import '../styles/Admin.css'
import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'

const AdminCategories = () => {
    const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = useCategories()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [searchId, setSearchId] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [operationLoading, setOperationLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const data = await getAllCategories()
            setCategories(Array.isArray(data) ? data : [])
            setCurrentPage(1)
        } catch (e) {
            setError(e.message || 'Error al obtener categorías')
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
            const category = await getCategoryById(searchId)
            if (!category || !category.id) {
                setError('Categoría no encontrada')
                setSelectedCategory(null)
                return
            }
            setSelectedCategory(category)
            setFormData({ name: category.name || '', description: category.description || '' })
            setSuccess(`Categoría ${category.name} cargada correctamente`)
        } catch (e) {
            setError(e.response?.status === 404 ? 'Categoría no encontrada' : (e.message || 'Error al obtener categoría'))
            setSelectedCategory(null)
        } finally {
            setOperationLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            setError('El nombre de la categoría es requerido')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await createCategory(formData)
            setSuccess('Categoría creada exitosamente')
            setFormData({ name: '', description: '' })
            fetchCategories()
        } catch (e) {
            setError(e.message || 'Error al crear categoría')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedCategory || !formData.name.trim()) {
            setError('Completa todos los campos requeridos')
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await updateCategory(selectedCategory.id, formData)
            setSuccess('Categoría actualizada exitosamente')
            setSelectedCategory(null)
            setSearchId('')
            fetchCategories()
        } catch (e) {
            setError(e.message || 'Error al actualizar categoría')
        } finally {
            setOperationLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!searchId.trim()) {
            setError('Ingresa un ID válido')
            return
        }
        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedCategory?.name}?`)) {
            return
        }
        try {
            setOperationLoading(true)
            setError(null)
            setSuccess(null)
            await deleteCategory(searchId)
            setSuccess('Categoría eliminada exitosamente')
            setSelectedCategory(null)
            setSearchId('')
            setFormData({ name: '', description: '' })
            fetchCategories()
        } catch (e) {
            setError(e.message || 'Error al eliminar categoría')
        } finally {
            setOperationLoading(false)
        }
    }

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedCategories = categories.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="header-content">
                    <h1>📚 Gestión de Categorías</h1>
                    <p className="subtitle">Crear, editar y eliminar categorías de mangas</p>
                </div>
            </header>

            <div className="admin-container">
                <aside className="admin-sidebar">
                    <div className="operation-section">
                        <h3>🔍 Buscar Categoría</h3>
                        <div className="operation-controls">
                            <input
                                type="number"
                                placeholder="ID de categoría"
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
                        <h3>➕ {selectedCategory ? '✏️ Editar' : '➕ Crear'} Categoría</h3>
                        {selectedCategory && (
                            <div className="user-badge">
                                <span className="badge-id">#{selectedCategory.id}</span>
                                <span className="badge-name">{selectedCategory.name}</span>
                            </div>
                        )}
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre de la categoría"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Descripción de la categoría"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>
                            <div className="button-group">
                                {selectedCategory ? (
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
                                {selectedCategory && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(null)
                                            setSearchId('')
                                            setFormData({ name: '', description: '' })
                                        }}
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
                            <h3>📋 Todas las Categorías ({categories.length})</h3>
                            {categories.length > 0 && (
                                <span className="page-info">Página {currentPage} de {totalPages}</span>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando categorías...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 No hay categorías registradas</p>
                            </div>
                        ) : (
                            <>
                                <div className="items-list">
                                    {paginatedCategories.map((cat) => (
                                        <div className="item-card" key={cat.id}>
                                            <div className="item-header">
                                                <span className="item-id">#{cat.id}</span>
                                                <span className="item-badge">Categoría</span>
                                            </div>
                                            <div className="item-content">
                                                <h4 className="item-title">{cat.name}</h4>
                                                {cat.description && <p className="item-desc">{cat.description}</p>}
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

export default AdminCategories
