import apiClient from "./api";

const productsService = {
    getAllProducts: async () => {
        try {
            const response = await apiClient.get('/v2/mangas')
            console.log('API Response for mangas:', response.data)
            
            // Buscar items en diferentes ubicaciones
            if (response.data.data?.items) {
                console.log('Found mangas in response.data.data.items, count:', response.data.data.items.length)
                return response.data.data.items
            }
            if (Array.isArray(response.data.data)) {
                console.log('Found mangas as array, count:', response.data.data.length)
                return response.data.data
            }
            if (response.data.data?.mangas) {
                console.log('Found mangas in response.data.data.mangas, count:', response.data.data.mangas.length)
                return response.data.data.mangas
            }
            
            console.warn('No mangas found in response', response.data)
            return []
        } catch (error) {
            console.error('Error fetching mangas:', error)
            throw error
        }
    },

    getProductById: async (id) => {
        const response = await apiClient.get(`/v2/mangas/${id}`)
        return response.data.data || {}
    },

    createProduct: async (productData) => {
        const response = await apiClient.post('/v2/mangas', productData)
        return response.data.data?.manga || response.data.data || {}
    },

    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`/v2/mangas/${id}`, productData)
        return response.data.data?.manga || response.data.data || {}
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/v2/mangas/${id}`)
        return response.data
    }
}

export default productsService
