const { AppDataSource } = require('../config/databaseConfig');
const OrderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');
const CreditCardPaymentStrategy = require('./CreditCardPaymentStrategy');

/**
 * OrderService (Facade)
 * Orquesta la lógica de negocio para el checkout transaccional
 * Maneja: verificación de stock, cálculo de totales, procesamiento de pago,
 * actualización de stock y creación de orden de forma atómica
 */
class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = productRepository;
    this.paymentStrategies = {
      CreditCard: CreditCardPaymentStrategy,
      // Aquí se pueden agregar más estrategias de pago
    };
  }

  /**
   * Procesa un checkout completo (transaccional)
   * @param {number} userId - ID del usuario comprador
   * @param {Array} items - Array de { productId, quantity }
   * @param {Object} paymentDetails - Detalles del pago
   * @param {string} paymentDetails.paymentMethod - Método de pago (ej. CreditCard)
   * @param {Object} paymentDetails.cardDetails - Detalles específicos de la tarjeta
   * @returns {Promise<Object>} Orden creada con status COMPLETED
   */
  async processCheckout(userId, items, paymentDetails) {
    // No usar queryRunner - TypeORM maneja transacciones automáticamente
    try {
      console.log('🔄 Iniciando transacción de checkout...');

      // Paso 1: Verificar stock disponible
      console.log('✓ Paso 1: Verificando stock...');
      const productsWithStock = await this._verifyAndPrepareItems(items);

      if (productsWithStock.hasErrors) {
        throw new Error(productsWithStock.errorMessage);
      }

      // Paso 2: Calcular total de la orden
      console.log('✓ Paso 2: Calculando total...');
      const { totalAmount, orderItems } = this._calculateOrderTotal(
        productsWithStock.products,
        items
      );

      // Paso 3: Procesar pago mediante Strategy
      console.log('✓ Paso 3: Procesando pago...');
      const paymentResult = await this._processPayment(
        paymentDetails,
        totalAmount
      );

      if (!paymentResult.success) {
        throw new Error('Payment processing failed: ' + paymentResult.message);
      }

      // Paso 4: Actualizar stock (solo después del pago exitoso)
      console.log('✓ Paso 4: Actualizando stock...');
      await this._updateProductStock(items);

      // Paso 5: Crear orden y order items
      console.log('✓ Paso 5: Creando orden...');
      const order = await this._createOrderWithItems(
        userId,
        totalAmount,
        orderItems,
        paymentResult.transactionId,
        paymentDetails.paymentMethod
      );

      console.log('✅ Transacción completada exitosamente');

      return {
        status: 'success',
        data: order,
      };
    } catch (error) {
      console.error('❌ Error en transacción:', error.message);

      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Obtiene órdenes de un usuario
   * @param {number} userId - ID del usuario
   * @param {number} page - Página
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>} Órdenes paginadas
   */
  async getUserOrders(userId, page = 1, limit = 10) {
    return await this.orderRepository.getOrdersByUserId(userId, page, limit);
  }

  /**
   * Obtiene detalle de una orden
   * @param {number} orderId - ID de la orden
   * @param {number} userId - ID del usuario (para validar propiedad)
   * @returns {Promise<Object>} Orden con sus items
   */
  async getOrderDetail(orderId, userId) {
    const order = await this.orderRepository.getOrderById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized: Order does not belong to this user');
    }

    return order;
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Verifica disponibilidad de stock para los productos
   * @private
   */
  async _verifyAndPrepareItems(items) {
    const products = [];
    let hasErrors = false;
    let errorMessage = '';

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        hasErrors = true;
        errorMessage = `Product with ID ${item.productId} not found`;
        break;
      }

      if (product.stock < item.quantity) {
        hasErrors = true;
        errorMessage = `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`;
        break;
      }

      products.push(product);
    }

    return {
      products,
      hasErrors,
      errorMessage,
    };
  }

  /**
   * Calcula el total y prepara items de la orden
   * @private
   */
  _calculateOrderTotal(products, items) {
    let totalAmount = 0;
    const orderItems = [];

    items.forEach((item, index) => {
      const product = products[index];
      const unitPrice = product.price;
      const subtotal = unitPrice * item.quantity;

      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
      });
    });

    return {
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      orderItems,
    };
  }

  /**
   * Procesa el pago usando la estrategia seleccionada
   * @private
   */
  async _processPayment(paymentDetails, totalAmount) {
    const { paymentMethod, cardDetails } = paymentDetails;

    // Seleccionar estrategia de pago
    const StrategyClass =
      this.paymentStrategies[paymentMethod] ||
      this.paymentStrategies.CreditCard;
    const strategy = new StrategyClass();

    // Ejecutar pago
    const result = await strategy.processPayment(
      cardDetails,
      totalAmount,
      cardDetails.currency || 'USD',
      `Order Payment - ${new Date().toISOString()}`
    );

    return result;
  }

  /**
   * Actualiza el stock de los productos
   * @private
   */
  async _updateProductStock(items) {
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);

      if (product) {
        product.stock = product.stock - item.quantity;
        await this.productRepository.save(product);
      }
    }
  }

  /**
   * Crea la orden con sus items
   * @private
   */
  async _createOrderWithItems(
    userId,
    totalAmount,
    orderItems,
    transactionId,
    paymentMethod
  ) {
    // Crear orden
    const order = await this.orderRepository.createOrder({
      userId,
      totalAmount,
      status: 'COMPLETED',
      paymentMethod,
      transactionId,
    });

    // Crear items de la orden
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await this.orderRepository.createOrderItems(itemsWithOrderId);

    // Retornar orden completa
    return await this.orderRepository.getOrderById(order.id);
  }
}

module.exports = OrderService;
