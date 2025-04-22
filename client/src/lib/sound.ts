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

// Sci-fi and fantasy sound effects using Web Audio API
class SoundEffects {
  // Base AudioContext
  private static audioCtx: AudioContext | null = null;
  
  // Get or create AudioContext
  private static getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }
  
  // Close context to free resources
  private static closeContext() {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      setTimeout(() => {
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
          this.audioCtx.close();
          this.audioCtx = null;
        }
      }, 500); // Close after 500ms to allow sounds to finish
    }
  }
  
  // Simple beep/tone
  static createTone(frequency: number, duration: number, volume = 0.2, type: OscillatorType = 'sine'): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;
      
      oscillator.start();
      
      // Stop the sound after duration
      setTimeout(() => {
        oscillator.stop();
      }, duration);
    } catch (error) {
      console.warn('Failed to create tone:', error);
    }
  }
  
  // Laser sound effect
  static laserSound(baseFreq = 880, duration = 200, volume = 0.2): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, ctx.currentTime + duration/1000);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration/1000);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch (error) {
      console.warn('Failed to create laser sound:', error);
    }
  }
  
  // Electronic beep sequence
  static beepSequence(frequencies: number[], durations: number[], volume = 0.2): void {
    let currentTime = 0;
    for (let i = 0; i < frequencies.length; i++) {
      setTimeout(() => {
        this.createTone(frequencies[i], durations[i], volume);
      }, currentTime);
      currentTime += durations[i];
    }
  }
  
  // Teleport sound
  static teleportSound(volume = 0.2): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 10;
      
      oscillator.type = 'sine';
      
      // Create teleport sweep effect
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 400);
    } catch (error) {
      console.warn('Failed to create teleport sound:', error);
    }
  }
  
  // Power-up sound effect
  static powerUpSound(volume = 0.15): void {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    const durations = [50, 50, 50, 100, 150];
    this.beepSequence(notes, durations, volume);
  }
  
  // Magic spell sound
  static magicSound(volume = 0.15): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      
      oscillator.start();
      
      setTimeout(() => {
        // Add sparkle effect after the main sound
        this.beepSequence([1500, 1800, 1600, 2000], [50, 60, 40, 100], volume * 0.5);
        oscillator.stop();
      }, 1200);
    } catch (error) {
      console.warn('Failed to create magic sound:', error);
    }
  }
  
  // Error/warning sound
  static errorSound(volume = 0.15): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      
      oscillator.start();
      
      // Create pulsing effect
      setTimeout(() => oscillator.frequency.setValueAtTime(180, ctx.currentTime + 0.2), 200);
      setTimeout(() => oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.4), 400);
      setTimeout(() => oscillator.stop(), 600);
    } catch (error) {
      console.warn('Failed to create error sound:', error);
    }
  }
  
  // Mechanical click sound
  static clickSound(volume = 0.1): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 50);
    } catch (error) {
      console.warn('Failed to create click sound:', error);
    }
  }
  
  // Hover sound effect
  static hoverSound(volume = 0.05): void {
    this.createTone(500, 30, volume, 'sine');
  }
  
  // Door/portal opening sound
  static doorSound(volume = 0.15): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 700);
    } catch (error) {
      console.warn('Failed to create door sound:', error);
    }
  }
  
  // Quest acceptance sound
  static questSound(volume = 0.15): void {
    const notes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
    const durations = [100, 100, 100, 300];
    this.beepSequence(notes, durations, volume);
  }
  
  // Achievement/reward fanfare
  static achievementSound(volume = 0.2): void {
    const fanfare = [
      392.00, 493.88, 587.33,  // G4, B4, D5
      783.99, 880.00, 1046.50  // G5, A5, C6
    ];
    const durations = [100, 100, 100, 150, 150, 300];
    this.beepSequence(fanfare, durations, volume);
  }
  
  // Engine boost sound
  static engineSound(volume = 0.15): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(80, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.2);
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 0.7);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 1000);
    } catch (error) {
      console.warn('Failed to create engine sound:', error);
    }
  }
}

// Fallback sounds for different types of audio feedback
function playFallbackSound(type: string): void {
  try {
    switch(type) {
      case 'click':
        SoundEffects.clickSound();
        break;
      case 'hover':
        SoundEffects.hoverSound();
        break;
      case 'error':
      case 'craftFail':
      case 'loginFail':
        SoundEffects.errorSound();
        break;
      case 'success':
      case 'loginSuccess':
        SoundEffects.teleportSound();
        break;
      case 'craftSuccess':
        SoundEffects.magicSound();
        break;
      case 'achievement':
        SoundEffects.achievementSound();
        break;
      case 'levelUp':
        SoundEffects.powerUpSound();
        setTimeout(() => SoundEffects.achievementSound(), 500);
        break;
      case 'questComplete':
        SoundEffects.achievementSound();
        break;
      case 'questStart':
      case 'questAccept':
        SoundEffects.questSound();
        break;
      case 'reward':
        SoundEffects.magicSound();
        break;
      case 'spaceDoor':
        SoundEffects.doorSound();
        break;
      case 'boostEngine':
        SoundEffects.engineSound();
        break;
      case 'powerUp':
        SoundEffects.powerUpSound();
        break;
      case 'fanfare':
        SoundEffects.achievementSound();
        break;
      default:
        SoundEffects.laserSound();
    }
  } catch (e) {
    console.warn("Error playing sound fallback:", e);
    // Last resort fallback if all else fails
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