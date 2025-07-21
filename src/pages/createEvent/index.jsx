import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import EventWizard from './components/EventWizard';

/**
 * Página de creación de eventos
 * Utiliza el nuevo componente EventWizard para el proceso de creación
 */
const CreateEventPage = () => {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <EventWizard />
    </QueryClientProvider>
  );
};

export default CreateEventPage;
