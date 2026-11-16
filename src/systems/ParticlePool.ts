import * as THREE from 'three';

interface ParticleItem {
  active: boolean;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  spin: number;
}

/**
 * Object Pool cho hạt 3D (cánh hoa nổ, pháo hoa 3D, tia lửa bug).
 * Tái sử dụng Geometry & Material để giữ ổn định 60 FPS.
 */
export class ParticlePool {
  private readonly items: ParticleItem[] = [];
  private readonly group = new THREE.Group();
  private readonly petalGeo = new THREE.OctahedronGeometry(0.18, 0);

  constructor(scene: THREE.Scene, poolSize = 220) {
    scene.add(this.group);

    for (let i = 0; i < poolSize; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(this.petalGeo, mat);
      mesh.visible = false;
      this.group.add(mesh);

      this.items.push({
        active: false,
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        spin: 0,
      });
    }
  }

  public spawnBurst(
    pos: THREE.Vector3,
    count: number,
    colors: number[] = [0xfb7185, 0xfacc15, 0x38bdf8],
    speed = 7
  ): void {
    let spawned = 0;
    for (const item of this.items) {
      if (item.active) continue;
      item.active = true;
      item.life = 0;
      item.maxLife = 0.55 + Math.random() * 0.45;
      item.spin = (Math.random() - 0.5) * 10;

      item.mesh.position.copy(pos);
      item.mesh.scale.setScalar(0.8 + Math.random() * 0.8);
      item.mesh.visible = true;

      const mat = item.mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
      mat.opacity = 1;

      const theta = Math.random() * Math.PI * 2;
      const up = (Math.random() - 0.2) * speed;
      const radial = (0.4 + Math.random() * 0.8) * speed;
      item.velocity.set(Math.cos(theta) * radial, up, Math.sin(theta) * radial);

      spawned++;
      if (spawned >= count) break;
    }
  }

  public spawnFallingPetal(xRange: number, yStart: number, zMin: number, zMax: number): void {
    for (const item of this.items) {
      if (item.active) continue;
      item.active = true;
      item.life = 0;
      item.maxLife = 3.2;
      item.spin = (Math.random() - 0.5) * 4;

      item.mesh.position.set(
        (Math.random() - 0.5) * xRange * 2,
        yStart,
        zMin + Math.random() * (zMax - zMin)
      );
      item.mesh.scale.setScalar(0.9 + Math.random() * 0.7);
      item.mesh.visible = true;

      const mat = item.mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(Math.random() > 0.35 ? 0xfb7185 : 0xfacc15);
      mat.opacity = 0.95;

      item.velocity.set((Math.random() - 0.5) * 1.4, -2.5 - Math.random() * 1.5, 0.8);
      break;
    }
  }

  public update(dt: number): void {
    for (const item of this.items) {
      if (!item.active) continue;
      item.life += dt;
      if (item.life >= item.maxLife) {
        item.active = false;
        item.mesh.visible = false;
        continue;
      }

      item.mesh.position.addScaledVector(item.velocity, dt);
      item.mesh.rotation.x += item.spin * dt;
      item.mesh.rotation.y += item.spin * dt;

      const ratio = 1 - item.life / item.maxLife;
      const mat = item.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, ratio);
      item.mesh.scale.setScalar(Math.max(0.1, ratio));
    }
  }

  public clear(): void {
    for (const item of this.items) {
      item.active = false;
      item.mesh.visible = false;
    }
  }
}

