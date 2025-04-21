import { Howl } from 'howler';

// Sound effects for the arcade-style interface
const sounds = {
  click: new Howl({
    src: ['https://assets.codepen.io/605876/click.mp3'],
    volume: 0.5,
  }),
  hover: new Howl({
    src: ['https://assets.codepen.io/605876/hover.mp3'],
    volume: 0.2,
  }),
  complete: new Howl({
    src: ['https://assets.codepen.io/605876/complete.mp3'],
    volume: 0.5,
  }),
  reward: new Howl({
    src: ['https://assets.codepen.io/605876/reward.mp3'],
    volume: 0.5,
  }),
  error: new Howl({
    src: ['https://assets.codepen.io/605876/error.mp3'],
    volume: 0.5,
  }),
  craft: new Howl({
    src: ['https://assets.codepen.io/605876/craft.mp3'],
    volume: 0.5,
  }),
  achievement: new Howl({
    src: ['https://assets.codepen.io/605876/achievement.mp3'],
    volume: 0.6,
  }),
  levelUp: new Howl({
    src: ['https://assets.codepen.io/605876/level-up.mp3'],
    volume: 0.7,
  }),
};

export default sounds;
