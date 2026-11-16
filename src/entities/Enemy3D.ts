import * as THREE from 'three';
import { MinionType } from '../config/stagesConfig';
import { AssetLoader } from '../systems/AssetLoader';

const MINION_COLORS: Record<MinionType, { body: number; border: string }> = {
  '<div>': { body: 0xf97316, border: '#f97316' },
  '<br>': { body: 0xfacc15, border: '#facc15' },
  '<p>': { body: 0x38bdf8, border: '#38bdf8' },
  undefined: { body: 0xc084fc, border: '#c084fc' },
  NaN: { body: 0xeab308, border: '#eab308' },
  '[object Object]': { body: 0x4ade80, border: '#4ade80' },
  null: { body: 0x1e293b, border: '#a855f7' },
  Exception: { body: 0xef4444, border: '#ef4444' },
  ClassNotFound: { body: 0x94a3b8, border: '#94a3b8' },
  'SELECT *': { body: 0x3b82f6, border: '#3b82f6' },
  JOIN: { body: 0x06b6d4, border: '#06b6d4' },
  'WHERE 1=1': { body: 0xec4899, border: '#ec4899' },
};

/**
 * Quái thường 3D đại diện cho các loại Bug qua 5 màn.
 */
export class Enemy3D {
  public readonly group = new THREE.Group();
  public readonly type: MinionType;
  public hp: number;
  public alive = true;
  public readonly radius = 0.85;

  private readonly bodyVisual: THREE.Object3D;
  private readonly bodyMat: THREE.Material;
  private readonly baseX: number;
  private elapsed = Math.random() * Math.PI * 2;
  private shootCooldown: number;

  constructor(
    scene: THREE.Scene,
    assets: AssetLoader,
    type: MinionType,
    startX: number,
    startZ: number,
    hp: number
  ) {
    this.type = type;
    this.hp = hp;
    this.baseX = startX;
    this.shootCooldown = 2.0 + Math.random() * 3.0;

    const palette = MINION_COLORS[type];
    const spriteTex = assets.getMinionTexture(type);

    if (spriteTex) {
      const mat = new THREE.SpriteMaterial({ map: spriteTex, transparent: true });
      const spriteBody = new THREE.Sprite(mat);
      spriteBody.scale.set(1.85, 1.85, 1);
      this.bodyVisual = spriteBody;
      this.bodyMat = mat;
      this.group.add(spriteBody);

      // Vòng hào quang 3D dưới chân quái
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 16),
        new THREE.MeshBasicMaterial({ color: palette.body, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.55;
      this.group.add(ring);
    } else {
      const geo = this.createGeometryForType(type);
      const mat = new THREE.MeshStandardMaterial({
        color: palette.body,
        emissive: palette.body,
        emissiveIntensity: 0.35,
        roughness: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      this.bodyVisual = mesh;
      this.bodyMat = mat;
      this.group.add(mesh);
    }

    // Nhãn code nổi phía trên đầu quái để nhìn từ góc top-down rất rõ
    const labelTex = assets.getCodeLabelTexture(type, '#0f172a', palette.border);
    const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(1.9, 0.7, 1);
    labelSprite.position.set(0, 1.25, 0);
    this.group.add(labelSprite);

    this.group.position.set(startX, 0.75, startZ);
    scene.add(this.group);
  }

  private createGeometryForType(type: MinionType): THREE.BufferGeometry {
    switch (type) {
      case 'null':
      case 'undefined':
        return new THREE.SphereGeometry(0.65, 14, 12);
      case 'Exception':
      case '<br>':
        return new THREE.OctahedronGeometry(0.7, 0);
      case 'JOIN':
      case 'NaN':
        return new THREE.TorusGeometry(0.5, 0.2, 8, 16);
      default:
        return new THREE.BoxGeometry(1.1, 0.8, 0.9);
    }
  }

  public takeDamage(dmg: number): boolean {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  public update(
    dt: number,
    speedMultiplier: number,
    maxHalfWidth: number,
    onShoot: (pos: THREE.Vector3) => void
  ): void {
    if (!this.alive) return;
    this.elapsed += dt;

    // Di chuyển tiến dần xuống và lắc ngang rộng ra cả 2 bên màn hình
    this.group.position.z += dt * 0.87 * speedMultiplier;
    this.group.position.x = THREE.MathUtils.clamp(
      this.baseX + Math.sin(this.elapsed * 1.32) * 3.2,
      -maxHalfWidth,
      maxHalfWidth
    );
    if (this.bodyVisual instanceof THREE.Mesh) {
      this.bodyVisual.rotation.y += dt * 1.1;
    } else {
      this.bodyVisual.position.y = Math.sin(this.elapsed * 2.5) * 0.12;
    }

    // Hiệu ứng nhấp nháy tàng hình cho 'undefined'
    if (this.type === 'undefined') {
      this.bodyMat.transparent = true;
      this.bodyMat.opacity = 0.45 + 0.55 * Math.abs(Math.sin(this.elapsed * 1.8));
    }

    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 3.3 + Math.random() * 3.2;
      onShoot(this.group.position.clone());
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
  }
}

