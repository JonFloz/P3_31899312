const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: "fail", message: "Acceso denegado: Token no proporcionado" });
    }

    jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
        if (err) {
            return res.status(403).json({ status: "fail", message: "Token no válido" }); 
        }
        req.user = user; // Guarda la información del usuario en la solicitud
        next(); // Continúa con la siguiente función de middleware o ruta
    });
};

module.exports = authenticateJWT;
