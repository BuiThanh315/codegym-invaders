import * as THREE from 'three';
import { AssetLoader } from '../systems/AssetLoader';
import { ParticlePool } from '../systems/ParticlePool';
import { SoundManager } from '../systems/SoundManager';
import { UIOverlay } from '../systems/UIOverlay';

export type SceneId = 'boot' | 'menu' | 'intro' | 'game' | 'ending';

export interface GameSceneInterface {
  enter(): void;
  update(dt: number): void;
  exit(): void;
}

export interface GameContext {
  threeScene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  assets: AssetLoader;
  sound: SoundManager;
  ui: UIOverlay;
  particles: ParticlePool;
  playerName: string;
  easterEggFlowerMode: boolean;
  score: number;
  switchScene: (id: SceneId) => void;
}

