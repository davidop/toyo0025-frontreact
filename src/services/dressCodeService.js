import appApi from './appApi';

/**
 * Servicio para obtener los códigos de vestimenta
 */
const dressCodeService = {
  /**
   * Obtiene todos los códigos de vestimenta disponibles
   * @returns {Promise} Promise con la respuesta de la API
   */
  getAllDressCodes: async () => {
    try {
      const response = await appApi.get('/DressCode');
      return response.data;
    } catch (error) {
      console.error('Error fetching dress codes:', error);
      throw error;
    }
  },
  
  /**
   * Alias para getAllDressCodes para mantener consistencia con las llamadas del wizard
   * @returns {Promise} Promise con la respuesta de la API
   */
  getDressCodes: async () => {
    return dressCodeService.getAllDressCodes();
  }
};

export default dressCodeService;
