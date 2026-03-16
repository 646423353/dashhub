-- DashHub 数据库建表 SQL
-- 执行方式：mysql -u root -p aa123456 < schema.sql

CREATE DATABASE IF NOT EXISTS dashhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dashhub;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  type ENUM('brand', 'traffic', 'ai_agent') NOT NULL,
  logo VARCHAR(500),
  cover_image VARCHAR(500),
  video_url VARCHAR(500),
  disclosure_protocol TEXT,
  is_pinned TINYINT(1) DEFAULT 0,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cooperation_form TEXT COMMENT '简洁合作形式概述',
  use_dashtro TINYINT(1) DEFAULT 0 COMMENT '是否使用 Dashtro 分账(1=是,0=否)',
  dashtro_agreement TEXT COMMENT 'Dashtro 的分账协议详情内容',
  INDEX idx_creator (creator_id),
  INDEX idx_type (type),
  INDEX idx_pinned (is_pinned),
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 项目统计表
CREATE TABLE IF NOT EXISTS project_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL UNIQUE,
  total_transaction_amount DECIMAL(15,2) DEFAULT 0.00,
  total_revenue_share_amount DECIMAL(15,2) DEFAULT 0.00,
  weekly_transaction_amount DECIMAL(15,2) DEFAULT 0.00,
  weekly_revenue_share_amount DECIMAL(15,2) DEFAULT 0.00,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 邮件验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type ENUM('register', 'reset_password', 'login') DEFAULT 'register',
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_code (email, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  query VARCHAR(500) NOT NULL,
  result_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  revenue_share_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project (project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
