import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from '../middleware/auth.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getSettings,
    updateSettings
} from '../controllers/productController.js';
import { login, logout, changePassword } from '../controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image and video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img/produtos'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Helper function to check if file is video
function isVideo(filename) {
    return /\.(mp4|webm|mov)$/i.test(filename);
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        // Check if it's a valid image
        const imageExts = ['.jpeg', '.jpg', '.png', '.webp'];
        const isImage = imageExts.includes(ext) || file.mimetype.startsWith('image/');

        // Check if it's a valid video
        const videoExts = ['.mp4', '.webm', '.mov'];
        const isVideoFile = videoExts.includes(ext) || file.mimetype.startsWith('video/');

        if (isImage || isVideoFile) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens (jpeg, jpg, png, webp) e vídeos (mp4, webm, mov) são permitidos'));
        }
    }
});

// ==================== AUTH ROUTES ====================

// Login Page
router.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/admin');
    }
    res.render('admin/login', {
        title: 'Admin - Login',
        error: null
    });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await login(username, password);

        if (result.success) {
            req.session.isAuthenticated = true;
            req.session.user = result.user;
            res.redirect('/admin');
        } else {
            res.render('admin/login', {
                title: 'Admin - Login',
                error: result.message
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('admin/login', {
            title: 'Admin - Login',
            error: 'Erro ao fazer login'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    logout(req);
    res.redirect('/admin/login');
});

// ==================== PROTECTED ROUTES ====================

// Dashboard
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const products = await getProducts('all');
        const settings = await getSettings();

        const stats = {
            totalProducts: products.length,
            fitnessProducts: products.filter(p => p.category === 'fitness').length,
            suplementosProducts: products.filter(p => p.category === 'suplementos').length,
            activeProducts: products.filter(p => p.active).length
        };

        res.render('admin/dashboard', {
            title: 'Admin - Dashboard',
            stats,
            settings
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar dashboard'
        });
    }
});

// Products List
router.get('/produtos', isAuthenticated, async (req, res) => {
    try {
        const category = req.query.category || 'all';
        const products = await getProducts(category);
        const categories = await getCategories();

        res.render('admin/products', {
            title: 'Admin - Produtos',
            products,
            categories,
            activeCategory: category,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Products list error:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar produtos'
        });
    }
});

// New Product Form
router.get('/produtos/novo', isAuthenticated, async (req, res) => {
    try {
        const categories = await getCategories();
        res.render('admin/product-form', {
            title: 'Admin - Novo Produto',
            product: null,
            categories,
            isEdit: false,
            error: null
        });
    } catch (error) {
        console.error('New product form error:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar formulário'
        });
    }
});

// Create Product
router.post('/produtos/novo', isAuthenticated, upload.array('media', 10), async (req, res) => {
    try {
        const { name, category, price, description, fullDescription, sizes } = req.body;

        // Separate images and videos
        const images = [];
        const videos = [];
        req.files.forEach(file => {
            const filePath = `/img/produtos/${file.filename}`;
            if (isVideo(file.filename)) {
                videos.push(filePath);
            } else {
                images.push(filePath);
            }
        });

        const productData = {
            name,
            category,
            categoryLabel: category === 'fitness' ? 'Roupas Fitness' : 'Suplementos',
            price: parseFloat(price),
            description,
            fullDescription,
            image: images[0] || '/img/produtos/placeholder.jpg',
            images: images.length > 0 ? images : ['/img/produtos/placeholder.jpg'],
            videos: videos,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            active: true
        };

        await createProduct(productData);
        res.redirect('/admin/produtos?success=Produto criado com sucesso!');
    } catch (error) {
        console.error('Create product error:', error);
        const categories = await getCategories();
        res.render('admin/product-form', {
            title: 'Admin - Novo Produto',
            product: req.body,
            categories,
            isEdit: false,
            error: 'Erro ao criar produto: ' + error.message
        });
    }
});

// Edit Product Form
router.get('/produtos/editar/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        const categories = await getCategories();

        if (!product) {
            return res.redirect('/admin/produtos?error=Produto não encontrado');
        }

        res.render('admin/product-form', {
            title: 'Admin - Editar Produto',
            product,
            categories,
            isEdit: true,
            error: null
        });
    } catch (error) {
        console.error('Edit product form error:', error);
        res.redirect('/admin/produtos?error=Erro ao carregar produto');
    }
});

// Update Product
router.post('/produtos/editar/:id', isAuthenticated, upload.array('media', 10), async (req, res) => {
    try {
        const { name, category, price, description, fullDescription, sizes, active, keepImages, keepVideos } = req.body;

        const existingProduct = await getProductById(req.params.id);
        if (!existingProduct) {
            return res.redirect('/admin/produtos?error=Produto não encontrado');
        }

        let images = existingProduct.images || [];
        let videos = existingProduct.videos || [];

        // If new files uploaded, separate images and videos
        if (req.files && req.files.length > 0) {
            const newImages = [];
            const newVideos = [];
            req.files.forEach(file => {
                const filePath = `/img/produtos/${file.filename}`;
                if (isVideo(file.filename)) {
                    newVideos.push(filePath);
                } else {
                    newImages.push(filePath);
                }
            });

            // Handle images
            if (newImages.length > 0) {
                images = keepImages === 'true' ? [...existingProduct.images, ...newImages] : newImages;
            }

            // Handle videos
            if (newVideos.length > 0) {
                videos = keepVideos === 'true' ? [...(existingProduct.videos || []), ...newVideos] : newVideos;
            }
        }

        const productData = {
            name,
            category,
            categoryLabel: category === 'fitness' ? 'Roupas Fitness' : 'Suplementos',
            price: parseFloat(price),
            description,
            fullDescription,
            image: images[0],
            images,
            videos,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            active: active === 'true'
        };

        await updateProduct(req.params.id, productData);
        res.redirect('/admin/produtos?success=Produto atualizado com sucesso!');
    } catch (error) {
        console.error('Update product error:', error);
        res.redirect(`/admin/produtos/editar/${req.params.id}?error=Erro ao atualizar produto`);
    }
});

// Delete Product
router.post('/produtos/excluir/:id', isAuthenticated, async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        res.redirect('/admin/produtos?success=Produto excluído com sucesso!');
    } catch (error) {
        console.error('Delete product error:', error);
        res.redirect('/admin/produtos?error=Erro ao excluir produto');
    }
});

// Toggle Product Status
router.post('/produtos/toggle/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        if (product) {
            await updateProduct(req.params.id, { active: !product.active });
        }
        res.redirect('/admin/produtos');
    } catch (error) {
        console.error('Toggle product error:', error);
        res.redirect('/admin/produtos?error=Erro ao alterar status');
    }
});

// Settings Page
router.get('/configuracoes', isAuthenticated, async (req, res) => {
    try {
        const settings = await getSettings();
        res.render('admin/settings', {
            title: 'Admin - Configurações',
            settings,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).render('error', {
            title: 'Erro',
            message: 'Erro ao carregar configurações'
        });
    }
});

// Update Settings
router.post('/configuracoes', isAuthenticated, async (req, res) => {
    try {
        const { storeName, storeSlogan, whatsappNumber, instagram, email } = req.body;
        await updateSettings({ storeName, storeSlogan, whatsappNumber, instagram, email });
        res.redirect('/admin/configuracoes?success=Configurações atualizadas!');
    } catch (error) {
        console.error('Update settings error:', error);
        res.redirect('/admin/configuracoes?error=Erro ao salvar configurações');
    }
});

// Change Password
router.post('/alterar-senha', isAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.redirect('/admin/configuracoes?error=As senhas não coincidem');
        }

        const result = await changePassword(req.session.user.id, currentPassword, newPassword);

        if (result.success) {
            res.redirect('/admin/configuracoes?success=Senha alterada com sucesso!');
        } else {
            res.redirect('/admin/configuracoes?error=' + result.message);
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.redirect('/admin/configuracoes?error=Erro ao alterar senha');
    }
});

export default router;
