/**
 * Test Suite para CreditCardPaymentStrategy
 * Validaciones de tarjeta y procesamiento de pagos
 */

const CreditCardPaymentStrategy = require('../services/CreditCardPaymentStrategy');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('CreditCardPaymentStrategy', () => {
  let strategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new CreditCardPaymentStrategy();
    strategy.apiUrl = 'https://fakepayment.onrender.com';
  });

  describe('getPaymentApiToken', () => {
    it('debe retornar token válido desde la API', async () => {
      // Arrange
      const mockToken = 'test-api-key-12345';
      axios.get.mockResolvedValue({
        data: { apiKey: mockToken },
      });

      // Act
      const token = await strategy.getPaymentApiToken();

      // Assert
      expect(token).toBe(mockToken);
      expect(axios.get).toHaveBeenCalledWith(
        'https://fakepayment.onrender.com/payments/api-key'
      );
    });

    it('debe lanzar error si no puede obtener token', async () => {
      // Arrange
      axios.get.mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(strategy.getPaymentApiToken()).rejects.toThrow(
        'Failed to get payment API token'
      );
    });
  });

  describe('processPayment - Tarjeta Válida', () => {
    it('debe procesar pago exitoso con tarjeta válida', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      const amount = 100.5;
      const currency = 'usd';
      const description = 'Order Payment';

      // Mock getPaymentApiToken
      axios.get.mockResolvedValue({ data: { apiKey: 'test-token' } });

      // Mock successful payment response
      axios.post.mockResolvedValue({
        status: 200,
        data: {
          success: true,
          data: { transaction_id: 'TXN_123456' },
        },
      });

      // Act
      const result = await strategy.processPayment(
        paymentDetails,
        amount,
        currency,
        description
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN_123456');
      expect(result.message).toBe('Payment processed successfully');

      // Verificar que se llamó a la API correctamente
      expect(axios.post).toHaveBeenCalledWith(
        'https://fakepayment.onrender.com/payments',
        expect.objectContaining({
          'card-number': '4532015112830366',
          'full-name': 'John Doe',
          amount: 100.5,
          currency: 'USD',
        }),
        expect.any(Object)
      );
    });

    it('debe manejar redirección 302 con transaction ID en URL', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.get.mockResolvedValue({ data: { apiKey: 'test-token' } });

      // Mock redirección 302
      axios.post.mockResolvedValue({
        status: 302,
        headers: {
          location: 'https://fakepayment.onrender.com/payments/TXN_999888',
        },
      });

      // Act
      const result = await strategy.processPayment(
        paymentDetails,
        50,
        'usd',
        'Test'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN_999888');
    });
  });

  describe('processPayment - Validaciones de Campo', () => {
    it('debe rechazar si falta cardNumber', async () => {
      // Arrange
      const paymentDetails = {
        // cardNumber faltante
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Missing required card details');

      // No debe llamar a axios si falta campo requerido
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('debe rechazar si falta fullName', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        // fullName faltante
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Missing required card details');
    });

    it('debe rechazar si falta expirationMonth', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        // expirationMonth faltante
        expirationYear: 2025,
        cvv: '123',
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Missing required card details');
    });

    it('debe rechazar si falta expirationYear', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        // expirationYear faltante
        cvv: '123',
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Missing required card details');
    });

    it('debe rechazar si falta CVV', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        // cvv faltante
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Missing required card details');
    });
  });

  describe('processPayment - Errores Específicos', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({ data: { apiKey: 'test-token' } });
    });

    it('debe rechazar tarjeta rechazada por el procesador', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'Card rejected',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 400,
        data: {
          success: false,
          message: 'Card rejected by payment processor',
        },
      });

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Card rejected by payment processor');
    });

    it('debe rechazar si hay fondos insuficientes', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'Insufficient funds',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 400,
        data: {
          success: false,
          message: 'Insufficient funds on card',
        },
      });

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 10000, 'usd', 'Test')
      ).rejects.toThrow('Insufficient funds on card');
    });

    it('debe rechazar error de tarjeta general', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'Card error test',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 400,
        data: {
          success: false,
          message: 'Card error occurred',
        },
      });

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Card processing error');
    });

    it('debe manejar error de conexión', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockRejectedValue(
        new Error('ECONNREFUSED: Connection refused')
      );

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow('Payment processing failed');
    });
  });

  describe('processPayment - Normalización de Datos', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({ data: { apiKey: 'test-token' } });
    });

    it('debe convertir currency a mayúsculas', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 200,
        data: { success: true, data: { transaction_id: 'TXN_123' } },
      });

      // Act
      await strategy.processPayment(paymentDetails, 100, 'eur', 'Test');

      // Assert
      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.currency).toBe('EUR');
    });

    it('debe convertir expirationMonth y expirationYear a string', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 200,
        data: { success: true, data: { transaction_id: 'TXN_123' } },
      });

      // Act
      await strategy.processPayment(paymentDetails, 100, 'usd', 'Test');

      // Assert
      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs['expiration-month']).toBe('12');
      expect(callArgs['expiration-year']).toBe('2025');
      expect(typeof callArgs.cvv).toBe('string');
    });

    it('debe convertir amount a float', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 200,
        data: { success: true, data: { transaction_id: 'TXN_123' } },
      });

      // Act
      await strategy.processPayment(paymentDetails, '99.99', 'usd', 'Test');

      // Assert
      const callArgs = axios.post.mock.calls[0][1];
      expect(typeof callArgs.amount).toBe('number');
      expect(callArgs.amount).toBe(99.99);
    });

    it('debe usar "USD" como moneda por defecto en los datos', async () => {
      // Arrange
      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      axios.post.mockResolvedValue({
        status: 200,
        data: { success: true, data: { transaction_id: 'TXN_123' } },
      });

      // Act
      await strategy.processPayment(paymentDetails, 100, 'usd', 'Test');

      // Assert
      const callArgs = axios.post.mock.calls[0][1];
      expect(callArgs.currency).toBe('USD');
    });
  });

  describe('processPayment - Headers y Autenticación', () => {
    it('debe enviar Authorization header con Bearer token', async () => {
      // Arrange
      const mockToken = 'secret-api-token';
      axios.get.mockResolvedValue({ data: { apiKey: mockToken } });

      axios.post.mockResolvedValue({
        status: 200,
        data: { success: true, data: { transaction_id: 'TXN_123' } },
      });

      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      // Act
      await strategy.processPayment(paymentDetails, 100, 'usd', 'Test');

      // Assert
      const callConfig = axios.post.mock.calls[0][2];
      expect(callConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(callConfig.headers['Content-Type']).toBe('application/json');
    });

    it('debe configurar validateStatus para aceptar < 500', async () => {
      // Arrange
      axios.get.mockResolvedValue({ data: { apiKey: 'token' } });

      axios.post.mockResolvedValue({
        status: 400,
        data: { success: false, message: 'Bad request' },
      });

      const paymentDetails = {
        cardNumber: '4532015112830366',
        fullName: 'John Doe',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123',
      };

      // Act & Assert
      await expect(
        strategy.processPayment(paymentDetails, 100, 'usd', 'Test')
      ).rejects.toThrow();

      // Verificar que se usó validateStatus
      const callConfig = axios.post.mock.calls[0][2];
      expect(callConfig.validateStatus).toBeDefined();
      expect(callConfig.validateStatus(400)).toBe(true); // < 500
      expect(callConfig.validateStatus(500)).toBe(false); // >= 500
    });
  });
});
