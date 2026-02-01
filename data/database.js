import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default data structure
const defaultData = {
    products: [],
    users: [],
    settings: {
        storeName: 'Madame Modas',
        storeSlogan: 'Moda Feminina & Fitness',
        whatsappNumber: '5500000000000',
        instagram: '@madamemodas',
        email: 'contato@madamemodas.com'
    }
};

// Configure lowdb
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, defaultData);

// Initialize database
async function initDb() {
    await db.read();
    db.data ||= defaultData;
    await db.write();
}

// Initialize on import
await initDb();

export default db;
