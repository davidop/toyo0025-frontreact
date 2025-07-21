import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useEventStore = create(devtools((set) => ({
  // State for editing an existing event
  eventForEdit: null,
  
  // Set the event data for editing
  setEventForEdit: (eventData) => set({ eventForEdit: eventData }),
  
  // Clear the event data after editing is complete or cancelled
  clearEventForEdit: () => set({ eventForEdit: null }),
}), { trace: true, traceLimit: 25, name: "eventStore" } ));

export default useEventStore;
