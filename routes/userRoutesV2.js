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
/**
 * @swagger
 * /v2/mangas:
 *   get:
 *     summary: Lista pública de mangas (paginación y filtros)
 *     tags: ["Public - Mangas"]
 *     parameters:
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
		responses:
			201:
				description: Categoría creada
				content:
					application/json:
						schema:
							type: object
							properties:
								status:
									type: string
									example: success
								data:
									$ref: '#/components/schemas/Category'
			400:
				description: Petición inválida (ej. falta el campo requerido)
				content:
					application/json:
						example:
							status: fail
							message: "Invalid request parameters"
			409:
				description: Conflicto - la categoría ya existe
				content:
					application/json:
						example:
							status: fail
							message: "Category already exists"
			500:
				description: Error interno del servidor
				content:
					application/json:
						example:
							status: error
							message: "Internal Server Error"
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Error interno del servidor
 */
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
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Petición inválida (ej. falta el campo requerido)
 *       409:
 *         description: Conflicto - la categoría ya existe
 *       500:
 *         description: Error interno del servidor
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
 *       400:
 *         description: Petición inválida
 *       409:
 *         description: Conflicto - datos duplicados o violación de unicidad
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
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
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *       500:
 *         description: Error interno del servidor
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
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *       500:
 *         description: Error interno del servidor
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
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Petición inválida
 *       409:
 *         description: Conflicto - la etiqueta ya existe
 *       500:
 *         description: Error interno del servidor
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
 *       400:
 *         description: Petición inválida
 *       409:
 *         description: Conflicto - datos duplicados o violación de unicidad
 *       404:
 *         description: Etiqueta no encontrada
 *       500:
 *         description: Error interno del servidor
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
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *       500:
 *         description: Error interno del servidor
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
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Manga'
 *       400:
 *         description: Petición inválida (datos faltantes o formato incorrecto)
 *       409:
 *         description: Conflicto - el slug o manga ya existe
 *       500:
 *         description: Error interno del servidor
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
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       404:
 *         description: Manga no encontrado
 *       500:
 *         description: Error interno del servidor
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
 *       400:
 *         description: Petición inválida
 *       404:
 *         description: Manga no encontrado
 *       409:
 *         description: Conflicto - el slug ya existe
 *       500:
 *         description: Error interno del servidor
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
 *       409:
 *         description: Conflicto - no se puede eliminar por restricciones de integridad
 *       404:
 *         description: Manga no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// Rutas para mangas (protegidas)
router.post('/mangas', authenticateJWT, require('../middlewares/validators').mangaCreate, create);                // Crear un nuevo manga
router.get('/mangas/:id', authenticateJWT, getById);            // Obtener un manga por ID (protegido)
router.put('/mangas/:id', authenticateJWT, require('../middlewares/validators').mangaUpdate, update);             // Actualizar un manga
router.delete('/mangas/:id', authenticateJWT, deleteProduct);   // Eliminar un manga

module.exports = router;
