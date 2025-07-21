import apiClient, { appApiClient } from './api';



const homeService = {
  // Obtener el contenido actual del Home (usando la API de app móvil)
  getHomeContent: async () => {
    try {
      const response = await apiClient.get('/Home');
      return response.data;
    } catch (error) {
      console.error('Error fetching home content:', error);
      throw error;
    }
  },
  

  
  // Actualizar el contenido del Home (imagen, PDF FAQ, descripción)
  updateHomeContent: async (data) => {
    try {
      const formData = new FormData();
      
      // Si hay imagen, la agregamos al FormData
      if (data.imagen instanceof File) {
        formData.append('Imagen', data.imagen);
      }
      
      // Si hay PDF FAQ, lo agregamos al FormData
      if (data.faq instanceof File) {
        formData.append('FAQ', data.faq);
      }
      
      // Si hay descripción, la agregamos al FormData
      if (data.descripcion) {
        formData.append('Descripcion', data.descripcion);
      }
      
      const response = await apiClient.patch('/Home', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating home content:', error);
      throw error;
    }
  }
};

export default homeService;
