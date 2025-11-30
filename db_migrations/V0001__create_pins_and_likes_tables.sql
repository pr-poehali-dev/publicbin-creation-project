-- PublicBin: tables for pins and likes

-- Pins table
CREATE TABLE IF NOT EXISTS pins (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0
);

-- Likes table (track unique likes by IP to prevent spam)
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    pin_id INTEGER NOT NULL REFERENCES pins(id),
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pin_id, ip_address)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pins_created_at ON pins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_pin_id ON likes(pin_id);