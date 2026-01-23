-- Migration 11: Add total_ves to packages table
ALTER TABLE packages ADD COLUMN total_ves REAL NOT NULL DEFAULT 0;
