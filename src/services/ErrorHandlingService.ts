/**
 * Enhanced API Error Handling Service
 * Provides centralized error handling, retry logic, and fallback mechanisms
 */

export interface ErrorDetails {
  code: string;
  message: string;
  context: string;
  timestamp: Date;
  retryable: boolean;
  fallbackAvailable: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  isFromFallback: boolean;
  retryCount: number;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorHistory: ErrorDetails[] = [];
  private circuitBreakers: Map<
    string,
    {
      failures: number;
      lastFailure: Date;
      state: "closed" | "open" | "half-open";
    }
  > = new Map();

  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Enhanced API call with automatic retry, circuit breaker, and fallback
   */
  async executeWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackProvider: () => T | Promise<T>,
    context: string,
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<ApiResponse<T>> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    let lastError: Error | null = null;
    let retryCount = 0;

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(context)) {
      console.warn(
        `Circuit breaker is open for ${context}, using fallback immediately`
      );
      const fallbackData = await fallbackProvider();
      return {
        success: true,
        data: fallbackData,
        isFromFallback: true,
        retryCount: 0,
      };
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const data = await this.executeWithTimeout(apiCall, 15000);

        // Success - reset circuit breaker
        this.resetCircuitBreaker(context);

        return {
          success: true,
          data,
          isFromFallback: false,
          retryCount: attempt,
        };
      } catch (error) {
        lastError = error as Error;
        retryCount = attempt;

        const errorDetails = this.categorizeError(error as Error, context);
        this.recordError(errorDetails);

        // Update circuit breaker
        this.recordFailure(context);

        // If not retryable or max retries reached, break
        if (!errorDetails.retryable || attempt === config.maxRetries) {
          break;
        }

        // Calculate delay for next retry
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        console.warn(
          `API call failed (attempt ${attempt + 1}), retrying in ${delay}ms:`,
          (error as Error).message
        );
        await this.delay(delay);
      }
    }

    // All retries failed - use fallback
    const finalError = lastError || new Error("Unknown error occurred");
    console.error(
      `All retries failed for ${context}, using fallback:`,
      finalError.message
    );

    try {
      const fallbackData = await fallbackProvider();
      return {
        success: true,
        data: fallbackData,
        error: this.categorizeError(finalError, context),
        isFromFallback: true,
        retryCount,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: this.categorizeError(
          fallbackError as Error,
          `${context}_fallback`
        ),
        isFromFallback: false,
        retryCount,
      };
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
      ),
    ]);
  }

  /**
   * Categorize errors for better handling
   */
  private categorizeError(error: Error, context: string): ErrorDetails {
    const message = error.message.toLowerCase();
    let code: string;
    let retryable = true;
    let fallbackAvailable = true;

    if (message.includes("timeout") || message.includes("network")) {
      code = "NETWORK_ERROR";
    } else if (message.includes("401") || message.includes("unauthorized")) {
      code = "AUTH_ERROR";
      retryable = false;
    } else if (message.includes("429") || message.includes("rate limit")) {
      code = "RATE_LIMIT_ERROR";
    } else if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503")
    ) {
      code = "SERVER_ERROR";
    } else if (message.includes("404") || message.includes("not found")) {
      code = "NOT_FOUND_ERROR";
      retryable = false;
    } else {
      code = "UNKNOWN_ERROR";
    }

    return {
      code,
      message: error.message,
      context,
      timestamp: new Date(),
      retryable,
      fallbackAvailable,
    };
  }

  /**
   * Circuit breaker implementation
   */
  private isCircuitBreakerOpen(context: string): boolean {
    const breaker = this.circuitBreakers.get(context);
    if (!breaker) return false;

    const now = new Date();
    const timeSinceLastFailure = now.getTime() - breaker.lastFailure.getTime();

    if (breaker.state === "open") {
      // Try to half-open after 30 seconds
      if (timeSinceLastFailure > 30000) {
        breaker.state = "half-open";
        return false;
      }
      return true;
    }

    return false;
  }

  private recordFailure(context: string): void {
    const breaker = this.circuitBreakers.get(context) || {
      failures: 0,
      lastFailure: new Date(),
      state: "closed" as const,
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    // Open circuit breaker after 3 failures
    if (breaker.failures >= 3) {
      breaker.state = "open";
      console.warn(
        `Circuit breaker opened for ${context} due to repeated failures`
      );
    }

    this.circuitBreakers.set(context, breaker);
  }

  private resetCircuitBreaker(context: string): void {
    this.circuitBreakers.delete(context);
  }

  /**
   * Record error for monitoring and analysis
   */
  private recordError(error: ErrorDetails): void {
    this.errorHistory.push(error);

    // Keep only last 100 errors
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsByContext: Record<string, number>;
    recentErrors: ErrorDetails[];
  } {
    const errorsByCode: Record<string, number> = {};
    const errorsByContext: Record<string, number> = {};

    this.errorHistory.forEach((error) => {
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
      errorsByContext[error.context] =
        (errorsByContext[error.context] || 0) + 1;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByCode,
      errorsByContext,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if system is in degraded mode
   */
  isSystemDegraded(): boolean {
    const recentErrors = this.errorHistory.filter(
      (error) => new Date().getTime() - error.timestamp.getTime() < 300000 // Last 5 minutes
    );
    return recentErrors.length > 5;
  }

  /**
   * Clear error history (for testing/reset)
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.circuitBreakers.clear();
  }
}

export default ErrorHandlingService.getInstance();
