/**
 * Test Suite para ProductQueryBuilder
 * Valida la construcción correcta de consultas y manejo de errores
 */

const ProductQueryBuilder = require('../services/ProductQueryBuilder');
const { FilterValidator } = require('../services/ProductQueryBuilder');

describe('ProductQueryBuilder - Patrón Builder', () => {
  let builder;

  beforeEach(() => {
    builder = new ProductQueryBuilder();
  });

  describe('FilterValidator', () => {
    describe('validateNumericId', () => {
      test('debe validar un número válido', () => {
        const result = FilterValidator.validateNumericId('123', 'id');
        expect(result).toBe(123);
      });

      test('debe lanzar error si no es número', () => {
        expect(() => {
          FilterValidator.validateNumericId('abc', 'id');
        }).toThrow('must be a valid number');
      });

      test('debe retornar null si está vacío', () => {
        const result = FilterValidator.validateNumericId('', 'id');
        expect(result).toBeNull();
      });
    });

    describe('validatePriceRange', () => {
      test('debe validar rango válido', () => {
        const result = FilterValidator.validatePriceRange('10', '50');
        expect(result.min).toBe(10);
        expect(result.max).toBe(50);
      });

      test('debe lanzar error si min > max', () => {
        expect(() => {
          FilterValidator.validatePriceRange('50', '10');
        }).toThrow('price_min cannot be greater than price_max');
      });

      test('debe lanzar error si precio negativo', () => {
        expect(() => {
          FilterValidator.validatePriceRange('-10', '50');
        }).toThrow('must be greater than or equal to 0');
      });

      test('debe permitir solo min o solo max', () => {
        const result1 = FilterValidator.validatePriceRange('10', null);
        expect(result1.min).toBe(10);
        expect(result1.max).toBeNull();

        const result2 = FilterValidator.validatePriceRange(null, '50');
        expect(result2.min).toBeNull();
        expect(result2.max).toBe(50);
      });
    });

    describe('validateSearchTerm', () => {
      test('debe aceptar término válido', () => {
        const result = FilterValidator.validateSearchTerm('naruto manga');
        expect(result).toBe('naruto manga');
      });

      test('debe retornar null si está vacío', () => {
        const result = FilterValidator.validateSearchTerm('   ');
        expect(result).toBeNull();
      });

      test('debe lanzar error si excede 100 caracteres', () => {
        const longString = 'a'.repeat(101);
        expect(() => {
          FilterValidator.validateSearchTerm(longString);
        }).toThrow('cannot exceed 100 characters');
      });
    });

    describe('validateTags', () => {
      test('debe convertir string a array', () => {
        const result = FilterValidator.validateTags('1,2,3');
        expect(result).toEqual([1, 2, 3]);
      });

      test('debe aceptar array directamente', () => {
        const result = FilterValidator.validateTags(['1', '2', '3']);
        expect(result).toEqual([1, 2, 3]);
      });

      test('debe filtrar IDs inválidas', () => {
        const result = FilterValidator.validateTags('1,abc,3');
        expect(result).toEqual([1, 3]);
      });

      test('debe retornar array vacío si sin tags', () => {
        const result = FilterValidator.validateTags('');
        expect(result).toEqual([]);
      });
    });

    describe('validateCategory', () => {
      test('debe reconocer ID numérica', () => {
        const result = FilterValidator.validateCategory('123');
        expect(result).toEqual({ type: 'id', value: 123 });
      });

      test('debe reconocer nombre', () => {
        const result = FilterValidator.validateCategory('manga');
        expect(result).toEqual({ type: 'name', value: 'manga' });
      });

      test('debe lanzar error si nombre > 50 caracteres', () => {
        const longName = 'a'.repeat(51);
        expect(() => {
          FilterValidator.validateCategory(longName);
        }).toThrow('cannot exceed 50 characters');
      });

      test('debe retornar null si está vacío', () => {
        const result = FilterValidator.validateCategory('');
        expect(result).toBeNull();
      });
    });

    describe('validateStringFilter', () => {
      test('debe validar string válido', () => {
        const result = FilterValidator.validateStringFilter('Masashi Kishimoto', 'author');
        expect(result).toBe('Masashi Kishimoto');
      });

      test('debe respetar límite de caracteres', () => {
        const longString = 'a'.repeat(51);
        expect(() => {
          FilterValidator.validateStringFilter(longString, 'author', 50);
        }).toThrow('cannot exceed 50 characters');
      });

      test('debe retornar null si está vacío', () => {
        const result = FilterValidator.validateStringFilter('   ', 'author');
        expect(result).toBeNull();
      });
    });
  });
});
