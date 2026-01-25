-- Enable PostGIS extension (Run this once per database)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Table (Safe for production)
CREATE TABLE IF NOT EXISTS incidents_spatial (
    id SERIAL PRIMARY KEY,
    mongo_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100),
    location GEOMETRY(Point, 4326)
);

-- Create Spatial Index (Safe)
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents_spatial USING GIST (location);

-- Dummy Data
INSERT INTO incidents_spatial (mongo_id, title, location)
VALUES (
    'dummy_mongo_id_1',
    'Test Incident',
    ST_SetSRID(ST_MakePoint(-73.935242, 40.730610), 4326)
);
