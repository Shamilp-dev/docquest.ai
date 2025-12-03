// Quick environment check script
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===\n');

const requiredVars = [
  'MONGODB_URI',
  'OPENROUTER_API_KEY',
  'GROQ_API_KEY',
  'JWT_SECRET',
  'EMBEDDING_MODEL'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const preview = value ? value.substring(0, 15) + '...' : 'NOT SET';
  
  console.log(`${isPresent ? '✅' : '❌'} ${varName}: ${preview}`);
  
  if (!isPresent) allPresent = false;
});

console.log('\n' + (allPresent ? '✅ All required variables are set!' : '❌ Some variables are missing!'));
console.log('\nIf deploying to Vercel, make sure to add these in:');
console.log('Vercel Dashboard → Project → Settings → Environment Variables\n');
