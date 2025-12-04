const { EntitySchema } = require('typeorm');

const Order = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      primary: true,
      type: 'integer',
      generated: true,
    },
    userId: {
      type: 'integer',
      nullable: false,
    },
    totalAmount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    status: {
      type: 'varchar',
      length: 50,
      default: 'PENDING',
      nullable: false,
      comment: 'PENDING, COMPLETED, CANCELED, PAYMENT_FAILED',
    },
    paymentMethod: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    transactionId: {
      type: 'varchar',
      length: 100,
      nullable: true,
      unique: true,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
  },
});

module.exports = Order;
