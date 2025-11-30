-- Add title and description columns to pins table
ALTER TABLE t_p53620071_publicbin_creation_p.pins 
ADD COLUMN title VARCHAR(200) DEFAULT '',
ADD COLUMN description TEXT DEFAULT '';

-- Create comments table
CREATE TABLE t_p53620071_publicbin_creation_p.comments (
    id SERIAL PRIMARY KEY,
    pin_id INTEGER NOT NULL REFERENCES t_p53620071_publicbin_creation_p.pins(id),
    username VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster comment queries
CREATE INDEX idx_comments_pin_id ON t_p53620071_publicbin_creation_p.comments(pin_id);
CREATE INDEX idx_comments_created_at ON t_p53620071_publicbin_creation_p.comments(created_at DESC);