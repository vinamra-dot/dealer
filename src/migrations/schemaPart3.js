// Schema Part 3: After-Sales, Parts, KYC & CSAT Retention
export const schemaPart3 = [
  {
    name: '005_advanced_dealership_extensions',
    sql: `
      CREATE TABLE IF NOT EXISTS customer_kyc (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(30) NOT NULL,
          pan_number VARCHAR(30),
          aadhaar_masked VARCHAR(30),
          doc_type VARCHAR(50) DEFAULT 'AADHAAR_PAN',
          verification_status VARCHAR(50) DEFAULT 'PENDING',
          uploaded_files TEXT,
          verified_by VARCHAR(100),
          remarks TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS service_job_cards (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          job_card_number VARCHAR(50) UNIQUE NOT NULL,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(30) NOT NULL,
          vehicle_model VARCHAR(100) NOT NULL,
          reg_number VARCHAR(50) NOT NULL,
          odometer_in INTEGER NOT NULL,
          fuel_level VARCHAR(30) DEFAULT '50%',
          service_type VARCHAR(50) DEFAULT 'PERIODIC_MAINTENANCE',
          bay_number VARCHAR(30) DEFAULT 'BAY-01',
          advisor_name VARCHAR(100) NOT NULL,
          technician_name VARCHAR(100),
          estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
          actual_cost NUMERIC(12, 2) DEFAULT 0.00,
          status VARCHAR(50) DEFAULT 'ARRIVED',
          complaints TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS spare_parts (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          part_number VARCHAR(50) UNIQUE NOT NULL,
          part_name VARCHAR(150) NOT NULL,
          category VARCHAR(50) NOT NULL,
          bin_location VARCHAR(50) NOT NULL,
          stock_quantity INTEGER NOT NULL DEFAULT 0,
          min_stock_alert INTEGER NOT NULL DEFAULT 5,
          unit_price NUMERIC(10, 2) NOT NULL,
          compatibility VARCHAR(150),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS csat_surveys (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(30) NOT NULL,
          vehicle_model VARCHAR(100) NOT NULL,
          delivery_date DATE NOT NULL,
          nps_rating INTEGER,
          feedback_category VARCHAR(50) DEFAULT 'SALES_EXPERIENCE',
          comments TEXT,
          survey_status VARCHAR(50) DEFAULT 'COMPLETED',
          first_service_due DATE,
          service_reminder_sent BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
];