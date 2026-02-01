import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

// Default products for seeding
const defaultProducts = [
    {
        name: 'Blusa Gym Branca',
        category: 'fitness',
        categoryLabel: 'Roupas Fitness',
        price: 89.90,
        description: 'Blusa confortável para treinos intensos',
        fullDescription: 'Blusa de alta qualidade, perfeita para seus treinos mais intensos. Tecido respirável e confortável.',
        image: '/img/produtos/blusa-gym-branca.jpeg',
        images: ['/img/produtos/blusa-gym-branca.jpeg'],
        sizes: ['P', 'M', 'G', 'GG'],
        active: true
    },
    {
        name: 'Conjunto Saia e Blusa',
        category: 'fitness',
        categoryLabel: 'Roupas Fitness',
        price: 159.90,
        description: 'Conjunto elegante e versátil',
        fullDescription: 'Conjunto perfeito para o dia a dia com estilo fitness.',
        image: '/img/produtos/conjunto-saia-e-blusa.jpeg',
        images: ['/img/produtos/conjunto-saia-e-blusa.jpeg'],
        sizes: ['P', 'M', 'G'],
        active: true
    },
    {
        name: 'Conjunto Top Short Folgado',
        category: 'fitness',
        categoryLabel: 'Roupas Fitness',
        price: 149.90,
        description: 'Conforto e estilo para seu treino',
        fullDescription: 'Conjunto confortável e estiloso para seus treinos.',
        image: '/img/produtos/conjunto-top-short-folgado-branco.jpeg',
        images: ['/img/produtos/conjunto-top-short-folgado-branco.jpeg'],
        sizes: ['P', 'M', 'G', 'GG'],
        active: true
    },
    {
        name: 'Secaps Black Chá',
        category: 'suplementos',
        categoryLabel: 'Suplementos',
        price: 89.90,
        description: 'Termogênico com chá verde e cafeína',
        fullDescription: 'Suplemento termogênico para auxiliar na queima de gordura.',
        image: '/img/produtos/secaps-black-cha.jpeg',
        images: ['/img/produtos/secaps-black-cha.jpeg'],
        sizes: [],
        active: true
    },
    {
        name: 'Creatina Gummy',
        category: 'suplementos',
        categoryLabel: 'Suplementos',
        price: 99.90,
        description: 'Creatina em gomas saborosas',
        fullDescription: 'Creatina de alta qualidade em formato de gomas deliciosas.',
        image: '/img/produtos/creatina-gummy.jpeg',
        images: ['/img/produtos/creatina-gummy.jpeg'],
        sizes: [],
        active: true
    }
];

// Cached connection for serverless
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB
export async function connectDB() {
    // If already connected, return the connection
    if (cached.conn) {
        return cached.conn;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('MONGODB_URI not found in environment variables');
        throw new Error('MONGODB_URI not configured');
    }

    // If there's no promise, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
            console.log('MongoDB conectado com sucesso!');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;

        // Seed database if empty
        await seedDatabase();

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error('Erro ao conectar ao MongoDB:', error.message);
        throw error;
    }
}

// Seed database with initial data
async function seedDatabase() {
    try {
        // Check if products exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.insertMany(defaultProducts);
            console.log('Produtos iniciais criados!');
        }

        // Check if admin user exists
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'admin123' // Will be hashed by the model
            });
            console.log('Usuário admin criado! (usuário: admin, senha: admin123)');
        }

        // Check if settings exist
        const settingsExist = await Settings.findOne();
        if (!settingsExist) {
            await Settings.create({});
            console.log('Configurações iniciais criadas!');
        }
    } catch (error) {
        console.error('Erro ao fazer seed do banco:', error.message);
    }
}

// Export models for easy access
export { Product, User, Settings };
