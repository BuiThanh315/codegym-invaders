import * as THREE from 'three';
import { MinionType } from '../config/stagesConfig';
import { extractVoxelDataFromImage, VoxelModelData } from './VoxelBuilder';

const MINION_SPRITE_MAP: Record<MinionType, string> = {
  '<div>': 'div',
  '<br>': 'br',
  '<p>': 'div',
  undefined: 'undefined',
  NaN: 'nan',
  '[object Object]': 'undefined',
  null: 'null',
  Exception: 'exception',
  ClassNotFound: 'null',
  'SELECT *': 'select',
  JOIN: 'where',
  'WHERE 1=1': 'where',
};

/**
 * Preload sprite Boss, Quái, Mentor, Background từ ./assets/
 * và cung cấp fallback procedural nếu thiếu file.
 */
export class AssetLoader {
  private readonly loader = new THREE.TextureLoader();
  private readonly labelCache = new Map<string, THREE.CanvasTexture>();
  private readonly minionTextures = new Map<string, THREE.Texture>();
  private readonly minionVoxels = new Map<string, VoxelModelData>();
  private readonly bossTextures = new Map<number, THREE.Texture>();
  private readonly bossVoxels = new Map<number, VoxelModelData>();
  private dragonWingTexture: THREE.Texture | null = null;
  private bgTexture: THREE.Texture | null = null;

  public async preload(): Promise<void> {
    const tasks: Promise<void>[] = [];

    tasks.push(
      this.loadTexture('./assets/bg-space.jpg').then((tex) => {
        if (tex) {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(2, 2);
          this.bgTexture = tex;
        }
      })
    );

    const uniqueMinions = Array.from(new Set(Object.values(MINION_SPRITE_MAP)));
    for (const key of uniqueMinions) {
      tasks.push(
        this.loadTexture(`./assets/minions/${key}.png`).then((tex) => {
          if (tex) {
            this.minionTextures.set(key, tex);
            if (tex.image instanceof HTMLImageElement) {
              const remapHex = key === 'null' ? 0xa855f7 : undefined;
              const voxel = extractVoxelDataFromImage(tex.image, 34, 2.0, 2.2, remapHex);
              if (voxel) this.minionVoxels.set(key, voxel);
            }
          }
        })
      );
    }

    for (let id = 1; id <= 5; id++) {
      tasks.push(
        this.loadTexture(`./assets/bosses/boss-${id}.png`).then((tex) => {
          if (tex) {
            this.bossTextures.set(id, tex);
            if (tex.image instanceof HTMLImageElement) {
              const voxel = extractVoxelDataFromImage(tex.image, 72, 5.4, 2.6);
              if (voxel) this.bossVoxels.set(id, voxel);
            }
          }
        })
      );
    }

    tasks.push(
      this.loadTexture('./assets/bosses/dragon-wing.png').then((tex) => {
        if (tex) this.dragonWingTexture = tex;
      })
    );

    await Promise.all(tasks);
  }

  private loadTexture(url: string): Promise<THREE.Texture | null> {
    return new Promise((resolve) => {
      this.loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        () => resolve(null)
      );
    });
  }

  public getBackgroundTexture(): THREE.Texture | null {
    return this.bgTexture;
  }

  public getMinionTexture(type: MinionType): THREE.Texture | null {
    const key = MINION_SPRITE_MAP[type];
    return this.minionTextures.get(key) ?? null;
  }

  public getMinionVoxel(type: MinionType): VoxelModelData | null {
    const key = MINION_SPRITE_MAP[type];
    return this.minionVoxels.get(key) ?? null;
  }

  public getBossTexture(id: number): THREE.Texture | null {
    return this.bossTextures.get(id) ?? null;
  }

  public getBossVoxel(id: number): VoxelModelData | null {
    return this.bossVoxels.get(id) ?? null;
  }

  public getDragonWingTexture(): THREE.Texture | null {
    return this.dragonWingTexture;
  }

  public getCodeLabelTexture(text: string, bgHex = '#0f172a', borderHex = '#38bdf8'): THREE.CanvasTexture {
    const key = `${text}|${bgHex}|${borderHex}`;
    const cached = this.labelCache.get(key);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = bgHex;
      ctx.beginPath();
      ctx.roundRect(6, 10, 244, 76, 16);
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = borderHex;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 28px "JetBrains Mono", "Be Vietnam Pro", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 48, 224);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.labelCache.set(key, texture);
    return texture;
  }

  public createScreenTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 160);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 244, 148);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 54px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('</>', 128, 66);

      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('❤ 20/11', 128, 122);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  public createPaperPageTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Nền trang giấy trắng ngà
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, 128, 160);

      // Viền trang giấy & góc gấp
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 124, 156);

      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.moveTo(96, 0);
      ctx.lineTo(128, 32);
      ctx.lineTo(96, 32);
      ctx.closePath();
      ctx.fill();

      // Tiêu đề đỏ URGENT
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(14, 16, 72, 14);

      // Các dòng chữ trên trang giấy
      ctx.fillStyle = '#64748b';
      for (let y = 46; y <= 136; y += 16) {
        const lineW = y === 136 ? 60 : 96;
        ctx.fillRect(16, y, lineW, 6);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
