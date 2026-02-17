
import axios from 'axios';

async function testLogin() {
  console.log('--- Testing Login Functionality ---');
  const baseUrl = 'http://localhost:4000/api/v1';
  const testEmail = 'test@example.com';
  const testPassword = 'Password123!'; // Assuming this is the test account password

  try {
    console.log(`Attempting login for: ${testEmail}`);
    const response = await axios.post(`${baseUrl}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('User Data:', JSON.stringify(response.data.user, null, 2));
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Server returned ${error.response.status}:`, error.response.data);
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

testLogin();
