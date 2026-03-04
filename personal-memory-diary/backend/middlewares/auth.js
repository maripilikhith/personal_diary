const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    if (!auth) {
        // Fallback for development if Firebase is not yet configured
        console.warn('Firebase Auth not configured. Bypassing auth for dev.');
        req.user = { uid: 'dev-user-id', email: 'dev@example.com' };
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken; // decodedToken contains uid, email, etc.
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { verifyToken };
