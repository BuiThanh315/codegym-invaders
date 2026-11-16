import './style.css';
import { SceneManager } from './systems/SceneManager';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error('Missing #game-canvas element in index.html');
}

const manager = new SceneManager(canvas);
manager.start();

