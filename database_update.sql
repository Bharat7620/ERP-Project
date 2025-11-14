-- COMPLETE DATABASE FIX FOR DISPATCH AND PACKING
-- Run these SQL commands in MySQL Workbench or MySQL command line

USE Vinar;

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS packing;
DROP TABLE IF EXISTS dispatch;

-- Step 2: Create dispatch table with ALL required columns
CREATE TABLE dispatch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispatch_id VARCHAR(255),
    invoice_no VARCHAR(255),
    invoice_date DATE,
    section VARCHAR(255),
    customer VARCHAR(255),
    qty_issued DOUBLE,
    vehicle_no VARCHAR(255),
    jobwork_no VARCHAR(255),
    challan_no VARCHAR(255),
    po_no VARCHAR(255),
    po_order_date DATE,
    from_location VARCHAR(255),
    destination VARCHAR(255),
    status VARCHAR(255),
    dispatch_date DATE
);

-- Step 3: Create packing table with ALL required columns
CREATE TABLE packing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sr_no INT,
    po_no VARCHAR(255),
    grade VARCHAR(255),
    colour_code VARCHAR(255),
    grade_section VARCHAR(255),
    section_wt VARCHAR(255),
    length DOUBLE,
    no_of_pcs INT,
    qty_in_mt DOUBLE,
    heat_no VARCHAR(255),
    challan_qty DOUBLE,
    challan_no VARCHAR(255),
    customer VARCHAR(255),
    doc_no VARCHAR(255),
    packing_date DATE,
    lorry_no VARCHAR(255),
    status VARCHAR(50),
    dispatch_id BIGINT,
    FOREIGN KEY (dispatch_id) REFERENCES dispatch(id) ON DELETE SET NULL
);

-- Step 4: Verify the tables were created correctly
DESCRIBE dispatch;
DESCRIBE packing;

-- Step 5: Show all tables to confirm
SHOW TABLES;
