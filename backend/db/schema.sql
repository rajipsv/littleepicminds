-- littleEpicMinds Database Schema (Neon PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  age INT,
  grade VARCHAR(50),
  level VARCHAR(50) DEFAULT 'seeds', -- 'seeds', 'seekers', 'warriors'
  role VARCHAR(50) DEFAULT 'student', -- 'student', 'parent', 'admin'
  is_premium BOOLEAN DEFAULT FALSE,
  mobile VARCHAR(20),
  account_status VARCHAR(20) DEFAULT 'active',
  password_changed_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token_hash ON password_reset_tokens(token_hash);

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  scripture TEXT DEFAULT 'gita',
  chapter_number INT,
  verse_id VARCHAR(50),
  question TEXT,
  response TEXT,
  notes TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  scripture VARCHAR DEFAULT 'gita',
  chapter_id INT NOT NULL,
  score NUMERIC(5,2) DEFAULT 0,
  best_score NUMERIC(5,2) DEFAULT 0,
  attempts INT DEFAULT 1,
  time_taken INT DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  scripture VARCHAR DEFAULT 'gita',
  chapter INT,
  shloka INT,
  activity_question TEXT,
  activity_response TEXT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, scripture, chapter, shloka)
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  scripture VARCHAR DEFAULT 'gita',
  chapter INT,
  verse VARCHAR,
  score NUMERIC(5,2),
  questions JSONB,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (password: admin123, bcrypt hash)
-- You can generate a fresh hash with: node -e "require('bcrypt').hash('admin123',10).then(h=>console.log(h))"
-- INSERT INTO users (username, email, password_hash, name, role, is_premium, level)
-- VALUES ('admin', 'gen.rajeswari@gmail.com', '$2b$10$...hash...', 'Hub Admin', 'admin', true, 'warriors');
