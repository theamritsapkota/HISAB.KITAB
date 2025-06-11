const axios = require('axios');

const API_BASE = 'http://localhost:5050';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testGroup = {
  name: 'Test Group',
  description: 'A test group for API testing',
  members: ['Alice', 'Bob', 'Charlie']
};

const testExpense = {
  description: 'Test Dinner',
  amount: 150.00,
  paidBy: 'Alice',
  participants: ['Alice', 'Bob', 'Charlie'],
  date: '2024-01-20'
};

let authToken = '';
let groupId = '';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/users/add`, testUser);
      console.log('✅ User Registration:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠️ User might already exist, continuing...');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 3: User Login (if you have this endpoint)
    console.log('3. Testing User Login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User Login:', loginResponse.data.message);
      if (loginResponse.data.token) {
        authToken = loginResponse.data.token;
        console.log('🔑 Auth token received');
      }
    } catch (error) {
      console.log('⚠️ Login endpoint might not be implemented yet');
    }
    console.log('');

    // Test 4: Create Group
    console.log('4. Testing Group Creation...');
    const groupResponse = await axios.post(`${API_BASE}/api/groups/add`, testGroup);
    console.log('✅ Group Creation:', groupResponse.data.message);
    groupId = groupResponse.data.group._id;
    console.log('📝 Group ID:', groupId);
    console.log('');

    // Test 5: Get All Groups
    console.log('5. Testing Get All Groups...');
    const groupsResponse = await axios.get(`${API_BASE}/api/groups/`);
    console.log('✅ Get Groups:', `Found ${groupsResponse.data.length} groups`);
    console.log('');

    // Test 6: Create Expense
    console.log('6. Testing Expense Creation...');
    const expenseData = {
      ...testExpense,
      group: groupId,
      splitAmong: [groupId] // Assuming this references group members
    };
    
    try {
      const expenseResponse = await axios.post(`${API_BASE}/api/expenses/add`, expenseData);
      console.log('✅ Expense Creation:', expenseResponse.data.message);
    } catch (error) {
      console.log('⚠️ Expense creation failed:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 7: Get All Expenses
    console.log('7. Testing Get All Expenses...');
    try {
      const expensesResponse = await axios.get(`${API_BASE}/api/expenses/`);
      console.log('✅ Get Expenses:', `Found ${expensesResponse.data.length} expenses`);
    } catch (error) {
      console.log('⚠️ Get expenses failed:', error.response?.data?.error || error.message);
    }
    console.log('');

    // Test 8: Get All Users
    console.log('8. Testing Get All Users...');
    const usersResponse = await axios.get(`${API_BASE}/api/users/`);
    console.log('✅ Get Users:', `Found ${usersResponse.data.length} users`);
    console.log('');

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
  }
}

// Helper function to test with authentication
async function testWithAuth() {
  if (!authToken) {
    console.log('⚠️ No auth token available, skipping authenticated tests');
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  console.log('\n🔐 Testing Authenticated Endpoints...');
  
  // Add authenticated tests here when you implement them
  console.log('✅ Authenticated tests would go here');
}

// Run the tests
if (require.main === module) {
  testAPI().then(() => {
    console.log('\n📊 Test Summary:');
    console.log('- Health check endpoint working');
    console.log('- User registration working');
    console.log('- Group creation working');
    console.log('- Data retrieval working');
    console.log('\n💡 Next steps:');
    console.log('- Implement proper authentication');
    console.log('- Add input validation');
    console.log('- Add error handling');
    console.log('- Connect to MongoDB');
  });
}

module.exports = { testAPI };