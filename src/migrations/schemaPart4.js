// Schema Part 4: Body Shop Insurance Claims, Exchange Auctions & HSRP/FASTag
export const schemaPart4 = [
  {
    name: '006_ultimate_dealership_extensions',
    sql: `
      CREATE TABLE IF NOT EXISTS accidental_claims (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          claim_number VARCHAR(50) UNIQUE NOT NULL,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(30) NOT NULL,
          vehicle_model VARCHAR(100) NOT NULL,
          reg_number VARCHAR(50) NOT NULL,
          insurance_company VARCHAR(100) NOT NULL,
          policy_number VARCHAR(50),
          surveyor_name VARCHAR(100),
          surveyor_phone VARCHAR(30),
          estimated_loss NUMERIC(12, 2) DEFAULT 0.00,
          approved_amount NUMERIC(12, 2) DEFAULT 0.00,
          customer_deductible NUMERIC(10, 2) DEFAULT 1000.00,
          claim_status VARCHAR(50) DEFAULT 'SURVEY_SCHEDULED',
          damage_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exchange_auctions (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          used_car_id VARCHAR(64),
          vehicle_name VARCHAR(150) NOT NULL,
          reg_number VARCHAR(50) NOT NULL,
          evaluator_name VARCHAR(100) NOT NULL,
          starting_bid NUMERIC(12, 2) NOT NULL,
          current_highest_bid NUMERIC(12, 2) NOT NULL,
          highest_bidder VARCHAR(100),
          auction_status VARCHAR(40) DEFAULT 'ACTIVE',
          total_bids INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compliance_fitment (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          booking_id VARCHAR(64),
          otf_number VARCHAR(50) NOT NULL,
          customer_name VARCHAR(150) NOT NULL,
          vehicle_model VARCHAR(100) NOT NULL,
          vin VARCHAR(100) NOT NULL,
          reg_number VARCHAR(50),
          front_hsrp_laser_code VARCHAR(50),
          rear_hsrp_laser_code VARCHAR(50),
          fastag_barcode VARCHAR(50),
          fastag_bank VARCHAR(50) DEFAULT 'IDBI_BANK',
          fastag_status VARCHAR(40) DEFAULT 'PENDING',
          hsrp_status VARCHAR(40) DEFAULT 'AFFIXED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
];
