const { EntitySchema } = require("typeorm");

// Manga entity: represents a manga volume in the collection
module.exports = new EntitySchema({
  name: "Manga",
  tableName: "mangas",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    author: {
      type: String,
      nullable: false,
    },
    tomoNumber: {
      type: "int",
      nullable: false,
      default: 1,
    },
    publicationDate: {
      type: "date",
      nullable: true,
    },
    price: {
      type: "float",
      nullable: false,
      default: 0,
    },
    stock: {
      type: "int",
      nullable: false,
      default: 0,
    },
    genre: {
      type: String,
      nullable: true,
    },
    series: {
      type: String,
      nullable: true,
    },
    illustrator: {
      type: String,
      nullable: true,
    },
    slug: {
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
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: true,
      nullable: true,
      eager: true,
    },
    tags: {
      type: "many-to-many",
      target: "Tag",
      joinTable: {
        name: "manga_tags",
      },
      eager: true,
    },
  },
});
