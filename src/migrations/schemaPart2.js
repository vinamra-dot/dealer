// Schema Migrations Part 2: Workflow & Core Extensions
export const schemaPart2 = [
  {
    name: '003_workflow_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
          quotation_id VARCHAR(64) REFERENCES quotations(id),
          vehicle_id VARCHAR(64) REFERENCES vehicles(id),
          otf_number VARCHAR(100) UNIQUE NOT NULL,
          booking_amount NUMERIC(12, 2) NOT NULL,
          booking_status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
          eta_date DATE,
          cancellation_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS finance_records (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
          bank_name VARCHAR(100) NOT NULL,
          loan_amount NUMERIC(12, 2) NOT NULL,
          do_number VARCHAR(100),
          do_status VARCHAR(40) DEFAULT 'PENDING',
          payout_percentage NUMERIC(5, 2) DEFAULT 1.25,
          payout_amount NUMERIC(12, 2) DEFAULT 0,
          remarks TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
          amount NUMERIC(12, 2) NOT NULL,
          payment_type VARCHAR(40) NOT NULL,
          method VARCHAR(30) NOT NULL,
          transaction_ref VARCHAR(100),
          cashier_verified BOOLEAN DEFAULT FALSE,
          verified_by_user_id VARCHAR(64) REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pdi_gatepasses (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          vehicle_id VARCHAR(64) REFERENCES vehicles(id),
          booking_id VARCHAR(64) REFERENCES bookings(id),
          driver_id VARCHAR(64) REFERENCES users(id),
          pass_type VARCHAR(50) DEFAULT 'YARD_TO_SHOWROOM',
          starting_odometer INT DEFAULT 0,
          ending_odometer INT,
          checklist_json TEXT,
          scratch_photo_url TEXT,
          status VARCHAR(40) DEFAULT 'ISSUED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS oem_claims (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
          claim_type VARCHAR(100) NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          submission_status VARCHAR(40) DEFAULT 'DRAFT',
          claim_reference_no VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_dealership ON bookings(dealership_id);
      CREATE INDEX IF NOT EXISTS idx_finance_booking ON finance_records(booking_id);
      CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
      CREATE INDEX IF NOT EXISTS idx_pdi_vehicle ON pdi_gatepasses(vehicle_id);
      CREATE INDEX IF NOT EXISTS idx_claims_booking ON oem_claims(booking_id);
    `
  },
  {
    name: '004_core_extensions',
    sql: `
      CREATE TABLE IF NOT EXISTS used_car_exchanges (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          customer_name VARCHAR(255) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          make VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          manufacturing_year INT NOT NULL,
          kilometers_run INT NOT NULL,
          condition_rating VARCHAR(30) DEFAULT 'GOOD',
          proposed_value NUMERIC(12, 2) NOT NULL,
          approved_value NUMERIC(12, 2) NOT NULL,
          rc_status VARCHAR(50) DEFAULT 'CLEAR',
          new_booking_id VARCHAR(64) REFERENCES bookings(id),
          status VARCHAR(40) DEFAULT 'APPROVED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS delivery_handovers (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
          ledger_balance_cleared BOOLEAN DEFAULT TRUE,
          keys_handed_over BOOLEAN DEFAULT TRUE,
          toolkit_verified BOOLEAN DEFAULT TRUE,
          fastag_affixed BOOLEAN DEFAULT TRUE,
          csi_rating INT DEFAULT 10,
          customer_remarks TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sales_targets (
          id VARCHAR(64) PRIMARY KEY,
          dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          target_month VARCHAR(30) NOT NULL,
          target_deliveries INT DEFAULT 10,
          achieved_deliveries INT DEFAULT 0,
          target_test_drives INT DEFAULT 20,
          achieved_test_drives INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_exchanges_dealership ON used_car_exchanges(dealership_id);
      CREATE INDEX IF NOT EXISTS idx_handovers_booking ON delivery_handovers(booking_id);
      CREATE INDEX IF NOT EXISTS idx_targets_user ON sales_targets(user_id);
    `
  }
];
