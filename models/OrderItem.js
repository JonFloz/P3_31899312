const { EntitySchema } = require('typeorm');

const OrderItem = new EntitySchema({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: {
      primary: true,
      type: 'integer',
      generated: true,
    },
    orderId: {
      type: 'integer',
      nullable: false,
    },
    productId: {
      type: 'integer',
      nullable: false,
    },
    quantity: {
      type: 'integer',
      nullable: false,
    },
    unitPrice: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    subtotal: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
      comment: 'quantity * unitPrice',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
  },
});

module.exports = OrderItem;
