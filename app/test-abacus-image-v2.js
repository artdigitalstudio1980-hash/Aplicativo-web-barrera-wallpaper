// Test script para verificar la API de Chat Completion con generación de imágenes
const https = require('https');

async function testAbacusImageViaChat() {
  const apiKey = '99e8655f67fa4bc9aec1827e7995feb9';
  
  console.log('Testing Abacus AI via Chat Completion API...');
  
  const postData = JSON.stringify({
    model: 'nano-banana',
    messages: [{
      role: 'user',
      content: 'Generate an image: A beautiful modern wallpaper design with geometric patterns in gold and navy blue'
    }],
    max_tokens: 1000
  });
  
  const options = {
    hostname: 'apps.abacus.ai',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('Response:', data);
          resolve(data);
        } catch (e) {
          console.log('Raw response:', data);
          resolve(data);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Error:', e.message);
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

testAbacusImageViaChat().catch(console.error);
