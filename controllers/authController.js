import bcrypt from 'bcryptjs';
import db from '../data/database.js';

// Default admin password (should be changed on first login)
const DEFAULT_PASSWORD = 'admin123';

// Initialize admin user if not exists
async function initializeAdmin() {
    await db.read();

    if (!db.data.users || db.data.users.length === 0) {
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        db.data.users = [{
            id: 'user-001',
            username: 'admin',
            password: hashedPassword,
            name: 'Administrador',
            role: 'admin',
            createdAt: new Date().toISOString()
        }];
        await db.write();
    }
}

// Initialize on module load
await initializeAdmin();

// Login function
export async function login(username, password) {
    await db.read();

    const user = db.data.users.find(u => u.username === username);

    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    // Check if password is the old unhashed placeholder
    if (user.password.startsWith('$2a$')) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { success: false, message: 'Senha incorreta' };
        }
    } else {
        // First login - hash the password
        if (password !== DEFAULT_PASSWORD) {
            return { success: false, message: 'Senha incorreta' };
        }
        // Update with hashed password
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const index = db.data.users.findIndex(u => u.id === user.id);
        db.data.users[index].password = hashedPassword;
        await db.write();
    }

    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }
    };
}

// Logout function
export function logout(req) {
    req.session.destroy();
}

// Change password
export async function changePassword(userId, currentPassword, newPassword) {
    await db.read();

    const user = db.data.users.find(u => u.id === userId);

    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return { success: false, message: 'Senha atual incorreta' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const index = db.data.users.findIndex(u => u.id === userId);
    db.data.users[index].password = hashedPassword;
    await db.write();

    return { success: true, message: 'Senha alterada com sucesso' };
}

// Get user by ID
export async function getUserById(userId) {
    await db.read();
    const user = db.data.users.find(u => u.id === userId);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}
