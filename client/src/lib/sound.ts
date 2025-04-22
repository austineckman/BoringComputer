import { Howl } from 'howler';

// Sound effects for the arcade-style interface
const sounds = {
  // Basic UI interactions
  click: new Howl({
    src: ['https://assets.codepen.io/605876/click.mp3'],
    volume: 0.5,
  }),
  hover: new Howl({
    src: ['https://assets.codepen.io/605876/hover.mp3'],
    volume: 0.2,
  }),
  
  // Quest related sounds
  complete: new Howl({
    src: ['https://assets.codepen.io/605876/complete.mp3'],
    volume: 0.5,
  }),
  questStart: new Howl({
    src: ['https://assets.codepen.io/605876/quest-start.mp3'],
    volume: 0.6,
  }),
  questComplete: new Howl({
    src: ['https://assets.codepen.io/605876/quest-complete.mp3'],
    volume: 0.6,
  }),
  
  // Reward related sounds
  reward: new Howl({
    src: ['https://assets.codepen.io/605876/reward.mp3'],
    volume: 0.5,
  }),
  coinCollect: new Howl({
    src: ['https://assets.codepen.io/605876/coin-collect.mp3'],
    volume: 0.5,
  }),
  itemGet: new Howl({
    src: ['https://assets.codepen.io/605876/item-get.mp3'],
    volume: 0.5,
  }),
  
  // Notification sounds
  error: new Howl({
    src: ['https://assets.codepen.io/605876/error.mp3'],
    volume: 0.5,
  }),
  notification: new Howl({
    src: ['https://assets.codepen.io/605876/notification.mp3'],
    volume: 0.4,
  }),
  
  // Crafting related sounds
  craft: new Howl({
    src: ['https://assets.codepen.io/605876/craft.mp3'],
    volume: 0.5,
  }),
  craftSuccess: new Howl({
    src: ['https://assets.codepen.io/605876/craft-success.mp3'],
    volume: 0.6,
  }),
  
  // Achievement related sounds
  achievement: new Howl({
    src: ['https://assets.codepen.io/605876/achievement.mp3'],
    volume: 0.6,
  }),
  levelUp: new Howl({
    src: ['https://assets.codepen.io/605876/level-up.mp3'],
    volume: 0.7,
  }),
  fanfare: new Howl({
    src: ['https://assets.codepen.io/605876/fanfare.mp3'],
    volume: 0.5,
  }),
  success: new Howl({
    src: ['https://assets.codepen.io/605876/success.mp3'],
    volume: 0.5,
  }),
  
  // Ambient & misc sounds
  powerUp: new Howl({
    src: ['https://assets.codepen.io/605876/power-up.mp3'],
    volume: 0.5,
  }),
  spaceDoor: new Howl({
    src: ['https://assets.codepen.io/605876/space-door.mp3'],
    volume: 0.5, 
  }),
  boostEngine: new Howl({
    src: ['https://assets.codepen.io/605876/boost-engine.mp3'],
    volume: 0.4,
  }),
};

export default sounds;
