import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import test_connection

if __name__ == "__main__":
    print("Testing database connection...")
    if test_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed!")