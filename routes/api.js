import express from 'express';
import { getProducts, getProductById, getSettings } from '../controllers/productController.js';

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

export default router;
