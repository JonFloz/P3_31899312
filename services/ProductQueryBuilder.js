const { AppDataSource } = require('../config/databaseConfig');
const Manga = require('../models/Product');

class ProductQueryBuilder {
  constructor() {
    // nothing to init; use AppDataSource on demand
  }

  /**
   * Build a QueryBuilder for products according to filters.
   * filters: { category, tags, price_min, price_max, search, brand, publisher, size, platform, generation, ... }
   */
  build(filters = {}) {
    const repo = AppDataSource.getRepository(Manga);
    const qb = repo.createQueryBuilder('manga')
      .leftJoinAndSelect('manga.category', 'category')
      .leftJoinAndSelect('manga.tags', 'tags');

    const {
      category,
      tags,
      price_min,
      price_max,
      search,
      author,
      genre,
      series,
      illustrator,
      tomoNumber,
      // additional filters can be forwarded as needed
    } = filters;

    // category: id or name
    if (category) {
      if (!Number.isNaN(Number(category))) {
        qb.andWhere('category.id = :catId', { catId: Number(category) });
      } else {
        qb.andWhere('LOWER(category.name) = :catName', { catName: String(category).toLowerCase() });
      }
    }

    // tags: comma separated IDs or array
    if (tags) {
      let tagIds = [];
      if (Array.isArray(tags)) tagIds = tags.map(t => Number(t));
      else tagIds = String(tags).split(',').map(t => Number(t));
      tagIds = tagIds.filter(n => !Number.isNaN(n));
      if (tagIds.length > 0) {
        qb.andWhere('tags.id IN (:...tagIds)', { tagIds });
      }
    }

    // price range
    if (price_min && !Number.isNaN(Number(price_min))) {
      qb.andWhere('manga.price >= :pmin', { pmin: Number(price_min) });
    }
    if (price_max && !Number.isNaN(Number(price_max))) {
      qb.andWhere('manga.price <= :pmax', { pmax: Number(price_max) });
    }

    // text search
    if (search) {
      const s = `%${String(search).toLowerCase()}%`;
      qb.andWhere('(LOWER(manga.name) LIKE :s OR LOWER(manga.series) LIKE :s)', { s });
    }

    // custom filters that map to manga columns
    if (author) qb.andWhere('manga.author = :author', { author: String(author) });
    if (genre) qb.andWhere('manga.genre = :genre', { genre: String(genre) });
    if (series) qb.andWhere('manga.series = :series', { series: String(series) });
    if (illustrator) qb.andWhere('manga.illustrator = :illustrator', { illustrator: String(illustrator) });
    if (tomoNumber && !Number.isNaN(Number(tomoNumber))) qb.andWhere('manga.tomoNumber = :tomo', { tomo: Number(tomoNumber) });

    // Default ordering
  qb.orderBy('manga.id', 'DESC');

    return qb;
  }
}

module.exports = new ProductQueryBuilder();