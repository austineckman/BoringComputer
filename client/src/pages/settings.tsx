import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sounds, playSound } from "@/lib/sound";

export default function SettingsPage() {
  const { toast } = useToast();
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  
  // Load volume settings from localStorage on component mount
  useEffect(() => {
    const savedVolume = localStorage.getItem("sound-volume");
    const savedMuted = localStorage.getItem("sound-muted");
    
    if (savedVolume !== null) {
      setVolume(parseInt(savedVolume));
    }
    
    if (savedMuted !== null) {
      setIsMuted(savedMuted === "true");
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("sound-volume", volume.toString());
    localStorage.setItem("sound-muted", isMuted.toString());
    
    // Update global sound settings by adjusting volume on all sounds
    Object.values(sounds).forEach(sound => {
      if (sound && typeof sound.volume === 'function') {
        sound.volume(isMuted ? 0 : volume / 100);
      }
    });
  }, [volume, isMuted]);
  
  const handleToggleMute = () => {
    if (!isMuted) playSound('click');
    setIsMuted(!isMuted);
    
    toast({
      title: !isMuted ? "Sound muted" : "Sound unmuted",
      description: !isMuted ? "All game sounds are now muted" : "Game sounds have been restored",
      duration: 2000,
    });
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0];
    setVolume(newVolume);
    
    // If volume is set to 0, mute the sound
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    } 
    // If volume is changed from 0 to a value and the sound is muted, unmute it
    else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    
    // Play a sound when adjusting volume
    if (newVolume > 0 && !isMuted) {
      playSound('click');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sound Settings</CardTitle>
            <CardDescription>
              Adjust the volume of game sounds and sound effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="mute-toggle">Mute All Sounds</Label>
                  <Switch 
                    id="mute-toggle" 
                    checked={isMuted}
                    onCheckedChange={handleToggleMute}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle all game sound effects on or off
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Sound Volume</Label>
                  <div 
                    className="h-8 w-8 flex items-center justify-center"
                    onMouseEnter={() => setShowVolumeTooltip(true)}
                    onMouseLeave={() => setShowVolumeTooltip(false)}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                    {showVolumeTooltip && (
                      <div className="absolute bg-background border border-border px-2 py-1 rounded text-xs -mt-8">
                        {volume}%
                      </div>
                    )}
                  </div>
                </div>
                <Slider
                  defaultValue={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  disabled={isMuted}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  className="mr-2"
                  onMouseEnter={() => sounds.hover?.()}
                  onClick={() => {
                    sounds.confirm?.();
                    toast({
                      title: "Settings saved",
                      description: "Your settings have been applied",
                      duration: 3000,
                    });
                  }}
                >
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onMouseEnter={() => sounds.hover?.()}
                  onClick={() => {
                    sounds.error?.();
                    setVolume(50);
                    setIsMuted(false);
                    toast({
                      title: "Settings reset",
                      description: "Sound settings have been reset to defaults",
                      duration: 3000,
                    });
                  }}
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Adjust visual preferences for the game interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pixel-toggle" className="block mb-1">Pixel Art Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enhance pixel art edges for a classic arcade look
                  </p>
                </div>
                <Switch id="pixel-toggle" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}