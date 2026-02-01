import { Product, Settings } from '../data/database.js';

// Get all products (with optional category filter)
export async function getProducts(category = 'all') {
    let query = { active: true };

    if (category !== 'all') {
        query.category = category;
    }

    return await Product.find(query).sort({ createdAt: -1 });
}

// Get all products including inactive (for admin)
export async function getAllProducts(category = 'all') {
    let query = {};

    if (category !== 'all') {
        query.category = category;
    }

    return await Product.find(query).sort({ createdAt: -1 });
}

// Get product by ID
export async function getProductById(id) {
    try {
        return await Product.findById(id);
    } catch (error) {
        // If ID is not valid ObjectId, return null
        return null;
    }
}

// Get available categories
export async function getCategories() {
    return [
        { id: 'fitness', name: 'Roupas Fitness' },
        { id: 'suplementos', name: 'Suplementos' }
    ];
}

// Create new product
export async function createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
}

// Update product
export async function updateProduct(id, productData) {
    const product = await Product.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true, runValidators: true }
    );

    if (!product) {
        throw new Error('Produto não encontrado');
    }

    return product;
}

// Delete product
export async function deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new Error('Produto não encontrado');
    }

    return true;
}

// Get settings
export async function getSettings() {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create({});
    }

    return settings;
}

// Update settings
export async function updateSettings(settingsData) {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create(settingsData);
    } else {
        Object.assign(settings, settingsData);
        await settings.save();
    }

    return settings;
}
