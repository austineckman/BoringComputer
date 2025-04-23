import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
  ArrowUpDown
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
  lootBoxRewards: {type: string, quantity: number}[];
  active: boolean;
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
  image: string;
}

// Define form validation schema
const questFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "Date must be in YYYY-MM-DD format" 
  }),
  adventureLine: z.enum([
    "30 Days Lost in Space", 
    "Cogsworth City", 
    "Neon Realm", 
    "Nebula Raider", 
    "Pandoras Box"
  ], { 
    required_error: "Adventure line is required",
    invalid_type_error: "Please select a valid adventure line"
  }),
  difficulty: z.coerce.number().min(1).max(5),
  orderInLine: z.coerce.number().min(0),
  xpReward: z.coerce.number().min(1),
  active: z.boolean().default(true),
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCodeLanguage, setNewCodeLanguage] = useState('javascript');
  const [newCodeContent, setNewCodeContent] = useState('');
  
  // Rewards state
  const [lootBoxRewards, setLootBoxRewards] = useState<{type: string, quantity: number}[]>([]);
  const [newRewardType, setNewRewardType] = useState('');
  const [newRewardQuantity, setNewRewardQuantity] = useState(1);
  
  const { toast } = useToast();

  // Fetch quests
  const { data: quests = [], isLoading: loadingQuests } = useQuery({
    queryKey: ['/api/admin/quests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/quests');
      return await response.json() || [];
    }
  });

  // Fetch loot box configurations for rewards
  const { data: lootBoxConfigs = [], isLoading: loadingLootBoxes } = useQuery({
    queryKey: ['/api/admin/loot-box-configs'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/loot-box-configs');
        return await response.json() || [];
      } catch (error) {
        console.error('Error fetching loot box configs:', error);
        return [];
      }
    }
  });

  // Fetch items for content references
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/items');
        return await response.json() || [];
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
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
    onSuccess: () => {
      toast({
        title: 'Quest updated',
        description: 'The quest has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
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
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      adventureLine: '30 Days Lost in Space',
      difficulty: 1,
      orderInLine: 0,
      xpReward: 100,
      active: true,
    },
  });

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

  const addImageUrl = () => {
    if (newImageUrl && newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
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

  // Reward management functions
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

  // Handle opening the dialog for adding a new quest
  const handleAddQuest = () => {
    form.reset({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      adventureLine: '30 Days Lost in Space',
      difficulty: 1,
      orderInLine: 0,
      xpReward: 100,
      active: true,
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
    // Ensure adventureLine is one of our valid options
    let validAdventureLine = quest.adventureLine;
    const validOptions = ["30 Days Lost in Space", "Cogsworth City", "Neon Realm", "Nebula Raider", "Pandoras Box"];
    
    if (!validOptions.includes(validAdventureLine)) {
      validAdventureLine = "30 Days Lost in Space"; // Default if not a valid option
    }
    
    form.reset({
      title: quest.title,
      description: quest.description,
      date: quest.date,
      adventureLine: validAdventureLine as any, // Cast to any to prevent TS error during transition
      difficulty: quest.difficulty,
      orderInLine: quest.orderInLine,
      xpReward: quest.xpReward,
      active: quest.active,
    });
    
    // Load content blocks
    setVideoUrls(quest.content?.videos || []);
    setImageUrls(quest.content?.images || []);
    setCodeBlocks(quest.content?.codeBlocks || []);
    
    // Load rewards
    setLootBoxRewards(quest.lootBoxRewards || []);
    
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
    setNewImageUrl('');
    setNewCodeContent('');
    setNewRewardType('');
    setNewRewardQuantity(1);
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof questFormSchema>) => {
    const questData = {
      ...values,
      content: {
        videos: videoUrls,
        images: imageUrls,
        codeBlocks: codeBlocks,
      },
      lootBoxRewards: lootBoxRewards,
    };

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
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe the quest and its objectives"
                                  className="min-h-[100px]"
                                />
                              </FormControl>
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
                                      <SelectValue placeholder="Select adventure kit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="30 Days Lost in Space">30 Days Lost in Space</SelectItem>
                                      <SelectItem value="Cogsworth City">Cogsworth City</SelectItem>
                                      <SelectItem value="Neon Realm">Neon Realm</SelectItem>
                                      <SelectItem value="Nebula Raider">Nebula Raider</SelectItem>
                                      <SelectItem value="Pandoras Box">Pandoras Box</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormDescription>
                                  The kit or topic this quest belongs to
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
                      </div>
                      
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
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      // Create FormData for upload
                                      const formData = new FormData();
                                      formData.append('image', file);
                                      
                                      // Upload the image
                                      const response = await apiRequest('POST', '/api/admin/upload-image', formData, {
                                        'Content-Type': 'multipart/form-data'
                                      });
                                      
                                      if (response.ok) {
                                        const data = await response.json();
                                        // Add the returned image URL to our list
                                        setImageUrls([...imageUrls, data.url]);
                                        toast({
                                          title: "Image uploaded",
                                          description: "The image has been uploaded successfully.",
                                        });
                                      } else {
                                        throw new Error("Failed to upload image");
                                      }
                                    } catch (error) {
                                      console.error('Error uploading image:', error);
                                      toast({
                                        title: "Upload failed",
                                        description: "There was a problem uploading your image. Please try again.",
                                        variant: "destructive",
                                      });
                                    }
                                    
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
                          
                          {/* URL Input Option */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="image-url" className="text-sm font-medium">
                              Or Add Image URL
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                id="image-url"
                                placeholder="Image URL (https://...)"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                              />
                              <Button 
                                type="button" 
                                onClick={addImageUrl}
                                disabled={!newImageUrl.trim()}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
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
                          Add loot box rewards for completing the quest
                        </p>
                        
                        <div className="flex space-x-2">
                          <Select
                            value={newRewardType}
                            onValueChange={setNewRewardType}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select reward type" />
                            </SelectTrigger>
                            <SelectContent>
                              {lootBoxConfigs.length > 0 ? (
                                lootBoxConfigs.map((config: LootBoxConfig) => (
                                  <SelectItem key={config.id} value={config.id}>
                                    {config.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="common">Common Loot Box</SelectItem>
                                  <SelectItem value="uncommon">Uncommon Loot Box</SelectItem>
                                  <SelectItem value="rare">Rare Loot Box</SelectItem>
                                  <SelectItem value="epic">Epic Loot Box</SelectItem>
                                  <SelectItem value="legendary">Legendary Loot Box</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          
                          <Input
                            type="number"
                            min={1}
                            value={newRewardQuantity}
                            onChange={(e) => setNewRewardQuantity(parseInt(e.target.value))}
                            className="w-24"
                          />
                          
                          <Button type="button" onClick={addReward}>
                            Add Reward
                          </Button>
                        </div>
                        
                        {lootBoxRewards.length > 0 && (
                          <div className="space-y-2 mt-4">
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