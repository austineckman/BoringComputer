import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useToast } from "@/hooks/use-toast";

interface LootBoxGeneratorProps {
  onLootBoxesCreated?: () => void;
}

export default function LootBoxGenerator({ onLootBoxesCreated }: LootBoxGeneratorProps) {
  const [tier, setTier] = useState("common");
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  
  const playSound = (type: string) => {
    try {
      if (type === "click" && sounds.click) {
        sounds.click();
      } else if (type === "success" && sounds.success) {
        sounds.success();
      } else if (type === "error" && sounds.error) {
        sounds.error();
      }
    } catch (e) {
      console.warn(`Could not play ${type} sound`, e);
    }
  };

  const createLootBoxMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/loot-boxes", {
        type: tier,
        count: quantity,
        source: "admin panel"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Loot Boxes Created",
        description: `${quantity} ${tier} loot box${quantity > 1 ? 'es' : ''} created successfully!`,
      });
      playSound("success");
      if (onLootBoxesCreated) {
        onLootBoxesCreated();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loot boxes",
        variant: "destructive",
      });
      playSound("error");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("click");
    createLootBoxMutation.mutate();
  };

  return (
    <Card className="bg-space-mid border-brand-orange/30">
      <CardHeader>
        <CardTitle>Loot Box Generator</CardTitle>
        <CardDescription>Create test loot boxes for development</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Loot Box Tier</label>
              <Select
                value={tier}
                onValueChange={setTier}
              >
                <SelectTrigger className="bg-space-dark border-brand-orange/30">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent className="bg-space-dark border-brand-orange/30">
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="uncommon">Uncommon</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-brand-light/60 mt-1">
                Higher tiers contain better rewards
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="bg-space-dark border-brand-orange/30"
              />
              <p className="text-xs text-brand-light/60 mt-1">
                Maximum 10 loot boxes per request
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-brand-orange hover:bg-brand-yellow text-space-darkest font-pixel w-full"
            disabled={createLootBoxMutation.isPending}
          >
            {createLootBoxMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Loot Boxes"
            )}
          </Button>
          
          <div className="mt-4 p-3 bg-space-dark rounded-md border border-brand-orange/20">
            <h4 className="text-brand-orange font-pixel text-sm mb-2">Tier Information</h4>
            <ul className="space-y-1.5 text-xs text-brand-light/70">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Common: Basic resources (1-3 items)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Uncommon: Better resources (2-4 items)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Rare: Valuable resources (3-5 items)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Epic: Premium resources (4-7 items)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Legendary: Ultimate rewards (5-8 items)</span>
              </li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}