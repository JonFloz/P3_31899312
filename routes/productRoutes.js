const express = require('express');
const authenticateJWT = require('../middlewares/auth');
const { getAll: getAllCategories, create: createCategory, update: updateCategory, delete: deleteCategory } = require('../controllers/Category');
const { getAll: getAllTags, create: createTag, update: updateTag, delete: deleteTag } = require('../controllers/Tag');
const { list: listProducts, publicView, getById, create, update, delete: deleteProduct } = require('../controllers/Product');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "Shonen"
 *         description:
 *           type: string
 *           example: "Categoría para mangas shounen"
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "Acción"
 *     Manga:
 *       type: object
 *       required:
 *         - name
 *         - author
 *         - tomoNumber
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         name:
 *           type: string
 *           example: "One Piece"
 *         author:
 *           type: string
 *           example: "Eiichiro Oda"
 *         tomoNumber:
 *           type: integer
 *           example: 101
 *         publicationDate:
 *           type: string
 *           format: date
 *           example: "2020-01-01"
 *         price:
 *           type: number
 *           format: float
 *           example: 9.99
 *         stock:
 *           type: integer
 *           example: 12
 *         genre:
 *           type: string
 *           example: "Shounen"
 *         series:
 *           type: string
 *           example: "One Piece"
 *         illustrator:
 *           type: string
 *           example: "Eiichiro Oda"
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           description: ID de la categoría a asociar (debe existir previamente). Consulte GET /v2/categories para ver categorías existentes.
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *           description: Lista de IDs de tags a asociar (deben existir previamente). Consulte GET /v2/tags para ver etiquetas existentes.
 *         slug:
 *           type: string
 *           example: "one-piece-101"

 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Shonen"
 *         description:
 *           type: string
 *           example: "Categoría para mangas shounen"
 *     TagCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Acción"
 *     MangaCreate:
 *       type: object
 *       required:
 *         - name
 *         - author
 *         - tomoNumber
 *       properties:
 *         name:
 *           type: string
 *           example: "One Piece"
 *         author:
 *           type: string
 *           example: "Eiichiro Oda"
 *         tomoNumber:
 *           type: integer
 *           example: 101
 *         publicationDate:
 *           type: string
 *           format: date
 *           example: "2020-01-01"
 *         price:
 *           type: number
 *           format: float
 *           example: 9.99
 *         stock:
 *           type: integer
 *           example: 12
 *         genre:
 *           type: string
 *           example: "Shounen"
 *         series:
 *           type: string
 *           example: "One Piece"
 *         illustrator:
 *           type: string
 *           example: "Eiichiro Oda"
 *         categoryId:
 *           type: integer
 *           nullable: true
 *           description: ID de la categoría a asociar (debe existir previamente)
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *           description: Lista de IDs de tags a asociar (deben existir previamente)
 */
/**
 * @swagger
 * /v2/mangas:
 *   get:
 *     summary: Lista pública de mangas (paginación y filtros)
 *     tags: ["Public - Mangas"]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página (para paginación)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por id o nombre de categoría
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Lista de ids de tags separados por comas
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (name o series)
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filtrar por género
 *       - in: query
 *         name: series
 *         schema:
 *           type: string
 *         description: Filtrar por serie
 *       - in: query
 *         name: illustrator
 *         schema:
 *           type: string
 *         description: Filtrar por ilustrador
 *       - in: query
 *         name: tomoNumber
 *         schema:
 *           type: integer
 *         description: Número de tomo exacto
 *     responses:
 *       200:
 *         description: Lista paginada de mangas
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 items:
 *                   - id: 1
 *                     name: "One Piece"
 *                     author: "Eiichiro Oda"
 *                     tomoNumber: 101
 *                     slug: "one-piece-101"
 *                 total: 42
 *                 totalPages: 5
 *                 page: 1
 *       400:
 *         description: Petición inválida (parámetros de consulta incorrectos)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid query parameters"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

/**
 * @swagger
 * tags:
 *   - name: "Public - Mangas"
 *     description: "Endpoints públicos para listar y consultar mangas"
 *   - name: "Admin - Mangas"
 *     description: "Endpoints protegidos para gestionar mangas"
 *   - name: "Admin - Categories"
 *     description: "Endpoints protegidos para gestionar categorías"
 *   - name: "Admin - Tags"
 *     description: "Endpoints protegidos para gestionar etiquetas"
 */

// Rutas públicas para búsqueda y listado avanzado
// Usar parámetro compuesto id-slug para permitir guiones en el slug
router.get('/p/:composite', publicView);      // Vista pública con autocorrección de slug
router.get('/mangas', listProducts);       // Public mangas listing (filters, pagination)
/**
 * @swagger
 * /v2/p/{composite}:
 *   get:
 *     summary: Vista pública de un manga por id y slug (self-healing)
 *     tags: ["Public - Mangas"]
 *     parameters:
 *       - in: path
 *         name: composite
 *         schema:
 *           type: string
 *         required: true
 *         description: Formato id-slug, por ejemplo 1-one-piece-101. La ruta validará el id y comparará el slug almacenado; si el slug no coincide, devuelve una redirección 301 a la URL canónica.
 *     responses:
 *       200:
 *         description: Manga encontrado y retornado en formato JSend
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "One Piece"
 *                 author: "Eiichiro Oda"
 *                 tomoNumber: 101
 *                 slug: "one-piece-101"
 *       301:
 *         description: Redirección a la URL canónica cuando el slug no coincide
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Moved Permanently"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       404:
 *         description: Manga no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
/**
 * @swagger
 * /v2/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado - token JWT inválido o faltante
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 2
 *                 name: "Shonen"
 *                 description: "Categoría para mangas shounen"
 *       400:
 *         description: Petición inválida (ej. falta el campo requerido)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *               errors:
 *                 - msg: "name is required"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       409:
 *         description: Conflicto - la categoría ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

// Rutas para categories
router.get('/categories', authenticateJWT, getAllCategories);      // Obtener todas las categorías
router.post('/categories', authenticateJWT, require('../middlewares/validators').categoryCreate, createCategory);      // Crear una nueva categoría
router.put('/categories/:id', authenticateJWT, require('../middlewares/validators').categoryUpdate, updateCategory);   // Actualizar una categoría
router.delete('/categories/:id', authenticateJWT, deleteCategory);// Eliminar una categoría

/**
 * @swagger
 * /v2/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría por ID
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Shonen"
 *                 description: "Categoría para mangas shounen actualizada"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category not found"
 *       409:
 *         description: Conflicto - datos duplicados o violación de unicidad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category name already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar categoría por ID
 *     tags: ["Admin - Categories"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Category deleted successfully"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Category not found"
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Cannot delete category with associated products"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

// Rutas para tags
router.get('/tags', authenticateJWT, getAllTags);                 // Obtener todas las etiquetas
router.post('/tags', authenticateJWT, require('../middlewares/validators').tagCreate, createTag);                 // Crear una nueva etiqueta
router.put('/tags/:id', authenticateJWT, require('../middlewares/validators').tagUpdate, updateTag);              // Actualizar una etiqueta
router.delete('/tags/:id', authenticateJWT, deleteTag);           // Eliminar una etiqueta

/**
 * @swagger
 * /v2/tags:
 *   get:
 *     summary: Obtener todas las etiquetas
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de etiquetas
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 - id: 1
 *                   name: "Acción"
 *                 - id: 2
 *                   name: "Aventura"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   post:
 *     summary: Crear una nueva etiqueta
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *     responses:
 *       201:
 *         description: Etiqueta creada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 3
 *                 name: "Acción"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *               errors:
 *                 - msg: "name is required"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       409:
 *         description: Conflicto - la etiqueta ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

/**
 * @swagger
 * /v2/tags/{id}:
 *   put:
 *     summary: Actualizar una etiqueta por ID
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagCreate'
 *     responses:
 *       200:
 *         description: Etiqueta actualizada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "Acción actualizada"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Etiqueta no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag not found"
 *       409:
 *         description: Conflicto - datos duplicados o violación de unicidad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag name already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar etiqueta por ID
 *     tags: ["Admin - Tags"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Etiqueta eliminada
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Tag deleted successfully"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Etiqueta no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Tag not found"
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Cannot delete tag with associated products"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */

/**
 * @swagger
 * /v2/mangas:
 *   post:
 *     summary: Crear un nuevo manga (protegido)
 *     tags: ["Admin - Mangas"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MangaCreate'
 *     responses:
 *       201:
 *         description: Manga creado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 5
 *                 name: "One Piece"
 *                 author: "Eiichiro Oda"
 *                 tomoNumber: 101
 *                 price: 9.99
 *                 stock: 12
 *                 slug: "one-piece-101"
 *       400:
 *         description: Petición inválida (datos faltantes o formato incorrecto)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *               errors:
 *                 - msg: "name is required"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       409:
 *         description: Conflicto - el slug o manga ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga slug already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 * /v2/mangas/{id}:
 *   get:
 *     summary: Obtener un manga por ID (protegido)
 *     tags: ["Admin - Mangas"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Manga encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "One Piece"
 *                 author: "Eiichiro Oda"
 *                 tomoNumber: 101
 *                 price: 9.99
 *                 stock: 12
 *                 slug: "one-piece-101"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Manga no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   put:
 *     summary: Actualizar un manga por ID (protegido)
 *     tags: ["Admin - Mangas"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MangaCreate'
 *     responses:
 *       200:
 *         description: Manga actualizado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 name: "One Piece"
 *                 author: "Eiichiro Oda"
 *                 tomoNumber: 102
 *                 price: 10.99
 *                 stock: 15
 *                 slug: "one-piece-102"
 *       400:
 *         description: Petición inválida
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid request parameters"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Manga no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga not found"
 *       409:
 *         description: Conflicto - el slug ya existe
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga slug already exists"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 *   delete:
 *     summary: Eliminar un manga por ID (protegido)
 *     tags: ["Admin - Mangas"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Manga eliminado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: "Manga deleted successfully"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       404:
 *         description: Manga no encontrado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Manga not found"
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Cannot delete manga with dependencies"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
// Rutas para mangas (protegidas)
router.post('/mangas', authenticateJWT, require('../middlewares/validators').mangaCreate, create);                // Crear un nuevo manga
router.get('/mangas/:id', authenticateJWT, getById);            // Obtener un manga por ID (protegido)
router.put('/mangas/:id', authenticateJWT, require('../middlewares/validators').mangaUpdate, update);             // Actualizar un manga
router.delete('/mangas/:id', authenticateJWT, deleteProduct);   // Eliminar un manga

// ==================== ÓRDENES (CHECKOUT) ====================

const OrderController = require('../controllers/Order');
const orderController = new OrderController();

/**
 * @swagger
 * /v2/orders:
 *   post:
 *     tags:
 *       - Admin - Orders (Checkout)
 *     summary: "Crear orden y procesar pago (Transaccional)"
 *     description: Crea una orden, procesa el pago via tarjeta de crédito y actualiza el stock. Operación ATÓMICA.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, paymentMethod, cardDetails]
 *             properties:
 *               items:
 *                 type: array
 *                 description: Productos a comprar
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               paymentMethod:
 *                 type: string
 *                 enum: [CreditCard]
 *                 example: CreditCard
 *               cardDetails:
 *                 type: object
 *                 required: [cardNumber, fullName, expirationMonth, expirationYear, cvv, currency]
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                     example: "4532015112830366"
 *                   fullName:
 *                     type: string
 *                     example: "John Doe"
 *                   expirationMonth:
 *                     type: integer
 *                     example: 12
 *                   expirationYear:
 *                     type: integer
 *                     example: 2025
 *                   cvv:
 *                     type: string
 *                     example: "123"
 *                   currency:
 *                     type: string
 *                     enum: [USD, EUR, MXN]
 *                     example: USD
 *     responses:
 *       201:
 *         description: Orden creada exitosamente y pago procesado
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 userId: 1
 *                 totalAmount: 49.99
 *                 status: COMPLETED
 *                 paymentMethod: CreditCard
 *                 transactionId: "550e8400-e29b-41d4-a716-446655440000"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 items:
 *                   - id: 1
 *                     orderId: 1
 *                     productId: 1
 *                     quantity: 2
 *                     unitPrice: 24.99
 *                     subtotal: 49.98
 *                     createdAt: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Error en validación o procesamiento de pago
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Insufficient stock for product 'Naruto Vol 1'. Available: 1, Requested: 2"
 *       401:
 *         description: No autorizado (token inválido o ausente)
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
router.post('/orders', authenticateJWT, (req, res) => orderController.createOrder(req, res));

/**
 * @swagger
 * /v2/orders:
 *   get:
 *     tags:
 *       - Admin - Orders
 *     summary: "Obtener historial de órdenes del usuario"
 *     description: Retorna las órdenes del usuario autenticado con paginación
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Órdenes obtenidas exitosamente
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 orders:
 *                   - id: 1
 *                     userId: 1
 *                     totalAmount: 49.99
 *                     status: COMPLETED
 *                     paymentMethod: CreditCard
 *                     transactionId: "550e8400-e29b-41d4-a716-446655440000"
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     items:
 *                       - id: 1
 *                         productId: 1
 *                         quantity: 2
 *                         unitPrice: 24.99
 *                         subtotal: 49.98
 *                   - id: 2
 *                     userId: 1
 *                     totalAmount: 99.98
 *                     status: PENDING
 *                     paymentMethod: CreditCard
 *                     transactionId: "660e8400-e29b-41d4-a716-446655440001"
 *                     createdAt: "2024-01-14T15:45:00Z"
 *                     items:
 *                       - id: 2
 *                         productId: 2
 *                         quantity: 1
 *                         unitPrice: 99.98
 *                         subtotal: 99.98
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 2
 *                 pages: 1
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
router.get('/orders', authenticateJWT, (req, res) => orderController.getOrders(req, res));

/**
 * @swagger
 * /v2/orders/{id}:
 *   get:
 *     tags:
 *       - Admin - Orders
 *     summary: "Obtener detalle de una orden específica"
 *     description: Retorna los detalles de una orden (solo el propietario puede verla)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               data:
 *                 id: 1
 *                 userId: 1
 *                 totalAmount: 49.99
 *                 status: COMPLETED
 *                 paymentMethod: CreditCard
 *                 transactionId: "550e8400-e29b-41d4-a716-446655440000"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T10:35:00Z"
 *                 items:
 *                   - id: 1
 *                     orderId: 1
 *                     productId: 1
 *                     quantity: 2
 *                     unitPrice: 24.99
 *                     subtotal: 49.98
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     product:
 *                       id: 1
 *                       name: "Naruto Vol 1"
 *                       author: "Masashi Kishimoto"
 *                       price: 24.99
 *                       stock: 15
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Invalid token"
 *       403:
 *         description: Orden no pertenece al usuario
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Order does not belong to this user"
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             example:
 *               status: fail
 *               message: "Order not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: "Internal Server Error"
 */
router.get('/orders/:id', authenticateJWT, (req, res) => orderController.getOrderDetail(req, res));

module.exports = router;
