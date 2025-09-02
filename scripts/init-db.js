// Simple database initialization script
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDB() {
  const connection = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 10,
  });

  try {
    console.log('Creating users table...');
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

    console.log('Creating resumes table...');
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

    console.log('Creating problems table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS problems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
        topic VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        examples JSON,
        constraints JSON,
        test_cases JSON,
        solution_template JSON,
        companies JSON,
        acceptance_rate DECIMAL(5,2) DEFAULT 0,
        likes INT DEFAULT 0,
        dislikes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating coding_sessions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coding_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        problem_id INT NOT NULL,
        code TEXT,
        language VARCHAR(50),
        status ENUM('attempted', 'solved') DEFAULT 'attempted',
        execution_time INT,
        memory_usage INT,
        test_cases_passed INT DEFAULT 0,
        total_test_cases INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id)
      )
    `);

    // Add fit_scores column if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE resumes ADD COLUMN fit_scores JSON
      `);
      console.log('Added fit_scores column to resumes table');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('fit_scores column already exists or other error:', error.message);
      }
    }

    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Adarsh0704##', 12);
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role, is_admin)
      VALUES ('tiwariadarsh1804@gmail.com', ?, 'Admin', 'admin', TRUE)
    `, [adminPassword]);

    console.log('Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database initialization error:', error);
    await connection.end();
    process.exit(1);
  }
}

initDB();