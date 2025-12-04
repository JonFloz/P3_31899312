const { AppDataSource } = require('../config/databaseConfig');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

/**
 * OrderRepository
 * Abstrae la lógica de acceso a datos para órdenes
 */
class OrderRepository {
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.productRepository = AppDataSource.getRepository(Product);
  }

  /**
   * Crea una nueva orden
   * @param {Object} orderData - { userId, totalAmount, status, paymentMethod, transactionId }
   * @returns {Promise<Order>} Orden creada
   */
  async createOrder(orderData) {
    const order = this.orderRepository.create(orderData);
    return await this.orderRepository.save(order);
  }

  /**
   * Crea items de una orden
   * @param {Array} itemsData - Array de { orderId, productId, quantity, unitPrice }
   * @returns {Promise<Array>} Items creados
   */
  async createOrderItems(itemsData) {
    const items = itemsData.map((item) => {
      const orderItem = this.orderItemRepository.create({
        ...item,
        subtotal: item.quantity * item.unitPrice,
      });
      return orderItem;
    });

    return await this.orderItemRepository.save(items);
  }

  /**
   * Obtiene una orden por ID
   * @param {number} orderId - ID de la orden
   * @returns {Promise<Order|null>} Orden encontrada con items y productos
   */
  async getOrderById(orderId) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) return null;

    // Cargar items y productos manualmente
    const items = await this.orderItemRepository.find({
      where: { orderId },
    });

    // Cargar productos para cada item
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      item.product = product;
    }

    order.items = items;
    return order;
  }

  /**
   * Obtiene órdenes de un usuario con paginación
   * @param {number} userId - ID del usuario
   * @param {number} page - Número de página
   * @param {number} limit - Elementos por página
   * @returns {Promise<Object>} { data, total, page, limit }
   */
  async getOrdersByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Cargar items para cada orden
    for (const order of orders) {
      const items = await this.orderItemRepository.find({
        where: { orderId: order.id },
      });

      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        item.product = product;
      }

      order.items = items;
    }

    return {
      data: orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualiza el estado de una orden
   * @param {number} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   * @returns {Promise<Order>} Orden actualizada
   */
  async updateOrderStatus(orderId, status) {
    await this.orderRepository.update({ id: orderId }, { status });
    return await this.getOrderById(orderId);
  }

  /**
   * Busca una orden por transaction ID
   * @param {string} transactionId - ID de la transacción
   * @returns {Promise<Order|null>} Orden encontrada o null
   */
  async getOrderByTransactionId(transactionId) {
    return await this.orderRepository.findOne({
      where: { transactionId },
      relations: ['items', 'items.product', 'user'],
    });
  }

  /**
   * Verifica si una orden pertenece al usuario
   * @param {number} orderId - ID de la orden
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si pertenece al usuario
   */
  async orderBelongsToUser(orderId, userId) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });
    return !!order;
  }
}

module.exports = OrderRepository;
