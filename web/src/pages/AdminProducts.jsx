import '../styles/Admin.css'
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useTags } from '../hooks/useTags'

const AdminProducts = () => {
    const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = useProducts()
    const { getAllCategories } = useCategories()
    const { getAllTags } = useTags()
    
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [searchId, setSearchId] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        author: '',
        tomoNumber: '',
        price: '',
        stock: '',
        genre: '',
        series: '',
        illustrator: '',
        categoryId: '',
        tags: [],
        image: null
    })
    const [operationLoading, setOperationLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [productsData, categoriesData, tagsData] = await Promise.all([
                getAllProducts(),
                getAllCategories(),
                getAllTags()
            ])
            console.log('Products data received:', productsData)
            setProducts(Array.isArray(productsData) ? productsData : [])
            setCategories(Array.isArray(categoriesData) ? categoriesData : [])
            setTags(Array.isArray(tagsData) ? tagsData : [])
            setCurrentPage(1)
        } catch (e) {
            setError(e.message || 'Error al obtener datos')
        } finally {
            setLoading(false)
        }
    }

    const handleGetById = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            const product = await getProductById(searchId)
            if (!product || !product.id) {
                setError('Manga no encontrado')
                setSelectedProduct(null)
                return
            }
            setSelectedProduct(product)
            setFormData({
                name: product.name || '',
                author: product.author || '',
                tomoNumber: product.tomoNumber || '',
                price: product.price || '',
                stock: product.stock || '',
                genre: product.genre || '',
                series: product.series || '',
                illustrator: product.illustrator || '',
                categoryId: product.category?.id || product.categoryId || '',
                tags: Array.isArray(product.tags) ? product.tags.map(t => t.id || t) : []
            })
            setSuccess(`Manga ${product.name} cargado correctamente`)
        } catch (e) {
            setError(e.response?.status === 404 ? 'Manga no encontrado' : (e.message || 'Error al obtener manga'))
            setSelectedProduct(null)
        } finally {
            setOperationLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.price || !formData.categoryId) {
            setError('Nombre, precio y categoría son requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            
            // Debug: verificar token
            const token = localStorage.getItem('token');
            console.log('Token en localStorage:', token ? '✓ Presente' : '✗ Ausente');
            
            // Si hay imagen, usar FormData. Si no, usar JSON normal
            let submitData;
            
            if (formData.image) {
                console.log('📎 Enviando con imagen (FormData)');
                submitData = new FormData()
                submitData.append('name', formData.name)
                submitData.append('author', formData.author)
                submitData.append('price', parseFloat(formData.price))
                submitData.append('stock', parseInt(formData.stock) || 0)
                submitData.append('tomoNumber', parseInt(formData.tomoNumber) || 0)
                submitData.append('genre', formData.genre)
                submitData.append('series', formData.series)
                submitData.append('illustrator', formData.illustrator)
                submitData.append('categoryId', parseInt(formData.categoryId))
                
                // Agregar tags
                if (Array.isArray(formData.tags)) {
                    formData.tags.forEach(tagId => {
                        submitData.append('tags', parseInt(tagId))
                    })
                }
                
                // Agregar imagen
                submitData.append('image', formData.image)
                
                console.log('FormData keys:', Array.from(submitData.keys()));
            } else {
                console.log('📝 Enviando sin imagen (JSON)');
                submitData = {
                    name: formData.name,
                    author: formData.author,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    tomoNumber: parseInt(formData.tomoNumber) || 0,
                    genre: formData.genre,
                    series: formData.series,
                    illustrator: formData.illustrator,
                    categoryId: parseInt(formData.categoryId),
                    tags: Array.isArray(formData.tags) ? formData.tags.map(t => parseInt(t)) : []
                }
            }
            
            await createProduct(submitData)
            setSuccess('Manga creado exitosamente')
            resetForm()
            fetchData()
        } catch (e) {
            console.error('❌ Error al crear manga:', {
                message: e.message,
                status: e.response?.status,
                statusText: e.response?.statusText,
                data: e.response?.data,
                config: {
                  url: e.config?.url,
                  method: e.config?.method,
                  headers: e.config?.headers
                }
            });
            setError(e.response?.data?.message || e.message || 'Error al crear manga')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedProduct || !formData.name.trim() || !formData.price || !formData.categoryId) {
            setError('Completa todos los campos requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            
            // Si hay imagen, usar FormData. Si no, usar JSON normal
            let submitData;
            
            if (formData.image) {
                console.log('📎 Actualizando con imagen (FormData)');
                submitData = new FormData()
                submitData.append('name', formData.name)
                submitData.append('author', formData.author)
                submitData.append('price', parseFloat(formData.price))
                submitData.append('stock', parseInt(formData.stock) || 0)
                submitData.append('tomoNumber', parseInt(formData.tomoNumber) || 0)
                submitData.append('genre', formData.genre)
                submitData.append('series', formData.series)
                submitData.append('illustrator', formData.illustrator)
                submitData.append('categoryId', parseInt(formData.categoryId))
                
                // Agregar tags
                if (Array.isArray(formData.tags)) {
                    formData.tags.forEach(tagId => {
                        submitData.append('tags', parseInt(tagId))
                    })
                }
                
                // Agregar imagen
                submitData.append('image', formData.image)
            } else {
                console.log('📝 Actualizando sin imagen (JSON)');
                submitData = {
                    name: formData.name,
                    author: formData.author,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock) || 0,
                    tomoNumber: parseInt(formData.tomoNumber) || 0,
                    genre: formData.genre,
                    series: formData.series,
                    illustrator: formData.illustrator,
                    categoryId: parseInt(formData.categoryId),
                    tags: Array.isArray(formData.tags) ? formData.tags.map(t => parseInt(t)) : []
                }
            }
            
            await updateProduct(selectedProduct.id, submitData)
            setSuccess('Manga actualizado exitosamente')
            setSelectedProduct(null)
            setSearchId('')
            fetchData()
        } catch (e) {
            console.error('❌ Error al actualizar manga:', {
                message: e.message,
                status: e.response?.status,
                statusText: e.response?.statusText,
                data: e.response?.data
            });
            setError(e.response?.data?.message || e.message || 'Error al actualizar manga')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedProduct?.name}?`)) {
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await deleteProduct(searchId)
            setSuccess('Manga eliminado exitosamente')
            resetForm()
            fetchData()
        } catch (e) {
            setError(e.message || 'Error al eliminar manga')
        } finally {
            setOperationLoading(false)
        }
    }

    const resetForm = () => {
        setSelectedProduct(null)
        setSearchId('')
        setFormData({
            name: '',
            author: '',
            tomoNumber: '',
            price: '',
            stock: '',
            genre: '',
            series: '',
            illustrator: '',
            categoryId: '',
            tags: [],
            image: null
        })
    }

    const toggleTag = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(t => t !== tagId)
                : [...prev.tags, tagId]
        }))
    }

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>📚 Gestión de Mangas</h1>
                    <p className="subtitle">Crear, editar y eliminar mangas del catálogo</p>
                </div>
            </header>

            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="operation-section">
                        <h3>🔍 Buscar Manga</h3>
                        <div className="operation-controls">
                            <input
                                type="number"
                                placeholder="ID de manga"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="input-field"
                            />
                            <button
                                onClick={handleGetById}
                                disabled={operationLoading}
                                className="btn btn-primary"
                            >
                                {operationLoading ? '⏳ Cargando...' : '🔎 Buscar'}
                            </button>
                        </div>
                    </div>

                    <div className="operation-section">
                        <h3>➕ {selectedProduct ? '✏️ Editar' : '➕ Crear'} Manga</h3>
                        {selectedProduct && (
                            <div className="user-badge">
                                <span className="badge-id">#{selectedProduct.id}</span>
                                <span className="badge-name">{selectedProduct.name}</span>
                            </div>
                        )}
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del manga"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Autor</label>
                                <input
                                    type="text"
                                    placeholder="Autor"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ilustrador</label>
                                <input
                                    type="text"
                                    placeholder="Ilustrador"
                                    value={formData.illustrator}
                                    onChange={(e) => setFormData({ ...formData, illustrator: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Género</label>
                                <input
                                    type="text"
                                    placeholder="Género"
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Serie</label>
                                <input
                                    type="text"
                                    placeholder="Serie"
                                    value={formData.series}
                                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tomo</label>
                                <input
                                    type="number"
                                    placeholder="Número de tomo"
                                    value={formData.tomoNumber}
                                    onChange={(e) => setFormData({ ...formData, tomoNumber: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Precio"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    placeholder="Stock disponible"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>🖼️ Imagen del Manga</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.png,.webp,.gif"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                                    className="input-field"
                                />
                                {formData.image && (
                                    <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                                        ✓ Archivo seleccionado: {formData.image.name}
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Categoría *</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Etiquetas</label>
                                <div className="tags-selector">
                                    {tags.map(tag => (
                                        <label key={tag.id} className="tag-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag.id)}
                                                onChange={() => toggleTag(tag.id)}
                                            />
                                            {tag.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="button-group">
                                {selectedProduct ? (
                                    <>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={operationLoading}
                                            className="btn btn-success"
                                        >
                                            {operationLoading ? '💾 Guardando...' : '💾 Guardar'}
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={operationLoading}
                                            className="btn btn-danger"
                                        >
                                            {operationLoading ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleCreate}
                                        disabled={operationLoading}
                                        className="btn btn-success"
                                    >
                                        {operationLoading ? '⏳ Creando...' : '➕ Crear'}
                                    </button>
                                )}
                                {selectedProduct && (
                                    <button
                                        onClick={resetForm}
                                        className="btn btn-secondary"
                                    >
                                        ❌ Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="message error">⚠️ {error}</div>}
                    {success && <div className="message success">✅ {success}</div>}
                </aside>

                <main className="admin-main">
                    <div className="admin-users">
                        <div className="users-header">
                            <h3>📚 Todos los Mangas ({products.length})</h3>
                            {products.length > 0 && (
                                <span className="page-info">Página {currentPage} de {totalPages}</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando mangas...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay mangas registrados</p>
                            </div>
                        ) : (
                            <>
                                <div className="items-list">
                                    {paginatedProducts.map((product) => (
                                        <div className="item-card" key={product.id}>
                                            <div className="item-header">
                                                <span className="item-id">#{product.id}</span>
                                                <span className="item-badge">Manga</span>
                                            </div>
                                            <div className="item-content">
                                                <h4 className="item-title">{product.name}</h4>
                                                {product.author && <p className="item-author">✍️ {product.author}</p>}
                                                {product.series && <p className="item-series">📖 {product.series}</p>}
                                                <div className="item-details">
                                                    <span className="detail-badge">💰 ${product.price}</span>
                                                    <span className="detail-badge">📦 Stock: {product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="btn-pagination"
                                        >
                                            ← Anterior
                                        </button>
                                        <div className="page-numbers">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="btn-pagination"
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminProducts
