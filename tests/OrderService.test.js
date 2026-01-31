/**
 * Test Suite para OrderService
 * Pruebas unitarias enfocadas en el cálculo de totales
 */

const OrderService = require('../services/OrderService');

describe('OrderService - Unit Tests', () => {
  let orderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('_calculateOrderTotal - Cálculo de Impuestos', () => {
    it('debe incluir 6% de impuesto en el total', () => {
      // Arrange
      const products = [
        { id: 1, price: 10 },
        { id: 2, price: 20 },
      ];
      const items = [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ];

      // Act
      const result = orderService._calculateOrderTotal(products, items);

      // Assert
      const expectedSubtotal = 10 + 40; // 10*1 + 20*2
      const expectedTax = expectedSubtotal * 0.06; // 6% tax
      const expectedTotal = expectedSubtotal + expectedTax;

      expect(result.subtotal).toBeCloseTo(50, 2);
      expect(result.tax).toBeCloseTo(3, 2);
      expect(result.totalAmount).toBeCloseTo(expectedTotal, 2);
    });

    it('debe redondear correctamente los decimales', () => {
      // Arrange
      const products = [{ id: 1, price: 9.99 }];
      const items = [{ productId: 1, quantity: 3 }];

      // Act
      const result = orderService._calculateOrderTotal(products, items);

      // Assert
      expect(result.subtotal).toBeCloseTo(29.97, 2);
      expect(result.tax).toBeCloseTo(1.80, 2);
      expect(result.totalAmount).toBeCloseTo(31.77, 2);
    });

    it('debe manejar múltiples items con precios variados', () => {
      // Arrange
      const products = [
        { id: 1, price: 5.50 },
        { id: 2, price: 12.75 },
        { id: 3, price: 99.99 },
      ];
      const items = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
        { productId: 3, quantity: 1 },
      ];

      // Act
      const result = orderService._calculateOrderTotal(products, items);

      // Assert
      // Subtotal: (5.50*2) + (12.75*3) + (99.99*1) = 11 + 38.25 + 99.99 = 149.24
      const expectedSubtotal = 149.24;
      const expectedTax = expectedSubtotal * 0.06;

      expect(result.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(result.tax).toBeCloseTo(expectedTax, 2);
      expect(result.totalAmount).toBeCloseTo(expectedSubtotal + expectedTax, 2);
    });

    it('debe retornar array de orderItems con estructura correcta', () => {
      // Arrange
      const products = [
        { id: 1, price: 10, name: 'Product 1' },
        { id: 2, price: 20, name: 'Product 2' },
      ];
      const items = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ];

      // Act
      const result = orderService._calculateOrderTotal(products, items);

      // Assert
      expect(result.orderItems).toHaveLength(2);
      expect(result.orderItems[0]).toEqual({
        productId: 1,
        quantity: 2,
        unitPrice: 10,
      });
      expect(result.orderItems[1]).toEqual({
        productId: 2,
        quantity: 1,
        unitPrice: 20,
      });
    });

    it('debe manejar cantidad cero', () => {
      // Arrange
      const products = [{ id: 1, price: 10 }];
      const items = [{ productId: 1, quantity: 0 }];

      // Act
      const result = orderService._calculateOrderTotal(products, items);

      // Assert
      expect(result.subtotal).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.totalAmount).toBe(0);
    });
  });
});
