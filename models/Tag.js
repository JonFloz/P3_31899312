const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: "Tag",
  tableName: "tags",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
      unique: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
      nullable: false,
    },
  },
  relations: {
    mangas: {
      type: "many-to-many",
      target: "Manga",
      inverseSide: "tags",
      joinTable: false,
    },
  },
});
