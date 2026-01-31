import apiClient from "./api";

const adminService = {
    getAllUsers: async () => {
        const response = await apiClient.get('/api/users')
        return response.data.data.usuarios || []
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/api/users/${id}`)
        return response.data.data.user || {}
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/api/users/${id}`, userData)
        return response.data.data.user || {}
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/api/users/${id}`)
        return response.data
    }
}

export default adminService