import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface LootBoxGeneratorProps {
  onLootBoxesCreated?: () => void;
}

export default function LootBoxGenerator({ onLootBoxesCreated }: LootBoxGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [type, setType] = useState("common");
  const [count, setCount] = useState(1);
  const { toast } = useToast();
  const { sounds } = useSoundEffects();

  const handleGenerateLootBoxes = async () => {
    setIsGenerating(true);
    try {
      try {
        sounds.click?.();
      } catch (e) {
        console.warn('Could not play sound', e);
      }

      const res = await apiRequest("POST", "/api/admin/loot-boxes", {
        type,
        count,
        source: "Admin Test"
      });

      const data = await res.json();
      
      toast({
        title: "Success!",
        description: `Created ${count} ${type} loot box(es)`,
      });

      if (onLootBoxesCreated) {
        onLootBoxesCreated();
      }
    } catch (error) {
      console.error("Error generating loot boxes:", error);
      toast({
        title: "Error",
        description: "Failed to generate loot boxes",
        variant: "destructive",
      });

      try {
        sounds.error?.();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-brand-orange">Generate Test Loot Boxes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lootbox-type">Loot Box Type</Label>
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger id="lootbox-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="lootbox-count">Count: {count}</Label>
            </div>
            <Slider
              id="lootbox-count"
              min={1}
              max={10}
              step={1}
              value={[count]}
              onValueChange={(values) => setCount(values[0])}
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleGenerateLootBoxes} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Loot Boxes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}