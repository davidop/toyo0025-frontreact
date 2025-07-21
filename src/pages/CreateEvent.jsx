import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import EventWizard from './createEvent/components/EventWizard';

/**
 * Componente principal para la creación de eventos
 * Utiliza el nuevo componente EventWizard para la creación de eventos
 */
const CreateEvent = () => {
  // Crear una instancia de QueryClient para permitir las mutaciones
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <EventWizard />
    </QueryClientProvider>
  );
};

export default CreateEvent;
