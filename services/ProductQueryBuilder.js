const { AppDataSource } = require('../config/databaseConfig');
const Manga = require('../models/Product');

/**
 * Clase para validación y sanitización de filtros
 */
class FilterValidator {
  /**
   * Valida y sanitiza un ID numérico
   */
  static validateNumericId(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`Field "${fieldName}" must be a valid number`);
    }
    return num;
  }

  /**
   * Valida y sanitiza un rango de precios
   */
  static validatePriceRange(minPrice, maxPrice) {
    const min = minPrice ? this.validateNumericId(minPrice, 'price_min') : null;
    const max = maxPrice ? this.validateNumericId(maxPrice, 'price_max') : null;

    if (min !== null && min < 0) {
      throw new Error('price_min must be greater than or equal to 0');
    }
    if (max !== null && max < 0) {
      throw new Error('price_max must be greater than or equal to 0');
    }
    if (min !== null && max !== null && min > max) {
      throw new Error('price_min cannot be greater than price_max');
    }

    return { min, max };
  }

  /**
   * Valida y sanitiza un término de búsqueda
   */
  static validateSearchTerm(search) {
    if (!search || typeof search !== 'string') {
      return null;
    }
    const trimmed = String(search).trim();
    if (trimmed.length === 0) {
      return null;
    }
    if (trimmed.length > 100) {
      throw new Error('Search term cannot exceed 100 characters');
    }
    return trimmed;
  }

  /**
   * Valida y convierte tags a array de IDs
   */
  static validateTags(tags) {
    if (!tags) return [];
    let tagIds = [];
    if (Array.isArray(tags)) {
      tagIds = tags;
    } else {
      tagIds = String(tags).split(',').map(t => t.trim());
    }
    // Filter out invalid numeric IDs silently
    const numericIds = tagIds
      .map(t => {
        try {
          return this.validateNumericId(t, 'tag id');
        } catch (err) {
          return null;
        }
      })
      .filter(id => id !== null);
    return numericIds;
  }

  /**
   * Valida una categoría (ID o nombre)
   */
  static validateCategory(category) {
    if (!category) return null;
    const str = String(category).trim();
    if (str.length === 0) return null;
    const num = Number(str);
    if (!Number.isNaN(num)) {
      return { type: 'id', value: num };
    }
    if (str.length > 50) {
      throw new Error('Category name cannot exceed 50 characters');
    }
    return { type: 'name', value: str.toLowerCase() };
  }

  /**
   * Valida un string genérico para filtros personalizados
   */
  static validateStringFilter(value, fieldName, maxLength = 100) {
    if (!value) return null;
    const str = String(value).trim();
    if (str.length === 0) return null;
    if (str.length > maxLength) {
      throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
    }
    return str;
  }
}

/**
 * Clase QueryBuilder mejorada con patrón Builder correcto
 * Comienza con el producto y construye la consulta de forma segura
 */
class ProductQueryBuilder {
  constructor() {
    this.qb = null;
    this.filters = {};
    this.validationErrors = [];
  }

  /**
   * Inicia la construcción del query builder
   * Punto de entrada del patrón Builder
   */
  start() {
    const repo = AppDataSource.getRepository(Manga);
    this.qb = repo.createQueryBuilder('manga')
      .leftJoinAndSelect('manga.category', 'category')
      .leftJoinAndSelect('manga.tags', 'tags');
    this.filters = {};
    this.validationErrors = [];
    return this;
  }

  /**
   * Valida y aplica filtro de categoría
   */
  filterByCategory(category) {
    if (!category) return this;
    try {
      const validated = FilterValidator.validateCategory(category);
      if (!validated) return this;

      this.filters.category = validated;
      if (validated.type === 'id') {
        this.qb.andWhere('category.id = :catId', { catId: validated.value });
      } else {
        this.qb.andWhere('LOWER(category.name) = :catName', { catName: validated.value });
      }
    } catch (err) {
      this.validationErrors.push(`Category filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de tags
   */
  filterByTags(tags) {
    if (!tags) return this;
    try {
      const tagIds = FilterValidator.validateTags(tags);
      if (tagIds.length === 0) return this;

      this.filters.tags = tagIds;
      this.qb.andWhere('tags.id IN (:...tagIds)', { tagIds });
    } catch (err) {
      this.validationErrors.push(`Tags filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de rango de precios
   */
  filterByPriceRange(priceMin, priceMax) {
    if (!priceMin && !priceMax) return this;
    try {
      const { min, max } = FilterValidator.validatePriceRange(priceMin, priceMax);
      this.filters.priceRange = { min, max };

      if (min !== null) {
        this.qb.andWhere('manga.price >= :pmin', { pmin: min });
      }
      if (max !== null) {
        this.qb.andWhere('manga.price <= :pmax', { pmax: max });
      }
    } catch (err) {
      this.validationErrors.push(`Price filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica búsqueda de texto
   */
  filterBySearch(search) {
    if (!search) return this;
    try {
      const searchTerm = FilterValidator.validateSearchTerm(search);
      if (!searchTerm) return this;

      this.filters.search = searchTerm;
      const s = `%${searchTerm.toLowerCase()}%`;
      this.qb.andWhere(
        '(LOWER(manga.name) LIKE :s OR LOWER(manga.series) LIKE :s)',
        { s }
      );
    } catch (err) {
      this.validationErrors.push(`Search filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de autor (filtro personalizado)
   */
  filterByAuthor(author) {
    if (!author) return this;
    try {
      const validated = FilterValidator.validateStringFilter(author, 'author');
      if (!validated) return this;

      this.filters.author = validated;
      this.qb.andWhere('manga.author = :author', { author: validated });
    } catch (err) {
      this.validationErrors.push(`Author filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de género (filtro personalizado)
   */
  filterByGenre(genre) {
    if (!genre) return this;
    try {
      const validated = FilterValidator.validateStringFilter(genre, 'genre');
      if (!validated) return this;

      this.filters.genre = validated;
      this.qb.andWhere('manga.genre = :genre', { genre: validated });
    } catch (err) {
      this.validationErrors.push(`Genre filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de serie (filtro personalizado)
   */
  filterBySeries(series) {
    if (!series) return this;
    try {
      const validated = FilterValidator.validateStringFilter(series, 'series');
      if (!validated) return this;

      this.filters.series = validated;
      this.qb.andWhere('manga.series = :series', { series: validated });
    } catch (err) {
      this.validationErrors.push(`Series filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de ilustrador (filtro personalizado)
   */
  filterByIllustrator(illustrator) {
    if (!illustrator) return this;
    try {
      const validated = FilterValidator.validateStringFilter(illustrator, 'illustrator');
      if (!validated) return this;

      this.filters.illustrator = validated;
      this.qb.andWhere('manga.illustrator = :illustrator', { illustrator: validated });
    } catch (err) {
      this.validationErrors.push(`Illustrator filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Valida y aplica filtro de número de tomo (filtro personalizado)
   */
  filterByTomoNumber(tomoNumber) {
    if (!tomoNumber) return this;
    try {
      const validated = FilterValidator.validateNumericId(tomoNumber, 'tomoNumber');
      if (validated === null) return this;

      if (validated <= 0) {
        throw new Error('tomoNumber must be greater than 0');
      }

      this.filters.tomoNumber = validated;
      this.qb.andWhere('manga.tomoNumber = :tomo', { tomo: validated });
    } catch (err) {
      this.validationErrors.push(`Tomo number filter error: ${err.message}`);
    }
    return this;
  }

  /**
   * Aplica ordenamiento
   */
  orderBy(column = 'id', direction = 'DESC') {
    if (!['id', 'name', 'price', 'createdAt'].includes(column)) {
      this.validationErrors.push(`Invalid order column: ${column}`);
      return this;
    }
    if (!['ASC', 'DESC'].includes(direction.toUpperCase())) {
      this.validationErrors.push(`Invalid order direction: ${direction}`);
      return this;
    }
    this.qb.orderBy(`manga.${column}`, direction.toUpperCase());
    return this;
  }

  /**
   * Aplica paginación
   */
  paginate(page, limit) {
    try {
      let p = FilterValidator.validateNumericId(page, 'page');
      let l = FilterValidator.validateNumericId(limit, 'limit');
      
      p = p === null ? 1 : p;
      l = l === null ? 10 : l;

      if (p < 1) {
        throw new Error('page must be at least 1');
      }
      if (l < 1 || l > 100) {
        throw new Error('limit must be between 1 and 100');
      }

      const offset = (p - 1) * l;
      this.filters.pagination = { page: p, limit: l, offset };
      this.qb.skip(offset).take(l);
    } catch (err) {
      this.validationErrors.push(`Pagination error: ${err.message}`);
    }
    return this;
  }

  /**
   * Construye el query a partir de un objeto de filtros
   * Este método valida todos los filtros de una vez
   */
  async build(filters = {}) {
    this.start();

    // Aplicar filtros en orden
    this.filterByCategory(filters.category);
    this.filterByTags(filters.tags);
    this.filterByPriceRange(filters.price_min, filters.price_max);
    this.filterBySearch(filters.search);
    this.filterByAuthor(filters.author);
    this.filterByGenre(filters.genre);
    this.filterBySeries(filters.series);
    this.filterByIllustrator(filters.illustrator);
    this.filterByTomoNumber(filters.tomoNumber);

    // Ordenamiento y paginación
    this.orderBy('id', 'DESC');
    this.paginate(filters.page, filters.limit);

    // Si hay errores de validación, lanzar excepción
    if (this.validationErrors.length > 0) {
      const error = new Error('Validation errors in filters');
      error.validationErrors = this.validationErrors;
      error.status = 400;
      throw error;
    }

    return this.qb;
  }

  /**
   * Obtiene el QueryBuilder construido
   */
  getQueryBuilder() {
    if (!this.qb) {
      throw new Error('QueryBuilder not initialized. Call build() first.');
    }
    return this.qb;
  }

  /**
   * Obtiene los filtros aplicados
   */
  getAppliedFilters() {
    return this.filters;
  }

  /**
   * Obtiene errores de validación
   */
  getValidationErrors() {
    return this.validationErrors;
  }

  /**
   * Verifica si hay errores
   */
  hasErrors() {
    return this.validationErrors.length > 0;
  }
}

module.exports = ProductQueryBuilder;
module.exports.FilterValidator = FilterValidator;