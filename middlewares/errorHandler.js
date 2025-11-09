// Manejador central de errores: mapear errores conocidos a códigos HTTP y formato JSend
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Si el controlador definió statusCode, usarlo
  if (err && err.statusCode) {
    const code = err.statusCode;
    const body = { status: code >= 500 ? 'error' : 'fail', message: err.message };
    if (err.details) body.details = err.details;
    return res.status(code).json(body);
  }
  // Errores de validación (array de errores)
  if (Array.isArray(err) && err.length > 0 && err[0].msg) {
    return res.status(400).json({ status: 'fail', message: 'Validación fallida', errors: err });
  }

  // Errores de constraints (TypeORM/SQLite) -> 409
  try {
    if (err && err.code && String(err.code).toUpperCase().includes('SQLITE_CONSTRAINT')) {
      // Diferenciar FK vs unicidad
      const msg = String(err.message || 'Error de restricción en BD');
      if (/FOREIGN KEY/i.test(msg)) {
        return res.status(409).json({ status: 'fail', message: 'Restricción de integridad: recurso relacionado existe o violación FK' });
      }
      return res.status(409).json({ status: 'fail', message: 'Conflicto: duplicado o violación de restricción' });
    }
  } catch (x) {
    // continuar
  }

  // Fallback genérico
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  return res.status(500).json({ status: 'error', message: (err && err.message) || 'Error interno del servidor' });
};
