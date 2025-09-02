// Add sample problems for testing
const mysql = require('mysql2/promise');

async function addSampleProblems() {
  const connection = mysql.createPool({
    uri: process.env.DATABASE_URL || 'mysql://4QEAYcFwfCEWisn.root:jH1cHDO08Ia6udys@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test',
    ssl: { rejectUnauthorized: false },
    connectionLimit: 10,
  });

  try {
    console.log('Adding sample problems...');

    const sampleProblems = [
      {
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Array",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        examples: JSON.stringify([
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          },
          {
            input: "nums = [3,2,4], target = 6",
            output: "[1,2]"
          }
        ]),
        constraints: JSON.stringify([
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ]),
        test_cases: JSON.stringify([
          { input: "[2,7,11,15], 9", expectedOutput: "[0,1]", hidden: false },
          { input: "[3,2,4], 6", expectedOutput: "[1,2]", hidden: false },
          { input: "[3,3], 6", expectedOutput: "[0,1]", hidden: true }
        ]),
        solution_template: JSON.stringify({
          javascript: "function twoSum(nums, target) {\n    // Write your solution here\n    \n}",
          python: "def two_sum(nums, target):\n    # Write your solution here\n    pass",
          java: "public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[0];\n}",
          cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}"
        }),
        companies: JSON.stringify(["Google", "Amazon", "Microsoft", "Facebook"]),
        acceptance_rate: 49.5,
        likes: 15420,
        dislikes: 512
      },
      {
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stack",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        examples: JSON.stringify([
          {
            input: 's = "()"',
            output: "true"
          },
          {
            input: 's = "()[]{}"',
            output: "true"
          },
          {
            input: 's = "(]"',
            output: "false"
          }
        ]),
        constraints: JSON.stringify([
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'."
        ]),
        test_cases: JSON.stringify([
          { input: '"()"', expectedOutput: "true", hidden: false },
          { input: '"()[]{}"', expectedOutput: "true", hidden: false },
          { input: '"(]"', expectedOutput: "false", hidden: false },
          { input: '"([)]"', expectedOutput: "false", hidden: true },
          { input: '"{[]}"', expectedOutput: "true", hidden: true }
        ]),
        solution_template: JSON.stringify({
          javascript: "function isValid(s) {\n    // Write your solution here\n    \n}",
          python: "def is_valid(s):\n    # Write your solution here\n    pass",
          java: "public boolean isValid(String s) {\n    // Write your solution here\n    return false;\n}",
          cpp: "bool isValid(string s) {\n    // Write your solution here\n    return false;\n}"
        }),
        companies: JSON.stringify(["Amazon", "Microsoft", "Google", "Bloomberg"]),
        acceptance_rate: 40.8,
        likes: 12340,
        dislikes: 423
      },
      {
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        topic: "Linked List",
        description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        examples: JSON.stringify([
          {
            input: "list1 = [1,2,4], list2 = [1,3,4]",
            output: "[1,1,2,3,4,4]"
          },
          {
            input: "list1 = [], list2 = []",
            output: "[]"
          }
        ]),
        constraints: JSON.stringify([
          "The number of nodes in both lists is in the range [0, 50].",
          "-100 <= Node.val <= 100",
          "Both list1 and list2 are sorted in non-decreasing order."
        ]),
        test_cases: JSON.stringify([
          { input: "[1,2,4], [1,3,4]", expectedOutput: "[1,1,2,3,4,4]", hidden: false },
          { input: "[], []", expectedOutput: "[]", hidden: false },
          { input: "[], [0]", expectedOutput: "[0]", hidden: true }
        ]),
        solution_template: JSON.stringify({
          javascript: "function mergeTwoLists(list1, list2) {\n    // Write your solution here\n    \n}",
          python: "def merge_two_lists(list1, list2):\n    # Write your solution here\n    pass",
          java: "public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n    // Write your solution here\n    return null;\n}",
          cpp: "ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Write your solution here\n    return nullptr;\n}"
        }),
        companies: JSON.stringify(["Amazon", "Microsoft", "Apple", "Adobe"]),
        acceptance_rate: 62.1,
        likes: 9876,
        dislikes: 234
      }
    ];

    for (const problem of sampleProblems) {
      await connection.execute(`
        INSERT IGNORE INTO problems (
          title, difficulty, topic, description, examples, constraints, 
          test_cases, solution_template, companies, acceptance_rate, likes, dislikes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        problem.title,
        problem.difficulty,
        problem.topic,
        problem.description,
        problem.examples,
        problem.constraints,
        problem.test_cases,
        problem.solution_template,
        problem.companies,
        problem.acceptance_rate,
        problem.likes,
        problem.dislikes
      ]);
    }

    console.log('Sample problems added successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error adding sample problems:', error);
    await connection.end();
    process.exit(1);
  }
}

addSampleProblems();