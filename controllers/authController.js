import { User } from '../data/database.js';

// Login function
export async function login(username, password) {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
        return { success: false, message: 'Senha incorreta' };
    }

    return {
        success: true,
        user: {
            id: user._id,
            username: user.username,
            name: user.username,
            role: 'admin'
        }
    };
}

// Logout function
export function logout(req) {
    req.session.destroy();
}

// Change password
export async function changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
        return { success: false, message: 'Senha atual incorreta' };
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return { success: true, message: 'Senha alterada com sucesso' };
}

// Get user by ID
export async function getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    return user;
}
