#!/usr/bin/env python3
"""
Database Configuration Helper
This script helps configure the database connection for the Healthcare Management System.
"""

import os
import sys
import getpass
from pathlib import Path
import mysql.connector
from mysql.connector import Error

def get_env_file_path():
    """Get the path to the .env file"""
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    return env_file

def read_env_file():
    """Read current .env file content"""
    env_file = get_env_file_path()
    if not env_file.exists():
        return {}
    
    env_vars = {}
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value
    return env_vars

def write_env_file(env_vars):
    """Write updated .env file"""
    env_file = get_env_file_path()
    
    # Template for .env file
    template = """# Database Configuration
DB_HOST={DB_HOST}
DB_PORT={DB_PORT}
DB_USER={DB_USER}
DB_PASSWORD={DB_PASSWORD}
DB_NAME={DB_NAME}

# API Configuration
API_HOST={API_HOST}
API_PORT={API_PORT}
API_DEBUG={API_DEBUG}

# Security
SECRET_KEY={SECRET_KEY}

# CORS Settings
CORS_ORIGINS={CORS_ORIGINS}
"""
    
    # Fill in defaults
    defaults = {
        'DB_HOST': 'localhost',
        'DB_PORT': '3306',
        'DB_USER': 'root',
        'DB_PASSWORD': '',
        'DB_NAME': 'healthcare_db',
        'API_HOST': '0.0.0.0',
        'API_PORT': '8000',
        'API_DEBUG': 'True',
        'SECRET_KEY': 'healthcare-system-secret-key-change-in-production',
        'CORS_ORIGINS': 'http://localhost:5173,http://localhost:3000'
    }
    
    # Update with current values
    for key in defaults:
        if key in env_vars:
            defaults[key] = env_vars[key]
    
    content = template.format(**defaults)
    
    with open(env_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Updated {env_file}")

def test_mysql_connection(host, port, user, password, database=None):
    """Test MySQL connection"""
    try:
        config = {
            'host': host,
            'port': int(port),
            'user': user,
            'password': password,
        }
        
        if database:
            config['database'] = database
        
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            print("✅ MySQL connection successful!")
            
            if database:
                print(f"✅ Connected to database '{database}'")
            else:
                # List available databases
                cursor = connection.cursor()
                cursor.execute("SHOW DATABASES;")
                databases = cursor.fetchall()
                print("📋 Available databases:")
                for db in databases:
                    print(f"   - {db[0]}")
                cursor.close()
            
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ MySQL connection failed: {e}")
        return False

def create_database_if_not_exists(host, port, user, password, database):
    """Create database if it doesn't exist"""
    try:
        connection = mysql.connector.connect(
            host=host,
            port=int(port),
            user=user,
            password=password
        )
        
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database};")
        cursor.execute(f"USE {database};")
        
        print(f"✅ Database '{database}' is ready")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"❌ Error creating database: {e}")
        return False

def main():
    print("🏥 Healthcare Management System - Database Configuration")
    print("=" * 60)
    
    # Read current configuration
    env_vars = read_env_file()
    
    print("\n📋 Current Configuration:")
    print(f"   Host: {env_vars.get('DB_HOST', 'localhost')}")
    print(f"   Port: {env_vars.get('DB_PORT', '3306')}")
    print(f"   User: {env_vars.get('DB_USER', 'root')}")
    print(f"   Database: {env_vars.get('DB_NAME', 'healthcare_db')}")
    print(f"   Password: {'*' * len(env_vars.get('DB_PASSWORD', '')) if env_vars.get('DB_PASSWORD') else '(not set)'}")
    
    print("\n🔧 Configuration Options:")
    print("1. Test current configuration")
    print("2. Update database password")
    print("3. Update database settings")
    print("4. Create database")
    print("5. Exit")
    
    choice = input("\nSelect option (1-5): ").strip()
    
    if choice == '1':
        # Test current configuration
        host = env_vars.get('DB_HOST', 'localhost')
        port = env_vars.get('DB_PORT', '3306')
        user = env_vars.get('DB_USER', 'root')
        password = env_vars.get('DB_PASSWORD', '')
        database = env_vars.get('DB_NAME', 'healthcare_db')
        
        if not password or password == 'your_mysql_password_here':
            print("❌ No password configured. Please choose option 2 to set password.")
            return
        
        print("\n🔍 Testing database connection...")
        if test_mysql_connection(host, port, user, password, database):
            print("🎉 Database configuration is working!")
        else:
            print("❌ Database configuration needs to be fixed.")
    
    elif choice == '2':
        # Update password
        print("\n🔑 Database Password Configuration")
        password = getpass.getpass("Enter MySQL root password: ")
        
        # Test the password
        host = env_vars.get('DB_HOST', 'localhost')
        port = env_vars.get('DB_PORT', '3306')
        user = env_vars.get('DB_USER', 'root')
        
        print("🔍 Testing connection...")
        if test_mysql_connection(host, port, user, password):
            env_vars['DB_PASSWORD'] = password
            write_env_file(env_vars)
            print("✅ Password updated and saved!")
        else:
            print("❌ Password test failed. Not saving.")
    
    elif choice == '3':
        # Update all settings
        print("\n⚙️  Database Settings Configuration")
        env_vars['DB_HOST'] = input(f"Host [{env_vars.get('DB_HOST', 'localhost')}]: ").strip() or env_vars.get('DB_HOST', 'localhost')
        env_vars['DB_PORT'] = input(f"Port [{env_vars.get('DB_PORT', '3306')}]: ").strip() or env_vars.get('DB_PORT', '3306')
        env_vars['DB_USER'] = input(f"User [{env_vars.get('DB_USER', 'root')}]: ").strip() or env_vars.get('DB_USER', 'root')
        env_vars['DB_NAME'] = input(f"Database [{env_vars.get('DB_NAME', 'healthcare_db')}]: ").strip() or env_vars.get('DB_NAME', 'healthcare_db')
        
        password = getpass.getpass("Enter MySQL password: ")
        env_vars['DB_PASSWORD'] = password
        
        print("🔍 Testing new configuration...")
        if test_mysql_connection(env_vars['DB_HOST'], env_vars['DB_PORT'], env_vars['DB_USER'], password):
            write_env_file(env_vars)
            print("✅ Configuration updated and saved!")
        else:
            print("❌ Configuration test failed. Not saving.")
    
    elif choice == '4':
        # Create database
        host = env_vars.get('DB_HOST', 'localhost')
        port = env_vars.get('DB_PORT', '3306')
        user = env_vars.get('DB_USER', 'root')
        password = env_vars.get('DB_PASSWORD', '')
        database = env_vars.get('DB_NAME', 'healthcare_db')
        
        if not password or password == 'your_mysql_password_here':
            password = getpass.getpass("Enter MySQL root password: ")
        
        print(f"🔍 Creating database '{database}'...")
        if create_database_if_not_exists(host, port, user, password, database):
            print("✅ Database is ready!")
        else:
            print("❌ Database creation failed.")
    
    elif choice == '5':
        print("👋 Goodbye!")
        return
    
    else:
        print("❌ Invalid option. Please choose 1-5.")

if __name__ == '__main__':
    main()