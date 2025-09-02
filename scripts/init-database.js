#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('🔍 Initializing database...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not found');
    process.exit(1);
  }

  try {
    const connection = mysql.createPool(process.env.DATABASE_URL);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'user',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@talvio.com';
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role, is_admin)
      VALUES (?, ?, 'Admin', 'admin', TRUE)
    `, [adminEmail, adminPassword]);
    console.log('✅ Admin user created');

    // Create resumes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        parsed_data JSON,
        confidence_score DECIMAL(5,2),
        fit_scores JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Resumes table created');

    // Create problems table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS problems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
        topic VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        examples JSON NOT NULL,
        constraints JSON NOT NULL,
        test_cases JSON NOT NULL,
        solution_template JSON NOT NULL,
        acceptance_rate DECIMAL(5,2) DEFAULT 0,
        likes INT DEFAULT 0,
        dislikes INT DEFAULT 0,
        companies JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Problems table created');

    // Create other tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role VARCHAR(100) NOT NULL,
        questions JSON,
        answers JSON,
        score DECIMAL(5,2),
        correct_answers INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        time_spent INT DEFAULT 0,
        feedback JSON,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Interviews table created');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coding_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_id INT NOT NULL,
        language VARCHAR(50) NOT NULL,
        code TEXT,
        test_results JSON,
        score DECIMAL(5,2),
        status ENUM('attempted', 'solved') DEFAULT 'attempted',
        submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id)
      )
    `);
    console.log('✅ Coding sessions table created');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proctoring_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_id VARCHAR(100) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Proctoring logs table created');

    await connection.end();
    console.log('\n🎉 Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();