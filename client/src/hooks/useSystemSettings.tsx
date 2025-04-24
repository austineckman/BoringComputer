import { useQuery, useMutation } from "@tanstack/react-query";
import { SystemSettings } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Hook for fetching system settings
export function useSystemSettings() {
  const { toast } = useToast();

  // Get all settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery<SystemSettings[]>({
    queryKey: ['/api/admin/settings'],
  });

  // Get settings by category
  const getSettingsByCategory = (category: string) => {
    const categorySettings = settings?.filter(
      (setting) => setting.category === category
    );
    return categorySettings || [];
  };

  // Get a single setting by key
  const getSetting = (key: string) => {
    return settings?.find((setting) => setting.key === key);
  };

  // Create a new setting
  const createSettingMutation = useMutation({
    mutationFn: async (newSetting: { key: string; value: any; category?: string }) => {
      const res = await apiRequest('POST', '/api/admin/settings', newSetting);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Setting created",
        description: "The system setting has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: any; category?: string }) => {
      const res = await apiRequest('PUT', `/api/admin/settings/${key}`, { value, category });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Setting updated",
        description: "The system setting has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a setting
  const deleteSettingMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await apiRequest('DELETE', `/api/admin/settings/${key}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Setting deleted",
        description: "The system setting has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting setting",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Helper method to create or update a setting
  const saveSetting = async (key: string, value: any, category: string = 'general') => {
    const setting = settings?.find(s => s.key === key);
    
    if (setting) {
      return updateSettingMutation.mutateAsync({ key, value, category });
    } else {
      return createSettingMutation.mutateAsync({ key, value, category });
    }
  };

  return {
    settings,
    isLoading,
    error,
    getSettingsByCategory,
    getSetting,
    createSetting: createSettingMutation.mutate,
    updateSetting: updateSettingMutation.mutate, 
    deleteSetting: deleteSettingMutation.mutate,
    saveSetting,
    refetchSettings: refetch
  };
}