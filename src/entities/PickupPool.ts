import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/gameConstants';

export type PickupKind = 'flower' | 'life';

export interface PickupItem {
  active: boolean;
  kind: PickupKind;
  mesh: THREE.Group;
  radius: number;
}

/**
 * Object Pool cho vật phẩm rơi từ quái:
 * - Bông hoa 3D (5 cánh hồng + nhụy vàng + lá xanh): +10 điểm
 * - Mạng Trái Tim 3D (ExtrudeGeometry hình trái tim phát sáng): +1 mạng (hoặc +50đ nếu đủ 5 mạng)
 */
export class PickupPool {
  public readonly items: PickupItem[] = [];
  private readonly group = new THREE.Group();

  private readonly petalGeo = new THREE.SphereGeometry(0.18, 8, 8);
  private readonly centerGeo = new THREE.SphereGeometry(0.13, 8, 8);
  private readonly leafGeo = new THREE.BoxGeometry(0.18, 0.04, 0.32);
  private readonly heartGeo: THREE.ExtrudeGeometry;

  constructor(scene: THREE.Scene, poolSize = 40) {
    scene.add(this.group);
    this.heartGeo = this.createHeartGeometry();

    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xe11d48,
      emissiveIntensity: 0.65,
      roughness: 0.3,
    });
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xfb7185,
      emissiveIntensity: 0.75,
      roughness: 0.25,
    });
    const heartRingMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const heartRingGeo = new THREE.RingGeometry(0.5, 0.62, 18);

    for (let i = 0; i < poolSize; i++) {
      const isLifeSlot = i % 5 === 0;
      const container = isLifeSlot
        ? this.buildLifeMesh(heartMat, heartRingGeo, heartRingMat)
        : this.buildFlowerMesh(petalMat, centerMat, leafMat);

      container.visible = false;
      this.group.add(container);

      this.items.push({
        active: false,
        kind: isLifeSlot ? 'life' : 'flower',
        mesh: container,
        radius: 0.65,
      });
    }
  }

  private createHeartGeometry(): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.12);
    shape.bezierCurveTo(0, 0.22, -0.18, 0.35, -0.32, 0.22);
    shape.bezierCurveTo(-0.48, 0.06, -0.35, -0.22, 0, -0.4);
    shape.bezierCurveTo(0.35, -0.22, 0.48, 0.06, 0.32, 0.22);
    shape.bezierCurveTo(0.18, 0.35, 0, 0.22, 0, 0.12);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }

  private buildFlowerMesh(
    petalMat: THREE.Material,
    centerMat: THREE.Material,
    leafMat: THREE.Material
  ): THREE.Group {
    const g = new THREE.Group();
    const center = new THREE.Mesh(this.centerGeo, centerMat);
    center.position.y = 0.06;
    g.add(center);

    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(this.petalGeo, petalMat);
      petal.scale.set(1.0, 0.45, 1.35);
      petal.position.set(Math.cos(angle) * 0.24, 0.03, Math.sin(angle) * 0.24);
      petal.rotation.y = -angle;
      g.add(petal);
    }

    const leaf1 = new THREE.Mesh(this.leafGeo, leafMat);
    leaf1.position.set(0.16, -0.06, 0.16);
    leaf1.rotation.y = 0.6;
    const leaf2 = new THREE.Mesh(this.leafGeo, leafMat);
    leaf2.position.set(-0.16, -0.06, 0.16);
    leaf2.rotation.y = -0.6;
    g.add(leaf1, leaf2);

    return g;
  }

  private buildLifeMesh(
    heartMat: THREE.Material,
    ringGeo: THREE.BufferGeometry,
    ringMat: THREE.Material
  ): THREE.Group {
    const g = new THREE.Group();
    const heart = new THREE.Mesh(this.heartGeo, heartMat);
    heart.scale.setScalar(1.25);
    // Nghiêng nhẹ về phía camera góc 65° để nhìn rõ hình trái tim
    heart.rotation.x = -0.65;
    g.add(heart);

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.15;
    g.add(ring);
    return g;
  }

  public spawn(kind: PickupKind, pos: THREE.Vector3): void {
    for (const item of this.items) {
      if (!item.active && item.kind === kind) {
        item.active = true;
        item.mesh.position.set(pos.x, 0.6, pos.z);
        item.mesh.visible = true;
        break;
      }
    }
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
      item.mesh.position.z += dt * 3.6;
      item.mesh.rotation.y += dt * 2.2;

      if (item.mesh.position.z > GAME_CONSTANTS.FIELD_MAX_Z + 3) {
        item.active = false;
        item.mesh.visible = false;
      }
    }
  }
}
