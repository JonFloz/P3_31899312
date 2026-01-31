const { AppDataSource } = require('../config/databaseConfig');
const Category = require("../models/Category");

const categoryController = {
  async getAll(req, res) {
    try {
      const categories = await AppDataSource.getRepository(Category).find();
      return res.status(200).json({ status: "success", data: categories });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      const category = await AppDataSource.getRepository(Category).findOneBy({ id });
      if (!category) {
        return res.status(404).json({ status: "fail", message: "Category not found" });
      }
      return res.status(200).json({ status: "success", data: category });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async create(req, res) {
    try {
  // Comprobar nombre duplicado
      const repo = AppDataSource.getRepository(Category);
      const exists = await repo.findOneBy({ name: req.body.name });
      if (exists) return res.status(409).json({ status: 'fail', message: 'Category already exists' });

      const category = await repo.save(req.body);
      return res.status(201).json({ status: "success", data: category });
    } catch (e) {
  // Dejar que el manejador central procese (si aplica)
  return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      const category = await AppDataSource.getRepository(Category).findOneBy({ id });
      if (!category) {
        return res.status(404).json({ status: "fail", message: "Category not found" });
      }
  // si cambia el nombre, evitar duplicados
      if (req.body.name && req.body.name !== category.name) {
        const repo = AppDataSource.getRepository(Category);
        const other = await repo.findOneBy({ name: req.body.name });
        if (other) return res.status(409).json({ status: 'fail', message: 'Category name already in use' });
      }
      AppDataSource.getRepository(Category).merge(category, req.body);
      const updatedCategory = await AppDataSource.getRepository(Category).save(category);
      return res.status(200).json({ status: "success", data: updatedCategory });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  },

  async delete(req, res) {
    try {
      const id = Number(req.params.id);
      const category = await AppDataSource.getRepository(Category).findOneBy({ id });
      if (!category) {
        return res.status(404).json({ status: "fail", message: "Category not found" });
      }
  // Comprobar mangas relacionados para evitar errores FK
      const mangas = await AppDataSource.getRepository(require('../models/Product')).find({ where: { category: { id } } });
      if (mangas && mangas.length > 0) {
        return res.status(409).json({ status: 'fail', message: 'Category has related products and cannot be deleted' });
      }
      await AppDataSource.getRepository(Category).remove(category);
      return res.status(200).json({ status: "success", message: "Category deleted" });
    } catch (e) {
      return res.status(500).json({ status: "error", message: e.message });
    }
  }
};

module.exports = categoryController;
