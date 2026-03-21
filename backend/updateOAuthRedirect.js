import { dbHelper } from './src/config/database.js';

async function updateOAuthClient() {
  try {
    await dbHelper.query(`
      UPDATE oauth_clients 
      SET redirect_uris = '["http://localhost:5175/auth/callback","http://localhost:5173/auth/callback","http://localhost:3000/auth/callback"]'
      WHERE client_id = 'business-planner'
    `);
    console.log('✅ OAuth client redirect URIs updated');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update OAuth client:', error);
    process.exit(1);
  }
}

updateOAuthClient();
