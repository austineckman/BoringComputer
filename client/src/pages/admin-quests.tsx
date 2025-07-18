import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Package, 
  Filter, 
  Search, 
  FileImage, 
  FileVideo, 
  Code,
  BookOpen,
  ListPlus,
  Gift,
  Sparkles,
  Archive,
  ArrowUpDown,
  Upload,
  Loader2,
  Shirt,
  Cog,
  X,
  Shield
} from 'lucide-react';

// Define quest types
interface Quest {
  id: number;
  date: string;
  title: string;
  description: string;
  adventureLine: string;
  difficulty: number;
  orderInLine: number;
  xpReward: number;
  goldReward: number;
  lootBoxRewards: {type: string, quantity: number}[];
  active: boolean;
  kitId?: string;
  components?: {id: number, required: boolean, quantity: number}[];
  rewards?: {type: string, id: string, quantity: number}[];
  content: {
    videos: string[];
    images: string[];
    codeBlocks: {language: string, code: string}[];
  };
}

interface Item {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  rarity: string;
}

interface LootBoxConfig {
  id: string;
  name: string;
  rarity: string;
  image?: string;
  description?: string;
  itemDropTable?: {
    itemId: string;
    weight: number;
    minQuantity: number;
    maxQuantity: number;
  }[];
}

interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  category?: string;
  difficulty?: string;
  components?: KitComponent[];
}

interface KitComponent {
  id: number;
  kitId: string;
  name: string;
  description: string;
  imagePath?: string;
  partNumber?: string;
  isRequired: boolean;
  quantity: number;
  category?: string;
}

// Define form validation schema
const questFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Flavor text is required" }),
  missionBrief: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "Date must be in YYYY-MM-DD format" 
  }),
  adventureLine: z.string().min(1, { message: "Adventure line is required" }),
  difficulty: z.coerce.number().min(1).max(5),
  orderInLine: z.coerce.number().min(0),
  xpReward: z.coerce.number().min(1),
  goldReward: z.coerce.number().min(0),
  active: z.boolean().default(true),
  kitId: z.string().optional(), // Optional reference to a component kit
});

const contentBlockSchema = z.object({
  videos: z.array(z.string().url({ message: "Must be a valid URL" })).default([]),
  images: z.array(z.string().url({ message: "Must be a valid URL" })).default([]),
  codeBlocks: z.array(
    z.object({
      language: z.string().min(1),
      code: z.string().min(1),
    })
  ).default([]),
});

const rewardSchema = z.object({
  type: z.string().min(1),
  quantity: z.coerce.number().min(1),
});

const AdminQuests: React.FC = () => {
  const [location] = useLocation();
  
  // State for dialog control
  const [isAddingQuest, setIsAddingQuest] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deleteQuest, setDeleteQuest] = useState<Quest | null>(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Content blocks state
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<{language: string, code: string}[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newCodeLanguage, setNewCodeLanguage] = useState('javascript');
  const [newCodeContent, setNewCodeContent] = useState('');
  
  // Rewards state
  const [lootBoxRewards, setLootBoxRewards] = useState<{type: string, quantity: number}[]>([]);
  const [newRewardType, setNewRewardType] = useState('');
  const [newRewardQuantity, setNewRewardQuantity] = useState(1);
  
  // New rewards state for unified system
  const [rewardTabValue, setRewardTabValue] = useState('lootbox');
  const [formData, setFormData] = useState<any>({
    rewards: []
  });
  
  // Component selection state
  const [questComponents, setQuestComponents] = useState<{
    id: number;
    name: string;
    required: boolean;
    quantity: number;
  }[]>([]);
  
  const { toast } = useToast();

  // Fetch quests
  const { data: quests = [], isLoading: loadingQuests } = useQuery({
    queryKey: ['/api/admin/quests'],
    // Use the default queryFn
  });

  // Fetch loot box configurations for rewards
  const { data: lootBoxConfigs = [], isLoading: loadingLootBoxes } = useQuery({
    queryKey: ['/api/admin/lootboxes'],
    // Use the default queryFn
    onError: (error) => {
      console.error('Error fetching loot box configs:', error);
    },
    onSuccess: (data) => {
      console.log("Fetched loot boxes:", data);
    }
  });

  // Fetch items for content references
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
    // Use the default queryFn
    onSuccess: (data) => {
      console.log("Fetched items:", data);
    },
    onError: (error) => {
      console.error('Error fetching items:', error);
    }
  });
  
  // Fetch component kits for quest requirements
  const { data: componentKits = [], isLoading: loadingKits } = useQuery({
    queryKey: ['/api/admin/components-for-quest'],
    // Use the default queryFn
    onSuccess: (data) => {
      console.log("Fetched component kits:", data);
    },
    onError: (error) => {
      console.error('Error fetching component kits:', error);
    }
  });

  // Create quest mutation
  const createQuestMutation = useMutation({
    mutationFn: async (questData: any) => {
      return await apiRequest('POST', '/api/admin/quests', questData);
    },
    onSuccess: () => {
      toast({
        title: 'Quest created',
        description: 'The quest has been created successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create quest',
        variant: 'destructive',
      });
    },
  });

  // Update quest mutation
  const updateQuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest('PUT', `/api/admin/quests/${id}`, data);
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Quest updated',
        description: 'The quest has been updated successfully.',
        variant: 'default',
      });
      
      // Invalidate the admin quests list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      
      // Also invalidate the individual quest query to update the quest detail page
      queryClient.invalidateQueries({ queryKey: ['/api/quests', variables.id.toString()] });
      
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update quest',
        variant: 'destructive',
      });
    },
  });

  // Delete quest mutation
  const deleteQuestMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/quests/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Quest deleted',
        description: 'The quest has been deleted successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      setDeleteQuest(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete quest',
        variant: 'destructive',
      });
    },
  });

  // Form for quest creation/editing
  const form = useForm<z.infer<typeof questFormSchema>>({
    resolver: zodResolver(questFormSchema),
    defaultValues: {
      title: '',
      description: '',
      missionBrief: '',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      adventureLine: '30 Days Lost in Space',
      difficulty: 1,
      orderInLine: 0,
      xpReward: 100,
      goldReward: 50,
      active: true,
      kitId: '',
    },
  });

  // Handle URL parameters from quest generator
  useEffect(() => {
    // Check if we have URL parameters that indicate we should open the quest editor
    if (location.includes('?')) {
      const params = new URLSearchParams(location.split('?')[1]);
      const action = params.get('action');
      
      if (action === 'new') {
        // We're coming from the quest generator, pre-populate the form
        const title = params.get('title') || '';
        const description = params.get('description') || '';
        const missionBrief = params.get('missionBrief') || '';
        const adventureLine = params.get('adventureLine') || '30 Days Lost in Space';
        const kitId = params.get('kitId') || '';
        const xpReward = parseInt(params.get('xpReward') || '100', 10);
        const difficulty = parseInt(params.get('difficulty') || '1', 10);
        const imageUrl = params.get('imageUrl') || '';
        const lootSuggestion = params.get('lootSuggestion') || '';
        
        // Reset form with values from URL parameters
        form.reset({
          title,
          description,
          missionBrief,
          date: new Date().toISOString().split('T')[0],
          adventureLine: adventureLine as any,
          difficulty,
          orderInLine: 0,
          xpReward,
          goldReward: 50,
          active: true,
          kitId,
        });
        
        // Set images if available
        if (imageUrl) {
          setImageUrls([imageUrl]);
        } else {
          setImageUrls([]);
        }
        
        // Reset other content blocks
        setVideoUrls([]);
        setCodeBlocks([]);
        
        // Process component IDs if available
        try {
          const componentIdsParam = params.get('componentIds');
          const componentsParam = params.get('components');
          
          if (componentIdsParam && componentsParam) {
            const componentIds = JSON.parse(componentIdsParam);
            const componentNames = JSON.parse(componentsParam);
            
            if (Array.isArray(componentIds) && Array.isArray(componentNames) && 
                componentIds.length === componentNames.length) {
              
              // Map component IDs to component objects for the quest
              const questComponentsList = componentIds.map((id, index) => ({
                id: id || 0,
                name: componentNames[index] || 'Unknown Component',
                required: true,
                quantity: 1
              }));
              
              setQuestComponents(questComponentsList);
              console.log('Loaded components from URL params:', questComponentsList);
            }
          }
        } catch (e) {
          console.error('Error parsing component data from URL:', e);
        }
        
        // Process rewards from lootSuggestion if available
        if (lootSuggestion) {
          try {
            // Parse lootSuggestion string into an array of reward objects
            // Format is typically "item-id x3, other-item x1"
            const rewards = lootSuggestion.split(',').map(item => {
              const [idPart, quantityPart] = item.trim().split('x');
              const id = idPart.trim();
              
              // Determine the correct reward type based on naming convention or ID pattern
              let rewardType: 'lootbox' | 'item' | 'equipment' = 'item'; // Default to 'item'
              
              // If it contains "box", "crate", or "pack", it's probably a lootbox
              if (id.includes('box') || id.includes('crate') || id.includes('pack')) {
                rewardType = 'lootbox';
              }
              // If it's wearable or equippable based on known items (this is simplified)
              else if (id.includes('helmet') || id.includes('armor') || id.includes('sword') || 
                       id.includes('boots') || id.includes('gloves') || id.includes('shield')) {
                rewardType = 'equipment';
              }
              
              return {
                type: rewardType,
                id: id,
                quantity: parseInt(quantityPart?.trim() || '1', 10) || 1
              };
            });
            
            // Set the rewards in our form data
            setFormData({
              rewards: rewards
            });
          } catch (e) {
            console.error('Error parsing rewards from lootSuggestion:', e);
          }
        } else {
          setFormData({ rewards: [] });
        }
        
        // Open the dialog for creating a new quest
        setIsAddingQuest(true);
        setEditingQuest(null);
      }
    }
  }, [location, form]);

  // Content management functions
  const addVideoUrl = () => {
    if (newVideoUrl && newVideoUrl.trim()) {
      setVideoUrls([...videoUrls, newVideoUrl.trim()]);
      setNewVideoUrl('');
    }
  };

  const removeVideoUrl = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const handleImageUpload = async () => {
    if (!selectedImageFile) return;
    
    try {
      setUploadingImage(true);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      
      // Upload the image using the apiRequest function
      const response = await apiRequest('POST', '/api/admin/upload-image', formData);
      
      const data = await response.json();
      
      if (data.url) {
        // Add the image URL to our list of images
        setImageUrls([...imageUrls, data.url]);
        
        // Clear the selected file
        setSelectedImageFile(null);
        
        toast({
          title: 'Image uploaded',
          description: 'The image was uploaded successfully.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addCodeBlock = () => {
    if (newCodeContent && newCodeContent.trim()) {
      setCodeBlocks([...codeBlocks, {
        language: newCodeLanguage,
        code: newCodeContent.trim()
      }]);
      setNewCodeContent('');
    }
  };

  const removeCodeBlock = (index: number) => {
    setCodeBlocks(codeBlocks.filter((_, i) => i !== index));
  };

  // Legacy reward management functions
  const addReward = () => {
    if (newRewardType) {
      setLootBoxRewards([...lootBoxRewards, {
        type: newRewardType,
        quantity: newRewardQuantity
      }]);
      setNewRewardType('');
      setNewRewardQuantity(1);
    }
  };

  const removeReward = (index: number) => {
    setLootBoxRewards(lootBoxRewards.filter((_, i) => i !== index));
  };
  
  // New unified reward management functions
  const addUnifiedReward = (rewardData: { type: string, id: string, quantity: number }) => {
    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, rewardData]
    }));
  };
  
  const removeUnifiedReward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  // Handle opening the dialog for adding a new quest
  const handleAddQuest = () => {
    form.reset({
      title: '',
      description: '',
      missionBrief: '',
      date: new Date().toISOString().split('T')[0],
      adventureLine: adventureLinesData.length > 0 ? adventureLinesData[0].id : '30 Days Lost in Space',
      difficulty: 1,
      orderInLine: 0,
      xpReward: 100,
      active: true,
      kitId: '',
    });
    
    // Reset content blocks and rewards
    setVideoUrls([]);
    setImageUrls([]);
    setCodeBlocks([]);
    setLootBoxRewards([]);
    
    setIsAddingQuest(true);
    setEditingQuest(null);
  };

  // Handle opening the dialog for editing an existing quest
  const handleEditQuest = (quest: Quest) => {
    // Use the quest's existing adventure line
    let validAdventureLine = quest.adventureLine;
    
    form.reset({
      title: quest.title,
      description: quest.description,
      missionBrief: quest.missionBrief || '',
      date: quest.date,
      adventureLine: validAdventureLine as any, // Cast to any to prevent TS error during transition
      difficulty: quest.difficulty,
      orderInLine: quest.orderInLine,
      xpReward: quest.xpReward,
      active: quest.active,
      kitId: quest.kitId || '',
    });
    
    // Load content blocks
    setVideoUrls(quest.content?.videos || []);
    setImageUrls(quest.content?.images || []);
    setCodeBlocks(quest.content?.codeBlocks || []);
    
    // Load rewards (legacy format)
    setLootBoxRewards(quest.lootBoxRewards || []);
    
    // Load rewards (new unified format if available)
    if (quest.rewards && Array.isArray(quest.rewards) && quest.rewards.length > 0) {
      setFormData({ rewards: quest.rewards });
    } else if (quest.lootBoxRewards && quest.lootBoxRewards.length > 0) {
      // Convert from legacy format
      setFormData({
        rewards: quest.lootBoxRewards.map(reward => ({
          type: 'lootbox',
          id: reward.type,
          quantity: reward.quantity
        }))
      });
    } else {
      setFormData({ rewards: [] });
    }
    
    // Load component requirements if quest has any
    if (quest.components && Array.isArray(quest.components) && quest.components.length > 0) {
      // If we have a kit selected and components data
      if (quest.kitId) {
        // Find the kit
        const selectedKit = componentKits.find((kit: any) => kit.id === quest.kitId);
        if (selectedKit && selectedKit.components) {
          console.log('Loading component state from saved quest data');
          
          // First, create a map of quest component required states by ID for quick lookup
          const questComponentsMap = new Map();
          quest.components.forEach((comp: any) => {
            // Store the required state (prioritizing the quest's saved state)
            questComponentsMap.set(comp.id, {
              required: comp.required,
              quantity: comp.quantity || 1
            });
          });
          
          // Create the merged components using the quest's saved state as priority
          const mergedComponents = selectedKit.components.map((kitComponent: any) => {
            // Check if this component exists in the saved quest components
            const savedComponentState = questComponentsMap.get(kitComponent.id);
            
            return {
              id: kitComponent.id,
              name: kitComponent.name,
              // Always use the kit's quantity as a baseline
              quantity: kitComponent.quantity,
              // Use the saved required state if available, otherwise use the kit default
              required: savedComponentState 
                ? savedComponentState.required 
                : Boolean(kitComponent.isRequired)
            };
          });
          
          setQuestComponents(mergedComponents);
        }
      }
    }
    
    setEditingQuest(quest);
    setIsAddingQuest(false);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setIsAddingQuest(false);
    setEditingQuest(null);
    form.reset();
    
    // Reset content blocks and rewards
    setVideoUrls([]);
    setImageUrls([]);
    setCodeBlocks([]);
    setLootBoxRewards([]);
    setNewVideoUrl('');
    setSelectedImageFile(null);
    setUploadingImage(false);
    setNewCodeContent('');
    setNewRewardType('');
    setNewRewardQuantity(1);
    
    // Reset new unified reward system
    setRewardTabValue('lootbox');
    setFormData({ rewards: [] });
    
    // Reset component selection
    setQuestComponents([]);
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof questFormSchema>) => {
    // Log the component state before submission to debug the issue
    console.log("Components before submission:", questComponents);
    
    const questData = {
      ...values,
      content: {
        videos: videoUrls,
        images: imageUrls,
        codeBlocks: codeBlocks,
      },
      heroImage: imageUrls.length > 0 ? imageUrls[0] : null, // Set the first uploaded image as hero image
      lootBoxRewards: lootBoxRewards, // Keep legacy format for backward compatibility
      rewards: formData.rewards.length > 0 ? formData.rewards : lootBoxRewards.map(reward => ({
        type: 'lootbox',
        id: reward.type,
        quantity: reward.quantity
      })), // Use new format if available, otherwise convert legacy format
      components: questComponents.map(component => ({
        id: component.id,
        required: component.required,
        quantity: component.quantity
      })),
    };
    
    // Log the final submission data to debug the issue
    console.log("Quest data being submitted:", questData);

    if (editingQuest) {
      updateQuestMutation.mutate({
        id: editingQuest.id,
        data: questData,
      });
    } else {
      createQuestMutation.mutate(questData);
    }
  };

  // Filter and sort quests
  const filteredQuests = quests.filter((quest: Quest) => {
    // Filter by search query
    const matchesSearch = searchQuery 
      ? quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.adventureLine.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter by difficulty
    const matchesDifficulty = filterDifficulty
      ? quest.difficulty === parseInt(filterDifficulty)
      : true;
    
    // Filter by active status
    const matchesTab = currentTab === 'all' 
      ? true 
      : currentTab === 'active' 
        ? quest.active 
        : !quest.active;
    
    return matchesSearch && matchesDifficulty && matchesTab;
  }).sort((a: Quest, b: Quest) => {
    // Sort by selected field
    let comparison = 0;
    
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = a.date.localeCompare(b.date);
        break;
      case 'difficulty':
        comparison = a.difficulty - b.difficulty;
        break;
      case 'adventureLine':
        comparison = a.adventureLine.localeCompare(b.adventureLine);
        break;
      case 'orderInLine':
        comparison = a.orderInLine - b.orderInLine;
        break;
      case 'xpReward':
        comparison = a.xpReward - b.xpReward;
        break;
      default:
        comparison = a.date.localeCompare(b.date);
    }
    
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get unique adventure lines for filter dropdown
  const adventureLines = [...new Set(quests.map((quest: Quest) => quest.adventureLine))];
  
  // Fetch adventure lines from the API for the form dropdown
  const { data: adventureLinesData = [], isLoading: loadingAdventureLines } = useQuery({
    queryKey: ['/api/adventure-lines'],
    // Use the default queryFn
    onSuccess: (data) => {
      console.log("Fetched adventure lines:", data);
    },
    onError: (error) => {
      console.error('Error fetching adventure lines:', error);
    }
  });
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quest Management</h1>
            <p className="text-muted-foreground">
              Create and manage quests for the adventure lines
            </p>
          </div>
          <Dialog open={isAddingQuest || !!editingQuest} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddQuest}>
                <Plus className="mr-2 h-4 w-4" />
                Add Quest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {editingQuest ? 'Edit Quest' : 'Create Quest'}
                </DialogTitle>
                <DialogDescription>
                  {editingQuest 
                    ? 'Update the details of this quest'
                    : 'Create a new quest for players to complete'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 pb-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quest Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter quest title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Flavor Text <span className="text-xs text-muted-foreground">(Italicized story text)</span></FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Add a flavor text or background story (will be displayed in italics)"
                                  className="min-h-[100px]"
                                />
                              </FormControl>
                              <FormDescription>
                                This text creates atmosphere and context for the quest.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="missionBrief"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mission Brief <span className="text-xs text-muted-foreground">(Direct instructions)</span></FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Provide clear instructions for the mission objectives"
                                  className="min-h-[150px]"
                                />
                              </FormControl>
                              <FormDescription>
                                This text contains the specific instructions and requirements for quest completion.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Release Date</FormLabel>
                                <FormControl>
                                  <Input {...field} type="date" />
                                </FormControl>
                                <FormDescription>
                                  When this quest becomes available
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="adventureLine"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adventure Line</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select adventure line" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {loadingAdventureLines ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                      ) : (
                                        adventureLinesData.map((line: any) => (
                                          <SelectItem key={line.id} value={line.id}>
                                            {line.name}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormDescription>
                                  The adventure line this quest belongs to
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="difficulty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Difficulty (1-5)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min={1} 
                                    max={5}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="orderInLine"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order in Line</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min={0}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Position in adventure line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="xpReward"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>XP Reward</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min={1}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="goldReward"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gold Reward</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min={0}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Gold coins awarded for quest completion
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Active Quest</FormLabel>
                                <FormDescription>
                                  When active, this quest will be available to players
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Component Kit Selection */}
                        <FormField
                          control={form.control}
                          name="kitId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required Component Kit</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a component kit (optional)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {!loadingKits && componentKits && Array.isArray(componentKits) && 
                                      componentKits.map((kit: ComponentKit) => (
                                        <SelectItem key={kit.id} value={kit.id}>
                                          {kit.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                The physical component kit required to complete this quest
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Component Kit Details (if selected) */}
                      {form.watch('kitId') && form.watch('kitId') !== 'none' && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/20">
                          <h4 className="font-medium mb-2">Component Kit Details</h4>
                          {!loadingKits && componentKits && Array.isArray(componentKits) && (() => {
                            const selectedKit = componentKits.find((kit: ComponentKit) => kit.id === form.watch('kitId'));
                            if (selectedKit) {
                              // Initialize questComponents state if it's not already set
                              const initialQuestComponents = selectedKit.components?.map(component => ({
                                id: component.id,
                                name: component.name,
                                required: component.isRequired,
                                quantity: component.quantity
                              })) || [];
                              
                              if (!questComponents || questComponents.length === 0) {
                                setQuestComponents(initialQuestComponents);
                              }
                              
                              return (
                                <div>
                                  <p className="mb-2 text-sm">{selectedKit.description}</p>
                                  {selectedKit.components && selectedKit.components.length > 0 ? (
                                    <div>
                                      <h5 className="text-sm font-medium mb-2">Select Required Components:</h5>
                                      <div className="space-y-3">
                                        {questComponents.map((component, index) => (
                                          <div key={component.id} className="flex items-center space-x-3 border p-2 rounded-md">
                                            <div className="flex-1">
                                              <p className="font-medium">{component.name}</p>
                                              <p className="text-xs text-muted-foreground">Quantity: {component.quantity}x</p>
                                            </div>
                                            <Select
                                              value={component.required ? "required" : "optional"}
                                              onValueChange={(value) => {
                                                const updatedComponents = [...questComponents];
                                                updatedComponents[index] = {
                                                  ...updatedComponents[index],
                                                  required: value === "required"
                                                };
                                                setQuestComponents(updatedComponents);
                                              }}
                                            >
                                              <SelectTrigger className="w-32">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="required">Required</SelectItem>
                                                <SelectItem value="optional">Not Used</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No components added to this kit yet.</p>
                                  )}
                                </div>
                              );
                            }
                            return <p className="text-sm text-muted-foreground">Select a component kit</p>;
                          })()}
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <FileImage className="h-5 w-5 mr-2" />
                          <span>Quest Images</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add images for the quest (hero images, diagrams, etc.)
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {/* File Upload Button */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="image-upload" className="text-sm font-medium">
                              Upload Image
                            </label>
                            <div className="flex gap-2">
                              <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="flex-1"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Store the selected file
                                    setSelectedImageFile(file);
                                    
                                    // Reset the file input
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                            </p>
                          </div>
                          
                          {/* Upload button */}
                          {selectedImageFile && (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">
                                  Selected Image: {selectedImageFile.name}
                                </label>
                                <Button 
                                  type="button" 
                                  size="sm"
                                  onClick={handleImageUpload}
                                  disabled={uploadingImage}
                                >
                                  {uploadingImage ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Image
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Image Preview List */}
                        {imageUrls.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">Added Images</h4>
                            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                              {imageUrls.map((url, index) => (
                                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                  <div className="flex items-center">
                                    <div className="h-12 w-12 rounded bg-muted mr-2 overflow-hidden">
                                      <img src={url} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="truncate max-w-[180px]">
                                      <span className="text-xs">{url.split('/').pop() || url}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImageUrl(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <FileVideo className="h-5 w-5 mr-2" />
                          <span>Instructional Videos</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add YouTube or other video links for quest instructions
                        </p>
                        
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Video URL (YouTube, Vimeo, etc.)"
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                          />
                          <Button type="button" onClick={addVideoUrl}>Add</Button>
                        </div>
                        
                        {videoUrls.length > 0 && (
                          <div className="space-y-2">
                            {videoUrls.map((url, index) => (
                              <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                <div className="truncate max-w-[500px]">
                                  <span className="text-sm">{url}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVideoUrl(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Code className="h-5 w-5 mr-2" />
                          <span>Code Blocks</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add code examples or instructions
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex space-x-2 mb-2">
                            <Select
                              value={newCodeLanguage}
                              onValueChange={setNewCodeLanguage}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="css">CSS</SelectItem>
                                <SelectItem value="bash">Bash</SelectItem>
                                <SelectItem value="txt">Plain text</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Textarea
                            placeholder="Enter code here"
                            value={newCodeContent}
                            onChange={(e) => setNewCodeContent(e.target.value)}
                            className="font-mono min-h-[100px]"
                          />
                          
                          <Button type="button" onClick={addCodeBlock}>
                            Add Code Block
                          </Button>
                        </div>
                        
                        {codeBlocks.length > 0 && (
                          <div className="space-y-4 mt-4">
                            {codeBlocks.map((block, index) => (
                              <div key={index} className="rounded-md border overflow-hidden">
                                <div className="flex items-center justify-between bg-muted p-2">
                                  <span className="text-sm font-medium">{block.language}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCodeBlock(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-3 bg-muted/30 font-mono text-sm overflow-x-auto">
                                  <pre className="whitespace-pre-wrap">{block.code}</pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Gift className="h-5 w-5 mr-2" />
                          <span>Quest Rewards</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add rewards for completing the quest (items, equipment, or loot boxes)
                        </p>
                        
                        {/* New reward interface with 3 tabs for different reward types */}
                        <Tabs 
                          value={rewardTabValue} 
                          onValueChange={setRewardTabValue}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="lootbox">
                              <Package className="h-4 w-4 mr-2" />
                              Loot Boxes
                            </TabsTrigger>
                            <TabsTrigger value="item">
                              <Cog className="h-4 w-4 mr-2" />
                              Items
                            </TabsTrigger>
                            <TabsTrigger value="equipment">
                              <Shirt className="h-4 w-4 mr-2" />
                              Equipment
                            </TabsTrigger>
                          </TabsList>
                          
                          {/* Loot Box Rewards Tab */}
                          <TabsContent value="lootbox" className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              {loadingLootBoxes ? (
                                <div className="flex items-center space-x-2 py-2">
                                  <span className="animate-spin">⟳</span>
                                  <span>Loading loot boxes...</span>
                                </div>
                              ) : lootBoxConfigs.length === 0 ? (
                                <div className="text-muted-foreground py-2">
                                  No loot boxes found. You need to create loot boxes in the Admin Loot Boxes section first.
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <Select
                                    value={newRewardType}
                                    onValueChange={setNewRewardType}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Select loot box" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {lootBoxConfigs.map((config: LootBoxConfig) => (
                                        <SelectItem key={config.id} value={config.id}>
                                          {config.name || config.id}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input
                                    type="number"
                                    min={1}
                                    value={newRewardQuantity}
                                    onChange={(e) => setNewRewardQuantity(parseInt(e.target.value) || 1)}
                                    className="w-24"
                                  />
                                  
                                  <Button 
                                    type="button"
                                    disabled={!newRewardType}
                                    onClick={() => {
                                      if (!newRewardType) return;
                                      
                                      // Add lootbox reward
                                      const newReward = {
                                        id: newRewardType,
                                        type: 'lootbox',
                                        quantity: newRewardQuantity
                                      };
                                      
                                      // Use the new quest.rewards format
                                      const updatedRewards = [...(formData.rewards || []), newReward];
                                      setFormData({...formData, rewards: updatedRewards});
                                      
                                      // Reset input fields
                                      setNewRewardQuantity(1);
                                      setNewRewardType('');
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Loot Box
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          {/* Items Rewards Tab */}
                          <TabsContent value="item" className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              {loadingItems ? (
                                <div className="flex items-center space-x-2 py-2">
                                  <span className="animate-spin">⟳</span>
                                  <span>Loading items...</span>
                                </div>
                              ) : items.length === 0 ? (
                                <div className="text-muted-foreground py-2">
                                  No items found. You need to create items in the Admin Items section first.
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <Select
                                    value={newRewardType}
                                    onValueChange={setNewRewardType}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {items
                                        .filter((item: any) => !item.equipSlot) // Exclude equipment items
                                        .map((item: any) => (
                                          <SelectItem key={item.id} value={item.id}>
                                            {item.name || item.id}
                                          </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input
                                    type="number"
                                    min={1}
                                    value={newRewardQuantity}
                                    onChange={(e) => setNewRewardQuantity(parseInt(e.target.value) || 1)}
                                    className="w-24"
                                  />
                                  
                                  <Button 
                                    type="button"
                                    disabled={!newRewardType}
                                    onClick={() => {
                                      if (!newRewardType) return;
                                      
                                      // Add item reward
                                      const newReward = {
                                        id: newRewardType,
                                        type: 'item',
                                        quantity: newRewardQuantity
                                      };
                                      
                                      // Use the new quest.rewards format
                                      const updatedRewards = [...(formData.rewards || []), newReward];
                                      setFormData({...formData, rewards: updatedRewards});
                                      
                                      // Reset input fields
                                      setNewRewardQuantity(1);
                                      setNewRewardType("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          {/* Equipment Rewards Tab */}
                          <TabsContent value="equipment" className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              {loadingItems ? (
                                <div className="flex items-center space-x-2 py-2">
                                  <span className="animate-spin">⟳</span>
                                  <span>Loading equipment...</span>
                                </div>
                              ) : items.filter((item: any) => item.category === 'equipment' || item.equipSlot).length === 0 ? (
                                <div className="text-muted-foreground py-2">
                                  No equipment found. You need to create equipment items in the Admin Items section first.
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <Select
                                    value={newRewardType}
                                    onValueChange={setNewRewardType}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Select equipment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {items
                                        .filter((item: any) => item.category === 'equipment' || item.equipSlot)
                                        .map((item: any) => (
                                          <SelectItem key={item.id} value={item.id}>
                                            {item.name || item.id}
                                          </SelectItem>
                                        ))
                                      }
                                    </SelectContent>
                                  </Select>
                                  
                                  <Input
                                    type="number"
                                    min={1}
                                    value={newRewardQuantity}
                                    onChange={(e) => setNewRewardQuantity(parseInt(e.target.value) || 1)}
                                    className="w-24"
                                  />
                                  
                                  <Button 
                                    type="button"
                                    disabled={!newRewardType}
                                    onClick={() => {
                                      if (!newRewardType) return;
                                      
                                      // Add equipment reward
                                      const newReward = {
                                        id: newRewardType,
                                        type: 'equipment',
                                        quantity: newRewardQuantity
                                      };
                                      
                                      // Use the new quest.rewards format
                                      const updatedRewards = [...(formData.rewards || []), newReward];
                                      setFormData({...formData, rewards: updatedRewards});
                                      
                                      // Reset input fields
                                      setNewRewardQuantity(1);
                                      setNewRewardType("");
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Equipment
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        {/* Display all rewards */}
                        {formData.rewards && formData.rewards.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium">Selected Rewards:</h4>
                            {formData.rewards.map((reward, index) => {
                              // Determine item details based on reward type
                              let displayName = '';
                              let icon = <Sparkles className="h-5 w-5 mr-2 text-amber-500" />;
                              
                              if (reward.type === 'lootbox') {
                                const lootBoxName = lootBoxConfigs.find((config: LootBoxConfig) => config.id === reward.id)?.name ||
                                                   reward.id.charAt(0).toUpperCase() + reward.id.slice(1) + ' Loot Box';
                                displayName = `${reward.quantity}x ${lootBoxName}`;
                                icon = <Sparkles className="h-5 w-5 mr-2 text-amber-500" />;
                              } else if (reward.type === 'item') {
                                const item = items.find((i: any) => i.id === reward.id);
                                displayName = `${reward.quantity}x ${item?.name || reward.id}`;
                                icon = <Package className="h-5 w-5 mr-2 text-blue-500" />;
                              } else if (reward.type === 'equipment') {
                                const equipment = items.find((i: any) => i.id === reward.id);
                                displayName = `${reward.quantity}x ${equipment?.name || reward.id}`;
                                icon = <Shield className="h-5 w-5 mr-2 text-purple-500" />;
                              }
                              
                              return (
                                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                  <div className="flex items-center">
                                    {icon}
                                    <span>{displayName}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      // Remove the reward at this index
                                      const updatedRewards = [...formData.rewards];
                                      updatedRewards.splice(index, 1);
                                      setFormData({...formData, rewards: updatedRewards});
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Legacy loot box rewards display (only if we have them) */}
                        {lootBoxRewards.length > 0 && (
                          <div className="space-y-2 mt-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-amber-500">Legacy Loot Box Rewards:</h4>
                            {lootBoxRewards.map((reward, index) => (
                              <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                <div className="flex items-center">
                                  <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                                  <span>
                                    {reward.quantity}x {
                                      lootBoxConfigs.find((config: LootBoxConfig) => config.id === reward.type)?.name ||
                                      reward.type.charAt(0).toUpperCase() + reward.type.slice(1) + ' Loot Box'
                                    }
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeReward(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createQuestMutation.isPending || updateQuestMutation.isPending}
                    >
                      {editingQuest ? 'Update Quest' : 'Create Quest'}
                      {(createQuestMutation.isPending || updateQuestMutation.isPending) && (
                        <span className="ml-2 animate-spin">⟳</span>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteQuest} onOpenChange={(open) => !open && setDeleteQuest(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the quest "{deleteQuest?.title}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteQuest(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteQuest && deleteQuestMutation.mutate(deleteQuest.id)}
                  disabled={deleteQuestMutation.isPending}
                >
                  Delete
                  {deleteQuestMutation.isPending && (
                    <span className="ml-2 animate-spin">⟳</span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <Tabs 
            defaultValue="all" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Quests</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
                  
                  <Select
                    value={sortField}
                    onValueChange={setSortField}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="adventureLine">Adventure Line</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="orderInLine">Order</SelectItem>
                      <SelectItem value="xpReward">XP Reward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 my-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quests..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={filterDifficulty || 'all'}
                onValueChange={(value) => setFilterDifficulty(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="1">Level 1 (Easiest)</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="5">Level 5 (Hardest)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={adventureLines.length > 0 ? adventureLines[0] : 'all'}
                onValueChange={(value) => value === 'all' ? setSearchQuery('') : setSearchQuery(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by adventure line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Adventure Lines</SelectItem>
                  {adventureLines.map((line) => (
                    <SelectItem key={line} value={line}>{line}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Tabs>
        </div>

        {/* Quests Grid */}
        {loadingQuests ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/30">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No quests found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || filterDifficulty
                ? "Try adjusting your search or filters"
                : "Get started by creating your first quest"
              }
            </p>
            <Button onClick={handleAddQuest} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create New Quest
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuests.map((quest: Quest) => (
              <Card key={quest.id} className={!quest.active ? "opacity-70" : undefined}>
                <CardHeader className="relative pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{quest.title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {quest.adventureLine} • Order: {quest.orderInLine + 1}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditQuest(quest)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteQuest(quest)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex h-6 items-center rounded-full bg-primary/10 px-2 text-xs">
                      {new Date(quest.date).toLocaleDateString()}
                    </span>
                    <span className="flex h-6 items-center rounded-full bg-yellow-500/10 px-2 text-xs">
                      {Array(quest.difficulty).fill('★').join('')}
                    </span>
                    {!quest.active && (
                      <span className="flex h-6 items-center rounded-full bg-destructive/10 px-2 text-xs text-destructive">
                        Inactive
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {quest.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quest.content?.images?.length > 0 && (
                      <span className="flex h-6 items-center rounded-full bg-blue-500/10 px-2 text-xs">
                        <FileImage className="mr-1 h-3 w-3" />
                        {quest.content.images.length} Image{quest.content.images.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {quest.content?.videos?.length > 0 && (
                      <span className="flex h-6 items-center rounded-full bg-red-500/10 px-2 text-xs">
                        <FileVideo className="mr-1 h-3 w-3" />
                        {quest.content.videos.length} Video{quest.content.videos.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {quest.content?.codeBlocks?.length > 0 && (
                      <span className="flex h-6 items-center rounded-full bg-green-500/10 px-2 text-xs">
                        <Code className="mr-1 h-3 w-3" />
                        {quest.content.codeBlocks.length} Code Block{quest.content.codeBlocks.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500 mr-1" />
                    <span>{quest.xpReward} XP</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuest(quest)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteQuest(quest)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQuests;