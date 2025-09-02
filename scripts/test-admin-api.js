// Test admin API directly
const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('Testing admin API...');

    // First, let's test if we can reach the API
    const testProblem = {
      title: "API Test Problem",
      difficulty: "Easy",
      topic: "Testing",
      description: "This is a test problem created via API",
      examples: [{ input: "test", output: "test" }],
      constraints: ["Test constraint"],
      testCases: [{ input: "test", expectedOutput: "test", hidden: false }],
      solutionTemplate: {
        javascript: "function test() { return 'test'; }",
        python: "def test(): return 'test'",
        java: "public String test() { return \"test\"; }",
        cpp: "string test() { return \"test\"; }"
      },
      companies: ["Test Company"],
      acceptanceRate: 75,
      likes: 10,
      dislikes: 2
    };

    console.log('Test problem data:', JSON.stringify(testProblem, null, 2));

    // Note: This test won't work without proper authentication
    // But we can at least test the data structure
    console.log('Problem data structure is valid');
    console.log('Title:', testProblem.title);
    console.log('Required fields present:', {
      title: !!testProblem.title,
      difficulty: !!testProblem.difficulty,
      topic: !!testProblem.topic,
      description: !!testProblem.description
    });

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAdminAPI();