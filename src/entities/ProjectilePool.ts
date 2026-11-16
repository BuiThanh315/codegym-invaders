import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/gameConstants';

export interface Projectile {
  active: boolean;
  isPlayer: boolean;
  mesh: THREE.Group;
  vx: number;
  vz: number;
  damage: number;
  radius: number;
}

/**
 * Object Pool cho đạn hoa hồng 3D (Player) và đạn lỗi (Quái & Boss).
 */
export class ProjectilePool {
  public readonly items: Projectile[] = [];
  private readonly group = new THREE.Group();

  private readonly roseGeo = new THREE.DodecahedronGeometry(0.24, 0);
  private readonly leafGeo = new THREE.BoxGeometry(0.14, 0.06, 0.36);
  private readonly enemyCoreGeo = new THREE.OctahedronGeometry(0.26, 0);
  private readonly enemySpikeGeo = new THREE.ConeGeometry(0.14, 0.42, 4);
  private readonly enemyRingGeo = new THREE.TorusGeometry(0.32, 0.045, 6, 12);

  constructor(scene: THREE.Scene, playerPool = 90, enemyPool = 140) {
    scene.add(this.group);

    const roseMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xe11d48,
      emissiveIntensity: 0.75,
    });
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });

    for (let i = 0; i < playerPool; i++) {
      const container = new THREE.Group();
      const bud = new THREE.Mesh(this.roseGeo, roseMat);
      const stem = new THREE.Mesh(this.leafGeo, leafMat);
      stem.position.z = 0.22;
      container.add(bud, stem);
      container.visible = false;
      this.group.add(container);

      this.items.push({
        active: false,
        isPlayer: true,
        mesh: container,
        vx: 0,
        vz: 0,
        damage: GAME_CONSTANTS.ROSE_DAMAGE,
        radius: 0.35,
      });
    }

    const coreWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < enemyPool; i++) {
      const container = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
      // Tạo hình đạn lỗi 3D: lõi sáng + mũi nhọn lao xuống + vòng gai xoay
      const core = new THREE.Mesh(this.enemyCoreGeo, mat);
      const inner = new THREE.Mesh(this.enemyCoreGeo, coreWhiteMat);
      inner.scale.setScalar(0.5);
      const tip = new THREE.Mesh(this.enemySpikeGeo, mat);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 0.25;
      const ring = new THREE.Mesh(this.enemyRingGeo, mat);
      container.add(core, inner, tip, ring);
      container.visible = false;
      this.group.add(container);

      this.items.push({
        active: false,
        isPlayer: false,
        mesh: container,
        vx: 0,
        vz: 0,
        damage: 1,
        radius: 0.34,
      });
    }
  }

  public spawnPlayerRose(pos: THREE.Vector3, angleOffset = 0): void {
    for (const item of this.items) {
      if (!item.active && item.isPlayer) {
        item.active = true;
        item.mesh.position.copy(pos);
        item.mesh.visible = true;
        item.vx = Math.sin(angleOffset) * GAME_CONSTANTS.ROSE_SPEED;
        item.vz = -Math.cos(angleOffset) * GAME_CONSTANTS.ROSE_SPEED;
        break;
      }
    }
  }

  public spawnEnemyBullet(
    pos: THREE.Vector3,
    vx: number,
    vz: number,
    color = 0xf87171
  ): void {
    for (const item of this.items) {
      if (!item.active && !item.isPlayer) {
        item.active = true;
        item.mesh.position.copy(pos);
        item.mesh.visible = true;
        item.vx = vx;
        item.vz = vz;
        const coloredMesh = item.mesh.children[0] as THREE.Mesh;
        (coloredMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
        break;
      }
    }
  }

  /**
   * Kỹ năng Boss 4 (DROP TABLE): Xóa bớt hàng đạn hoa hồng của người chơi trên màn hình.
   */
  public clearPlayerBullets(fraction = 0.75): number {
    let removed = 0;
    for (const item of this.items) {
      if (item.active && item.isPlayer && Math.random() < fraction) {
        item.active = false;
        item.mesh.visible = false;
        removed++;
      }
    }
    return removed;
  }

  public clearAll(): void {
    for (const item of this.items) {
      item.active = false;
      item.mesh.visible = false;
    }
  }

  public update(dt: number): void {
    for (const item of this.items) {
      if (!item.active) continue;
      item.mesh.position.x += item.vx * dt;
      item.mesh.position.z += item.vz * dt;
      if (item.isPlayer) {
        item.mesh.rotation.z += dt * 6;
      } else {
        item.mesh.rotation.z -= dt * 5;
        item.mesh.rotation.y += dt * 3;
      }

      if (
        item.mesh.position.z < GAME_CONSTANTS.FIELD_MIN_Z - 4 ||
        item.mesh.position.z > GAME_CONSTANTS.FIELD_MAX_Z + 4 ||
        Math.abs(item.mesh.position.x) > GAME_CONSTANTS.FIELD_HALF_WIDTH + 12
      ) {
        item.active = false;
        item.mesh.visible = false;
      }
    }
  }
}

