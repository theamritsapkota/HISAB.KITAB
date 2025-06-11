const axios = require('axios');
const fs = require('fs');

// Configuration
const API_BASE = 'http://localhost:5051'; // Updated port
const TEST_RESULTS_FILE = 'test-results.json';

// Test data
const testUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password456'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'password789'
  }
];

const testGroups = [
  {
    name: 'Bali Trip 2024',
    description: 'Vacation expenses for our amazing Bali trip',
    members: ['Alice', 'Bob', 'Charlie']
  },
  {
    name: 'Apartment Roommates',
    description: 'Shared living expenses',
    members: ['Alice', 'Bob']
  },
  {
    name: 'Office Team Lunch',
    description: 'Weekly team lunch expenses',
    members: ['Alice', 'Bob', 'Charlie', 'David']
  }
];

const testExpenses = [
  {
    description: 'Hotel booking in Ubud',
    amount: 450.00,
    paidBy: 'Alice',
    participants: ['Alice', 'Bob', 'Charlie'],
    date: '2024-01-15'
  },
  {
    description: 'Flight tickets',
    amount: 1200.00,
    paidBy: 'Bob',
    participants: ['Alice', 'Bob', 'Charlie'],
    date: '2024-01-10'
  },
  {
    description: 'Dinner at beach restaurant',
    amount: 180.50,
    paidBy: 'Charlie',
    participants: ['Alice', 'Bob', 'Charlie'],
    date: '2024-01-16'
  }
];

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  tests: []
};

let authTokens = {};
let createdGroups = [];
let createdExpenses = [];

// Utility functions
function logTest(name, status, message, data = null) {
  const test = {
    name,
    status,
    message,
    timestamp: new Date().toISOString(),
    data
  };
  
  testResults.tests.push(test);
  testResults.summary.total++;
  testResults.summary[status]++;
  
  const statusEmoji = {
    passed: '✅',
    failed: '❌',
    skipped: '⚠️'
  };
  
  console.log(`${statusEmoji[status]} ${name}: ${message}`);
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
}

function saveTestResults() {
  fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(testResults, null, 2));
  console.log(`\n📊 Test results saved to ${TEST_RESULTS_FILE}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 HEALTH CHECK TESTS');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_BASE}/`);
    logTest('Health Check', 'passed', 'Server is running', {
      status: response.status,
      message: response.data.message,
      timestamp: response.data.timestamp
    });
  } catch (error) {
    logTest('Health Check', 'failed', `Server not responding: ${error.message}`);
  }
  
  try {
    const response = await axios.get(`${API_BASE}/api/test`);
    logTest('API Test Endpoint', 'passed', 'API test endpoint working', {
      status: response.status,
      message: response.data.message
    });
  } catch (error) {
    logTest('API Test Endpoint', 'failed', `API test endpoint failed: ${error.message}`);
  }
}

async function testUserRoutes() {
  console.log('\n👥 USER ROUTES TESTS');
  console.log('='.repeat(50));
  
  // Test user registration
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    try {
      const response = await axios.post(`${API_BASE}/api/users/add`, user);
      logTest(`User Registration - ${user.name}`, 'passed', 'User created successfully', {
        userId: response.data.user?.id,
        email: response.data.user?.email,
        hasToken: !!response.data.token
      });
      
      if (response.data.token) {
        authTokens[user.email] = response.data.token;
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error?.includes('already exists')) {
        logTest(`User Registration - ${user.name}`, 'skipped', 'User already exists');
      } else {
        logTest(`User Registration - ${user.name}`, 'failed', 
          error.response?.data?.error || error.message);
      }
    }
    await delay(100);
  }
  
  // Test user login
  for (const user of testUsers) {
    try {
      const response = await axios.post(`${API_BASE}/api/users/login`, {
        email: user.email,
        password: user.password
      });
      logTest(`User Login - ${user.name}`, 'passed', 'Login successful', {
        userId: response.data.user?.id,
        hasToken: !!response.data.token
      });
      
      if (response.data.token) {
        authTokens[user.email] = response.data.token;
      }
    } catch (error) {
      logTest(`User Login - ${user.name}`, 'failed', 
        error.response?.data?.error || error.message);
    }
    await delay(100);
  }
  
  // Test get all users
  try {
    const response = await axios.get(`${API_BASE}/api/users/`);
    logTest('Get All Users', 'passed', `Retrieved ${response.data.length} users`, {
      userCount: response.data.length,
      users: response.data.map(u => ({ id: u._id, name: u.name, email: u.email }))
    });
  } catch (error) {
    logTest('Get All Users', 'failed', error.response?.data?.error || error.message);
  }
  
  // Test invalid user registration
  try {
    await axios.post(`${API_BASE}/api/users/add`, {
      name: '',
      email: 'invalid-email',
      password: '123'
    });
    logTest('Invalid User Registration', 'failed', 'Should have rejected invalid data');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Invalid User Registration', 'passed', 'Correctly rejected invalid data', {
        error: error.response.data.error
      });
    } else {
      logTest('Invalid User Registration', 'failed', 'Unexpected error type');
    }
  }
}

async function testGroupRoutes() {
  console.log('\n👨‍👩‍👧‍👦 GROUP ROUTES TESTS');
  console.log('='.repeat(50));
  
  // Test group creation
  for (let i = 0; i < testGroups.length; i++) {
    const group = testGroups[i];
    try {
      const response = await axios.post(`${API_BASE}/api/groups/add`, group);
      logTest(`Group Creation - ${group.name}`, 'passed', 'Group created successfully', {
        groupId: response.data.group?._id,
        name: response.data.group?.name,
        memberCount: response.data.group?.members?.length
      });
      
      if (response.data.group?._id) {
        createdGroups.push({
          id: response.data.group._id,
          name: group.name,
          members: group.members
        });
      }
    } catch (error) {
      logTest(`Group Creation - ${group.name}`, 'failed', 
        error.response?.data?.error || error.message);
    }
    await delay(100);
  }
  
  // Test get all groups
  try {
    const response = await axios.get(`${API_BASE}/api/groups/`);
    logTest('Get All Groups', 'passed', `Retrieved ${response.data.length} groups`, {
      groupCount: response.data.length,
      groups: response.data.map(g => ({ id: g._id, name: g.name, memberCount: g.members?.length }))
    });
  } catch (error) {
    logTest('Get All Groups', 'failed', error.response?.data?.error || error.message);
  }
  
  // Test invalid group creation
  try {
    await axios.post(`${API_BASE}/api/groups/add`, {
      name: '',
      members: []
    });
    logTest('Invalid Group Creation', 'failed', 'Should have rejected invalid data');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Invalid Group Creation', 'passed', 'Correctly rejected invalid data', {
        error: error.response.data.error
      });
    } else {
      logTest('Invalid Group Creation', 'failed', 'Unexpected error type');
    }
  }
}

async function testExpenseRoutes() {
  console.log('\n💰 EXPENSE ROUTES TESTS');
  console.log('='.repeat(50));
  
  if (createdGroups.length === 0) {
    logTest('Expense Tests', 'skipped', 'No groups available for expense testing');
    return;
  }
  
  // Test expense creation
  for (let i = 0; i < testExpenses.length && i < createdGroups.length; i++) {
    const expense = testExpenses[i];
    const group = createdGroups[i];
    
    const expenseData = {
      ...expense,
      group: group.id,
      splitAmong: [group.id] // This might need adjustment based on your schema
    };
    
    try {
      const response = await axios.post(`${API_BASE}/api/expenses/add`, expenseData);
      logTest(`Expense Creation - ${expense.description}`, 'passed', 'Expense created successfully', {
        expenseId: response.data.expense?._id,
        amount: expense.amount,
        groupId: group.id
      });
      
      if (response.data.expense?._id) {
        createdExpenses.push({
          id: response.data.expense._id,
          description: expense.description,
          amount: expense.amount,
          groupId: group.id
        });
      }
    } catch (error) {
      logTest(`Expense Creation - ${expense.description}`, 'failed', 
        error.response?.data?.error || error.message);
    }
    await delay(100);
  }
  
  // Test get all expenses
  try {
    const response = await axios.get(`${API_BASE}/api/expenses/`);
    logTest('Get All Expenses', 'passed', `Retrieved ${response.data.length} expenses`, {
      expenseCount: response.data.length,
      totalAmount: response.data.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    });
  } catch (error) {
    logTest('Get All Expenses', 'failed', error.response?.data?.error || error.message);
  }
  
  // Test invalid expense creation
  try {
    await axios.post(`${API_BASE}/api/expenses/add`, {
      title: '',
      amount: -100,
      group: 'invalid-id'
    });
    logTest('Invalid Expense Creation', 'failed', 'Should have rejected invalid data');
  } catch (error) {
    if (error.response?.status >= 400) {
      logTest('Invalid Expense Creation', 'passed', 'Correctly rejected invalid data', {
        error: error.response.data.error
      });
    } else {
      logTest('Invalid Expense Creation', 'failed', 'Unexpected error type');
    }
  }
}

async function testAuthRoutes() {
  console.log('\n🔐 AUTHENTICATION ROUTES TESTS');
  console.log('='.repeat(50));
  
  // Test basic auth login (if available)
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testUsers[0].email,
      password: testUsers[0].password
    });
    logTest('Auth Login', 'passed', 'Authentication successful', {
      hasUser: !!response.data.user,
      hasMessage: !!response.data.message
    });
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Auth Login', 'skipped', 'Auth endpoint not fully implemented');
    } else {
      logTest('Auth Login', 'failed', error.response?.data?.error || error.message);
    }
  }
  
  // Test invalid credentials
  try {
    await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
    logTest('Invalid Auth Login', 'failed', 'Should have rejected invalid credentials');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Invalid Auth Login', 'passed', 'Correctly rejected invalid credentials');
    } else {
      logTest('Invalid Auth Login', 'failed', 'Unexpected error type');
    }
  }
}

async function testErrorHandling() {
  console.log('\n🚨 ERROR HANDLING TESTS');
  console.log('='.repeat(50));
  
  // Test 404 routes
  try {
    await axios.get(`${API_BASE}/api/nonexistent`);
    logTest('404 Handling', 'failed', 'Should return 404 for non-existent routes');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('404 Handling', 'passed', 'Correctly returns 404 for non-existent routes');
    } else {
      logTest('404 Handling', 'failed', 'Unexpected error status');
    }
  }
  
  // Test malformed JSON
  try {
    await axios.post(`${API_BASE}/api/users/add`, 'invalid json', {
      headers: { 'Content-Type': 'application/json' }
    });
    logTest('Malformed JSON Handling', 'failed', 'Should reject malformed JSON');
  } catch (error) {
    if (error.response?.status >= 400) {
      logTest('Malformed JSON Handling', 'passed', 'Correctly rejects malformed JSON');
    } else {
      logTest('Malformed JSON Handling', 'failed', 'Unexpected error handling');
    }
  }
  
  // Test CORS
  try {
    const response = await axios.options(`${API_BASE}/api/users`);
    logTest('CORS Preflight', 'passed', 'CORS preflight working', {
      status: response.status,
      headers: Object.keys(response.headers).filter(h => h.toLowerCase().includes('access-control'))
    });
  } catch (error) {
    logTest('CORS Preflight', 'failed', 'CORS preflight failed');
  }
}

async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('='.repeat(50));
  
  // Test response times
  const endpoints = [
    { name: 'Health Check', url: `${API_BASE}/` },
    { name: 'Get Users', url: `${API_BASE}/api/users/` },
    { name: 'Get Groups', url: `${API_BASE}/api/groups/` },
    { name: 'Get Expenses', url: `${API_BASE}/api/expenses/` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      await axios.get(endpoint.url);
      const responseTime = Date.now() - startTime;
      
      const status = responseTime < 1000 ? 'passed' : 'failed';
      const message = `Response time: ${responseTime}ms`;
      
      logTest(`Performance - ${endpoint.name}`, status, message, {
        responseTime,
        threshold: 1000
      });
    } catch (error) {
      logTest(`Performance - ${endpoint.name}`, 'failed', 'Endpoint not accessible');
    }
  }
  
  // Test concurrent requests
  try {
    const startTime = Date.now();
    const promises = Array(10).fill().map(() => axios.get(`${API_BASE}/`));
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    logTest('Concurrent Requests', 'passed', `10 concurrent requests completed in ${totalTime}ms`, {
      totalTime,
      averageTime: totalTime / 10
    });
  } catch (error) {
    logTest('Concurrent Requests', 'failed', 'Failed to handle concurrent requests');
  }
}

async function generateTestReport() {
  console.log('\n📋 GENERATING TEST REPORT');
  console.log('='.repeat(50));
  
  const { summary } = testResults;
  const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
  
  console.log(`\n📊 TEST SUMMARY`);
  console.log(`Total Tests: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⚠️ Skipped: ${summary.skipped}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  if (summary.failed > 0) {
    console.log(`- Fix ${summary.failed} failing tests`);
  }
  
  if (summary.skipped > 0) {
    console.log(`- Implement ${summary.skipped} skipped features`);
  }
  
  if (successRate < 80) {
    console.log('- Focus on improving API reliability');
  }
  
  console.log('- Add input validation for all endpoints');
  console.log('- Implement proper authentication middleware');
  console.log('- Add rate limiting for production');
  console.log('- Set up proper error logging');
  console.log('- Add API documentation (Swagger/OpenAPI)');
  
  // Generate detailed report
  const detailedReport = {
    ...testResults,
    recommendations: [
      'Implement comprehensive input validation',
      'Add authentication middleware',
      'Set up proper error handling',
      'Add rate limiting',
      'Implement API documentation',
      'Add logging and monitoring',
      'Set up automated testing pipeline'
    ],
    nextSteps: [
      'Connect to MongoDB database',
      'Implement JWT authentication',
      'Add user authorization',
      'Create API documentation',
      'Set up production environment',
      'Add monitoring and alerts'
    ]
  };
  
  fs.writeFileSync('detailed-test-report.json', JSON.stringify(detailedReport, null, 2));
  console.log('\n📄 Detailed report saved to detailed-test-report.json');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE API TESTS');
  console.log('='.repeat(60));
  console.log(`Testing API at: ${API_BASE}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    await testHealthCheck();
    await testUserRoutes();
    await testGroupRoutes();
    await testExpenseRoutes();
    await testAuthRoutes();
    await testErrorHandling();
    await testPerformance();
    
    await generateTestReport();
    saveTestResults();
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR DURING TESTING:', error.message);
    logTest('Test Runner', 'failed', `Critical error: ${error.message}`);
    saveTestResults();
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  testHealthCheck,
  testUserRoutes,
  testGroupRoutes,
  testExpenseRoutes,
  testAuthRoutes,
  testErrorHandling,
  testPerformance
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}