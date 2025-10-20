const Usuario = require('../models/usuario'); // Esto sigue siendo correcto
const { AppDataSource } = require('../config/databaseConfig');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Controlador para crear un nuevo usuario
const createUser = async (req, res) => {
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

        // Verificar unicidad del correo
        const existingUser = await AppDataSource.getRepository(Usuario).findOneBy({ email });
        if (existingUser) {
            return res.status(409).json({ status: "fail", message: "El correo ya está en uso" });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // Crear el usuario
        const usuario = AppDataSource.getRepository(Usuario).create({
            nombre,
            email,
            contrasena: hashedPassword,
        });

        // Guardar el usuario en la base de datos
        await AppDataSource.getRepository(Usuario).save(usuario);

        res.status(201).json({
            status: "success",
            data: {
                usuario,
            },
        });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({
            status: "error",
            message: "Error al crear el usuario",
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const userRepository = AppDataSource.getRepository(Usuario);

        // Validar que el ID esté presente y sea un número
        if (!req.params.id || isNaN(Number(req.params.id))) {
            return res.status(400).json({ status: "fail", message: "ID de usuario no válido" });
        }

        const userId = Number(req.params.id);
        const usuario = await userRepository.findOneBy({ id: userId });

        if (!usuario) {
            return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
        }

        // Validar que el cuerpo de la solicitud no esté vacío
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: "fail", message: "No se proporcionaron datos para actualizar" });
        }

        // Definir campos requeridos para la actualización (ajusta según tus necesidades)
        const camposRequeridos = ['nombre', 'apellido', 'email'];

        // Validar que los campos requeridos no estén vacíos
        for (const campo of camposRequeridos) {
            if (req.body[campo] !== undefined) {
                // Trim para eliminar espacios en blanco
                const valorCampo = req.body[campo].trim();
                
                if (valorCampo === '') {
                    return res.status(400).json({ 
                        status: "fail", 
                        message: `El campo '${campo}' no puede estar vacío` 
                    });
                }

                // Actualizar el campo con el valor sin espacios en blanco al inicio o al final
                req.body[campo] = valorCampo;
            }
        }

        // Validar cambios en el correo
        const { email } = req.body;
        if (email && email !== usuario.email) {
            // Validaciones adicionales de formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: "fail", message: "Formato de correo electrónico inválido" });
            }

            const existingUser = await userRepository.findOneBy({ email });
            if (existingUser) {
                return res.status(409).json({ status: "fail", message: "El correo ya está en uso" });
            }
        }

        // Validaciones adicionales para la contraseña
        if (req.body.contrasena) {
            // Ejemplo de validación de longitud de contraseña
            if (req.body.contrasena.length < 8) {
                return res.status(400).json({ 
                    status: "fail", 
                    message: "La contraseña debe tener al menos 8 caracteres" 
                });
            }

            // Hashear la nueva contraseña
            req.body.contrasena = await bcrypt.hash(req.body.contrasena, saltRounds);
        }

        // Actualizar el usuario
        userRepository.merge(usuario, req.body);
        await userRepository.save(usuario);

        res.json({ status: 'success', data: usuario });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};



module.exports = { createUser, updateUser };
