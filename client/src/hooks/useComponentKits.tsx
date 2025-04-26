import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';

// Types
export interface Component {
  id: number;
  name: string;
  description: string;
  imagePath: string | null;
  kitId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  category: string;
  difficulty: string;
  components?: Component[];
  quests?: any[]; // Using any for quests to avoid circular dependency with Quest type
  createdAt?: Date;
  updatedAt?: Date;
}

// Hook to fetch all component kits
export const useComponentKits = () => {
  const result = useQuery<ComponentKit[]>({
    queryKey: ['/api/kits'],
  });
  
  return {
    ...result,
    kits: result.data || [],
    loading: result.isLoading
  };
};

// Hook to fetch a specific component kit
export const useComponentKit = (kitId: string | null) => {
  return useQuery<ComponentKit>({
    queryKey: ['/api/kits', kitId],
    enabled: !!kitId,
  });
};

// Hook to fetch quests for a specific component kit
export const useKitQuests = (kitId: string | null) => {
  return useQuery<any[]>({
    queryKey: ['/api/kits', kitId, 'quests'],
    enabled: !!kitId,
  });
};

// Admin functionalities

// Create a new component kit
export const useCreateComponentKit = () => {
  const mutation = useMutation({
    mutationFn: async (kitData: Omit<ComponentKit, 'id'>) => {
      const response = await fetch('/api/admin/kits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kitData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create component kit');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
    },
  });
  
  return mutation;
};

// Update an existing component kit
export const useUpdateComponentKit = () => {
  const mutation = useMutation({
    mutationFn: async ({ kitId, kitData }: { kitId: string, kitData: Partial<ComponentKit> }) => {
      const response = await fetch(`/api/admin/kits/${kitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kitData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update component kit');
      }
      
      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kits', variables.kitId] });
    },
  });
  
  return mutation;
};

// Delete a component kit
export const useDeleteComponentKit = () => {
  const mutation = useMutation({
    mutationFn: async (kitId: string) => {
      const response = await fetch(`/api/admin/kits/${kitId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete component kit');
      }
      
      return response.json();
    },
    onSuccess: (_data, kitId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kits', kitId] });
    },
  });
  
  return mutation;
};

// Add a component to a kit
export const useAddComponentToKit = () => {
  const mutation = useMutation({
    mutationFn: async ({ kitId, component }: { kitId: string, component: Omit<Component, 'id' | 'kitId'> }) => {
      const response = await fetch(`/api/admin/kits/${kitId}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(component),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add component to kit');
      }
      
      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kits', variables.kitId] });
    },
  });
  
  return mutation;
};

// Update a component
export const useUpdateComponent = () => {
  const mutation = useMutation({
    mutationFn: async ({ componentId, componentData, kitId }: { 
      componentId: number, 
      componentData: Partial<Omit<Component, 'id' | 'kitId'>>,
      kitId: string 
    }) => {
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(componentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update component');
      }
      
      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kits', variables.kitId] });
    },
  });
  
  return mutation;
};

// Delete a component
export const useDeleteComponent = () => {
  const mutation = useMutation({
    mutationFn: async ({ componentId, kitId }: { componentId: number, kitId: string }) => {
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete component');
      }
      
      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/kits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kits', variables.kitId] });
    },
  });
  
  return mutation;
};