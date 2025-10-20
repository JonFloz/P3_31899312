require("reflect-metadata");
const { DataSource } = require("typeorm");
const  Usuario  = require("../models/usuario");
require("dotenv").config();

const isTest = process.env.NODE_ENV === 'test';

// Crear un nuevo DataSource
const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTest ? `${process.env.TEST_DATABASE_PATH}` : `${process.env.DATABASE_PATH}` ,
  entities: [Usuario],
  synchronize: true,
  logging: false,
});
// Corregido: la sintaxis de la función debe ser `function iniciarServer()`
const iniciarServer = async () => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
  
  }
};

module.exports = { iniciarServer, AppDataSource };
