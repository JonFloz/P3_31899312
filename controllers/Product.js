const { AppDataSource } = require('../config/databaseConfig');
const Producto = require("../models/Product");

const slugify = (text = '') =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const productRepository = require('../repositories/ProductRepository');
const ProductQueryBuilder = require('../services/ProductQueryBuilder');

const productController = {
  /**
   * ENDPOINT PÚBLICO: GET /p/:id-:slug
   * Búsqueda pública con Self-Healing URL
   * Redirige a URL canónica si el slug es incorrecto (301 Moved Permanently)
   */
  async publicView(req, res) {
    try {
      // Parsear parámetro compuesto o individual
      let idParam = '';
      let urlSlug = '';
      if (req.params) {
        if (req.params.composite) {
          const comp = String(req.params.composite);
          const hyphenIndex = comp.indexOf('-');
          if (hyphenIndex >= 0) {
            idParam = comp.slice(0, hyphenIndex);
            urlSlug = comp.slice(hyphenIndex + 1);
          } else {
            idParam = comp;
          }
        } else {
          idParam = req.params.id ? String(req.params.id) : '';
          urlSlug = req.params.slug ? String(req.params.slug) : '';
        }
      }

      // Validar ID
      let id = Number(idParam);
      if (Number.isNaN(id)) {
        const m = idParam.match(/^\d+/);
        id = m ? Number(m[0]) : NaN;
      }

      if (Number.isNaN(id)) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      // Buscar producto
      const product = await productRepository.findByIdWithRelations(id);

      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      // Obtener slug correcto
      const correctSlug = product.slug ? String(product.slug) : slugify(product.name);

      // Normalizar slugs para comparación
      const normalizedUrlSlug = slugify(urlSlug || '');
      const normalizedCorrect = slugify(correctSlug || '');

      // Self-Healing: si slug es incorrecto, redirigir a canónico (301)
      if (normalizedUrlSlug !== normalizedCorrect) {
        const base = req.baseUrl || '';
        const canonical = `${base}/p/${product.id}-${correctSlug}`;
        return res.redirect(301, canonical);
      }

      // Slug correcto, devolver producto
      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  /**
   * ENDPOINT PÚBLICO: GET /products
   * Búsqueda avanzada con filtros, paginación y validación centralizada
   * Los errores de validación son manejados por ProductQueryBuilder
   */
  async list(req, res) {
    try {
      // Construir consulta usando el patrón Builder
      const queryBuilder = new ProductQueryBuilder();
      const qb = await queryBuilder.build({
        category: req.query.category,
        tags: req.query.tags,
        price_min: req.query.price_min,
        price_max: req.query.price_max,
        search: req.query.search,
        author: req.query.author,
        genre: req.query.genre,
        series: req.query.series,
        illustrator: req.query.illustrator,
        tomoNumber: req.query.tomoNumber,
        page: req.query.page,
        limit: req.query.limit,
      });

      // Ejecutar búsqueda
      const { items, total } = await productRepository.findAdvanced(qb);

      // Calcular metadatos
      const pagination = queryBuilder.getAppliedFilters().pagination || { page: 1, limit: 10 };
      const totalPages = Math.max(Math.ceil(total / pagination.limit), 1);

      // Respuesta en formato JSend
      return res.status(200).json({
        status: "success",
        data: {
          items,
          meta: {
            total,
            page: pagination.page,
            limit: pagination.limit,
            totalPages,
            filtersApplied: queryBuilder.getAppliedFilters(),
          }
        }
      });
    } catch (err) {
      // El ProductQueryBuilder lanza errores con validationErrors y status
      if (err.status === 400 && err.validationErrors) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid filters",
          errors: err.validationErrors
        });
      }
      return res.status(500).json({
        status: "error",
        message: err.message
      });
    }
  },

  /**
   * ENDPOINT PROTEGIDO: GET /products/:id
   * Obtener un producto por ID con sus relaciones
   */
  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      const product = await productRepository.findByIdWithRelations(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  /**
   * ENDPOINT PROTEGIDO: POST /products
   * Crear un nuevo producto
   */
  async create(req, res) {
    try {
      const body = req.body || {};

      // Validaciones básicas
      if (!body.name) {
        return res.status(400).json({ status: "fail", message: "Field 'name' is required" });
      }
      if (body.price != null && Number.isNaN(Number(body.price))) {
        return res.status(400).json({ status: "fail", message: "Field 'price' must be a number" });
      }
      if (body.stock != null && Number.isNaN(Number(body.stock))) {
        return res.status(400).json({ status: "fail", message: "Field 'stock' must be a number" });
      }

      // Crear instancia de producto
      const product = productRepository.create(body);

      // Generar slug único
      const baseSlug = slugify(String(body.name));
      product.slug = await productRepository.generateUniqueSlug(baseSlug);

      // Asignar categoría si se proporciona
      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) {
          return res.status(404).json({ status: 'fail', message: 'Category not found' });
        }
        product.category = cat;
      }

      // Asignar tags si se proporcionan
      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        product.tags = foundTags;
      }

      // Guardar con reintentos para evitar colisiones de slug
      const savedProduct = await productRepository.saveWithRetry(product, {
        onConflict: async (err, attempt, ent) => {
          const msg = String(err && err.message || '').toLowerCase();
          if (msg.includes('slug') || /unique/i.test(msg)) {
            ent.slug = `${baseSlug}-${attempt}`;
            return true; // retry
          }
          return false;
        }
      }, 6);

      return res.status(201).json({ status: "success", data: savedProduct });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  /**
   * ENDPOINT PROTEGIDO: PUT /products/:id
   * Actualizar un producto existente
   */
  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      // Buscar producto existente
      const existing = await productRepository.findByIdWithRelations(id);
      if (!existing) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      const body = req.body || {};

      // Fusionar cambios
      AppDataSource.getRepository(Producto).merge(existing, body);

      // Actualizar slug si cambió el nombre
      if (body.name) {
        const baseSlug = slugify(String(body.name));
        if (!existing.slug || existing.slug !== baseSlug) {
          existing.slug = await productRepository.generateUniqueSlug(baseSlug);
        }
      }

      // Asignar categoría si se proporciona
      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) {
          return res.status(404).json({ status: 'fail', message: 'Category not found' });
        }
        existing.category = cat;
      }

      // Asignar tags si se proporcionan
      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        existing.tags = foundTags;
      }

      // Guardar con reintentos
      const base = slugify(String(existing.name));
      const saved = await productRepository.saveWithRetry(existing, {
        onConflict: async (err, attempt, ent) => {
          const msg = String(err && err.message || '').toLowerCase();
          if (msg.includes('slug') || /unique/i.test(msg)) {
            ent.slug = `${base}-${attempt}`;
            return true;
          }
          return false;
        }
      }, 6);

      return res.status(200).json({ status: "success", data: saved });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  /**
   * ENDPOINT PROTEGIDO: DELETE /products/:id
   * Eliminar un producto
   */
  async delete(req, res) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ status: "fail", message: "Invalid product id" });
      }

      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

      await productRepository.remove(product);
      return res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },
};

module.exports = productController;
