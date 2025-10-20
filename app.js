// Importar dependencias
const express = require('express');
const bodyParser = require('body-parser');
const { AppDataSource, iniciarServer } = require('./config/databaseConfig');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Ejemplo',
      version: '1.0.0',
      description: 'Documentación de la API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Indica que está utilizando el formato JWT
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo o producción'
      },
      {
        url: 'https://P3_31899312onrender.com',
        description: 'Servidor en Render'
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Inicializar el servidor
if (process.env.NODE_ENV !== 'test') {
    iniciarServer()
};

// Crear una instancia de Express
const app = express();

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Usar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Configurar rutas
app.use('/', userRoutes);

module.exports = app;
