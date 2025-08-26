#!/usr/bin/env node

/**
 * Simple API Testing Script
 * This script provides basic end-to-end testing for the School Management API
 * Run with: node test-api.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  role: 'student',
  grade: '10th',
  section: 'A',
  dateOfBirth: '2005-05-15',
  gender: 'male'
};

let authToken = '';
let userId = '';
let studentId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log('green', `✅ ${message}`);
const logError = (message) => log('red', `❌ ${message}`);
const logInfo = (message) => log('blue', `ℹ️  ${message}`);
const logWarning = (message) => log('yellow', `⚠️  ${message}`);

// Test functions
const testHealthCheck = async () => {
  try {
    logInfo('Testing health check endpoint...');
    const response = await axios.get('http://localhost:3000/');
    
    if (response.status === 200 && response.data.status === 'OK') {
      logSuccess('Health check passed');
      return true;
    } else {
      logError('Health check failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Health check failed - ${error.message}`);
    return false;
  }
};

const testUserSignup = async () => {
  try {
    logInfo('Testing user signup...');
    const response = await axios.post(`${BASE_URL}/auth/signup`, TEST_USER);
    
    if (response.status === 201 && response.data.success) {
      authToken = response.data.token;
      userId = response.data.user.id;
      logSuccess(`User signup successful - ID: ${userId}`);
      return true;
    } else {
      logError('User signup failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`User signup failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testUserLogin = async () => {
  try {
    logInfo('Testing user login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.token;
      logSuccess('User login successful');
      return true;
    } else {
      logError('User login failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`User login failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testGetProfile = async () => {
  try {
    logInfo('Testing get profile endpoint...');
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Get profile successful');
      return true;
    } else {
      logError('Get profile failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Get profile failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testCreateStudent = async () => {
  try {
    logInfo('Testing student creation...');
    const studentData = {
      name: 'Test Student',
      email: `student-${Date.now()}@example.com`,
      password: 'password123',
      grade: '11th',
      section: 'B',
      dateOfBirth: '2004-06-20',
      gender: 'female'
    };
    
    const response = await axios.post(`${BASE_URL}/students`, studentData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201 && response.data.success) {
      studentId = response.data.data._id;
      logSuccess(`Student creation successful - ID: ${studentId}`);
      return true;
    } else {
      logError('Student creation failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Student creation failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testGetStudents = async () => {
  try {
    logInfo('Testing get students endpoint...');
    const response = await axios.get(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess(`Get students successful - Found ${response.data.data.length} students`);
      return true;
    } else {
      logError('Get students failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Get students failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testUpdateStudent = async () => {
  if (!studentId) {
    logWarning('Skipping student update test - no student ID available');
    return true;
  }
  
  try {
    logInfo('Testing student update...');
    const updateData = {
      grade: '12th',
      section: 'C'
    };
    
    const response = await axios.put(`${BASE_URL}/students/${studentId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Student update successful');
      return true;
    } else {
      logError('Student update failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Student update failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testCreateTeacher = async () => {
  try {
    logInfo('Testing teacher creation...');
    const teacherData = {
      name: 'Test Teacher',
      email: `teacher-${Date.now()}@example.com`,
      password: 'password123',
      department: 'Science',
      qualification: 'PhD',
      experience: 8,
      dateOfBirth: '1980-08-15',
      gender: 'male'
    };
    
    const response = await axios.post(`${BASE_URL}/teachers`, teacherData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201 && response.data.success) {
      logSuccess(`Teacher creation successful - ID: ${response.data.data._id}`);
      return true;
    } else {
      logError('Teacher creation failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Teacher creation failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testGetTeachers = async () => {
  try {
    logInfo('Testing get teachers endpoint...');
    const response = await axios.get(`${BASE_URL}/teachers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess(`Get teachers successful - Found ${response.data.data.length} teachers`);
      return true;
    } else {
      logError('Get teachers failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Get teachers failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testChangePassword = async () => {
  try {
    logInfo('Testing password change...');
    const response = await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: TEST_USER.password,
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Password change successful');
      return true;
    } else {
      logError('Password change failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Password change failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

const testLogout = async () => {
  try {
    logInfo('Testing logout...');
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Logout successful');
      return true;
    } else {
      logError('Logout failed - unexpected response');
      return false;
    }
  } catch (error) {
    logError(`Logout failed - ${error.response?.data?.message || error.message}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('\n🚀 Starting API Tests...\n');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Create Student', fn: testCreateStudent },
    { name: 'Get Students', fn: testGetStudents },
    { name: 'Update Student', fn: testUpdateStudent },
    { name: 'Create Teacher', fn: testCreateTeacher },
    { name: 'Get Teachers', fn: testGetTeachers },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Logout', fn: testLogout }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`${test.name} failed with error: ${error.message}`);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  console.log(`Total: ${tests.length}`);
  
  if (failed === 0) {
    logSuccess('\n🎉 All tests passed!');
  } else {
    logError('\n💥 Some tests failed!');
  }
  
  console.log('\n' + '='.repeat(50));
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get('http://localhost:3000/', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Main execution
const main = async () => {
  logInfo('Checking if server is running...');
  
  if (!(await checkServer())) {
    logError('Server is not running! Please start the server first:');
    logInfo('npm start');
    logInfo('or');
    logInfo('npm run dev');
    process.exit(1);
  }
  
  logSuccess('Server is running! Starting tests...\n');
  
  try {
    await runTests();
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserSignup,
  testUserLogin,
  testGetProfile,
  testCreateStudent,
  testGetStudents,
  testUpdateStudent,
  testCreateTeacher,
  testGetTeachers,
  testChangePassword,
  testLogout
}; 