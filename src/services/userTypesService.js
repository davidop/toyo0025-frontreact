import apiClient from './api'

export const userTypesService = {
  // Get all user types
  getUserTypes: async () => {
    try {
      const response = await apiClient.get('/TipoUsuarios')
      return response.data
    } catch (error) {
      console.error('Error fetching user types:', error)
      throw error
    }
  },
}

export default userTypesService
