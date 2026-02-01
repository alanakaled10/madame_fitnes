import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './data/database.js';

// Routes
import indexRoutes from './routes/index.js';
import adminRoutes from './routes/admin.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session - disable secure cookie for now to avoid issues
app.use(session({
    secret: process.env.SESSION_SECRET || 'madame-modas-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error.message);
        return res.status(500).render('error', {
            title: 'Erro de Conexao',
            message: 'Erro ao conectar ao banco de dados. Verifique as configuracoes.'
        });
    }
});

// Global variables for views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Pagina nao encontrada' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).render('error', {
        title: 'Erro',
        message: 'Algo deu errado!'
    });
});

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
        console.log(`Catalogo: http://localhost:${PORT}`);
        console.log(`Admin: http://localhost:${PORT}/admin`);
    });
}

// Export for Vercel
export default app;
