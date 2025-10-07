import mysql.connector
import json
import random
from datetime import datetime, timedelta, date
import numpy as np
from typing import Dict, List, Tuple
import os
from dotenv import load_dotenv

load_dotenv()

class HealthcareDataGenerator:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'healthcare_db'),
            'autocommit': True
        }
        
        self.connection = None
        self.cursor = None
        
        # Real disease trends and seasonal patterns (2010-2025)
        self.disease_trends = {
            # Seasonal diseases with real patterns
            'influenza': {
                'category': 'seasonal',
                'icd10': 'J09-J11',
                'peak_months': [11, 12, 1, 2, 3],  # Nov-Mar flu season
                'cases_per_100k': {
                    2010: 12500, 2011: 8900, 2012: 11200, 2013: 15800, 2014: 18500,
                    2015: 22300, 2016: 19800, 2017: 31200, 2018: 44900, 2019: 37800,
                    2020: 8500,  # COVID lockdowns reduced flu
                    2021: 3200, 2022: 18900, 2023: 28600, 2024: 31200, 2025: 29800
                },
                'mortality_rate': 0.15,
                'age_groups': ['0-5', '65+'],
                'descriptions': ['Seasonal influenza', 'Flu-like symptoms', 'Respiratory infection']
            },
            
            'covid19': {
                'category': 'infectious',
                'icd10': 'U07.1',
                'peak_months': [1, 7, 11, 12],  # Multiple waves
                'cases_per_100k': {
                    2020: 85000, 2021: 125000, 2022: 89000, 2023: 45000, 2024: 28000, 2025: 22000
                },
                'mortality_rate': 1.8,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['COVID-19', 'SARS-CoV-2 infection', 'Coronavirus disease']
            },
            
            'respiratory_syncytial_virus': {
                'category': 'seasonal',
                'icd10': 'J21.0',
                'peak_months': [10, 11, 12, 1, 2],
                'cases_per_100k': {
                    2010: 3200, 2011: 3800, 2012: 4100, 2013: 3900, 2014: 4300,
                    2015: 4700, 2016: 4200, 2017: 5100, 2018: 5800, 2019: 5400,
                    2020: 1200, 2021: 8900,  # RSV surge post-COVID
                    2022: 7800, 2023: 6200, 2024: 5900, 2025: 6100
                },
                'mortality_rate': 0.05,
                'age_groups': ['0-5'],
                'descriptions': ['RSV infection', 'Bronchiolitis', 'Respiratory syncytial virus']
            },
            
            # Chronic diseases with increasing trends
            'diabetes_type2': {
                'category': 'chronic',
                'icd10': 'E11',
                'peak_months': [],  # Year-round
                'cases_per_100k': {
                    2010: 8300, 2011: 8800, 2012: 9200, 2013: 9700, 2014: 10200,
                    2015: 10800, 2016: 11300, 2017: 11900, 2018: 12400, 2019: 12900,
                    2020: 13200, 2021: 13800, 2022: 14200, 2023: 14700, 2024: 15100, 2025: 15500
                },
                'mortality_rate': 2.1,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['Type 2 diabetes mellitus', 'Diabetes complications', 'Diabetic ketoacidosis']
            },
            
            'hypertension': {
                'category': 'chronic',
                'icd10': 'I10',
                'peak_months': [],
                'cases_per_100k': {
                    2010: 28900, 2011: 30100, 2012: 31400, 2013: 32800, 2014: 34200,
                    2015: 35700, 2016: 37100, 2017: 38600, 2018: 40000, 2019: 41500,
                    2020: 42800, 2021: 44200, 2022: 45500, 2023: 46800, 2024: 48000, 2025: 49200
                },
                'mortality_rate': 1.2,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['Essential hypertension', 'High blood pressure', 'Hypertensive crisis']
            },
            
            'heart_disease': {
                'category': 'cardiovascular',
                'icd10': 'I25',
                'peak_months': [12, 1, 2],  # Winter peaks
                'cases_per_100k': {
                    2010: 6200, 2011: 6400, 2012: 6600, 2013: 6800, 2014: 7000,
                    2015: 7100, 2016: 7300, 2017: 7400, 2018: 7600, 2019: 7700,
                    2020: 7900, 2021: 8200, 2022: 8400, 2023: 8600, 2024: 8800, 2025: 9000
                },
                'mortality_rate': 4.8,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['Coronary artery disease', 'Myocardial infarction', 'Heart failure']
            },
            
            # Cancer trends
            'lung_cancer': {
                'category': 'cancer',
                'icd10': 'C78.1',
                'peak_months': [],
                'cases_per_100k': {
                    2010: 58.2, 2011: 57.8, 2012: 57.3, 2013: 56.9, 2014: 56.4,
                    2015: 55.8, 2016: 55.2, 2017: 54.6, 2018: 54.0, 2019: 53.3,
                    2020: 52.6, 2021: 51.9, 2022: 51.2, 2023: 50.4, 2024: 49.7, 2025: 48.9
                },
                'mortality_rate': 84.2,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['Lung cancer', 'Bronchogenic carcinoma', 'Pulmonary neoplasm']
            },
            
            'breast_cancer': {
                'category': 'cancer',
                'icd10': 'C50',
                'peak_months': [],
                'cases_per_100k': {
                    2010: 122.1, 2011: 123.5, 2012: 124.8, 2013: 126.2, 2014: 127.5,
                    2015: 128.9, 2016: 130.2, 2017: 131.6, 2018: 132.9, 2019: 134.3,
                    2020: 128.4,  # Screening delays during COVID
                    2021: 135.7, 2022: 137.1, 2023: 138.4, 2024: 139.8, 2025: 141.2
                },
                'mortality_rate': 19.8,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['Breast cancer', 'Mammary carcinoma', 'Breast neoplasm']
            },
            
            # Mental health trends (increasing)
            'depression': {
                'category': 'mental_health',
                'icd10': 'F32',
                'peak_months': [11, 12, 1, 2],  # Seasonal depression
                'cases_per_100k': {
                    2010: 8200, 2011: 8700, 2012: 9200, 2013: 9800, 2014: 10400,
                    2015: 11100, 2016: 11800, 2017: 12600, 2018: 13400, 2019: 14300,
                    2020: 18900,  # COVID impact
                    2021: 21200, 2022: 19800, 2023: 18400, 2024: 17200, 2025: 16800
                },
                'mortality_rate': 0.8,
                'age_groups': ['6-17', '18-64'],
                'descriptions': ['Major depressive disorder', 'Clinical depression', 'Mood disorder']
            },
            
            'anxiety_disorders': {
                'category': 'mental_health',
                'icd10': 'F41',
                'peak_months': [],
                'cases_per_100k': {
                    2010: 11800, 2011: 12400, 2012: 13100, 2013: 13800, 2014: 14600,
                    2015: 15400, 2016: 16300, 2017: 17200, 2018: 18200, 2019: 19300,
                    2020: 25600,  # COVID impact
                    2021: 28900, 2022: 26700, 2023: 24800, 2024: 23200, 2025: 22600
                },
                'mortality_rate': 0.3,
                'age_groups': ['6-17', '18-64'],
                'descriptions': ['Generalized anxiety disorder', 'Panic disorder', 'Anxiety syndrome']
            },
            
            # Respiratory conditions
            'asthma': {
                'category': 'respiratory',
                'icd10': 'J45',
                'peak_months': [9, 10, 4, 5],  # Fall and spring triggers
                'cases_per_100k': {
                    2010: 7800, 2011: 7900, 2012: 8100, 2013: 8200, 2014: 8400,
                    2015: 8500, 2016: 8700, 2017: 8800, 2018: 9000, 2019: 9100,
                    2020: 8900, 2021: 9300, 2022: 9500, 2023: 9700, 2024: 9900, 2025: 10100
                },
                'mortality_rate': 1.2,
                'age_groups': ['0-5', '6-17', '18-64'],
                'descriptions': ['Bronchial asthma', 'Allergic asthma', 'Asthma exacerbation']
            },
            
            'copd': {
                'category': 'respiratory',
                'icd10': 'J44',
                'peak_months': [11, 12, 1, 2, 3],  # Winter exacerbations
                'cases_per_100k': {
                    2010: 3800, 2011: 3900, 2012: 4000, 2013: 4100, 2014: 4200,
                    2015: 4300, 2016: 4400, 2017: 4500, 2018: 4600, 2019: 4700,
                    2020: 4800, 2021: 4900, 2022: 5000, 2023: 5100, 2024: 5200, 2025: 5300
                },
                'mortality_rate': 5.8,
                'age_groups': ['18-64', '65+'],
                'descriptions': ['COPD', 'Chronic bronchitis', 'Emphysema']
            }
        }
        
        # Major health events/outbreaks
        self.major_outbreaks = [
            {
                'name': 'H1N1 Pandemic',
                'disease': 'influenza',
                'start_date': '2009-04-01',
                'end_date': '2010-08-31',
                'severity': 'high',
                'type': 'pandemic'
            },
            {
                'name': 'MERS-CoV Outbreak',
                'disease': 'mers',
                'start_date': '2012-09-01',
                'end_date': '2015-12-31',
                'severity': 'moderate',
                'type': 'outbreak'
            },
            {
                'name': 'Ebola Outbreak',
                'disease': 'ebola',
                'start_date': '2014-03-01',
                'end_date': '2016-06-30',
                'severity': 'high',
                'type': 'outbreak'
            },
            {
                'name': 'Zika Virus Epidemic',
                'disease': 'zika',
                'start_date': '2015-05-01',
                'end_date': '2017-11-30',
                'severity': 'moderate',
                'type': 'epidemic'
            },
            {
                'name': 'COVID-19 Pandemic',
                'disease': 'covid19',
                'start_date': '2019-12-01',
                'end_date': '2023-05-31',
                'severity': 'severe',
                'type': 'pandemic'
            },
            {
                'name': 'Mpox Outbreak',
                'disease': 'mpox',
                'start_date': '2022-05-01',
                'end_date': '2023-12-31',
                'severity': 'moderate',
                'type': 'outbreak'
            }
        ]

        # Demographics data
        self.first_names = {
            'male': ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Thomas', 'Mark', 'Donald',
                    'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald'],
            'female': ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
                      'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle']
        }
        
        self.last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                          'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    
    def connect_db(self):
        """Connect to MySQL database"""
        try:
            self.connection = mysql.connector.connect(**self.db_config)
            self.cursor = self.connection.cursor()
            print("✅ Connected to MySQL database")
        except mysql.connector.Error as err:
            print(f"❌ Database connection error: {err}")
            raise
    
    def disconnect_db(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("🔌 Disconnected from database")
    
    def execute_query(self, query: str, params: tuple = None):
        """Execute SQL query"""
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            return self.cursor.fetchall()
        except mysql.connector.Error as err:
            print(f"❌ Query error: {err}")
            print(f"Query: {query}")
            if params:
                print(f"Params: {params}")
            raise
    
    def populate_seasonal_patterns(self):
        """Populate seasonal disease patterns table"""
        print("📊 Generating seasonal disease patterns...")
        
        for disease_name, data in self.disease_trends.items():
            for year in range(2010, 2026):
                if year in data['cases_per_100k']:
                    for month in range(1, 13):
                        # Calculate seasonal variation
                        base_cases = data['cases_per_100k'][year]
                        
                        if data['peak_months']:
                            if month in data['peak_months']:
                                # Peak months get 150-200% of base rate
                                seasonal_multiplier = random.uniform(1.5, 2.0)
                            else:
                                # Off-season gets 50-80% of base rate
                                seasonal_multiplier = random.uniform(0.5, 0.8)
                        else:
                            # Chronic diseases have less seasonal variation
                            seasonal_multiplier = random.uniform(0.9, 1.1)
                        
                        cases_per_100k = int(base_cases * seasonal_multiplier / 12)
                        
                        query = """
                        INSERT INTO seasonal_disease_patterns 
                        (year_period, month_period, disease_category, disease_name, icd10_code, 
                         peak_month, cases_per_100k, mortality_rate, affected_age_groups, 
                         geographic_regions, notes)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        
                        peak_month = data['peak_months'][0] if data['peak_months'] else None
                        affected_age_groups = json.dumps(data['age_groups'])
                        geographic_regions = json.dumps(['northeast', 'southeast', 'midwest', 'southwest', 'west'])
                        
                        params = (
                            year, month, data['category'], disease_name.replace('_', ' ').title(),
                            data['icd10'], peak_month, cases_per_100k, data['mortality_rate'],
                            affected_age_groups, geographic_regions,
                            f"Generated pattern for {disease_name} based on historical trends"
                        )
                        
                        self.execute_query(query, params)
        
        print("✅ Seasonal disease patterns populated")
    
    def populate_outbreaks(self):
        """Populate disease outbreaks table"""
        print("🦠 Generating disease outbreaks data...")
        
        for outbreak in self.major_outbreaks:
            query = """
            INSERT INTO disease_outbreaks 
            (outbreak_name, disease_name, icd10_code, start_date, end_date, 
             affected_regions, total_cases, total_deaths, case_fatality_rate,
             outbreak_type, severity, response_measures, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Calculate estimated cases and deaths based on historical data
            if outbreak['disease'] == 'covid19':
                total_cases = 103000000  # Approximate US COVID cases
                total_deaths = 1100000   # Approximate US COVID deaths
                case_fatality_rate = 1.07
            elif outbreak['disease'] == 'influenza':
                total_cases = 60800000   # H1N1 pandemic
                total_deaths = 12469
                case_fatality_rate = 0.02
            else:
                total_cases = random.randint(1000, 100000)
                total_deaths = int(total_cases * random.uniform(0.001, 0.1))
                case_fatality_rate = (total_deaths / total_cases) * 100
            
            affected_regions = json.dumps(['nationwide'])
            response_measures = f"Public health emergency response for {outbreak['name']}"
            
            params = (
                outbreak['name'],
                outbreak['disease'],
                self.disease_trends.get(outbreak['disease'], {}).get('icd10', 'Z99.9'),
                outbreak['start_date'],
                outbreak['end_date'],
                affected_regions,
                total_cases,
                total_deaths,
                case_fatality_rate,
                outbreak['type'],
                outbreak['severity'],
                response_measures,
                f"Major {outbreak['type']} affecting healthcare system"
            )
            
            self.execute_query(query, params)
        
        print("✅ Disease outbreaks populated")
    
    def populate_statistics(self):
        """Populate healthcare statistics table"""
        print("📈 Generating healthcare statistics...")
        
        for year in range(2010, 2026):
            # Calculate year-over-year trends
            year_progress = (year - 2010) / 15  # 0.0 to 1.0
            
            # US population growth trend
            population_base = 309000000  # 2010 baseline
            population_growth = year_progress * 25000000  # Growth over 15 years
            population = int(population_base + population_growth)
            
            # Life expectancy trends (slight increase then COVID impact)
            life_exp_male_base = 76.2
            life_exp_female_base = 81.0
            
            if year <= 2019:
                life_exp_male = life_exp_male_base + (year_progress * 0.8)
                life_exp_female = life_exp_female_base + (year_progress * 0.6)
            else:
                # COVID impact 2020-2021, then recovery
                covid_impact = -1.5 if year in [2020, 2021] else -0.5
                life_exp_male = life_exp_male_base + (year_progress * 0.8) + covid_impact
                life_exp_female = life_exp_female_base + (year_progress * 0.6) + covid_impact
            
            # Health trend calculations
            obesity_rate = 35.7 + (year_progress * 1.5)  # Increasing trend
            diabetes_rate = 8.3 + (year_progress * 2.2)  # Increasing trend
            hypertension_rate = 45.4 + (year_progress * 1.8)  # Increasing trend
            smoking_rate = 19.3 - (year_progress * 5.8)  # Decreasing trend
            
            # Healthcare capacity and spending (in INR)
            spending_per_capita = 664000 + (year_progress * 332000)  # Increasing healthcare costs
            beds_per_1000 = 2.9 - (year_progress * 0.2)  # Slight decrease in bed capacity
            physicians_per_1000 = 2.4 + (year_progress * 0.3)  # Slight increase in physicians
            
            query = """
            INSERT INTO healthcare_statistics 
            (year_period, region, population_total, life_expectancy_male, life_expectancy_female,
             infant_mortality_rate, obesity_rate, diabetes_prevalence, hypertension_prevalence,
             smoking_rate, healthcare_spending_per_capita, hospital_beds_per_1000, physicians_per_1000)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            infant_mortality = 6.1 - (year_progress * 0.5)  # Improving trend
            
            params = (
                year, 'USA', population, round(life_exp_male, 1), round(life_exp_female, 1),
                round(infant_mortality, 2), round(obesity_rate, 2), round(diabetes_rate, 2),
                round(hypertension_rate, 2), round(smoking_rate, 2), round(spending_per_capita, 2),
                round(beds_per_1000, 1), round(physicians_per_1000, 1)
            )
            
            self.execute_query(query, params)
        
        print("✅ Healthcare statistics populated")

    def generate_realistic_patients(self, count: int = 50000):
        """Generate realistic patient data spanning 2010-2025"""
        print(f"👥 Generating {count} realistic patients...")
        
        patients_data = []
        
        for i in range(count):
            # Generate birth date with realistic age distribution
            age_weights = [0.06, 0.13, 0.13, 0.13, 0.26, 0.16, 0.13]  # 0-9, 10-19, 20-29, 30-39, 40-59, 60-79, 80+
            age_group = np.random.choice(range(7), p=age_weights)
            
            if age_group == 0:  # 0-9
                age = random.randint(0, 9)
            elif age_group == 1:  # 10-19
                age = random.randint(10, 19)
            elif age_group == 2:  # 20-29
                age = random.randint(20, 29)
            elif age_group == 3:  # 30-39
                age = random.randint(30, 39)
            elif age_group == 4:  # 40-59
                age = random.randint(40, 59)
            elif age_group == 5:  # 60-79
                age = random.randint(60, 79)
            else:  # 80+
                age = random.randint(80, 95)
            
            birth_date = datetime.now().date() - timedelta(days=age*365 + random.randint(0, 365))
            
            # Gender distribution
            gender = random.choices(['male', 'female', 'other'], weights=[49, 49, 2])[0]
            
            # Generate name based on gender
            if gender == 'male':
                given_name = random.choice(self.first_names['male'])
            elif gender == 'female':
                given_name = random.choice(self.first_names['female'])
            else:
                given_name = random.choice(self.first_names['male'] + self.first_names['female'])
            
            family_name = random.choice(self.last_names)
            
            # Generate unique identifier
            identifier = f"PAT{i+1:06d}"
            
            # Contact information
            phone = f"555-{random.randint(100,999)}-{random.randint(1000,9999)}"
            email = f"{given_name.lower()}.{family_name.lower()}.{random.randint(1,999)}@email.com"
            
            # Address
            address_line = f"{random.randint(1,9999)} {random.choice(['Main', 'Oak', 'Park', 'Pine', 'Cedar', 'Elm', 'Washington', 'Lincoln'])} {random.choice(['St', 'Ave', 'Dr', 'Ln', 'Blvd'])}"
            cities = ['Springfield', 'Franklin', 'Clinton', 'Georgetown', 'Madison', 'Chester', 'Marion', 'Washington']
            states = ['IL', 'CA', 'TX', 'FL', 'NY', 'PA', 'OH', 'GA', 'NC', 'MI']
            
            address_city = random.choice(cities)
            address_state = random.choice(states)
            postal_code = f"{random.randint(10000,99999)}"
            
            # Demographics
            marital_status = random.choices(['single', 'married', 'divorced', 'widowed'], weights=[25, 55, 15, 5])[0]
            blood_type = random.choices(['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'], 
                                      weights=[37.4, 35.7, 8.5, 3.4, 6.6, 6.3, 1.5, 0.6])[0]
            
            # Insurance
            insurance_providers = ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Anthem', 'Medicare', 'Medicaid']
            insurance_provider = random.choice(insurance_providers)
            insurance_number = f"{random.choice(['BC', 'AE', 'CG', 'UH', 'AN', 'MC', 'MD'])}{random.randint(100000000,999999999)}"
            
            # Emergency contact
            emergency_names = [f"{random.choice(self.first_names['male'] + self.first_names['female'])} {random.choice(self.last_names)}" for _ in range(5)]
            emergency_contact_name = random.choice(emergency_names)
            emergency_contact_phone = f"555-{random.randint(100,999)}-{random.randint(1000,9999)}"
            emergency_relationships = ['spouse', 'parent', 'child', 'sibling', 'friend']
            emergency_relationship = random.choice(emergency_relationships)
            
            # Contact person
            contact_name = emergency_contact_name
            contact_phone = emergency_contact_phone
            contact_relationship = emergency_relationship
            
            patients_data.append((
                identifier, given_name, family_name, birth_date, gender, phone, email,
                address_line, address_city, address_state, postal_code, 'USA',
                contact_name, contact_phone, contact_relationship, marital_status, blood_type,
                insurance_provider, insurance_number, emergency_contact_name, emergency_contact_phone, emergency_relationship
            ))
        
        # Batch insert patients
        query = """
        INSERT INTO fhir_patients 
        (identifier, given_name, family_name, birth_date, gender, phone, email,
         address_line, address_city, address_state, address_postal_code, address_country,
         contact_name, contact_phone, contact_relationship, marital_status, blood_type,
         insurance_provider, insurance_number, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        self.cursor.executemany(query, patients_data)
        print(f"✅ Generated {count} realistic patients")

    def generate_patient_conditions(self):
        """Generate patient conditions based on realistic disease patterns"""
        print("🏥 Generating patient conditions based on historical trends...")
        
        # Get all patients
        self.execute_query("SELECT patient_id, birth_date, gender FROM fhir_patients WHERE is_active = TRUE")
        patients = self.cursor.fetchall()
        
        conditions_data = []
        
        for patient_id, birth_date, gender in patients:
            current_age = (datetime.now().date() - birth_date).days // 365
            
            # Determine how many conditions this patient should have based on age
            if current_age < 18:
                num_conditions = random.choices([0, 1, 2], weights=[60, 30, 10])[0]
            elif current_age < 65:
                num_conditions = random.choices([0, 1, 2, 3], weights=[40, 35, 20, 5])[0]
            else:
                num_conditions = random.choices([1, 2, 3, 4, 5], weights=[20, 30, 25, 20, 5])[0]
            
            # Select conditions based on age group and gender
            possible_conditions = []
            
            for disease_name, data in self.disease_trends.items():
                age_group_match = False
                
                # Check if this condition applies to this age group
                for age_group in data['age_groups']:
                    if age_group == '0-5' and current_age <= 5:
                        age_group_match = True
                    elif age_group == '6-17' and 6 <= current_age <= 17:
                        age_group_match = True
                    elif age_group == '18-64' and 18 <= current_age <= 64:
                        age_group_match = True
                    elif age_group == '65+' and current_age >= 65:
                        age_group_match = True
                
                if age_group_match:
                    # Calculate probability based on disease prevalence
                    avg_cases_per_100k = np.mean(list(data['cases_per_100k'].values()))
                    probability = min(avg_cases_per_100k / 100000, 0.5)  # Cap at 50%
                    
                    # Adjust probability for chronic vs acute conditions
                    if data['category'] == 'chronic':
                        probability *= 1.5  # Chronic conditions are more likely to be recorded
                    elif data['category'] == 'seasonal':
                        probability *= 0.3  # Seasonal conditions are less likely to be current
                    
                    possible_conditions.append((disease_name, data, probability))
            
            # Select conditions for this patient
            selected_conditions = []
            for _ in range(num_conditions):
                if possible_conditions:
                    # Weighted selection based on probabilities
                    weights = [prob for _, _, prob in possible_conditions]
                    if sum(weights) > 0:
                        selected = np.random.choice(len(possible_conditions), p=np.array(weights)/sum(weights))
                        condition_name, condition_data, _ = possible_conditions[selected]
                        
                        # Remove selected condition to avoid duplicates
                        possible_conditions.pop(selected)
                        selected_conditions.append((condition_name, condition_data))
            
            # Generate condition records
            for condition_name, condition_data in selected_conditions:
                # Generate onset date
                if condition_data['category'] == 'chronic':
                    # Chronic conditions could have started years ago
                    onset_days_ago = random.randint(30, 365*5)
                elif condition_data['category'] == 'seasonal':
                    # Seasonal conditions in the last year
                    onset_days_ago = random.randint(1, 365)
                else:
                    # Acute conditions more recent
                    onset_days_ago = random.randint(1, 90)
                
                onset_date = datetime.now().date() - timedelta(days=onset_days_ago)
                
                # Determine status and resolved date
                if condition_data['category'] == 'chronic':
                    status = random.choices(['active', 'chronic'], weights=[30, 70])[0]
                    resolved_date = None
                elif condition_data['category'] == 'seasonal':
                    status = random.choices(['resolved', 'active'], weights=[80, 20])[0]
                    resolved_date = onset_date + timedelta(days=random.randint(7, 30)) if status == 'resolved' else None
                else:
                    status = random.choices(['resolved', 'active', 'in_remission'], weights=[70, 25, 5])[0]
                    resolved_date = onset_date + timedelta(days=random.randint(5, 60)) if status == 'resolved' else None
                
                # Severity based on age and condition type
                if current_age >= 65 or current_age <= 5:
                    severity = random.choices(['mild', 'moderate', 'severe', 'critical'], weights=[30, 40, 25, 5])[0]
                else:
                    severity = random.choices(['mild', 'moderate', 'severe', 'critical'], weights=[45, 35, 18, 2])[0]
                
                # Select a specific description
                condition_description = random.choice(condition_data.get('descriptions', [condition_name.replace('_', ' ').title()]))
                
                diagnosed_by = f"Dr. {random.choice(self.first_names['male'] + self.first_names['female'])} {random.choice(self.last_names)}"
                
                notes = f"Patient {patient_id} diagnosed with {condition_description}"
                if condition_data['category'] == 'chronic':
                    notes += " - ongoing management required"
                
                conditions_data.append((
                    patient_id, condition_data['icd10'], condition_description, 
                    condition_data['category'], severity, onset_date, resolved_date,
                    status, diagnosed_by, notes
                ))
        
        # Batch insert conditions
        if conditions_data:
            query = """
            INSERT INTO patient_conditions 
            (patient_id, condition_code, condition_name, condition_category, severity, 
             onset_date, resolved_date, status, diagnosed_by, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            self.cursor.executemany(query, conditions_data)
            print(f"✅ Generated {len(conditions_data)} patient conditions")

    def generate_staff_data(self, count: int = 500):
        """Generate realistic healthcare staff data"""
        print(f"👨‍⚕️ Generating {count} healthcare staff members...")
        
        departments = ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Orthopedics', 'Pediatrics', 
                      'Oncology', 'Neurology', 'Psychiatry', 'Internal Medicine', 'Family Medicine', 
                      'Radiology', 'Laboratory', 'Pharmacy', 'Administration']
        
        roles = ['Doctor', 'Nurse', 'Surgeon', 'Technician', 'Admin', 'Pharmacist', 'Therapist', 'Social_Worker']
        
        staff_data = []
        
        for i in range(count):
            gender = random.choice(['male', 'female'])
            given_name = random.choice(self.first_names[gender])
            family_name = random.choice(self.last_names)
            
            staff_id = f"STF{i+1:04d}"
            employee_number = f"EMP{random.randint(100000,999999)}"
            
            email = f"{given_name.lower()}.{family_name.lower()}@hospital.com"
            phone = f"555-{random.randint(100,999)}-{random.randint(1000,9999)}"
            
            role = random.choice(roles)
            department = random.choice(departments)
            
            # Match some roles to departments
            if role == 'Surgeon':
                department = 'Surgery'
            elif role == 'Pharmacist':
                department = 'Pharmacy'
            
            shift = random.choice(['morning', 'afternoon', 'night', 'rotating'])
            status = random.choices(['on-duty', 'off-duty', 'on-break', 'vacation'], weights=[40, 50, 8, 2])[0]
            
            location = f"{department} - Floor {random.randint(1,5)}"
            
            # Experience based on role
            if role in ['Doctor', 'Surgeon']:
                experience = random.randint(3, 30)
            elif role == 'Nurse':
                experience = random.randint(1, 25)
            else:
                experience = random.randint(1, 20)
            
            specializations = []
            if role == 'Doctor':
                specializations = [department, 'Internal Medicine']
            elif role == 'Surgeon':
                specializations = ['Surgery', department]
            elif role == 'Nurse':
                specializations = ['Patient Care', department]
            else:
                specializations = [role, department]
            
            license_number = f"{role[:2].upper()}{random.randint(100000,999999)}"
            
            # Hire date
            hire_date = datetime.now().date() - timedelta(days=experience*365 + random.randint(0, 365))
            
            # Salary based on role and experience (in INR)
            base_salaries = {
                'Doctor': 16600000, 'Surgeon': 24900000, 'Nurse': 6225000, 'Pharmacist': 9960000,
                'Technician': 4150000, 'Therapist': 5810000, 'Social_Worker': 4980000, 'Admin': 3735000
            }
            
            base_salary = base_salaries.get(role, 4150000)
            salary = base_salary + (experience * 166000) + random.randint(-415000, 1245000)
            
            workload = random.randint(20, 90)
            
            # Next shift
            next_shift = datetime.now() + timedelta(hours=random.randint(1, 48))
            
            staff_data.append((
                staff_id, employee_number, given_name, family_name, email, phone,
                role, department, shift, status, location, json.dumps(specializations),
                experience, license_number, hire_date, salary, workload, next_shift
            ))
        
        # Batch insert staff
        query = """
        INSERT INTO staff 
        (staff_id, employee_number, given_name, family_name, email, phone, role, 
         department, shift, status, location, specialization, years_experience, 
         license_number, hire_date, salary, workload, next_shift)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        self.cursor.executemany(query, staff_data)
        print(f"✅ Generated {count} healthcare staff members")

    def generate_infrastructure_data(self):
        """Generate wards, beds, and oxygen stations"""
        print("🏗️ Generating hospital infrastructure...")
        
        # Generate wards
        ward_types = ['General', 'ICU', 'Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Isolation', 'Oncology', 'Cardiac']
        departments = ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Internal Medicine']
        
        # Get some staff IDs for head nurses
        self.execute_query("SELECT staff_id FROM staff WHERE role = 'Nurse' ORDER BY RAND() LIMIT 20")
        nurse_ids = [row[0] for row in self.cursor.fetchall()]
        
        wards_data = []
        for i, ward_type in enumerate(ward_types):
            for floor in range(1, 4):  # 3 floors per ward type
                ward_name = f"{ward_type} Ward {floor}"
                ward_code = f"{ward_type[:3].upper()}{floor}"
                
                total_beds = random.randint(15, 40)
                occupied_beds = random.randint(0, int(total_beds * 0.8))
                available_beds = total_beds - occupied_beds
                
                department = random.choice(departments)
                head_nurse = random.choice(nurse_ids) if nurse_ids else None
                
                specialized_equipment = []
                if ward_type == 'ICU':
                    specialized_equipment = ['ventilators', 'cardiac_monitors', 'defibrillators', 'oxygen_stations']
                elif ward_type == 'Surgery':
                    specialized_equipment = ['surgical_equipment', 'anesthesia_machines', 'oxygen_stations']
                elif ward_type == 'Emergency':
                    specialized_equipment = ['trauma_equipment', 'defibrillators', 'oxygen_stations']
                else:
                    specialized_equipment = ['basic_monitoring', 'oxygen_stations']
                
                infection_control = 'standard'
                if ward_type == 'Isolation':
                    infection_control = 'airborne'
                elif ward_type == 'ICU':
                    infection_control = 'contact'
                
                wards_data.append((
                    ward_name, ward_code, ward_type, floor, 'Main Building',
                    total_beds, available_beds, occupied_beds, 0, department,
                    head_nurse, f"ext-{random.randint(1000,9999)}", 
                    json.dumps(specialized_equipment), infection_control
                ))
        
        query = """
        INSERT INTO wards 
        (ward_name, ward_code, ward_type, floor_number, building, total_beds, 
         available_beds, occupied_beds, maintenance_beds, department, head_nurse, 
         phone_extension, specialized_equipment, infection_control_level)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        self.cursor.executemany(query, wards_data)
        print(f"✅ Generated {len(wards_data)} wards")
        
        # Get ward IDs for beds
        self.execute_query("SELECT ward_id, total_beds, ward_type FROM wards")
        wards = self.cursor.fetchall()
        
        # Generate beds
        bed_types = ['Standard', 'ICU', 'Emergency', 'Isolation', 'Maternity', 'Pediatric']
        bed_statuses = ['available', 'occupied', 'maintenance', 'cleaning']
        
        # Get some patient and staff IDs
        self.execute_query("SELECT patient_id FROM fhir_patients ORDER BY RAND() LIMIT 200")
        patient_ids = [row[0] for row in self.cursor.fetchall()]
        
        self.execute_query("SELECT staff_id FROM staff ORDER BY RAND() LIMIT 100")
        staff_ids = [row[0] for row in self.cursor.fetchall()]
        
        beds_data = []
        bed_counter = 1
        
        for ward_id, total_beds, ward_type in wards:
            for bed_num in range(1, total_beds + 1):
                bed_number = f"{ward_type[:3]}{ward_id:02d}-{bed_num:02d}"
                
                # Bed type matches ward type mostly
                if ward_type == 'ICU':
                    bed_type = 'ICU'
                elif ward_type == 'Emergency':
                    bed_type = 'Emergency'
                elif ward_type == 'Isolation':
                    bed_type = 'Isolation'
                elif ward_type == 'Maternity':
                    bed_type = 'Maternity'
                elif ward_type == 'Pediatrics':
                    bed_type = 'Pediatric'
                else:
                    bed_type = 'Standard'
                
                status = random.choices(bed_statuses, weights=[40, 45, 10, 5])[0]
                
                patient_id = random.choice(patient_ids) if status == 'occupied' and patient_ids else None
                assigned_staff = random.choice(staff_ids) if patient_id and staff_ids else None
                
                # Remove used patient to avoid duplicates
                if patient_id and patient_id in patient_ids:
                    patient_ids.remove(patient_id)
                
                last_cleaned = datetime.now() - timedelta(hours=random.randint(1, 24))
                last_maintenance = datetime.now() - timedelta(days=random.randint(1, 30))
                
                equipment_status = random.choices(['OK', 'Needs_Maintenance', 'Out_of_Order'], weights=[85, 12, 3])[0]
                
                special_features = ['basic_monitoring']
                if bed_type == 'ICU':
                    special_features.extend(['oxygen', 'cardiac_monitor', 'ventilator_capable'])
                elif bed_type in ['Emergency', 'Surgery']:
                    special_features.extend(['oxygen', 'cardiac_monitor'])
                elif bed_type == 'Isolation':
                    special_features.extend(['isolation_capable', 'negative_pressure'])
                else:
                    special_features.append('oxygen')
                
                daily_rate = random.randint(41500, 166000)  # INR equivalent
                if bed_type == 'ICU':
                    daily_rate += 83000
                elif bed_type == 'Emergency':
                    daily_rate += 41500
                
                beds_data.append((
                    bed_number, ward_id, bed_type, status, patient_id, assigned_staff,
                    last_cleaned, last_maintenance, equipment_status, 
                    json.dumps(special_features), daily_rate, f"Bed {bed_counter}"
                ))
                
                bed_counter += 1
        
        query = """
        INSERT INTO beds 
        (bed_number, ward_id, bed_type, status, patient_id, assigned_staff_id,
         last_cleaned, last_maintenance, equipment_status, special_features, 
         daily_rate, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        self.cursor.executemany(query, beds_data)
        print(f"✅ Generated {len(beds_data)} beds")
        
        # Generate oxygen stations
        self.execute_query("SELECT bed_id, ward_id FROM beds WHERE JSON_CONTAINS(special_features, '\"oxygen\"')")
        oxygen_beds = self.cursor.fetchall()
        
        oxygen_data = []
        for i, (bed_id, ward_id) in enumerate(oxygen_beds[:100]):  # Limit to 100 stations
            station_code = f"OXY{i+1:03d}"
            station_name = f"Oxygen Station {i+1}"
            
            # Get ward info for location
            self.execute_query("SELECT ward_name, floor_number FROM wards WHERE ward_id = %s", (ward_id,))
            ward_info = self.cursor.fetchone()
            ward_name, floor = ward_info if ward_info else ("Unknown Ward", 1)
            
            location = f"{ward_name} - Bed {bed_id}"
            
            capacity = random.choice([2000, 3000, 5000, 6000])  # Liters
            current_level = random.randint(int(capacity * 0.1), capacity)
            pressure = random.uniform(45.0, 55.0)
            flow_rate = random.uniform(0.5, 5.0)
            
            # Get patient for this bed
            self.execute_query("SELECT patient_id, assigned_staff_id FROM beds WHERE bed_id = %s", (bed_id,))
            bed_info = self.cursor.fetchone()
            patient_id, assigned_staff = bed_info if bed_info else (None, None)
            
            # Status based on current level
            level_percentage = (current_level / capacity) * 100
            if level_percentage <= 10:
                status = 'critical'
            elif level_percentage <= 20:
                status = 'low'
            elif random.random() < 0.05:
                status = 'maintenance'
            else:
                status = 'normal'
            
            last_refilled = datetime.now() - timedelta(days=random.randint(1, 30))
            last_maintenance = datetime.now() - timedelta(days=random.randint(1, 90))
            next_maintenance = datetime.now() + timedelta(days=random.randint(30, 90))
            
            suppliers = ['MedOx Supply Co', 'Hospital Gas Systems', 'AirGas Medical', 'Praxair Healthcare']
            supplier = random.choice(suppliers)
            
            cost_per_refill = random.uniform(12450.0, 24900.0)  # INR equivalent
            equipment_serial = f"OX{random.randint(100000,999999)}"
            installation_date = datetime.now().date() - timedelta(days=random.randint(365, 365*5))
            warranty_expiry = installation_date + timedelta(days=365*3)
            
            oxygen_data.append((
                station_code, station_name, location, ward_id, bed_id,
                capacity, current_level, pressure, flow_rate, patient_id, assigned_staff,
                status, last_refilled, last_maintenance, next_maintenance,
                supplier, cost_per_refill, 20, 10, equipment_serial,
                installation_date, warranty_expiry, f"Oxygen station for bed {bed_id}"
            ))
        
        query = """
        INSERT INTO oxygen_stations 
        (station_code, station_name, location, ward_id, bed_id, capacity_liters, 
         current_level_liters, pressure_psi, flow_rate_lpm, patient_id, assigned_staff_id,
         status, last_refilled, last_maintenance, next_maintenance_due, supplier, 
         cost_per_refill, alert_threshold_low, alert_threshold_critical, equipment_serial,
         installation_date, warranty_expiry, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        self.cursor.executemany(query, oxygen_data)
        print(f"✅ Generated {len(oxygen_data)} oxygen stations")

    def generate_all_data(self):
        """Generate all healthcare data for 2010-2025"""
        try:
            self.connect_db()
            
            print("🚀 Starting comprehensive healthcare data generation (2010-2025)...")
            print("=" * 70)
            
            # Generate reference data first
            self.populate_seasonal_patterns()
            self.populate_outbreaks()
            self.populate_statistics()
            
            # Generate core entities
            self.generate_realistic_patients(count=10000)  # 10k patients
            self.generate_patient_conditions()
            self.generate_staff_data(count=500)  # 500 staff
            self.generate_infrastructure_data()
            
            print("=" * 70)
            print("🎉 Healthcare data generation completed successfully!")
            print("\n📊 Summary:")
            
            # Get counts
            tables = ['fhir_patients', 'patient_conditions', 'staff', 'wards', 'beds', 'oxygen_stations', 
                     'seasonal_disease_patterns', 'disease_outbreaks', 'healthcare_statistics']
            
            for table in tables:
                self.execute_query(f"SELECT COUNT(*) FROM {table}")
                count = self.cursor.fetchone()[0]
                print(f"   {table}: {count:,} records")
            
        except Exception as e:
            print(f"❌ Error during data generation: {e}")
            raise
        finally:
            self.disconnect_db()

if __name__ == "__main__":
    generator = HealthcareDataGenerator()
    generator.generate_all_data()