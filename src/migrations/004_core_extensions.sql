-- Migration 004: Used Car Exchange, Delivery Handover, and Sales Targets
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
