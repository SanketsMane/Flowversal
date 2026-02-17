const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseData = '';
  res.on('data', d => {
    responseData += d;
  });
  
  res.on('end', () => {
    try {
        const json = JSON.parse(responseData);
        const output = JSON.stringify(json, null, 2);
        fs.writeFileSync('login_error_debug.txt', output);
        console.log('Error details saved to login_error_debug.txt');
    } catch (e) {
        console.log('Failed to parse response:');
        console.log(responseData);
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
