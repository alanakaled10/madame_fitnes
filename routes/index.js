import express from 'express';
import { getProducts, getProductById, getCategories, getSettings } from '../controllers/productController.js';

const router = express.Router();

// Home - Catálogo
router.get('/', async (req, res) => {
    try {
        const category = req.query.category || 'all';
        const products = await getProducts(category);
        const categories = await getCategories();
        const settings = await getSettings();

        // Busca suplementos para a seção de destaque
        const suplementos = await getProducts('suplementos');

        res.render('index', {
            title: 'Madame Modas - Catálogo',
            products,
            categories,
            settings,
            activeCategory: category,
            suplementos
        });
    } catch (error) {
        console.error('Error loading catalog:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar o catálogo'
        });
    }
});

// Product Details Page
router.get('/produto/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        const settings = await getSettings();

        if (!product) {
            return res.status(404).render('404', {
                title: 'Produto não encontrado'
            });
        }

        res.render('product', {
            title: `${product.name} - Madame Modas`,
            product,
            settings
        });
    } catch (error) {
        console.error('Error loading product:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar o produto'
        });
    }
});

export default router;
