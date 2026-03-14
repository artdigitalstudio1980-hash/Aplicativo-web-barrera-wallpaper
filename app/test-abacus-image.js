// Test script para verificar la API de Abacus AI
const fetch = require('node-fetch');

async function testAbacusImageGeneration() {
  const apiKey = process.env.ABACUSAI_API_KEY || '99e8655f67fa4bc9aec1827e7995feb9';
  
  console.log('Testing Abacus AI Image Generation API...');
  console.log('API Key:', apiKey);
  
  // Intentar con el endpoint de generación de imágenes
  try {
    const response = await fetch('https://apps.abacus.ai/api/v0/generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: 'A beautiful modern wallpaper design with geometric patterns',
        model: 'nano-banana'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAbacusImageGeneration();
