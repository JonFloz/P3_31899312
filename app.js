// Importar dependencias
const express = require('express');
const path = require('path');
const { iniciarServer } = require('./config/databaseConfig');
const userRoutes = require('./routes/userRoutes');
const userRoutesV2 = require('./routes/userRoutesV2');
const productRoutes = require('./routes/productRoutes');
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
        url: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000',
        description: 'Servidor dinámico (Render o local)'
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

// Middleware para parsear JSON y FormData
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (public folder)
app.use(express.static('public'));

// Configurar CORS simple y funcional
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de autenticación y usuarios
app.use('/api', userRoutes);

// Rutas v2 (productos, órdenes, etc)
app.use('/v2', productRoutes);
app.use('/v2', userRoutesV2);

// Servir archivos estáticos del frontend (para arquitectura monorepo)
const frontendPath = path.join(__dirname, './web/dist');
app.use(express.static(frontendPath));

// SPA fallback para React Router (usar regex en lugar de '*')
app.get(/^(?!\/(api|v2|auth|api-docs)).*$/, (req, res) => {
  // Si no es una ruta de API, servir index.html
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 para rutas de API no encontradas
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/v2') || req.path.startsWith('/auth')) {
    return res.status(404).json({ status: 'fail', message: 'Endpoint no encontrado' });
  }
  // Si la carpeta dist no existe, devolver 404 genérico
  res.status(404).json({ status: 'fail', message: 'No encontrado' });
});

// Manejador de errores (debe ir después de las rutas)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
