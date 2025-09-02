#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not found');
    process.exit(1);
  }

  try {
    const connection = mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionLimit: 1,
    });

    // Test connection
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Test tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables in database`);
    
    await connection.end();
    console.log('✅ Database connection test completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();