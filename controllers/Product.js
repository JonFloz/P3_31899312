const { AppDataSource } = require('../config/databaseConfig');
const Producto = require("../models/Product");
const Category = require("../models/Category");
const Tag = require("../models/Tag");

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
const { QueryExpressionMap } = require('typeorm/query-builder/QueryExpressionMap.js');

const productController = {
  // Helper: guardar con reintentos para cgitolisiones de slug
  async _saveWithSlugRetries(entity, baseSlug, maxRetries = 4) {
    let attempt = 0;
    const repo = productRepository;
    let slug = baseSlug;
    while (attempt <= maxRetries) {
      try {
        entity.slug = slug;
        const saved = await repo.save(entity);
        return saved;
      } catch (err) {
  // detectar constraint único (slug) o violación de unicidad
        const code = (err && err.code) || '';
        const msg = (err && err.message) || '';
        if (String(code).toUpperCase().includes('SQLITE_CONSTRAINT') || /unique/i.test(msg)) {
          // si habla de slug o es violación única, probar siguiente sufijo
          attempt += 1;
          slug = `${baseSlug}-${attempt}`;
          // continuar loop para reintentar
          continue;
        }
  // error desconocido: relanzar para el manejador externo
        throw err;
      }
    }
    // si llegamos aquí, se agotaron reintentos
    throw new Error('Could not generate unique slug after retries');
  },
  // Público: vista con autocorrección de slug (GET /p/:id-:slug)
  async publicView(req, res) {
    // Ser defensivo: soportar parámetro compuesto id-slug en `:composite`
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

    let id = Number(idParam);
    if (Number.isNaN(id)) {
      const m = idParam.match(/^\d+/);
      id = m ? Number(m[0]) : NaN;
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({ status: "fail", message: "Invalid product id" });
    }

    try {
      const product = await productRepository.findByIdWithRelations(id);

      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }

    const correctSlug = product.slug ? String(product.slug) : slugify(product.name);

  // Normalizar slugs antes de comparar (mayúsculas, acentos, caracteres extra)
    const normalizedUrlSlug = slugify(urlSlug || '');
    const normalizedCorrect = slugify(correctSlug || '');

    if (normalizedUrlSlug !== normalizedCorrect) {
      // conservar prefijo de rutas (ej. /v2) al redirigir
      const base = req.baseUrl || '';
      const canonical = `${base}/p/${product.id}-${correctSlug}`;
      return res.redirect(301, canonical);
    }

      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  // Público: listado paginado y filtrable
  async list(req, res) {
    try {
      const page = Math.max(Number(req.query.page || 1), 1);
      const limit = Math.max(Number(req.query.limit || 10), 1);

      // Extraer filtros de la query
      const filters = {
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
        page,
        limit,
      };

      // Construir query
      const queryBuilder = new ProductQueryBuilder();
      const qb = await queryBuilder.build(filters);

      // Ejecutar búsqueda
      const { items, total } = await productRepository.findAdvanced(qb);
      const totalPages = Math.max(Math.ceil(total / limit), 1);

      return res.status(200).json({
        status: "success",
        data: {
          items,
          meta: { total, page, limit, totalPages }
        }
      });
    } catch (err) {
      console.error('Product list error:', err);
      const message = err.validationErrors 
        ? err.validationErrors.join(', ')
        : err.message || 'Filtros inválidos';
      return res.status(err.status || 400).json({ 
        status: "fail", 
        message,
        error: err.message 
      });
    }
  },

  // Obtener producto por ID (protegido)
  async getById(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const product = await productRepository.findByIdWithRelations(id);
      if (!product) {
        return res.status(404).json({ status: "fail", message: "Product not found" });
      }
      return res.status(200).json({ status: "success", data: product });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  // Crear producto (protegido)
  async create(req, res) {
    const body = req.body || {};
  // Validaciones básicas
    if (!body.name) return res.status(400).json({ status: "fail", message: "Field 'name' is required" });
    if (body.price != null && Number.isNaN(Number(body.price))) {
      return res.status(400).json({ status: "fail", message: "Field 'price' must be a number" });
    }
    if (body.stock != null && Number.isNaN(Number(body.stock))) {
      return res.status(400).json({ status: "fail", message: "Field 'stock' must be a number" });
    }

    try {
      const { categoryId, tags } = body;
      const product = productRepository.create(body);

  // Manejar imagen si existe
      if (req.file) {
        product.image = `/uploads/${req.file.filename}`;
      }

  // generar slug y asegurar unicidad
      const baseSlug = slugify(String(body.name));
      product.slug = await productRepository.generateUniqueSlug(baseSlug);

      if (categoryId) {
        const cat = await productRepository.findCategoryById(Number(categoryId));
        if (!cat) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        product.category = cat;
      }

      if (tags) {
        const tagIds = Array.isArray(tags) ? tags : String(tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        product.tags = foundTags;
      }

  // Guardar con reintentos para evitar carreras en slug
      try {
        const savedProduct = await productRepository.saveWithRetry(product, {
          onConflict: async (err, attempt, ent) => {
            // si constraint por slug, regenerar
            const msg = String(err && err.message || '').toLowerCase();
            if (msg.includes('slug') || /unique/i.test(msg)) {
              ent.slug = `${baseSlug}-${attempt}`;
              return true; // retry
            }
            return false;
          }
        }, 6);
        return res.status(201).json({ status: "success", data: savedProduct });
      } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  // Actualizar producto (protegido)
  async update(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const existing = await productRepository.findByIdWithRelations(id);
      if (!existing) return res.status(404).json({ status: "fail", message: "Product not found" });

      const body = req.body || {};
  // fusionar cambios
      AppDataSource.getRepository(Producto).merge(existing, body);

  // Manejar imagen si existe
      if (req.file) {
        existing.image = `/uploads/${req.file.filename}`;
      }

  // actualizar slug si cambió el nombre
      if (body.name) {
        const baseSlug = slugify(String(body.name));
        // if baseSlug differs from existing.slug, generate unique
        if (!existing.slug || existing.slug !== baseSlug) {
          existing.slug = await productRepository.generateUniqueSlug(baseSlug);
        }
      }

      if (body.categoryId) {
        const cat = await productRepository.findCategoryById(Number(body.categoryId));
        if (!cat) return res.status(404).json({ status: 'fail', message: 'Category not found' });
        existing.category = cat;
      }

      if (body.tags) {
        const tagIds = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => Number(t));
        const foundTags = await productRepository.findTagsByIds(tagIds);
        if (foundTags.length !== tagIds.filter(n => !Number.isNaN(n)).length) {
          return res.status(404).json({ status: 'fail', message: 'One or more tags not found' });
        }
        existing.tags = foundTags;
      }

  // al guardar, manejar colisiones de slug
      try {
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
      } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
      }
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  // Eliminar un producto (protegido)
  async delete(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ status: "fail", message: "Invalid product id" });
    try {
      const product = await productRepository.findById(id);
      if (!product) return res.status(404).json({ status: "fail", message: "Product not found" });

      await productRepository.remove(product);
      return res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },
};

module.exports = productController;
