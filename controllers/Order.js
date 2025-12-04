const OrderService = require('../services/OrderService');

/**
 * OrderController
 * Maneja las solicitudes relacionadas con órdenes y checkout
 */
class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * POST /orders
   * Crea una orden y procesa el pago (transaccional)
   * Body: {
   *   items: [{ productId, quantity }],
   *   paymentMethod: 'CreditCard',
   *   cardDetails: {
   *     cardNumber: '...',
   *     fullName: '...',
   *     expirationMonth: 12,
   *     expirationYear: 2025,
   *     cvv: '123',
   *     currency: 'USD'
   *   }
   * }
   */
  async createOrder(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          data: { message: 'Unauthorized: User ID not found' },
        });
      }

      const { items, paymentMethod, cardDetails } = req.body;

      // Validar entrada
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'items must be a non-empty array' },
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'paymentMethod is required' },
        });
      }

      if (!cardDetails) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'cardDetails are required' },
        });
      }

      // Procesar checkout
      const result = await this.orderService.processCheckout(userId, items, {
        paymentMethod,
        cardDetails,
      });

      if (result.status === 'error') {
        return res.status(400).json({
          status: 'fail',
          data: { message: result.message },
        });
      }

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Order created and payment processed successfully',
          order: result.data,
        },
      });
    } catch (error) {
      console.error('Error in createOrder:', error);
      return res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error' },
      });
    }
  }

  /**
   * GET /orders
   * Obtiene el historial de órdenes del usuario autenticado
   * Query: page, limit
   */
  async getOrders(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          data: { message: 'Unauthorized: User ID not found' },
        });
      }

      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      // Validar paginación
      if (page < 1) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'page must be at least 1' },
        });
      }

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'limit must be between 1 and 100' },
        });
      }

      const result = await this.orderService.getUserOrders(userId, page, limit);

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Orders retrieved successfully',
          orders: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            pages: result.pages,
          },
        },
      });
    } catch (error) {
      console.error('Error in getOrders:', error);
      return res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error' },
      });
    }
  }

  /**
   * GET /orders/:id
   * Obtiene el detalle de una orden específica
   * Solo el propietario puede verla
   */
  async getOrderDetail(req, res) {
    try {
      const userId = req.user?.id;
      const orderId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          data: { message: 'Unauthorized: User ID not found' },
        });
      }

      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
          status: 'fail',
          data: { message: 'Invalid order ID' },
        });
      }

      const order = await this.orderService.getOrderDetail(orderId, userId);

      if (!order) {
        return res.status(404).json({
          status: 'fail',
          data: { message: 'Order not found' },
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Order retrieved successfully',
          order,
        },
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          status: 'fail',
          data: { message: error.message },
        });
      }

      console.error('Error in getOrderDetail:', error);
      return res.status(500).json({
        status: 'error',
        data: { message: error.message || 'Internal server error' },
      });
    }
  }
}

module.exports = OrderController;
