import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { themeConfig } from "@/lib/themeConfig";
import LootBoxGenerator from "@/components/admin/LootBoxGenerator";

// Form schema for creating a quest
const createQuestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" }),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  kitRequired: z.string().min(2, { message: "Kit information is required" }),
  difficulty: z.number().min(1).max(5),
  adventureKit: z.string(),
  rewards: z.array(
    z.object({
      type: z.string(),
      quantity: z.number().min(1)
    })
  ).min(1, { message: "At least one reward is required" })
});

type CreateQuestFormValues = z.infer<typeof createQuestSchema>;

const Admin = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const [activeRewardType, setActiveRewardType] = useState("cloth");
  const [activeRewardQuantity, setActiveRewardQuantity] = useState(1);
  
  const playSound = (type: string) => {
    try {
      if (type === "click" && sounds.click) {
        sounds.click();
      } else if (type === "error" && sounds.error) {
        sounds.error();
      } else if (type === "complete" && sounds.success) {
        sounds.success();
      }
    } catch (e) {
      console.warn(`Could not play ${type} sound`, e);
    }
  };
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes("admin");
  
  const form = useForm<CreateQuestFormValues>({
    resolver: zodResolver(createQuestSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      title: "",
      description: "",
      kitRequired: "",
      difficulty: 1,
      adventureKit: "lost-in-space",
      rewards: []
    }
  });
  
  const createQuestMutation = useMutation({
    mutationFn: async (data: CreateQuestFormValues) => {
      const response = await apiRequest("POST", "/api/admin/quests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      toast({
        title: "Quest Created",
        description: "The quest has been successfully created",
      });
      playSound("complete");
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create quest",
        variant: "destructive",
      });
      playSound("error");
    }
  });
  
  function onSubmit(data: CreateQuestFormValues) {
    if (data.rewards.length === 0) {
      toast({
        title: "Error",
        description: "At least one reward is required",
        variant: "destructive",
      });
      return;
    }
    
    createQuestMutation.mutate(data);
  }
  
  const addReward = () => {
    const currentRewards = form.getValues("rewards") || [];
    form.setValue("rewards", [
      ...currentRewards,
      { type: activeRewardType, quantity: activeRewardQuantity }
    ]);
    
    toast({
      title: "Reward Added",
      description: `Added ${activeRewardQuantity}x ${activeRewardType}`,
    });
    playSound("click");
  };
  
  const removeReward = (index: number) => {
    const currentRewards = form.getValues("rewards") || [];
    form.setValue("rewards", currentRewards.filter((_, i) => i !== index));
    
    toast({
      title: "Reward Removed",
      description: "The reward has been removed from the quest",
    });
    playSound("click");
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <div>
      <section className="mb-12">
        <div className="bg-space-mid rounded-lg p-6 pixel-border relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl md:text-2xl text-brand-orange mb-2">ADMIN PANEL</h1>
              <p className="text-brand-light/80 mb-4">Manage quests, craftables, and user progress</p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-brand-orange/10 blur-3xl"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-brand-yellow/10 blur-3xl"></div>
        </div>
      </section>
      
      <section>
        <Tabs defaultValue="quests" className="w-full">
          <TabsList className="bg-space-dark mb-6">
            <TabsTrigger 
              value="quests" 
              className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
              onClick={() => playSound("click")}
            >
              Quests
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
              onClick={() => playSound("click")}
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="craftables" 
              className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
              onClick={() => playSound("click")}
            >
              Craftables
            </TabsTrigger>
            <TabsTrigger 
              value="lootboxes" 
              className="data-[state=active]:bg-brand-orange/20 data-[state=active]:text-brand-orange"
              onClick={() => playSound("click")}
            >
              Loot Boxes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quests" className="space-y-4">
            <Card className="bg-space-mid border-brand-orange/30">
              <CardHeader>
                <CardTitle>Create New Quest</CardTitle>
                <CardDescription>Add a new quest to the adventure system</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quest Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter quest title" 
                                {...field} 
                                className="bg-space-dark border-brand-orange/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quest Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                className="bg-space-dark border-brand-orange/30"
                              />
                            </FormControl>
                            <FormDescription>
                              Format: YYYY-MM-DD
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="kitRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required Kit</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="E.g. HERO Board + LED" 
                                {...field} 
                                className="bg-space-dark border-brand-orange/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty (1-5)</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value.toString()}
                              >
                                <SelectTrigger className="bg-space-dark border-brand-orange/30">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent className="bg-space-dark border-brand-orange/30">
                                  <SelectItem value="1">1 - Very Easy</SelectItem>
                                  <SelectItem value="2">2 - Easy</SelectItem>
                                  <SelectItem value="3">3 - Medium</SelectItem>
                                  <SelectItem value="4">4 - Hard</SelectItem>
                                  <SelectItem value="5">5 - Very Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="adventureKit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adventure Kit</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="bg-space-dark border-brand-orange/30">
                                  <SelectValue placeholder="Select adventure kit" />
                                </SelectTrigger>
                                <SelectContent className="bg-space-dark border-brand-orange/30">
                                  {themeConfig.adventureKits.map((kit) => (
                                    <SelectItem key={kit.id} value={kit.id}>{kit.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quest Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter quest description" 
                                  {...field} 
                                  className="bg-space-dark border-brand-orange/30 min-h-[100px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormLabel>Quest Rewards</FormLabel>
                        <div className="bg-space-dark border border-brand-orange/30 rounded-md p-4 mb-4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {form.watch("rewards")?.map((reward, index) => (
                              <div 
                                key={index} 
                                className="flex items-center bg-space-mid px-3 py-1 rounded-full"
                              >
                                <span>
                                  {reward.quantity}x {reward.type.replace('-', ' ')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeReward(index)}
                                  className="ml-2 text-red-400 hover:text-red-300"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ))}
                            
                            {!form.watch("rewards")?.length && (
                              <div className="text-brand-light/50 text-sm">No rewards added yet</div>
                            )}
                          </div>
                          
                          <div className="flex gap-3">
                            <Select 
                              onValueChange={setActiveRewardType} 
                              defaultValue={activeRewardType}
                            >
                              <SelectTrigger className="bg-space-mid border-brand-orange/30 w-[180px]">
                                <SelectValue placeholder="Resource type" />
                              </SelectTrigger>
                              <SelectContent className="bg-space-dark border-brand-orange/30">
                                {themeConfig.resourceTypes.map((resource) => (
                                  <SelectItem key={resource.id} value={resource.id}>
                                    {resource.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              onValueChange={(value) => setActiveRewardQuantity(parseInt(value))} 
                              defaultValue={activeRewardQuantity.toString()}
                            >
                              <SelectTrigger className="bg-space-mid border-brand-orange/30 w-[100px]">
                                <SelectValue placeholder="Quantity" />
                              </SelectTrigger>
                              <SelectContent className="bg-space-dark border-brand-orange/30">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}x
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              type="button" 
                              onClick={addReward}
                              className="bg-brand-orange hover:bg-brand-yellow text-space-darkest"
                            >
                              Add Reward
                            </Button>
                          </div>
                        </div>
                        <FormMessage />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-brand-orange hover:bg-brand-yellow text-space-darkest font-bold pixel-button"
                      disabled={createQuestMutation.isPending}
                    >
                      {createQuestMutation.isPending ? "Creating..." : "Create Quest"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-space-mid border-brand-orange/30">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-brand-light/70">User management features will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="craftables" className="space-y-4">
            <Card className="bg-space-mid border-brand-orange/30">
              <CardHeader>
                <CardTitle>Craftable Items</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-brand-light/70">Craftable item management will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Admin;
