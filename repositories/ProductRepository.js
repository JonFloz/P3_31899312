const { AppDataSource } = require('../config/databaseConfig');
const Producto = require("../models/Product");
const Tag = require("../models/Tag");
const Category = require("../models/Category");
const { In } = require('typeorm');

class ProductRepository {
  constructor() {
    this.repo = AppDataSource.getRepository(Producto);
    this.tagRepo = AppDataSource.getRepository(Tag);
    this.categoryRepo = AppDataSource.getRepository(Category);
  }

  /**
   * Encuentra un producto por ID con sus relaciones
   */
  async findByIdWithRelations(id) {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'tags'],
    });
  }

  /**
   * Encuentra un producto por ID sin relaciones
   */
  async findById(id) {
    return this.repo.findOneBy({ id });
  }

  /**
   * Encuentra un producto por slug con sus relaciones
   */
  async findBySlug(slug) {
    return this.repo.findOne({ where: { slug }, relations: ['category', 'tags'] });
  }

  /**
   * Crea una nueva instancia de producto
   */
  create(data) {
    return this.repo.create(data);
  }

  /**
   * Guarda un producto
   */
  async save(entity) {
    return this.repo.save(entity);
  }

  /**
   * Guardar con reintentos para colisiones (p. ej. slug único).
   * options: { onConflict: async (err, attempt, entity) => boolean }
   * onConflict debe ajustar la entidad y devolver true para reintentar.
   */
  async saveWithRetry(entity, options = {}, maxRetries = 5) {
    let attempt = 0;
    while (true) {
      try {
        return await this.repo.save(entity);
      } catch (err) {
        attempt += 1;
        const canRetry = attempt <= maxRetries && typeof options.onConflict === 'function';
        if (canRetry) {
          const shouldContinue = await options.onConflict(err, attempt, entity);
          if (shouldContinue) continue;
        }
        // relanzar si no se puede manejar
        throw err;
      }
    }
  }

  /**
   * Elimina un producto
   */
  async remove(entity) {
    return this.repo.remove(entity);
  }

  /**
   * Encuentra tags por IDs numéricos
   * Acepta un array de IDs numéricos
   */
  async findTagsByIds(tagIds) {
    if (!Array.isArray(tagIds) || tagIds.length === 0) return [];
    if (typeof this.tagRepo.findByIds === 'function') {
      return this.tagRepo.findByIds(tagIds);
    }
    return this.tagRepo.findBy({ id: In(tagIds) });
  }

  /**
   * Encuentra una categoría por ID
   */
  async findCategoryById(id) {
    return this.categoryRepo.findOneBy({ id });
  }

  /**
   * Verifica si existe un slug
   */
  async existsSlug(slug) {
    const count = await this.repo.count({ where: { slug } });
    return count > 0;
  }

  /**
   * Genera un slug único agregando sufijos si es necesario
   */
  async generateUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let suffix = 0;
    while (await this.existsSlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
  }

  /**
   * Ejecuta una búsqueda avanzada usando el QueryBuilder
   * Retorna resultados paginados con metadatos
   */
  async findAdvanced(queryBuilder) {
    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  /**
   * Obtiene todos los productos (sin filtros)
   */
  async findAll() {
    return this.repo.find({
      relations: ['category', 'tags'],
    });
  }

  /**
   * Cuenta el total de productos
   */
  async count() {
    return this.repo.count();
  }
}

module.exports = new ProductRepository();