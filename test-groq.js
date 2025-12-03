// Test script to verify Groq API key
require('dotenv').config({ path: '.env.local' });
const Groq = require('groq-sdk').default;

async function testGroq() {
  console.log('Testing Groq API key...');
  console.log('API Key present:', !!process.env.GROQ_API_KEY);
  console.log('API Key (first 10 chars):', process.env.GROQ_API_KEY?.substring(0, 10));
  
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Say 'test successful' if you can read this." }
      ],
      max_tokens: 50,
    });

    console.log('✅ Groq API is working!');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ Groq API Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
    if (error.error) {
      console.error('Details:', error.error);
    }
  }
}

testGroq();
