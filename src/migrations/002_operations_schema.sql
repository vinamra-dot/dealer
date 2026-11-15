-- Migration 002: Vehicle Inventory, Leads, Test Drives, and Quotations
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(64) PRIMARY KEY,
    dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(30) DEFAULT 'PETROL',
    transmission VARCHAR(30) DEFAULT 'MANUAL',
    ex_showroom_price NUMERIC(12, 2) NOT NULL,
    vin VARCHAR(100) UNIQUE,
    engine_no VARCHAR(100),
    status VARCHAR(40) DEFAULT 'AVAILABLE',
    yard_location VARCHAR(100) DEFAULT 'Central Stockyard',
    holding_cost_per_day NUMERIC(8, 2) DEFAULT 350.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(50) DEFAULT 'WALK_IN',
    interested_model VARCHAR(100),
    budget NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'NEW',
    assigned_to_user_id VARCHAR(64) REFERENCES users(id),
    telecaller_user_id VARCHAR(64) REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_drives (
    id VARCHAR(64) PRIMARY KEY,
    dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id),
    consultant_id VARCHAR(64) REFERENCES users(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_mins INT DEFAULT 30,
    status VARCHAR(40) DEFAULT 'SCHEDULED',
    gm_approved BOOLEAN DEFAULT FALSE,
    customer_feedback TEXT,
    rating INT,
    route_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(64) PRIMARY KEY,
    dealership_id VARCHAR(64) REFERENCES dealerships(id) ON DELETE CASCADE,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
    vehicle_model VARCHAR(100) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    ex_showroom_price NUMERIC(12, 2) NOT NULL,
    rto_tax NUMERIC(12, 2) DEFAULT 0,
    insurance_cost NUMERIC(12, 2) DEFAULT 0,
    fastag_fee NUMERIC(8, 2) DEFAULT 600,
    accessories_cost NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    final_on_road_price NUMERIC(12, 2) NOT NULL,
    created_by_user_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(30) DEFAULT 'SENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_dealership ON vehicles(dealership_id);
CREATE INDEX IF NOT EXISTS idx_leads_dealership ON leads(dealership_id);
CREATE INDEX IF NOT EXISTS idx_test_drives_lead ON test_drives(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotations_lead ON quotations(lead_id);
