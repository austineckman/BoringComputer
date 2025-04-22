import { Howl } from 'howler';

// Create base sound configuration
const createSound = (path: string, volume: number = 0.6) => {
  return new Howl({
    src: [path],
    volume: volume,
    html5: true, // This helps with mobile devices
    // Always provide fallback for missing sounds
    onloaderror: function() {
      console.warn(`Could not load sound: ${path}`);
    }
  });
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

// Create a simple beep sound using Web Audio API
function createBeepSound(frequency = 440, duration = 200, volume = 0.2, type = 'sine'): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type as OscillatorType;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    oscillator.start();
    
    // Stop the sound after duration
    setTimeout(() => {
      oscillator.stop();
      // Close the audio context to free up resources
      setTimeout(() => {
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      }, 100);
    }, duration);
  } catch (error) {
    console.warn('Failed to create fallback beep sound:', error);
  }
}

// Fallback sounds for different types of audio feedback
function playFallbackSound(type: string): void {
  switch(type) {
    case 'click':
      createBeepSound(800, 50, 0.1);
      break;
    case 'error':
      createBeepSound(200, 300, 0.2, 'sawtooth');
      break;
    case 'success':
    case 'loginSuccess':
    case 'craftSuccess':
      createBeepSound(880, 100, 0.1);
      setTimeout(() => createBeepSound(1320, 100, 0.1), 100);
      break;
    case 'achievement':
    case 'levelUp':
    case 'questComplete':
      createBeepSound(523.25, 100, 0.1); // C5
      setTimeout(() => createBeepSound(659.25, 100, 0.1), 100); // E5
      setTimeout(() => createBeepSound(783.99, 200, 0.1), 200); // G5
      break;
    default:
      createBeepSound(440, 100, 0.1);
  }
}

// Function to play a sound by name
export function playSound(name: SoundName): void {
  const sound = sounds[name];
  if (sound) {
    // Check if the sound has been loaded successfully
    if (sound.state() === 'loaded') {
      // Play the sound
      const soundId = sound.play();
      
      // Check if sound is actually playing
      if (soundId === undefined) {
        console.warn(`Sound "${name}" failed to play, using fallback`);
        playFallbackSound(name);
      } else {
        console.log(`Playing sound: ${name}`);
      }
    } else {
      // Sound is still loading or failed to load, use fallback
      sound.once('loaderror', () => {
        console.warn(`Sound file for "${name}" could not be loaded, using fallback`);
        playFallbackSound(name);
      });
      
      // Try to play anyway (will work if the sound loads in time)
      const soundId = sound.play();
      if (soundId === undefined) {
        console.warn(`Sound "${name}" couldn't be played immediately, using fallback`);
        playFallbackSound(name);
      }
    }
  } else {
    console.warn(`Sound "${name}" not found, using fallback`);
    playFallbackSound(name);
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