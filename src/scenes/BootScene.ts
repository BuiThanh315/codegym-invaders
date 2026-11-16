import { GameContext, GameSceneInterface } from './SceneTypes';

export class BootScene implements GameSceneInterface {
  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.ctx.ui.clear();
    void this.ctx.assets.preload().then(() => {
      this.ctx.switchScene('menu');
    });
  }

  public update(_dt: number): void {
    // No-op during instant boot
  }

  public exit(): void {
    this.ctx.ui.clear();
  }
}

