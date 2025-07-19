// Simple test script to verify the chat API is working
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/chat';

async function testChatAPI() {
  console.log('🧪 Testing Chat API...\n');
  
  const testMessage = "Hello, can you tell me a joke?";
  
  try {
    console.log(`📤 Sending: "${testMessage}"`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`📥 Response: "${data.reply}"`);
    console.log('\n✅ API test successful!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running with: npm start');
    }
  }
}

// Run the test
testChatAPI();
