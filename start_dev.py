#!/usr/bin/env python3
"""
Development server starter script
Starts both the Python backend and Vite frontend concurrently
"""

import subprocess
import sys
import os
import signal
import time
from threading import Thread

def run_backend():
    """Run the Python Flask backend"""
    try:
        backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
        os.chdir(backend_dir)
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Backend error: {e}")

def run_frontend():
    """Run the Vite frontend development server"""
    try:
        project_dir = os.path.dirname(__file__)
        os.chdir(project_dir)
        subprocess.run(['npm', 'run', 'dev'], check=True)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Frontend error: {e}")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print('\nShutting down servers...')
    sys.exit(0)

if __name__ == "__main__":
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    print("Starting Hospital Management System...")
    print("Backend will be available at: http://localhost:5000")
    print("Frontend will be available at: http://localhost:5173")
    print("Press Ctrl+C to stop both servers\n")
    
    # Start backend in a separate thread
    backend_thread = Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Give backend a moment to start
    time.sleep(2)
    
    # Start frontend in main thread
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\nShutting down...")
        sys.exit(0)