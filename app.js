// Importar dependencias
const express = require('express');
const { iniciarServer } = require('./config/databaseConfig');
const userRoutes = require('./routes/userRoutes');
const userRoutesV2 = require('./routes/userRoutesV2');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Config Swagger
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
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo o producción'
      },
      {
        url: 'https://p3-31899312.onrender.com',
        description: 'Servidor en Render'
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

// Montar rutas: v1 en /api, v2 en /api/v2
app.use('/', userRoutes);
app.use('/v2', userRoutesV2);

// Manejador de errores (debe ir después de las rutas)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
