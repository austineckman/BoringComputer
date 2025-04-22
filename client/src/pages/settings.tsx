import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX, Edit, Save, User, Gift, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sounds } from "@/lib/sound";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });
  
  // Load user data when available
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

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
    if (!isMuted && sounds.click) {
      sounds.click.play();
    }
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
    if (newVolume > 0 && !isMuted && sounds.click) {
      sounds.click.play();
    }
  };
  
  const handleUpdateProfile = () => {
    if (sounds.success) sounds.success.play();
    // In a real app, we'd send an API request here
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
      duration: 3000,
    });
    setEditingProfile(false);
  };

  const handleConnectDiscord = () => {
    if (sounds.questStart) sounds.questStart.play();
    
    // In a real application, this would redirect to Discord OAuth
    // For demo purposes, we'll simulate the connection with a toast message
    setTimeout(() => {
      if (sounds.reward) sounds.reward.play();
      toast({
        title: "Discord Connected!",
        description: "Your Discord account has been connected and a Rare Loot Box has been added to your inventory!",
        duration: 5000,
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-orange">Settings</h1>
      
      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card className="bg-space-darkest border-brand-orange/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-brand-orange">User Profile</CardTitle>
                <CardDescription className="text-brand-light/70">
                  Manage your account information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-brand-orange/50 text-brand-orange hover:bg-brand-orange/10 hover:text-brand-yellow"
                onClick={() => setEditingProfile(!editingProfile)}
                onMouseEnter={() => sounds.hover?.play()}
              >
                {editingProfile ? (
                  <><Save className="mr-2 h-4 w-4" /> Save</>
                ) : (
                  <><Edit className="mr-2 h-4 w-4" /> Edit</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.username} />
                  ) : (
                    <AvatarFallback className="bg-space-mid text-brand-orange text-xl">
                      {user?.username?.slice(0, 2)?.toUpperCase() || <User />}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg">{user?.username}</h3>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="bg-space-mid border-brand-orange text-brand-orange">
                      Level {user?.level || 1}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      disabled={!editingProfile}
                      className="bg-space-dark border-brand-orange/30 text-white font-medium placeholder:text-gray-500 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!editingProfile}
                      className="bg-space-dark border-brand-orange/30 text-white font-medium placeholder:text-gray-500 mt-1"
                    />
                  </div>
                  
                  {editingProfile && (
                    <div className="pt-4">
                      <Button 
                        onClick={handleUpdateProfile}
                        onMouseEnter={() => sounds.hover?.play()}
                      >
                        <Save className="mr-2 h-4 w-4" /> Save Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Discord Connection Card */}
        <Card className="bg-space-darkest border-brand-orange/30">
          <CardHeader>
            <CardTitle className="text-brand-orange">Connect Accounts</CardTitle>
            <CardDescription className="text-brand-light/70">
              Link your external accounts to enhance your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-space-dark rounded-lg border border-brand-orange/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#5865F2] rounded-full">
                    <svg viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid" className="h-8 w-8 text-white">
                      <g>
                        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#ffffff" fillRule="nonzero"></path>
                      </g>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Discord</h3>
                    <p className="text-sm text-muted-foreground">Connect your Discord account to receive a Rare Loot Box</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  {/* Mock check for connected Discord - in a real app we'd check user?.discordId */}
                  {false ? (
                    <>
                      <Badge className="bg-green-600 hover:bg-green-700">Connected</Badge>
                      <Button variant="outline" size="sm" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" /> Already Connected
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                      size="lg"
                      onMouseEnter={() => sounds.hover?.play()}
                      onClick={handleConnectDiscord}
                    >
                      <Gift className="mr-2 h-5 w-5" /> Connect & Get Loot
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sound Settings Card */}
        <Card className="bg-space-darkest border-brand-orange/30">
          <CardHeader>
            <CardTitle className="text-brand-orange">Sound Settings</CardTitle>
            <CardDescription className="text-brand-light/70">
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
                  onMouseEnter={() => sounds.hover?.play()}
                  onClick={() => {
                    sounds.success?.play();
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
                  onMouseEnter={() => sounds.hover?.play()}
                  onClick={() => {
                    sounds.error?.play();
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
        
        {/* Display Settings Card */}
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