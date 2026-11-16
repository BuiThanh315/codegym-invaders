import * as THREE from 'three';
import { MinionType } from '../config/stagesConfig';
import { AssetLoader } from '../systems/AssetLoader';
import { createVoxelInstancedMesh } from '../systems/VoxelBuilder';

const MINION_COLORS: Record<MinionType, { body: number; border: string }> = {
  '<div>': { body: 0xf97316, border: '#f97316' },
  '<br>': { body: 0xfacc15, border: '#facc15' },
  '<p>': { body: 0x38bdf8, border: '#38bdf8' },
  undefined: { body: 0xc084fc, border: '#c084fc' },
  NaN: { body: 0xeab308, border: '#eab308' },
  '[object Object]': { body: 0x4ade80, border: '#4ade80' },
  null: { body: 0xa855f7, border: '#c084fc' },
  Exception: { body: 0xef4444, border: '#ef4444' },
  ClassNotFound: { body: 0x94a3b8, border: '#94a3b8' },
  'SELECT *': { body: 0x3b82f6, border: '#3b82f6' },
  JOIN: { body: 0x06b6d4, border: '#06b6d4' },
  'WHERE 1=1': { body: 0xec4899, border: '#ec4899' },
};

export type EnemyState = 'entering' | 'formation' | 'diving' | 'returning';

/**
 * Quái thường 3D Voxel với 5 hiệu ứng xuất hiện khác nhau theo màn,
 * xếp thành 3 hàng so le, giữ đội hình và lao xuống khi được kích hoạt.
 */
export class Enemy3D {
  public readonly group = new THREE.Group();
  public readonly type: MinionType;
  public hp: number;
  public alive = true;
  public state: EnemyState = 'entering';
  public readonly radius = 0.85;

  private readonly bodyVisual: THREE.Object3D;
  private readonly bodyMat: THREE.Material;
  private readonly targetSlot: THREE.Vector3;
  private readonly startPos: THREE.Vector3;
  private readonly entryStyle: number;
  private readonly entryDelay: number;
  private readonly entryDuration = 1.35;
  private entryElapsed = 0;

  private readonly diveTarget = new THREE.Vector3();
  private elapsed = Math.random() * Math.PI * 2;

  constructor(
    scene: THREE.Scene,
    assets: AssetLoader,
    type: MinionType,
    targetX: number,
    targetZ: number,
    hp: number,
    entryStyle: number,
    indexInWave: number
  ) {
    this.type = type;
    this.hp = hp;
    this.entryStyle = entryStyle;
    this.entryDelay = indexInWave * 0.06;
    this.targetSlot = new THREE.Vector3(targetX, 0.75, targetZ);
    this.startPos = this.computeStartPos(entryStyle, targetX, targetZ, indexInWave);

    const palette = MINION_COLORS[type];
    const voxelData = assets.getMinionVoxel(type);

    if (voxelData) {
      const voxelMesh = createVoxelInstancedMesh(voxelData, type === 'undefined');
      voxelMesh.rotation.x = -0.35;
      this.bodyVisual = voxelMesh;
      this.bodyMat = voxelMesh.material as THREE.Material;
      this.group.add(voxelMesh);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.55, 0.72, 16),
        new THREE.MeshBasicMaterial({
          color: palette.body,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55,
        })
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

    const labelTex = assets.getCodeLabelTexture(type, '#0f172a', palette.border);
    const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(1.9, 0.7, 1);
    labelSprite.position.set(0, 1.25, 0);
    this.group.add(labelSprite);

    this.group.position.copy(this.startPos);
    if (entryStyle === 3) {
      this.group.scale.setScalar(0.01);
    }
    scene.add(this.group);
  }

  /**
   * Mọi màn đều xuất hiện từ phía trên hoặc 2 bên trên (tuyệt đối không đi từ dưới màn hình).
   */
  private computeStartPos(
    style: number,
    targetX: number,
    targetZ: number,
    idx: number
  ): THREE.Vector3 {
    switch (style) {
      case 1:
        // Màn 1 (HTML/CSS): Rơi thẳng từng cột từ phía trên màn hình
        return new THREE.Vector3(targetX, 0.75, -20);
      case 2:
        // Màn 2 (JS): Bay đan chéo từ 2 bên mép trên màn hình vào
        return new THREE.Vector3(idx % 2 === 0 ? -18 : 18, 0.75, targetZ - 6);
      case 3:
        // Màn 3 (Java Core): Khởi tạo thu phóng từ trên cao (warp-in)
        return new THREE.Vector3(targetX, 7.5, targetZ - 3);
      case 4:
        // Màn 4 (SQL): Trượt chéo bậc thang từ góc trên trái
        return new THREE.Vector3(-18, 0.75, -19);
      default:
        // Màn 5 (Project): Bay xoắn từ trên cao tụ về đội hình
        return new THREE.Vector3(Math.cos(idx) * 14, 5.5, -20);
    }
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

  public startDive(playerPos: THREE.Vector3): void {
    if (this.state !== 'formation') return;
    this.state = 'diving';
    this.diveTarget.set(playerPos.x, 0.75, Math.min(playerPos.z, 7.5));
  }

  public update(dt: number, maxHalfWidth: number, formationTime: number): void {
    if (!this.alive) return;
    this.elapsed += dt;

    // 1. Hiệu ứng xuất hiện theo từng màn
    if (this.state === 'entering') {
      this.entryElapsed += dt;
      const tRaw = (this.entryElapsed - this.entryDelay) / this.entryDuration;
      if (tRaw <= 0) return;

      const t = Math.min(1, tRaw);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out

      if (this.entryStyle === 3) {
        this.group.scale.setScalar(0.05 + 0.95 * ease);
      }

      this.group.position.lerpVectors(this.startPos, this.targetSlot, ease);
      if (this.entryStyle === 5) {
        // Thêm độ lượn vòng cung cho Màn 5
        this.group.position.x += Math.sin(t * Math.PI) * 2.8;
      }

      if (t >= 1) {
        this.group.scale.setScalar(1);
        this.group.position.copy(this.targetSlot);
        this.state = 'formation';
      }
    } else if (this.state === 'formation') {
      // 2. Xếp đội hình 3 hàng so le & lắc nhẹ 2 bên trong giới hạn màn hình
      const swayX = Math.sin(formationTime * 1.1) * 1.6;
      this.group.position.x = THREE.MathUtils.clamp(
        this.targetSlot.x + swayX,
        -maxHalfWidth,
        maxHalfWidth
      );
      this.group.position.z = this.targetSlot.z;
      this.group.position.y = 0.75;
    } else if (this.state === 'diving') {
      // 3. Lao đến vị trí người chơi
      const dir = this.diveTarget.clone().sub(this.group.position);
      const dist = dir.length();
      if (dist < 0.45) {
        this.state = 'returning';
      } else {
        dir.normalize();
        this.group.position.addScaledVector(dir, dt * 8.5);
      }
    } else if (this.state === 'returning') {
      // 4. Quay lại vị trí đội hình
      const swayX = Math.sin(formationTime * 1.1) * 1.6;
      const returnPos = new THREE.Vector3(
        THREE.MathUtils.clamp(this.targetSlot.x + swayX, -maxHalfWidth, maxHalfWidth),
        0.75,
        this.targetSlot.z
      );
      const dir = returnPos.clone().sub(this.group.position);
      const dist = dir.length();
      if (dist < 0.35) {
        this.group.position.copy(returnPos);
        this.state = 'formation';
      } else {
        dir.normalize();
        this.group.position.addScaledVector(dir, dt * 7.5);
      }
    }

    // Animation Voxel 3D
    if (this.bodyVisual instanceof THREE.InstancedMesh) {
      this.bodyVisual.rotation.y = Math.sin(this.elapsed * 2.0) * 0.28;
      this.bodyVisual.position.y = Math.sin(this.elapsed * 2.5) * 0.1;
    } else if (this.bodyVisual instanceof THREE.Mesh) {
      this.bodyVisual.rotation.y += dt * 1.1;
    }

    if (this.type === 'undefined') {
      this.bodyMat.transparent = true;
      this.bodyMat.opacity = 0.45 + 0.55 * Math.abs(Math.sin(this.elapsed * 1.8));
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
  }
}
