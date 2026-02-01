import express from 'express';
import { getProducts, getProductById, getSettings } from '../controllers/productController.js';
import { User } from '../data/database.js';

const router = express.Router();

// Get all products (with optional category filter)
router.get('/products', async (req, res) => {
    try {
        const category = req.query.category || 'all';
        const products = await getProducts(category);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar produtos' });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Produto não encontrado' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar produto' });
    }
});

// Get settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar configurações' });
    }
});

// Setup route - creates admin user if not exists
router.get('/setup', async (req, res) => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            return res.json({ success: true, message: 'Admin user already exists' });
        }

        await User.create({
            username: 'admin',
            password: 'admin123'
        });

        res.json({ success: true, message: 'Admin user created! Username: admin, Password: admin123' });
    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
