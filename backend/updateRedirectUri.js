import { dbHelper } from './src/config/database.js';

async function updateRedirectUri() {
  try {
    await dbHelper.query(`UPDATE oauth_clients SET redirect_uris = '["http://localhost:5173/auth/callback"]'`);
    console.log('Updated redirect URIs');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRedirectUri();
