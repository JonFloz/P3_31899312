require("reflect-metadata");
const { DataSource } = require("typeorm");
const  Usuario  = require("../models/usuario");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Tag = require("../models/Tag");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
require("dotenv").config();

const isTest = process.env.NODE_ENV === 'test';

const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTest ? `${process.env.TEST_DATABASE_PATH}` : `${process.env.DATABASE_PATH}` ,
  entities: [Usuario, Category, Product, Tag, Order, OrderItem],
  synchronize: true,
  logging: false,
});

const iniciarServer = async () => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
  
  }
};

module.exports = { iniciarServer, AppDataSource };
