const http = require('http');

const data = JSON.stringify({
  title: "Test from Antigravity JS",
  category: "Verification"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/objectives',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Request failed:');
  console.error(error);
});

req.write(data);
req.end();
