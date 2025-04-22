import React from "react";
import PixelButton from "@/components/ui/pixel-button";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useToast } from "@/hooks/use-toast";

interface ResourceRequirement {
  type: string;
  quantity: number;
}

interface CraftingRecipeProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: ResourceRequirement[];
  type: "physical" | "digital";
  onCraft: () => void;
  canCraft: boolean;
}

const CraftingRecipe = ({
  id,
  name,
  description,
  imageUrl,
  requirements,
  type,
  onCraft,
  canCraft
}: CraftingRecipeProps) => {
  const { playSound } = useSoundEffects();
  const { toast } = useToast();

  const handleCraft = () => {
    if (canCraft) {
      playSound("craftSuccess");
      onCraft();
      toast({
        title: "Item Crafted!",
        description: `You've successfully crafted ${name}`,
        variant: "default",
      });
    } else {
      playSound("craftFail");
      toast({
        title: "Cannot Craft Item",
        description: "You don't have enough resources for this recipe",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="crafting-recipe bg-space-dark rounded-lg overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-space-light flex items-center justify-center">
        <img src={imageUrl} alt={name} className="object-cover w-full h-32" />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-xs text-brand-light/70 mb-3">{description}</p>
        
        {/* Resource Requirements */}
        <div className="mb-4">
          <span className="text-xs text-brand-light/60 block mb-2">Required Resources:</span>
          <div className="flex flex-wrap gap-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center bg-space-mid px-2 py-1 rounded">
                <div 
                  className="w-4 h-4 rounded-sm flex items-center justify-center mr-1"
                  style={{ 
                    backgroundColor: 
                      req.type === "cloth" ? "var(--resource-cloth)" :
                      req.type === "metal" ? "var(--resource-metal)" :
                      req.type === "tech-scrap" ? "var(--resource-tech-scrap)" :
                      req.type === "sensor-crystal" ? "var(--resource-sensor-crystal)" :
                      req.type === "circuit-board" ? "var(--resource-circuit-board)" :
                      req.type === "alchemy-ink" ? "var(--resource-alchemy-ink)" :
                      "gray"
                  }}
                >
                  <i className={`fas fa-${
                    req.type === "cloth" ? "scroll" :
                    req.type === "metal" ? "cog" :
                    req.type === "tech-scrap" ? "microchip" :
                    req.type === "sensor-crystal" ? "gem" :
                    req.type === "circuit-board" ? "memory" :
                    req.type === "alchemy-ink" ? "flask" :
                    "question"
                  } text-white text-xs`}></i>
                </div>
                <span className="text-xs">{req.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Craft Button */}
        <PixelButton 
          variant={canCraft ? "secondary" : "disabled"} 
          fullWidth 
          onClick={handleCraft}
          disabled={!canCraft}
        >
          CRAFT ({type === "physical" ? "SHIPS TO YOU" : "DIGITAL UNLOCK"})
        </PixelButton>
      </div>
    </div>
  );
};

export default CraftingRecipe;
