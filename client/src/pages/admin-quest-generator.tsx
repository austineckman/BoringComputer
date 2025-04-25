import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Wand2, Check, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PixelLoader from '@/components/ui/pixel-loader';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Form schema
const formSchema = z.object({
  kitId: z.string().min(1, 'Please select a kit'),
  theme: z.string().optional(),
  missionKeywords: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(2),
  includeImage: z.boolean().default(true),
  imagePrompt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminQuestGenerator = () => {
  const { toast } = useToast();
  const [generatedQuest, setGeneratedQuest] = useState<{
    title: string;
    description: string;  // This is the flavor text/storytelling (lore)
    missionBrief: string; // This is the clear classroom assignment
    components: string[];
    xpReward: number;
    lootSuggestion: string;
    kitId: string;
    imageUrl: string;
    adventureLine: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Fetch all kits
  const { data: kits, isLoading: kitsLoading } = useQuery({ 
    queryKey: ['/api/admin/kits'],
  });
  
  // Fetch adventure lines
  const { data: adventureLines, isLoading: adventureLinesLoading } = useQuery({
    queryKey: ['/api/adventure-lines'],
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: 2,
      includeImage: true,
    },
  });
  
  // Generate quest mutation
  const generateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/admin/generate-quest', data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Generated quest data:", data);
      // Specifically log the mission brief to see if it's being received
      console.log("Mission brief from API:", data.missionBrief);
      setGeneratedQuest(data);
      toast({
        title: 'Quest Generated',
        description: 'Your quest has been successfully generated!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate quest',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Save quest mutation
  const saveMutation = useMutation({
    mutationFn: async (quest: any) => {
      const response = await apiRequest('POST', '/api/admin/quests', quest);
      return response.json();
    },
    onSuccess: () => {
      setSaving(false);
      toast({
        title: 'Quest Saved',
        description: 'Your quest has been successfully saved!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
    onError: (error: Error) => {
      setSaving(false);
      toast({
        title: 'Failed to save quest',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    generateMutation.mutate(values);
  };
  
  const handleSaveQuest = () => {
    if (!generatedQuest) return;
    
    setSaving(true);
    
    // Parse lootSuggestion string into an array of reward objects
    // Format is typically "item-id x3, other-item x1"
    const rewards = generatedQuest.lootSuggestion.split(',').map(item => {
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
    
    // Create the quest object in the format expected by the API
    const questToSave = {
      title: generatedQuest.title,
      description: generatedQuest.description,
      missionBrief: generatedQuest.missionBrief,
      adventureLine: generatedQuest.adventureLine || "Adventure",
      kitId: form.getValues('kitId'),
      xpReward: generatedQuest.xpReward,
      rewards: rewards,
      
      // Add additional required fields
      date: new Date().toISOString().split('T')[0],
      difficulty: form.getValues('difficulty') || 2,
      orderInLine: 0, // Default position in adventure line
      
      // Map components to the format expected
      components: generatedQuest.components.map(name => ({
        id: 0, // We'll need to update this to use real component IDs
        required: true,
        quantity: 1
      })),
      
      // Add content object with images
      content: {
        images: generatedQuest.imageUrl ? [generatedQuest.imageUrl] : [],
        videos: [] as string[],  // Explicit type definition to avoid undefined[]
        codeBlocks: [] as Array<{language: string, code: string}>  // Empty array with explicit type
      }
    };
    
    console.log("Saving quest:", questToSave);
    saveMutation.mutate(questToSave);
  };
  
  const handleDiscard = () => {
    setGeneratedQuest(null);
  };
  
  return (
    <AdminLayout>
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Wand2 className="h-7 w-7 text-indigo-500" />
          AI Quest Generator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generate New Quest</CardTitle>
              <CardDescription>
                Use AI to generate pixel-perfect quests for your adventure lines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="kitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Component Kit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={generateMutation.isPending || kitsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a kit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kits?.map((kit: any) => (
                              <SelectItem key={kit.id} value={kit.id}>
                                {kit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the component kit this quest will use.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Space Exploration, Circuit City"
                            {...field}
                            disabled={generateMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Suggest a theme for your quest (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="missionKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Keywords</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., problem-solving, coding, circuits"
                            {...field}
                            disabled={generateMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Add keywords to shape your mission (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            disabled={generateMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription className="flex justify-between text-xs">
                          <span>Beginner</span>
                          <span>Advanced</span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeImage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Generate Pixel Art Image</FormLabel>
                          <FormDescription>
                            Create a custom pixel art image for your quest.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={generateMutation.isPending}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("includeImage") && (
                    <FormField
                      control={form.control}
                      name="imagePrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Style Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., pixel art space station, 16-bit aesthetic, no text, vibrant colors"
                              {...field}
                              disabled={generateMutation.isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Customize your image style (optional). <strong>Important:</strong> Add "no text" to prevent text in your image.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <>Generating Quest <PixelLoader size={4} /></>
                    ) : (
                      <>Generate Quest with AI</>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Results Section */}
          <div>
            {generateMutation.isPending ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <PixelLoader 
                      message="Generating your quest with AI..." 
                      color="#6366f1"
                      size={10}
                    />
                    <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                      Our AI is crafting a perfect pixel adventure for your students, 
                      complete with learning objectives, components, and rewards.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : generatedQuest ? (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                  <CardTitle className="text-xl">{generatedQuest.title}</CardTitle>
                  <CardDescription>
                    Adventure Line: {generatedQuest.adventureLine || "Not specified"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                  {generatedQuest.imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <div className="border rounded-lg overflow-hidden shadow-md">
                        <img 
                          src={generatedQuest.imageUrl} 
                          alt="Quest illustration" 
                          className="h-48 w-full object-cover"
                          style={{
                            imageRendering: 'pixelated',
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Story/Lore</h3>
                      <p className="mt-1 italic text-muted-foreground">{generatedQuest.description}</p>
                    </div>
                    
                    <div className="p-4 border border-green-300 rounded-md bg-green-50">
                      <h3 className="font-bold text-sm uppercase tracking-wide text-green-700">Mission Brief</h3>
                      <p className="mt-1 font-medium text-green-800">
                        {generatedQuest.missionBrief || "No mission brief available."}
                      </p>
                      <div className="mt-2 text-xs text-green-600">
                        Debug: mission_brief_length={generatedQuest.missionBrief ? generatedQuest.missionBrief.length : 0}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Required Components</h3>
                      <ul className="mt-1 space-y-1">
                        {generatedQuest.components.map((component: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {component}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">XP Reward</h3>
                        <p className="mt-1">{generatedQuest.xpReward} XP</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Loot Reward</h3>
                        <p className="mt-1">{generatedQuest.lootSuggestion}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDiscard}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-1" /> Discard
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSaveQuest}
                    disabled={saving}
                  >
                    {saving ? (
                      <>Saving <PixelLoader size={3} /></>
                    ) : (
                      <><Save className="h-4 w-4 mr-1" /> Save Quest</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <Wand2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Quest Generated Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Fill out the form and click "Generate Quest with AI" to create 
                      an engaging STEM quest powered by artificial intelligence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQuestGenerator;