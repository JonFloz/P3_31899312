/**
 * PaymentStrategy Interface
 * Define el contrato para implementar diferentes estrategias de pago
 */
class PaymentStrategy {
  /**
   * Procesa un pago con la estrategia implementada
   * @param {Object} paymentDetails - Detalles específicos del método de pago
   * @param {number} amount - Cantidad a pagar
   * @param {string} currency - Moneda (ej. USD, EUR)
   * @param {string} description - Descripción de la transacción
   * @returns {Promise<Object>} Resultado de la transacción { success, transactionId, message }
   */
  async processPayment(paymentDetails, amount, currency, description) {
    throw new Error('processPayment() must be implemented by subclass');
  }
}

module.exports = PaymentStrategy;
