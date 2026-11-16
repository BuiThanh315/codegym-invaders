import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { BootScene } from '../scenes/BootScene';
import { EndingScene } from '../scenes/EndingScene';
import { GameScene } from '../scenes/GameScene';
import { IntroScene } from '../scenes/IntroScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameContext, GameSceneInterface, SceneId } from '../scenes/SceneTypes';
import { AssetLoader } from '../systems/AssetLoader';
import { ParticlePool } from '../systems/ParticlePool';
import { SoundManager } from '../systems/SoundManager';
import { UIOverlay } from '../systems/UIOverlay';

export class SceneManager {
  private readonly context: GameContext;
  private readonly scenes: Record<SceneId, GameSceneInterface>;
  private activeScene: GameSceneInterface | null = null;
  private lastTime = performance.now();
  private readonly starField: THREE.Points;

  constructor(canvas: HTMLCanvasElement) {
    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x090d1a);
    threeScene.fog = new THREE.FogExp2(0x090d1a, 0.016);

    const camera = new THREE.PerspectiveCamera(
      GAME_CONSTANTS.CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Ánh sáng 3D dịu mắt
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.15);
    dirLight.position.set(8, 20, 12);
    threeScene.add(ambient, dirLight);

    // Nền sao 3D nhẹ nhàng giúp không gian có chiều sâu
    this.starField = this.createStarField();
    threeScene.add(this.starField);

    const assets = new AssetLoader();
    const sound = new SoundManager();
    const ui = new UIOverlay();
    const particles = new ParticlePool(threeScene);

    this.context = {
      threeScene,
      camera,
      renderer,
      assets,
      sound,
      ui,
      particles,
      playerName: '',
      easterEggFlowerMode: false,
      score: 0,
      switchScene: (id: SceneId) => this.switchTo(id),
    };

    this.scenes = {
      boot: new BootScene(this.context),
      menu: new MenuScene(this.context),
      intro: new IntroScene(this.context),
      game: new GameScene(this.context),
      ending: new EndingScene(this.context),
    };

    window.addEventListener('resize', () => this.onResize());
    this.updateCameraForAspect();
  }

  private createStarField(): THREE.Points {
    const count = 240;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = -2 - Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.22,
      transparent: true,
      opacity: 0.65,
    });
    return new THREE.Points(geo, mat);
  }

  private updateCameraForAspect(): void {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    // Tự động lùi camera trên màn hình dọc (Mobile) để không bị cắt mất hai bên không gian chơi
    const zoomScale = aspect < 1.0 ? Math.min(1.65, 1.05 / aspect) : 1.0;
    this.context.camera.position.set(
      0,
      GAME_CONSTANTS.CAMERA_POS_Y * zoomScale,
      GAME_CONSTANTS.CAMERA_POS_Z * zoomScale
    );
    this.context.camera.lookAt(0, 0, GAME_CONSTANTS.CAMERA_LOOK_AT_Z);
  }

  public start(): void {
    this.switchTo('boot');
    requestAnimationFrame((t) => this.loop(t));
  }

  public switchTo(id: SceneId): void {
    if (this.activeScene) {
      this.activeScene.exit();
    }
    this.activeScene = this.scenes[id];
    this.activeScene.enter();
  }

  private onResize(): void {
    this.context.camera.aspect = window.innerWidth / window.innerHeight;
    this.context.camera.updateProjectionMatrix();
    this.context.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateCameraForAspect();
  }

  private loop(now: number): void {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.starField.rotation.y += dt * 0.018;
    this.activeScene?.update(dt);
    this.context.particles.update(dt);
    this.context.renderer.render(this.context.threeScene, this.context.camera);

    requestAnimationFrame((t) => this.loop(t));
  }
}

