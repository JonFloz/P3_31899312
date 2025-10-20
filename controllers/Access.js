const Usuario = require('../models/usuario');
const { AppDataSource } = require('../config/databaseConfig');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const registerUser = async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;

        // Validar que todos los campos estén presentes
        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ status: "fail", message: "Todos los campos son obligatorios" });
        }

        // Validar el formato del correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: "fail", message: "El correo electrónico no es válido" });
        }

        // Validar unicidad del email
        const existingUser = await AppDataSource.getRepository(Usuario).findOneBy({ email });
        if (existingUser) {
            return res.status(409).json({ status: "fail", message: "El correo ya está en uso" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Crear el usuario
        const usuario = AppDataSource.getRepository(Usuario).create({
            nombre,
            email,
            contrasena: hashedPassword,
        });

        // Guardar el usuario en la base de datos
        await AppDataSource.getRepository(Usuario).save(usuario);

        // Eliminar la contraseña de la respuesta
        const { contrasena: _, ...usuarioData } = usuario;
        res.status(201).json({ status: "success", data: usuarioData });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al registrar el usuario", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        // Verificar que email y contrasena estén presentes y no estén vacíos
        if (!email || typeof email !== 'string' || email.trim() === "") {
            return res.status(400).json({ status: "fail", message: "El campo email es obligatorio y no puede estar vacío." });
        }

        if (!contrasena || typeof contrasena !== 'string' || contrasena.trim() === "") {
            return res.status(400).json({ status: "fail", message: "El campo contrasena es obligatorio y no puede estar vacío." });
        }

        // Comprobar si el formato del correo es válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: "fail", message: "El correo electrónico no es válido." });
        }

        const usuario = await AppDataSource.getRepository(Usuario).findOneBy({ email });

        // Comprobamos si el usuario existe y si la contraseña es correcta
        if (!usuario) {
            return res.status(401).json({ status: "fail", message: "Credenciales inválidas." });
        }

        const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordMatch) {
            return res.status(401).json({ status: "fail", message: "Credenciales inválidas." });
        }

        // Generar el token JWT
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ status: "success", token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ status: "error", message: "Error al iniciar sesión." });
    }
};


module.exports = {
    registerUser,
    loginUser
};
