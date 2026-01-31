import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // pendingFilters: bound to inputs
  // appliedFilters: used for querying (only updated when user submits)
  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    author: '',
    genre: '',
    series: '',
    illustrator: '',
    tomoNumber: '',
    tags: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(pendingFilters);
  const [categories, setCategories] = useState([]);

  // Cargar productos y categorías
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, appliedFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = {
        page: currentPage,
        limit: 12,
      };

      const f = appliedFilters || {};
      if (f.search) queryParams.search = f.search;
      if (f.category) queryParams.category = f.category;
      if (f.minPrice) queryParams.price_min = f.minPrice;
      if (f.maxPrice) queryParams.price_max = f.maxPrice;
      if (f.author) queryParams.author = f.author;
      if (f.genre) queryParams.genre = f.genre;
      if (f.series) queryParams.series = f.series;
      if (f.illustrator) queryParams.illustrator = f.illustrator;
      if (f.tomoNumber) queryParams.tomoNumber = f.tomoNumber;
      if (f.tags) queryParams.tags = f.tags; // comma separated ids

        const response = await productService.getProducts(queryParams);
        setProducts(response.items || []);
        // response.meta may hold { totalPages } or meta.totalPages
        const totalPagesFromMeta = response.meta?.totalPages || response.meta?.totalPages || response.meta?.totalPages || response.meta?.totalPages;
        setTotalPages(totalPagesFromMeta || 1);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Intentar cargar categorías desde la API; si falla, usar fallback
      try {
        const resp = await fetch('/v2/categories');
        if (resp.ok) {
          const json = await resp.json();
          const cats = json.data || json.items || json;
          setCategories(Array.isArray(cats) ? cats : []);
          return;
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback hardcoded
      setCategories([
        { id: 1, name: 'Shonen' },
        { id: 2, name: 'Shoujo' },
        { id: 3, name: 'Seinen' },
        { id: 4, name: 'Isekai' },
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Apply pending filters and trigger fetch
    setAppliedFilters(pendingFilters);
    setCurrentPage(1);
  };

  const handleReset = () => {
    const empty = { search: '', category: '', minPrice: '', maxPrice: '', author: '', genre: '', series: '', illustrator: '', tomoNumber: '', tags: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setCurrentPage(1);
  };

  if (loading && products.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <div className="products-page">
      <h1>Catálogo de Productos</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="products-container">
        {/* Sidebar de Filtros */}
        <aside className="filters-sidebar">
          <h3>Filtros</h3>

          <form onSubmit={handleSearch} className="filters-form">
            <div className="filter-group">
              <label htmlFor="search">Búsqueda:</label>
              <input
                type="text"
                id="search"
                name="search"
                value={pendingFilters.search}
                onChange={handleFilterChange}
                placeholder="Buscar productos..."
              />
            </div>

            <div className="filter-group">
              <label htmlFor="category">Categoría:</label>
              <select
                id="category"
                name="category"
                value={pendingFilters.category}
                onChange={handleFilterChange}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="author">Autor:</label>
              <input
                type="text"
                id="author"
                name="author"
                value={pendingFilters.author}
                onChange={handleFilterChange}
                placeholder="Ej: Eiichiro Oda"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="genre">Género:</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={pendingFilters.genre}
                onChange={handleFilterChange}
                placeholder="Ej: Shounen"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="series">Serie:</label>
              <input
                type="text"
                id="series"
                name="series"
                value={pendingFilters.series}
                onChange={handleFilterChange}
                placeholder="Ej: One Piece"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="illustrator">Ilustrador:</label>
              <input
                type="text"
                id="illustrator"
                name="illustrator"
                value={pendingFilters.illustrator}
                onChange={handleFilterChange}
                placeholder="Ej: Akira Toriyama"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="tomoNumber">Nº Tomo:</label>
              <input
                type="number"
                id="tomoNumber"
                name="tomoNumber"
                value={pendingFilters.tomoNumber}
                onChange={handleFilterChange}
                min="1"
                placeholder="1"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="tags">Tags (IDs, coma-separated):</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={pendingFilters.tags}
                onChange={handleFilterChange}
                placeholder="1,2,5"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="minPrice">Precio Mínimo (S/.):</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={pendingFilters.minPrice}
                onChange={handleFilterChange}
                min="0"
                placeholder="0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxPrice">Precio Máximo (S/.):</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={pendingFilters.maxPrice}
                onChange={handleFilterChange}
                min="0"
                placeholder="999999"
              />
            </div>

            <button type="submit" className="filter-button">
              Aplicar Filtros
            </button>
            <button
              type="button"
              className="filter-button reset"
              onClick={handleReset}
            >
              Limpiar Filtros
            </button>
          </form>
        </aside>

        {/* Grid de Productos */}
        <section className="products-main">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Anterior
                  </button>

                  <div className="pagination-info">
                    Página {currentPage} de {totalPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;
