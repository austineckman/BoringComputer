import { Howl } from 'howler';

// Create base sound configuration with lazy loading
const createSound = (path: string, volume: number = 0.6, loop: boolean = false) => {
  // Instead of loading immediately, return a proxy that loads on first use
  let actualSound: Howl | null = null;
  
  // Create a wrapper object with the same interface as Howl
  const soundProxy = {
    play: function() {
      if (!actualSound) {
        // Lazy-initialize the sound only when first played
        actualSound = new Howl({
          src: [path],
          volume: volume,
          html5: true, // This helps with mobile devices
          loop: loop, // Enable looping for background music
          onloaderror: function() {
            // Only log errors when actually trying to use the sound
            console.warn(`Could not load sound: ${path}`);
          },
          preload: true
        });
      }
      return actualSound.play();
    },
    pause: function(id?: number) {
      if (actualSound) actualSound.pause(id);
    },
    stop: function(id?: number) {
      if (actualSound) actualSound.stop(id);
    },
    volume: function(vol?: number) {
      if (actualSound && typeof vol === 'number') {
        return actualSound.volume(vol);
      } else if (actualSound) {
        return actualSound.volume();
      }
      return volume; // Return the initial volume if not loaded yet
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

// Function to play a sound by name
export function playSound(name: SoundName): void {
  try {
    const sound = sounds[name];
    if (sound && typeof sound.play === 'function') {
      // Play the actual sound file without any synthetic fallbacks
      sound.play();
    } else {
      console.warn(`Sound "${name}" not found or play is not a function`);
    }
  } catch (error) {
    console.warn(`Error playing sound "${name}":`, error);
  }
}

// Create a mock implementation for tests or environments without audio
// We no longer use mock sounds - all sounds should be loaded from real audio files