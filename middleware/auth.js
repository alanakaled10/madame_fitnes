// Authentication middleware
export function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/admin/login');
}

// Admin role check middleware
export function isAdmin(req, res, next) {
    if (req.session.isAuthenticated && req.session.user?.role === 'admin') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Acesso Negado',
        message: 'Você não tem permissão para acessar esta página'
    });
}
