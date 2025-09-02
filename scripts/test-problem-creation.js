// Test problem creation directly
const mysql = require('mysql2/promise');

async function testProblemCreation() {
  const connection = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 10,
  });

  try {
    console.log('Testing problem creation...');

    // Test inserting a simple problem
    const testProblem = {
      title: "Test Problem",
      difficulty: "Easy",
      topic: "Array",
      description: "This is a test problem",
      examples: JSON.stringify([{ input: "test", output: "test" }]),
      constraints: JSON.stringify(["Test constraint"]),
      test_cases: JSON.stringify([{ input: "test", expectedOutput: "test", hidden: false }]),
      solution_template: JSON.stringify({ javascript: "function test() {}" }),
      companies: JSON.stringify(["Test Company"]),
      acceptance_rate: 50,
      likes: 0,
      dislikes: 0
    };

    const [result] = await connection.execute(`
      INSERT INTO problems (
        title, difficulty, topic, description, examples, constraints,
        test_cases, solution_template, companies, acceptance_rate, likes, dislikes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testProblem.title,
      testProblem.difficulty,
      testProblem.topic,
      testProblem.description,
      testProblem.examples,
      testProblem.constraints,
      testProblem.test_cases,
      testProblem.solution_template,
      testProblem.companies,
      testProblem.acceptance_rate,
      testProblem.likes,
      testProblem.dislikes
    ]);

    console.log('Problem created with ID:', result.insertId);

    // Verify the problem was created
    const [rows] = await connection.execute('SELECT * FROM problems WHERE id = ?', [result.insertId]);
    console.log('Retrieved problem:', rows[0]);

    // Get all problems count
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM problems');
    console.log('Total problems in database:', countRows[0].count);

    await connection.end();
  } catch (error) {
    console.error('Test error:', error);
    await connection.end();
    process.exit(1);
  }
}

testProblemCreation();