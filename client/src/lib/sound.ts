import { Howl } from 'howler';

// Create base sound configuration
const createSound = (path: string, volume: number = 0.6) => {
  // Create a standard Howl object
  const soundObj = new Howl({
    src: [path],
    volume: volume,
    html5: true, // This helps with mobile devices
    onloaderror: function() {
      console.warn(`Could not load sound: ${path}`);
    }
  });
  
  return soundObj;
};

// Define all the sound effects we need for the arcade game
export const sounds = {
  // UI sounds
  click: createSound('/sounds/click.mp3', 0.5),
  hover: createSound('/sounds/hover.mp3', 0.3),
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
};

// Export the type with all possible sound names for type checking
export type SoundName = keyof typeof sounds;

// Function to play a sound by name
export function playSound(name: SoundName): void {
  try {
    const sound = sounds[name];
    if (sound) {
      // Play the actual sound file without any synthetic fallbacks
      sound.play();
    } else {
      console.warn(`Sound "${name}" not found`);
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