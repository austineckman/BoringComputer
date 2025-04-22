import { Howl } from 'howler';

// Define all the sound effects we need for the arcade game
export const sounds = {
  // UI sounds
  click: new Howl({
    src: ['/sounds/click.mp3'],
    volume: 0.5,
  }),
  hover: new Howl({
    src: ['/sounds/hover.mp3'],
    volume: 0.3,
  }),
  error: new Howl({
    src: ['/sounds/error.mp3'],
    volume: 0.6,
  }),
  success: new Howl({
    src: ['/sounds/success.mp3'],
    volume: 0.6,
  }),
  
  // Achievement sounds
  achievement: new Howl({
    src: ['/sounds/achievement.mp3'],
    volume: 0.7,
  }),
  
  // Quest sounds
  questComplete: new Howl({
    src: ['/sounds/quest-complete.mp3'],
    volume: 0.8,
  }),
  questAccept: new Howl({
    src: ['/sounds/quest-accept.mp3'],
    volume: 0.6,
  }),
  questStart: new Howl({
    src: ['/sounds/quest-start.mp3'],
    volume: 0.6,
  }),
  reward: new Howl({
    src: ['/sounds/reward.mp3'],
    volume: 0.7,
  }),
  
  // Crafting sounds
  craftSuccess: new Howl({
    src: ['/sounds/craft-success.mp3'],
    volume: 0.7,
  }),
  craftFail: new Howl({
    src: ['/sounds/craft-fail.mp3'],
    volume: 0.6,
  }),
  
  // Login sounds
  loginSuccess: new Howl({
    src: ['/sounds/login-success.mp3'],
    volume: 0.6,
  }),
  loginFail: new Howl({
    src: ['/sounds/login-fail.mp3'],
    volume: 0.6,
  }),
  
  // Adventure-specific sounds
  spaceDoor: new Howl({
    src: ['/sounds/space-door.mp3'],
    volume: 0.7,
  }),
  boostEngine: new Howl({
    src: ['/sounds/boost-engine.mp3'],
    volume: 0.8,
  }),
  powerUp: new Howl({
    src: ['/sounds/power-up.mp3'],
    volume: 0.7,
  }),
  
  // Level up sounds
  levelUp: new Howl({
    src: ['/sounds/level-up.mp3'],
    volume: 0.8,
  }),
  fanfare: new Howl({
    src: ['/sounds/fanfare.mp3'],
    volume: 0.7,
  }),
};

// Export the type with all possible sound names for type checking
export type SoundName = keyof typeof sounds;

// Function to play a sound by name
export function playSound(name: SoundName): void {
  const sound = sounds[name];
  if (sound) {
    // Handle missing sound files gracefully
    sound.once('loaderror', () => {
      console.warn(`Sound file for "${name}" could not be loaded`);
    });
    
    // Play the sound
    sound.play();
  } else {
    console.warn(`Sound "${name}" not found`);
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