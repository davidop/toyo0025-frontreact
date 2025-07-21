import apiClient from './api';

/**
 * Servicio para gestionar operaciones relacionadas con iconos
 */
const iconoService = {
  /**
   * Obtiene todos los iconos disponibles
   * @returns {Promise} Promesa que resuelve con la lista de iconos
   */
  getAllIconos: async () => {
    try {
      const response = await apiClient.get('/Icono');
      return response.data;
    } catch (error) {
      console.error('Error al obtener iconos:', error);
      throw error;
    }
  },
  
  /**
   * Alias para getAllIconos para mantener consistencia con las llamadas del wizard
   * @returns {Promise} Promesa que resuelve con la lista de iconos
   */
  getIcons: async () => {
    return iconoService.getAllIconos();
  }
};

export default iconoService;
