-- Anti-Bypass Link Protection System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS antibypasser_db;
USE antibypasser_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    link_id VARCHAR(100) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    title VARCHAR(255),
    shortener_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    access_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_link_id (link_id),
    INDEX idx_user_id (user_id)
);

-- Link tokens table (for one-time use tokens)
CREATE TABLE IF NOT EXISTS link_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link_id VARCHAR(100) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    INDEX idx_token (token),
    INDEX idx_link_id (link_id),
    INDEX idx_expires (expires_at)
);

-- Access logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link_id VARCHAR(100) NOT NULL,
    token VARCHAR(255),
    access_type ENUM('success', 'blocked', 'failed') NOT NULL,
    reason VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45),
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_link_id (link_id),
    INDEX idx_accessed_at (accessed_at)
);

-- Settings table (for user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    require_referrer BOOLEAN DEFAULT TRUE,
    min_time_delay INT DEFAULT 5,
    enable_devtools_detection BOOLEAN DEFAULT TRUE,
    enable_automation_detection BOOLEAN DEFAULT TRUE,
    custom_blocked_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
