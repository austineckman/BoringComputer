import { Howl } from 'howler';

// Create base sound configuration with improved lazy loading and error handling
const createSound = (path: string, volume: number = 0.6, loop: boolean = false) => {
  // Instead of loading immediately, return a proxy that loads on first use
  let actualSound: Howl | null = null;
  let loadAttempted = false;
  let loadError = false;
  
  // Create a wrapper object with the same interface as Howl
  const soundProxy = {
    play: function() {
      // If we've already tried to load and got an error, don't try again
      if (loadError) {
        return -1; // Return invalid sound ID
      }
      
      if (!actualSound && !loadAttempted) {
        loadAttempted = true;
        // Lazy-initialize the sound only when first played
        try {
          actualSound = new Howl({
            src: [path],
            volume: volume,
            html5: true, // This helps with mobile devices
            loop: loop, // Enable looping for background music
            onloaderror: function() {
              // Only log errors when actually trying to use the sound
              console.warn(`Could not load sound: ${path}`);
              loadError = true;
            },
            preload: true
          });
        } catch (err) {
          console.warn(`Error initializing sound: ${path}`, err);
          loadError = true;
          return -1; // Return invalid sound ID
        }
      }
      
      // Skip playing if we don't have a sound object
      if (!actualSound) return -1;
      
      try {
        return actualSound.play();
      } catch (err) {
        console.warn(`Error playing sound: ${path}`, err);
        return -1;
      }
    },
    pause: function(id?: number) {
      if (actualSound && !loadError) {
        try {
          actualSound.pause(id);
        } catch (err) {
          console.warn(`Error pausing sound: ${path}`, err);
        }
      }
    },
    stop: function(id?: number) {
      if (actualSound && !loadError) {
        try {
          actualSound.stop(id);
        } catch (err) {
          console.warn(`Error stopping sound: ${path}`, err);
        }
      }
    },
    volume: function(vol?: number) {
      if (loadError) return volume;
      
      try {
        if (actualSound && typeof vol === 'number') {
          return actualSound.volume(vol);
        } else if (actualSound) {
          return actualSound.volume();
        }
      } catch (err) {
        console.warn(`Error setting volume for sound: ${path}`, err);
      }
      
      return volume; // Return the initial volume if not loaded yet or on error
    }
  };
  
  return soundProxy as unknown as Howl; // Cast to Howl type for compatibility
};

// Define all the sound effects we need for the arcade game
export const sounds = {
  // UI sounds
  click: createSound('/sounds/click.mp3', 0.5),
  hover: createSound('/sounds/hover.mp3', 0.06), // Reduced to 20% of original volume (0.3 * 0.2 = 0.06)
  error: createSound('/sounds/error.mp3', 0.6),
  success: createSound('/sounds/success.mp3', 0.6),
  
  // Achievement sounds
  achievement: createSound('/sounds/achievement.mp3', 0.7),
  
  // Quest sounds
  questComplete: createSound('/sounds/quest-complete.mp3', 0.8),
  questAccept: createSound('/sounds/quest-accept.mp3', 0.6),
  questStart: createSound('/sounds/quest-start.mp3', 0.6),
  reward: createSound('/sounds/reward.mp3', 0.7),
  
  // Crafting sounds
  craftSuccess: createSound('/sounds/craft-success.mp3', 0.7),
  craftFail: createSound('/sounds/craft-fail.mp3', 0.6),
  craft: createSound('/sounds/craft-success.mp3', 0.7), // Alias for craft-success
  drop: createSound('/sounds/click.mp3', 0.4), // Using click sound for drop effect
  remove: createSound('/sounds/hover.mp3', 0.3), // Using hover sound for remove effect
  
  // Login sounds
  loginSuccess: createSound('/sounds/login-success.mp3', 0.6),
  loginFail: createSound('/sounds/login-fail.mp3', 0.6),
  
  // Adventure-specific sounds
  spaceDoor: createSound('/sounds/space-door.mp3', 0.7),
  boostEngine: createSound('/sounds/boost-engine.mp3', 0.8),
  powerUp: createSound('/sounds/power-up.mp3', 0.7),
  
  // Level up sounds
  levelUp: createSound('/sounds/level-up.mp3', 0.8),
  fanfare: createSound('/sounds/fanfare.mp3', 0.7),
  
  // Loot box sounds
  open: createSound('/sounds/open.mp3', 0.5),
  
  // Background music - new Fantasy Guild Hall music
  backgroundMusic: createSound('/sounds/fantasy-guild-hall.mp3', 0.3, true),
};

// Export the type with all possible sound names for type checking
export type SoundName = keyof typeof sounds;

// Function to play a sound by name with improved error handling
export function playSound(name: SoundName): number {
  // Default to invalid sound ID
  let soundId = -1;
  
  try {
    const sound = sounds[name];
    if (sound && typeof sound.play === 'function') {
      // Play the actual sound file without any synthetic fallbacks
      soundId = sound.play();
      
      // Check if we got a valid ID back
      if (soundId === -1) {
        console.warn(`Sound "${name}" returned invalid ID`);
      }
    } else {
      console.warn(`Sound "${name}" not found or play is not a function`);
    }
  } catch (error) {
    console.warn(`Error playing sound "${name}":`, error);
  }
  
  return soundId;
}

// Create a mock implementation for tests or environments without audio
// We no longer use mock sounds - all sounds should be loaded from real audio files