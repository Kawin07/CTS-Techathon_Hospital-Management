import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Zap, 
  Target,
  AlertCircle,
  Info,
  X,
  ArrowRight,
  Brain
} from 'lucide-react';
import { predictiveAnalytics } from '../utils/predictiveAnalytics';
import { realTimeSimulator } from '../utils/realTimeSimulator';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'oxygen' | 'beds' | 'staff' | 'emergency' | 'system';
  title: string;
  message: string;
  timestamp: number;
  priority: number; // 1-10, 10 being highest
  acknowledged: boolean;
  resolved: boolean;
  recommendations: Recommendation[];
  affectedResources: string[];
  estimatedImpact: string;
  autoResolve?: boolean;
}

export interface Recommendation {
  id: string;
  action: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  impact: string;
  cost: 'none' | 'low' | 'medium' | 'high';
  department: string[];
  automation: boolean;
  successRate: number; // 0-100%
}

class AlertSystem {
  private alerts: Alert[] = [];
  private subscribers: ((alerts: Alert[]) => void)[] = [];
  private alertCounter = 0;

  constructor() {
    this.initializeSystem();
  }

  private initializeSystem() {
    // Subscribe to real-time data updates
    realTimeSimulator.subscribe((data) => {
      this.analyzeData(data);
    });

    // Start real-time simulation
    realTimeSimulator.start();

    // Generate periodic predictive alerts
    setInterval(() => {
      this.generatePredictiveAlerts();
    }, 60000); // Every minute
  }

  private analyzeData(data: any) {
    // Analyze oxygen levels
    data.oxygenStations?.forEach((station: any) => {
      if (station.alertStatus === 'critical' && !this.hasActiveAlert(`oxygen-${station.stationId}`)) {
        this.createAlert({
          type: 'critical',
          category: 'oxygen',
          title: `Critical Oxygen Level - ${station.location}`,
          message: `Oxygen level at ${station.currentLevel}% in ${station.location}. Immediate attention required.`,
          priority: 9,
          affectedResources: [station.location],
          estimatedImpact: 'Patient safety risk',
          recommendations: [
            {
              action: 'Increase oxygen flow rate immediately',
              priority: 'immediate',
              estimatedTime: '2 minutes',
              impact: 'Stabilize oxygen levels',
              cost: 'none',
              department: ['Respiratory Therapy', 'ICU'],
              automation: false,
              successRate: 95
            },
            {
              action: 'Check oxygen supply connections',
              priority: 'immediate',
              estimatedTime: '5 minutes',
              impact: 'Identify supply issues',
              cost: 'none',
              department: ['Maintenance', 'Respiratory Therapy'],
              automation: false,
              successRate: 90
            },
            {
              action: 'Activate backup oxygen supply',
              priority: 'high',
              estimatedTime: '10 minutes',
              impact: 'Ensure continuous supply',
              cost: 'low',
              department: ['Respiratory Therapy'],
              automation: true,
              successRate: 98
            }
          ]
        });
      }
    });

    // Analyze bed availability
    if (data.bedOccupancy?.availableBeds < 5 && !this.hasActiveAlert('beds-critical')) {
      this.createAlert({
        type: 'critical',
        category: 'beds',
        title: 'Critical Bed Shortage',
        message: `Only ${data.bedOccupancy.availableBeds} beds available. Implement bed shortage protocol.`,
        priority: 8,
        affectedResources: ['All Wards'],
        estimatedImpact: 'Admission delays, patient overflow',
        recommendations: [
          {
            action: 'Activate bed shortage protocol',
            priority: 'immediate',
            estimatedTime: '15 minutes',
            impact: 'Coordinate patient flow',
            cost: 'none',
            department: ['Administration', 'Nursing'],
            automation: true,
            successRate: 85
          },
          {
            action: 'Contact nearby hospitals for transfers',
            priority: 'high',
            estimatedTime: '30 minutes',
            impact: 'Reduce patient load',
            cost: 'medium',
            department: ['Administration', 'Patient Transport'],
            automation: false,
            successRate: 75
          },
          {
            action: 'Expedite discharge planning',
            priority: 'high',
            estimatedTime: '2 hours',
            impact: 'Free up beds',
            cost: 'low',
            department: ['Discharge Planning', 'Social Services'],
            automation: false,
            successRate: 80
          }
        ]
      });
    }

    // Analyze staff workload
    if (data.staffMetrics?.averageWorkload > 90 && !this.hasActiveAlert('staff-overload')) {
      this.createAlert({
        type: 'warning',
        category: 'staff',
        title: 'Staff Overload Warning',
        message: `Average staff workload at ${data.staffMetrics.averageWorkload}%. Risk of burnout and errors.`,
        priority: 7,
        affectedResources: ['All Departments'],
        estimatedImpact: 'Decreased care quality, staff fatigue',
        recommendations: [
          {
            action: 'Call in additional staff',
            priority: 'high',
            estimatedTime: '45 minutes',
            impact: 'Reduce individual workload',
            cost: 'high',
            department: ['Human Resources', 'Administration'],
            automation: true,
            successRate: 70
          },
          {
            action: 'Redistribute non-critical tasks',
            priority: 'medium',
            estimatedTime: '20 minutes',
            impact: 'Balance workload',
            cost: 'none',
            department: ['Nursing Management'],
            automation: false,
            successRate: 85
          },
          {
            action: 'Activate on-call staff',
            priority: 'high',
            estimatedTime: '30 minutes',
            impact: 'Immediate support',
            cost: 'medium',
            department: ['Human Resources'],
            automation: true,
            successRate: 90
          }
        ]
      });
    }

    // Analyze emergency load
    if (data.emergencyMetrics?.activeEmergencies > 8 && !this.hasActiveAlert('emergency-surge')) {
      this.createAlert({
        type: 'critical',
        category: 'emergency',
        title: 'Emergency Department Surge',
        message: `${data.emergencyMetrics.activeEmergencies} active emergencies. Surge capacity protocol needed.`,
        priority: 9,
        affectedResources: ['Emergency Department'],
        estimatedImpact: 'Delayed emergency care, overcrowding',
        recommendations: [
          {
            action: 'Activate emergency surge protocol',
            priority: 'immediate',
            estimatedTime: '10 minutes',
            impact: 'Increase capacity',
            cost: 'low',
            department: ['Emergency Medicine', 'Administration'],
            automation: true,
            successRate: 95
          },
          {
            action: 'Deploy additional emergency staff',
            priority: 'immediate',
            estimatedTime: '20 minutes',
            impact: 'Faster patient processing',
            cost: 'high',
            department: ['Emergency Medicine', 'Human Resources'],
            automation: false,
            successRate: 80
          },
          {
            action: 'Open overflow treatment areas',
            priority: 'high',
            estimatedTime: '30 minutes',
            impact: 'Additional treatment space',
            cost: 'medium',
            department: ['Facilities', 'Emergency Medicine'],
            automation: false,
            successRate: 85
          }
        ]
      });
    }
  }

  private generatePredictiveAlerts() {
    const predictions = predictiveAnalytics.getAllPredictions();

    // Generate alerts based on predictions
    Object.entries(predictions).forEach(([resource, prediction]) => {
      if (
        typeof prediction === 'object' &&
        prediction !== null &&
        !Array.isArray(prediction) &&
        'riskLevel' in prediction
      ) {
        const resourceData = prediction as any;
        
        if (resourceData.riskLevel === 'critical' && !this.hasActiveAlert(`predictive-${resource}`)) {
          this.createAlert({
            type: 'warning',
            category: resource as any,
            title: `Predicted ${resource.charAt(0).toUpperCase() + resource.slice(1)} Crisis`,
            message: `AI models predict ${resource} shortage in next 4-6 hours. Proactive measures recommended.`,
            priority: 6,
            affectedResources: [resource],
            estimatedImpact: 'Potential service disruption',
            autoResolve: true,
            recommendations: resourceData.recommendations.slice(0, 3).map((rec: string, index: number) => ({
              id: `pred-${resource}-${index}`,
              action: rec,
              priority: 'medium' as const,
              estimatedTime: '1-2 hours',
              impact: 'Prevent predicted crisis',
              cost: 'low' as const,
              department: [resource === 'staff' ? 'Human Resources' : resource === 'beds' ? 'Patient Services' : 'Clinical Services'],
              automation: false,
              successRate: 75
            }))
          });
        }
      }
    });

    // System optimization recommendations
    if (predictions.overallOptimization < 70 && !this.hasActiveAlert('optimization-low')) {
      this.createAlert({
        type: 'info',
        category: 'system',
        title: 'System Optimization Opportunity',
        message: `Overall optimization score: ${predictions.overallOptimization}%. Multiple improvement opportunities identified.`,
        priority: 4,
        affectedResources: ['System-wide'],
        estimatedImpact: 'Efficiency improvement potential',
        autoResolve: true,
        recommendations: [
          {
            action: 'Run automated resource optimization',
            priority: 'low',
            estimatedTime: '5 minutes',
            impact: 'Optimize resource allocation',
            cost: 'none',
            department: ['IT', 'Administration'],
            automation: true,
            successRate: 95
          },
          {
            action: 'Review staffing schedules',
            priority: 'medium',
            estimatedTime: '2 hours',
            impact: 'Better staff utilization',
            cost: 'none',
            department: ['Human Resources'],
            automation: false,
            successRate: 80
          },
          {
            action: 'Analyze patient flow patterns',
            priority: 'low',
            estimatedTime: '4 hours',
            impact: 'Improved patient throughput',
            cost: 'none',
            department: ['Quality Improvement'],
            automation: false,
            successRate: 85
          }
        ]
      });
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved' | 'recommendations'> & {
    recommendations: Omit<Recommendation, 'id'>[];
  }) {
    const { recommendations, ...restAlertData } = alertData;
    const alert: Alert = {
      id: `alert-${++this.alertCounter}-${Date.now()}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      recommendations: recommendations.map((rec, index) => ({
        ...rec,
        id: `rec-${this.alertCounter}-${index}`
      })),
      ...restAlertData
    };

    this.alerts.unshift(alert);
    
    // Auto-resolve old alerts if specified
    if (alert.autoResolve) {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 300000); // 5 minutes
    }

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    this.notifySubscribers();
  }

  private hasActiveAlert(pattern: string): boolean {
    return this.alerts.some(alert => 
      !alert.resolved && 
      (alert.id.includes(pattern) || alert.title.toLowerCase().includes(pattern.toLowerCase()))
    );
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.notifySubscribers();
    }
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.acknowledged = true;
      this.notifySubscribers();
    }
  }

  public executeRecommendation(alertId: string, recommendationId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      const recommendation = alert.recommendations.find(r => r.id === recommendationId);
      if (recommendation && recommendation.automation) {
        // Simulate automated action
        setTimeout(() => {
          if (Math.random() < recommendation.successRate / 100) {
            alert.resolved = true;
            alert.acknowledged = true;
            this.notifySubscribers();
          }
        }, 2000);
      }
    }
  }

  public subscribe(callback: (alerts: Alert[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.alerts);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback([...this.alerts]));
  }

  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  public getCriticalAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved && alert.type === 'critical');
  }

  public getAlertStats(): {
    total: number;
    critical: number;
    warning: number;
    info: number;
    unacknowledged: number;
  } {
    const active = this.getActiveAlerts();
    return {
      total: active.length,
      critical: active.filter(a => a.type === 'critical').length,
      warning: active.filter(a => a.type === 'warning').length,
      info: active.filter(a => a.type === 'info').length,
      unacknowledged: active.filter(a => !a.acknowledged).length
    };
  }
}

// Singleton instance
export const alertSystem = new AlertSystem();

// React component for alert management
const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  useEffect(() => {
    const unsubscribe = alertSystem.subscribe(setAlerts);
    return unsubscribe;
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (!alert.resolved && (filterType === 'all' || alert.type === filterType)) {
      return true;
    }
    return false;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const stats = alertSystem.getAlertStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span>Intelligent Alert System</span>
          </h1>
          <p className="text-gray-600">AI-powered alerts and automated recommendations</p>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-sm text-gray-600">Critical</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            <p className="text-sm text-gray-600">Warnings</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            <p className="text-sm text-gray-600">Information</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.unacknowledged}</p>
            <p className="text-sm text-gray-600">Unacknowledged</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-2">
          {(['all', 'critical', 'warning', 'info'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === filter
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} 
              {filter !== 'all' && (
                <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {filter === 'critical' ? stats.critical : 
                   filter === 'warning' ? stats.warning : stats.info}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                getAlertColor(alert.type)
              } ${selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                        Priority {alert.priority}
                      </span>
                      {!alert.acknowledged && (
                        <span className="px-2 py-0.5 bg-red-200 text-red-700 text-xs rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{alert.affectedResources.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alertSystem.acknowledgeAlert(alert.id);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alertSystem.resolveAlert(alert.id);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No active alerts</p>
              <p>All systems operating normally</p>
            </div>
          )}
        </div>

        {/* Alert Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedAlert ? (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getAlertIcon(selectedAlert.type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAlert.title}</h3>
                  <p className="text-sm text-gray-600">{selectedAlert.category.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                  <p className="text-sm text-gray-700">{selectedAlert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Impact: {selectedAlert.estimatedImpact}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    AI Recommendations ({selectedAlert.recommendations.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedAlert.recommendations.map((rec) => (
                      <div key={rec.id} className="bg-gray-50 p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{rec.estimatedTime}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-900 font-medium mb-1">{rec.action}</p>
                        <p className="text-xs text-gray-600 mb-2">{rec.impact}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Success rate: {rec.successRate}%
                          </div>
                          
                          {rec.automation && (
                            <button
                              onClick={() => alertSystem.executeRecommendation(selectedAlert.id, rec.id)}
                              className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Execute</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  {!selectedAlert.acknowledged && (
                    <button
                      onClick={() => alertSystem.acknowledgeAlert(selectedAlert.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                  <button
                    onClick={() => alertSystem.resolveAlert(selectedAlert.id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertManagement;