import db from '../data/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all products (with optional category filter)
export async function getProducts(category = 'all') {
    await db.read();

    let products = db.data.products || [];

    // Filter only active products for public view
    products = products.filter(p => p.active !== false);

    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }

    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get all products including inactive (for admin)
export async function getAllProducts(category = 'all') {
    await db.read();

    let products = db.data.products || [];

    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }

    return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get product by ID
export async function getProductById(id) {
    await db.read();
    return db.data.products.find(p => p.id === id);
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
    await db.read();

    const newProduct = {
        id: `prod-${uuidv4()}`,
        ...productData,
        createdAt: new Date().toISOString()
    };

    db.data.products.push(newProduct);
    await db.write();

    return newProduct;
}

// Update product
export async function updateProduct(id, productData) {
    await db.read();

    const index = db.data.products.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error('Produto não encontrado');
    }

    db.data.products[index] = {
        ...db.data.products[index],
        ...productData,
        updatedAt: new Date().toISOString()
    };

    await db.write();

    return db.data.products[index];
}

// Delete product
export async function deleteProduct(id) {
    await db.read();

    const index = db.data.products.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error('Produto não encontrado');
    }

    db.data.products.splice(index, 1);
    await db.write();

    return true;
}

// Get settings
export async function getSettings() {
    await db.read();
    return db.data.settings || {};
}

// Update settings
export async function updateSettings(settingsData) {
    await db.read();

    db.data.settings = {
        ...db.data.settings,
        ...settingsData
    };

    await db.write();

    return db.data.settings;
}
