import { Howl } from 'howler';

// Create base sound configuration
const createSound = (path: string, volume: number = 0.6, loop: boolean = false) => {
  // Create a standard Howl object
  const soundObj = new Howl({
    src: [path],
    volume: volume,
    html5: true, // This helps with mobile devices
    loop: loop, // Enable looping for background music
    onloaderror: function() {
      console.warn(`Could not load sound: ${path}`);
    },
    preload: path.includes('pixel-dreams') ? false : true // Only preload smaller sounds, not bg music
  });
  
  return soundObj;
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
const mockSounds = Object.keys(sounds).reduce((acc, name) => {
  acc[name as SoundName] = {
    play: () => console.log(`[Mock] Playing sound: ${name}`),
    stop: () => console.log(`[Mock] Stopping sound: ${name}`),
  };
  return acc;
}, {} as Record<SoundName, { play: () => void; stop: () => void }>);

// Export the mock implementation
export const mockSound = {
  play: (name: SoundName): void => {
    mockSounds[name].play();
  },
  stop: (name: SoundName): void => {
    mockSounds[name].stop();
  },
};