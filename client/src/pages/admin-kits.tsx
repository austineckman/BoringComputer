import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Edit, Plus, ImagePlus, FileText, ChevronRight, Package, Database, Grid, Settings, Image as ImageIcon, Upload } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Define types for our Kit and Component models
type Kit = {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  updatedAt: string;
};

type Component = {
  id: number;
  kitId: string;
  name: string;
  description: string;
  imagePath: string | null;
  partNumber: string | null;
  isRequired: boolean;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
};

// Extended component type that includes kit information for the component reuse feature
interface ExtendedComponent extends Component {
  kitName: string;
}

// Form validation schemas
const kitFormSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters").max(50),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

const componentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  partNumber: z.string().optional(),
  isRequired: z.boolean().default(true),
  quantity: z.number().min(1, "Quantity must be at least 1").max(100),
  category: z.string().min(2, "Category is required"),
});

const AdminKits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [isAddingKit, setIsAddingKit] = useState(false);
  const [isEditingKit, setIsEditingKit] = useState(false);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [isEditingComponent, setIsEditingComponent] = useState(false);
  const [isManagingArtwork, setIsManagingArtwork] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [kitImageFile, setKitImageFile] = useState<File | null>(null);
  const [componentImageFile, setComponentImageFile] = useState<File | null>(null);
  const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>("kits");
  const [useExistingComponent, setUseExistingComponent] = useState(false);
  const [selectedExistingComponent, setSelectedExistingComponent] = useState<number | null>(null);
  
  // Fetch kits
  const { data: kits, isLoading: isLoadingKits } = useQuery({
    queryKey: ['/api/admin/kits'],
    queryFn: () => fetch('/api/admin/kits', { 
      method: 'GET',
      credentials: 'include' 
    }).then(res => res.json()),
  });

  // Fetch components for selected kit
  const { data: components, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['/api/admin/kits', selectedKit?.id, 'components'],
    queryFn: () => fetch(`/api/admin/kits/${selectedKit?.id}/components`, { 
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json()),
    enabled: !!selectedKit,
  });
  
  // Fetch all components across all kits for reuse
  const { data: allComponents, isLoading: isLoadingAllComponents } = useQuery<ExtendedComponent[]>({
    queryKey: ['/api/admin/all-components'],
    queryFn: () => fetch('/api/admin/all-components', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json()),
  });

  // Kit form
  const kitForm = useForm<z.infer<typeof kitFormSchema>>({
    resolver: zodResolver(kitFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      category: "electronics",
      difficulty: "beginner",
    },
  });

  // Component form
  const componentForm = useForm<z.infer<typeof componentFormSchema>>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      partNumber: "",
      isRequired: true,
      quantity: 1,
      category: "hardware",
    },
  });

  // Mutations
  const addKitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return fetch('/api/admin/kits', {
        method: 'POST',
        body: data,
        credentials: 'include',
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kits'] });
      toast({
        title: "Kit created",
        description: "The kit was created successfully",
        variant: "default",
      });
      setIsAddingKit(false);
      kitForm.reset();
      setKitImageFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error creating kit",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  const updateKitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return fetch(`/api/admin/kits/${selectedKit?.id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kits'] });
      toast({
        title: "Kit updated",
        description: "The kit was updated successfully",
        variant: "default",
      });
      setIsEditingKit(false);
      kitForm.reset();
      setKitImageFile(null);
      if (selectedKit) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kits', selectedKit.id, 'components'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating kit",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  const deleteKitMutation = useMutation({
    mutationFn: async (kitId: string) => {
      return fetch(`/api/admin/kits/${kitId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kits'] });
      toast({
        title: "Kit deleted",
        description: "The kit was deleted successfully",
        variant: "default",
      });
      setSelectedKit(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting kit",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  const addComponentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Submitting component to kit:", selectedKit?.id);
      const response = await fetch(`/api/admin/kits/${selectedKit?.id}/components`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding component:", errorData);
        throw new Error(errorData.message || "Failed to add component");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Component added successfully:", data);
      if (selectedKit) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kits', selectedKit.id, 'components'] });
      }
      toast({
        title: "Component added",
        description: "The component was added successfully",
        variant: "default",
      });
      setIsAddingComponent(false);
      componentForm.reset();
      setComponentImageFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error adding component",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  const updateComponentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Updating component with ID:", selectedComponent?.id);
      const response = await fetch(`/api/admin/components/${selectedComponent?.id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating component:", errorData);
        throw new Error(errorData.message || "Failed to update component");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Component updated successfully:", data);
      if (selectedKit) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kits', selectedKit.id, 'components'] });
      }
      toast({
        title: "Component updated",
        description: "The component was updated successfully",
        variant: "default",
      });
      setIsEditingComponent(false);
      componentForm.reset();
      setComponentImageFile(null);
      setSelectedComponent(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating component",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId: number) => {
      console.log("Deleting component with ID:", componentId);
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting component:", errorData);
        throw new Error(errorData.message || "Failed to delete component");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Component deleted successfully:", data);
      if (selectedKit) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kits', selectedKit.id, 'components'] });
      }
      toast({
        title: "Component deleted",
        description: "The component was deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting component",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });
  
  const uploadArtworkMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("Uploading artwork for kit:", selectedKit?.id);
      const response = await fetch(`/api/admin/kits/${selectedKit?.id}/artwork`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading artwork:", errorData);
        throw new Error(errorData.message || "Failed to upload artwork");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kits'] });
      if (selectedKit) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/kits', selectedKit.id, 'artwork'] });
      }
      toast({
        title: "Artwork uploaded",
        description: "The artwork was uploaded successfully",
        variant: "default",
      });
      setIsManagingArtwork(false);
      setArtworkFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Error uploading artwork",
        description: error.toString(),
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onAddKit = (data: z.infer<typeof kitFormSchema>) => {
    const formData = new FormData();
    formData.append('id', data.id);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('difficulty', data.difficulty);
    
    if (kitImageFile) {
      formData.append('image', kitImageFile);
    }
    
    addKitMutation.mutate(formData);
  };

  const onEditKit = (data: z.infer<typeof kitFormSchema>) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('difficulty', data.difficulty);
    
    if (kitImageFile) {
      formData.append('image', kitImageFile);
    }
    
    updateKitMutation.mutate(formData);
  };

  const onAddComponent = (data: z.infer<typeof componentFormSchema>) => {
    console.log("onAddComponent called with data:", data);
    console.log("useExistingComponent:", useExistingComponent);
    console.log("selectedExistingComponent:", selectedExistingComponent);
    console.log("selectedKit:", selectedKit);
    
    const formData = new FormData();
    
    // Creating a new component from scratch - this function is now only used for new components
    console.log("Adding new component");
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('partNumber', data.partNumber || '');
    formData.append('isRequired', data.isRequired.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('category', data.category);
    
    if (componentImageFile) {
      formData.append('image', componentImageFile);
    }
    
    console.log("Calling mutation to add component");
    // Log values individually instead of using iterator
    console.log("name:", formData.get('name'));
    console.log("description:", formData.get('description'));
    console.log("isRequired:", formData.get('isRequired'));
    console.log("quantity:", formData.get('quantity'));
    console.log("category:", formData.get('category'));
    
    addComponentMutation.mutate(formData);
  };

  const onEditComponent = (data: z.infer<typeof componentFormSchema>) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('partNumber', data.partNumber || '');
    formData.append('isRequired', data.isRequired.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('category', data.category);
    
    if (componentImageFile) {
      formData.append('image', componentImageFile);
    }
    
    updateComponentMutation.mutate(formData);
  };

  const handleDeleteKit = (kit: Kit) => {
    if (window.confirm(`Are you sure you want to delete the kit "${kit.name}"? This will also delete all of its components.`)) {
      deleteKitMutation.mutate(kit.id);
    }
  };

  const handleDeleteComponent = (component: Component) => {
    if (window.confirm(`Are you sure you want to delete the component "${component.name}"?`)) {
      deleteComponentMutation.mutate(component.id);
    }
  };

  const handleEditKit = (kit: Kit) => {
    setSelectedKit(kit);
    setIsEditingKit(true);
    
    kitForm.reset({
      id: kit.id,
      name: kit.name,
      description: kit.description,
      category: kit.category,
      difficulty: kit.difficulty as "beginner" | "intermediate" | "advanced",
    });
  };

  const handleEditComponent = (component: Component) => {
    setSelectedComponent(component);
    setIsEditingComponent(true);
    
    componentForm.reset({
      name: component.name,
      description: component.description,
      partNumber: component.partNumber || "",
      isRequired: component.isRequired,
      quantity: component.quantity,
      category: component.category,
    });
  };

  const handleSelectKit = (kit: Kit) => {
    setSelectedKit(kit);
    setActiveTab("components");
  };
  
  const handleKitArtwork = (kit: Kit) => {
    setSelectedKit(kit);
    setIsManagingArtwork(true);
    setArtworkFiles([]);
  };

  const handleAddComponent = () => {
    componentForm.reset({
      name: "",
      description: "",
      partNumber: "",
      isRequired: true,
      quantity: 1,
      category: "hardware",
    });
    setComponentImageFile(null);
    setUseExistingComponent(false);
    setSelectedExistingComponent(null);
    setIsAddingComponent(true);
  };
  
  const onUploadArtwork = () => {
    if (!selectedKit) return;
    
    const formData = new FormData();
    artworkFiles.forEach((file, index) => {
      formData.append(`artwork${index + 1}`, file);
    });
    
    uploadArtworkMutation.mutate(formData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Component Kits Management</h1>
            <p className="text-muted-foreground">
              Create and manage educational component kits and their parts
            </p>
          </div>
          <Button onClick={() => {
            setIsAddingKit(true);
            kitForm.reset();
            setKitImageFile(null);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add New Kit
          </Button>
        </div>

        <Tabs defaultValue="kits" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="kits">
              <Package className="mr-2 h-4 w-4" />
              Kits
            </TabsTrigger>
            {selectedKit && (
              <TabsTrigger value="components">
                <Grid className="mr-2 h-4 w-4" />
                Components for {selectedKit.name}
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Kits Tab */}
          <TabsContent value="kits">
            {isLoadingKits ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : kits && kits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kits.map((kit: Kit) => (
                  <Card key={kit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      {kit.imagePath ? (
                        <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden mb-2">
                          <img 
                            src={kit.imagePath} 
                            alt={kit.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded-md mb-2">
                          <Package className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl truncate">{kit.name}</CardTitle>
                        <Badge variant="outline" className={getDifficultyColor(kit.difficulty)}>
                          {kit.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{kit.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Database className="mr-1 h-4 w-4" />
                        <span>Category: {kit.category}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col md:flex-row justify-between gap-2 pt-0">
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button variant="secondary" size="sm" className="flex-grow md:flex-grow-0" onClick={() => handleSelectKit(kit)}>
                          View Components <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-grow md:flex-grow-0" onClick={() => handleKitArtwork(kit)}>
                          Artwork <ImageIcon className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 self-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEditKit(kit)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteKit(kit)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Component Kits Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first component kit to get started
                  </p>
                  <Button onClick={() => setIsAddingKit(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Kit
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            {selectedKit && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedKit.name} Components</h2>
                    <p className="text-muted-foreground">Manage components in this kit</p>
                  </div>
                  <Button onClick={handleAddComponent}>
                    <Plus className="mr-2 h-4 w-4" /> Add Component
                  </Button>
                </div>

                {isLoadingComponents ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : components && components.length > 0 ? (
                  <div className="bg-space-mid rounded-md border shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-space-light">
                          <TableHead className="text-brand-light">Image</TableHead>
                          <TableHead className="text-brand-light">Name</TableHead>
                          <TableHead className="text-brand-light">Description</TableHead>
                          <TableHead className="text-brand-light">Category</TableHead>
                          <TableHead className="text-brand-light">Quantity</TableHead>
                          <TableHead className="text-brand-light text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {components.map((component: Component) => (
                          <TableRow key={component.id} className="hover:bg-space-dark">
                            <TableCell>
                              {component.imagePath ? (
                                <div className="relative w-12 h-12 bg-space-dark rounded-md overflow-hidden">
                                  <img 
                                    src={component.imagePath} 
                                    alt={component.name}
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-12 h-12 bg-space-dark rounded-md">
                                  <Settings className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-brand-light">{component.name}</TableCell>
                            <TableCell className="max-w-xs truncate text-brand-light">{component.description}</TableCell>
                            <TableCell className="text-brand-light">{component.category}</TableCell>
                            <TableCell className="text-brand-light">{component.quantity}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditComponent(component)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteComponent(component)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Card className="bg-space-mid border-space-light">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Grid className="h-16 w-16 text-brand-light/60 mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-brand-light">No Components Found</h3>
                      <p className="text-brand-light/70 text-center mb-4">
                        Add components to this kit to get started
                      </p>
                      <Button onClick={handleAddComponent}>
                        <Plus className="mr-2 h-4 w-4" /> Add Component
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Kit Dialog */}
        <Dialog open={isAddingKit} onOpenChange={setIsAddingKit}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Component Kit</DialogTitle>
              <DialogDescription>
                Create a new educational component kit that can be used in quests and projects.
              </DialogDescription>
            </DialogHeader>
            <Form {...kitForm}>
              <form onSubmit={kitForm.handleSubmit(onAddKit)} className="space-y-4">
                <FormField
                  control={kitForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input placeholder="arduino-uno" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for the kit (e.g., "arduino-uno", "raspberry-pi")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={kitForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Arduino Uno Starter Kit" {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name for this component kit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={kitForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A comprehensive starter kit featuring the Arduino Uno microcontroller board and all the essential components to build your first circuits..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description of what's included in the kit and its purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={kitForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="electronics" {...field} />
                        </FormControl>
                        <FormDescription>
                          Category for this kit (e.g., electronics, robotics)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={kitForm.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The complexity level of this kit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kit-image">Kit Image</Label>
                  <div className="flex items-center gap-4">
                    {kitImageFile ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={URL.createObjectURL(kitImageFile)}
                          alt="Kit preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md">
                        <ImagePlus className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="kit-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setKitImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload an image for this kit (optional)
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingKit(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addKitMutation.isPending}
                  >
                    {addKitMutation.isPending && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Create Kit
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Kit Dialog */}
        <Dialog open={isEditingKit} onOpenChange={setIsEditingKit}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Component Kit</DialogTitle>
              <DialogDescription>
                Update details for this component kit.
              </DialogDescription>
            </DialogHeader>
            <Form {...kitForm}>
              <form onSubmit={kitForm.handleSubmit(onEditKit)} className="space-y-4">
                <FormField
                  control={kitForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input disabled {...field} />
                      </FormControl>
                      <FormDescription>
                        ID cannot be changed after creation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={kitForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={kitForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={kitForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={kitForm.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kit-image-edit">Kit Image</Label>
                  <div className="flex items-center gap-4">
                    {kitImageFile ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={URL.createObjectURL(kitImageFile)}
                          alt="Kit preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : selectedKit?.imagePath ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={selectedKit.imagePath}
                          alt="Kit preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md">
                        <ImagePlus className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="kit-image-edit"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setKitImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a new image (optional)
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditingKit(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateKitMutation.isPending}
                  >
                    {updateKitMutation.isPending && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Component Dialog */}
        <Dialog open={isAddingComponent} onOpenChange={setIsAddingComponent}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Component to {selectedKit?.name}</DialogTitle>
              <DialogDescription>
                Add a new component to this kit with detailed specifications or select an existing one.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-existing" 
                  checked={useExistingComponent}
                  onCheckedChange={setUseExistingComponent}
                />
                <Label htmlFor="use-existing">Use existing component from another kit</Label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Reuse components that already exist in other kits to avoid duplication
              </p>
            </div>
            
            {useExistingComponent ? (
              // Existing Component Selection Form - NO FORM WRAPPER
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label>Select an existing component</Label>
                  {isLoadingAllComponents ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : allComponents && allComponents.length > 0 ? (
                    <div className="border rounded-md max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Kit</TableHead>
                            <TableHead>Select</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allComponents
                            ?.filter((c: ExtendedComponent) => c.kitId !== selectedKit?.id) // Don't show components from the current kit
                            .map((component: ExtendedComponent) => (
                              <TableRow key={component.id}>
                                <TableCell>
                                  {component.imagePath ? (
                                    <div className="relative w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                      <img 
                                        src={component.imagePath} 
                                        alt={component.name}
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md">
                                      <Settings className="h-5 w-5 text-gray-300" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{component.name}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{component.description}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{component.kitName}</TableCell>
                                <TableCell>
                                  <Button 
                                    type="button" 
                                    variant={selectedExistingComponent === component.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedExistingComponent(component.id)}
                                  >
                                    {selectedExistingComponent === component.id ? "Selected" : "Select"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-md text-center">
                      <p>No components available from other kits.</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="existing-quantity">Quantity</Label>
                    <Input 
                      id="existing-quantity"
                      type="number" 
                      min={1} 
                      max={100}
                      defaultValue={1}
                      onChange={(e) => componentForm.setValue('quantity', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      How many of this component come in the kit
                    </p>
                  </div>
                  
                  <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                      id="existing-required"
                      defaultChecked={true}
                      onCheckedChange={(checked) => componentForm.setValue('isRequired', !!checked)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="existing-required">Required Component</Label>
                      <p className="text-sm text-muted-foreground">
                        Is this component required for kit completion?
                      </p>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingComponent(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={addComponentMutation.isPending || !selectedExistingComponent}
                    onClick={() => {
                      if (!selectedExistingComponent || !selectedKit) return;
                      
                      console.log("Adding existing component with direct click");
                      const formData = new FormData();
                      formData.append('fromExistingId', selectedExistingComponent.toString());
                      // Use default values if not set
                      const quantity = componentForm.getValues('quantity') || 1;
                      const isRequired = componentForm.getValues('isRequired') !== false; // default to true
                      
                      formData.append('quantity', quantity.toString());
                      formData.append('isRequired', isRequired.toString());
                      
                      console.log("FormData contents for existing component:");
                      // Log the key values without iterator
                      console.log("fromExistingId:", formData.get('fromExistingId'));
                      console.log("quantity:", formData.get('quantity'));
                      console.log("isRequired:", formData.get('isRequired'));
                      
                      addComponentMutation.mutate(formData);
                    }}
                  >
                    {addComponentMutation.isPending && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Add Existing Component
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              // New Component Form
              <Form {...componentForm}>
                <form onSubmit={componentForm.handleSubmit(onAddComponent)} className="space-y-4">
                  <FormField
                    control={componentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Component Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Arduino Uno R3 Board" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={componentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button." 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={componentForm.control}
                      name="partNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Number</FormLabel>
                          <FormControl>
                            <Input placeholder="A000066" {...field} />
                          </FormControl>
                          <FormDescription>
                            Manufacturer's part number (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={componentForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="microcontroller" {...field} />
                          </FormControl>
                          <FormDescription>
                            Component category (e.g., sensor, actuator, connector)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={componentForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={100} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>
                            How many come in the kit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="component-image">Component Image</Label>
                    <div className="flex items-center gap-4">
                      {componentImageFile ? (
                        <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={URL.createObjectURL(componentImageFile)}
                            alt="Component preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md">
                          <ImagePlus className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="component-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setComponentImageFile(e.target.files[0]);
                            }
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Upload an image for this component (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddingComponent(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addComponentMutation.isPending}
                    >
                      {addComponentMutation.isPending && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      )}
                      Add New Component
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Component Dialog */}
        <Dialog open={isEditingComponent} onOpenChange={setIsEditingComponent}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Component</DialogTitle>
              <DialogDescription>
                Update details for {selectedComponent?.name}
              </DialogDescription>
            </DialogHeader>
            <Form {...componentForm}>
              <form onSubmit={componentForm.handleSubmit(onEditComponent)} className="space-y-4">
                <FormField
                  control={componentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Component Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={componentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={componentForm.control}
                    name="partNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={componentForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={componentForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={100} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="component-image-edit">Component Image</Label>
                  <div className="flex items-center gap-4">
                    {componentImageFile ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={URL.createObjectURL(componentImageFile)}
                          alt="Component preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : selectedComponent?.imagePath ? (
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={selectedComponent.imagePath}
                          alt="Component preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md">
                        <ImagePlus className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="component-image-edit"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setComponentImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a new image (optional)
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditingComponent(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateComponentMutation.isPending}
                  >
                    {updateComponentMutation.isPending && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Artwork Upload Dialog */}
        <Dialog open={isManagingArtwork} onOpenChange={setIsManagingArtwork}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Artwork for {selectedKit?.name}</DialogTitle>
              <DialogDescription>
                Upload up to 6 artwork images that represent the theme and world of this kit. These images will be used for AI image generation to ensure consistency.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`artwork-${index + 1}`}>Artwork {index + 1}</Label>
                      <div className="flex flex-col items-center gap-3 border rounded-md p-3">
                        {artworkFiles[index] ? (
                          <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={URL.createObjectURL(artworkFiles[index])}
                              alt={`Artwork ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                const newFiles = [...artworkFiles];
                                newFiles.splice(index, 1);
                                setArtworkFiles(newFiles);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-32 bg-gray-100 rounded-md">
                            <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                            <Input
                              id={`artwork-${index + 1}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const newFiles = [...artworkFiles];
                                  newFiles[index] = e.target.files[0];
                                  setArtworkFiles(newFiles);
                                }
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                document.getElementById(`artwork-${index + 1}`)?.click();
                              }}
                            >
                              <Upload className="h-4 w-4 mr-1" /> Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 border">
                <h4 className="text-sm font-medium mb-2">Tips for effective artwork:</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Include images that represent the theme, setting, and aesthetic of your kit</li>
                  <li>Provide images with consistent art style to ensure coherent quest imagery</li>
                  <li>Use high-quality images with good lighting and clear subjects</li>
                  <li>Include environment shots, characters, and technology relevant to your kit</li>
                  <li>Uploaded images will be used as reference for AI image generation</li>
                </ul>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsManagingArtwork(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  disabled={artworkFiles.length === 0 || uploadArtworkMutation.isPending}
                  onClick={onUploadArtwork}
                >
                  {uploadArtworkMutation.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  Upload Artwork
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminKits;