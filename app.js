// Importar dependencias
const express = require('express');
const { iniciarServer } = require('./config/databaseConfig');
const userRoutes = require('./routes/userRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

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
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://p3-31899312.onrender.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Servidor en Render' 
          : 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};



const swaggerDocs = swaggerJsDoc(swaggerOptions);

if (process.env.NODE_ENV !== 'test') {
    iniciarServer()
};

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', userRoutes);

module.exports = app;
