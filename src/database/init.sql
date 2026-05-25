
-- Create custom Enum Status Type safely if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seat_status') THEN
        CREATE TYPE seat_status AS ENUM ('AVAILABLE', 'RESERVED', 'CONFIRMED');
    END IF;
END $$;


CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    seat_number VARCHAR(50) NOT NULL,
    status seat_status DEFAULT 'AVAILABLE',
    reserved_by VARCHAR(255) DEFAULT NULL,
    reserved_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    UNIQUE(event_id, seat_number)
);
