import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const generateProblems = () => {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const topics = ['Array', 'String', 'Linked List', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Binary Search', 'Two Pointers', 'Stack', 'Queue', 'Hash Table', 'Heap', 'Trie', 'Bit Manipulation', 'Math', 'Sorting', 'Sliding Window', 'Divide and Conquer'];
  
  const problemTemplates = [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
      ],
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
      test_cases: [{ input: { nums: [2,7,11,15], target: 9 }, expected: [0,1] }]
    },
    {
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
      examples: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Reverse the array in-place.' }
      ],
      constraints: ['1 <= s.length <= 10^5'],
      test_cases: [{ input: { s: ["h","e","l","l","o"] }, expected: ["o","l","l","e","h"] }]
    },
    {
      title: 'Maximum Depth of Binary Tree',
      description: 'Given the root of a binary tree, return its maximum depth.',
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'The maximum depth is 3.' }
      ],
      constraints: ['The number of nodes is in the range [0, 10^4]'],
      test_cases: [{ input: { root: [3,9,20,null,null,15,7] }, expected: 3 }]
    },
    {
      title: 'Valid Palindrome',
      description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
      examples: [
        { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: 'After processing: "amanaplanacanalpanama" is a palindrome.' }
      ],
      constraints: ['1 <= s.length <= 2 * 10^5'],
      test_cases: [{ input: { s: "A man, a plan, a canal: Panama" }, expected: true }]
    },
    {
      title: 'Fibonacci Number',
      description: 'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1.',
      examples: [
        { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' }
      ],
      constraints: ['0 <= n <= 30'],
      test_cases: [{ input: { n: 2 }, expected: 1 }]
    }
  ];

  const problems = [];
  
  for (let i = 1; i <= 300; i++) {
    const template = problemTemplates[(i - 1) % problemTemplates.length];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const variant = Math.floor((i - 1) / problemTemplates.length) + 1;
    
    problems.push({
      title: variant > 1 ? `${template.title} ${variant}` : template.title,
      difficulty,
      topic,
      description: template.description + (variant > 1 ? ` (Variant ${variant})` : ''),
      examples: JSON.stringify(template.examples),
      constraints: JSON.stringify(template.constraints),
      test_cases: JSON.stringify(template.test_cases),
      solution_template: JSON.stringify({
        javascript: `var solution = function() {\n    // Write your solution here\n    \n};`,
        python: `def solution():\n    # Write your solution here\n    pass`,
        java: `public class Solution {\n    public void solution() {\n        // Write your solution here\n    }\n}`,
        cpp: `class Solution {\npublic:\n    void solution() {\n        // Write your solution here\n    }\n};`
      }),
      companies: JSON.stringify(['Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple'].slice(0, Math.floor(Math.random() * 3) + 1)),
      likes: Math.floor(Math.random() * 20000) + 1000,
      dislikes: Math.floor(Math.random() * 2000) + 100
    });
  }
  
  return problems;
};

export async function POST(request: NextRequest) {
  try {
    await db.execute('DELETE FROM problems');
    
    const problems = generateProblems();
    
    for (const problem of problems) {
      await db.execute(`
        INSERT INTO problems (title, difficulty, topic, description, examples, constraints, test_cases, solution_template, companies, likes, dislikes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        problem.title, problem.difficulty, problem.topic, problem.description,
        problem.examples, problem.constraints, problem.test_cases, 
        problem.solution_template, problem.companies, problem.likes, problem.dislikes
      ]);
    }

    return NextResponse.json({ message: 'Problems seeded successfully', count: problems.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed problems' }, { status: 500 });
  }
}