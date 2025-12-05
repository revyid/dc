import dotenv from 'dotenv';
import { createAdminUser, initializeDatabase } from './src/utils/db-firebase.js';
import { hashPassword } from './src/web/auth.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('🔧 Discord Bot Admin Setup\n');
  
  try {
    console.log('Initializing Firebase database...');
    await initializeDatabase();
    console.log('✓ Database initialized\n');

    const username = await question('Create admin username: ');
    if (!username.trim()) {
      console.log('❌ Username cannot be empty');
      rl.close();
      process.exit(1);
    }

    const password = await question('Create admin password: ');
    if (!password.trim()) {
      console.log('❌ Password cannot be empty');
      rl.close();
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);
    await createAdminUser(username, passwordHash);

    console.log('\n✅ Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log('\n📌 Next steps:');
    console.log('1. Verify Firebase environment variables are set in .env');
    console.log('2. Start the bot with: npm start');
    console.log('3. Visit http://localhost:3000 to access the dashboard');

    rl.close();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
