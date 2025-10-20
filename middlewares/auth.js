const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar las variables de entorno desde .env


// Middleware para verificar el token JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado

    // Verificar si el token no está proporcionado
    if (!token) {
        return res.status(401).json({ status: "fail", message: "Acceso denegado: Token no proporcionado" });
    }

    // Verificar el token con la clave secreta de las variables de entorno
    jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
        if (err) {
            return res.status(403).json({ status: "fail", message: "Token no válido" }); // Token inválido
        }
        req.user = user; // Guarda la información del usuario en la solicitud
        next(); // Pasa el control al siguiente middleware o endpoint
    });
};

module.exports = authenticateJWT;
