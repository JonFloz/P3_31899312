const { EntitySchema } = require("typeorm");

const Usuario = new EntitySchema({
  name: "Usuario",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true
    },
    nombre: {
      type: String,
    },
    email: {
      type: String,
      unique: true
    },
    contrasena: {
      type: String,
    }
  }
});

module.exports =  Usuario ;
