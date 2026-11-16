import * as THREE from 'three';
import { BossConfig } from '../config/stagesConfig';
import { AssetLoader } from '../systems/AssetLoader';
import { createVoxelInstancedMesh } from '../systems/VoxelBuilder';

export interface BossUpdateCallbacks {
  onHalfHp: (line: string) => void;
  onPhaseChange: (phase: 1 | 2 | 3, line: string) => void;
  onShoot: (pos: THREE.Vector3, vx: number, vz: number, color?: number) => void;
  onClearPlayerBullets: () => void;
  onShake: (intensity: number) => void;
}

/**
 * 5 Boss 3D với thiết kế hình thể & chi tiết riêng biệt cho từng Boss,
 * kết hợp lõi 3D Voxel và các khối phụ kiện 3D chuyển động đặc trưng.
 */
export class Boss3D {
  public readonly group = new THREE.Group();
  public readonly config: BossConfig;
  public hp: number;
  public alive = true;
  public readonly radius = 2.2;

  private readonly coreGroup = new THREE.Group();
  private readonly animParts: THREE.Object3D[] = [];
  private voxelBody: THREE.InstancedMesh | null = null;
  private wingLeft: THREE.Object3D | null = null;
  private wingRight: THREE.Object3D | null = null;

  private elapsed = 0;
  private halfTriggered = false;
  private currentPhase: 1 | 2 | 3 = 1;
  private attackTimer = 0.8;
  private spiralAngle = 0;
  private boss4Pattern = 0;
  private teleportTimer = 0;
  private isHidden = false;

  constructor(scene: THREE.Scene, assets: AssetLoader, config: BossConfig) {
    this.config = config;
    this.hp = config.maxHp;

    this.group.position.set(0, 1.2, -10.5);
    this.group.add(this.coreGroup);

    const bossVoxel = assets.getBossVoxel(config.id);
    if (bossVoxel) {
      this.voxelBody = createVoxelInstancedMesh(bossVoxel);
      this.voxelBody.position.set(0, 1.35, 0);
      this.voxelBody.rotation.x = -0.35;
      this.coreGroup.add(this.voxelBody);
    }

    // Dựng thiết kế 3D riêng biệt làm nổi bật hình thể từng Boss
    this.buildUniqueBossArchitecture(config, assets);

    scene.add(this.group);
  }

  private buildUniqueBossArchitecture(config: BossConfig, assets: AssetLoader): void {
    const mainMat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.35,
    });
    const accentMat = new THREE.MeshBasicMaterial({ color: config.accentColor });

    if (config.id === 1) {
      // Boss 1: Thẻ Không Đóng — lõi giáp 3D vững chắc sau lưng + các thẻ HTML/CSS bay quanh
      if (this.voxelBody) this.voxelBody.scale.set(1.05, 1.0, 1.0);
      const armorCore = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 2.8, 0.55),
        new THREE.MeshStandardMaterial({
          color: 0x16a34a,
          emissive: 0x22c55e,
          emissiveIntensity: 0.35,
          roughness: 0.4,
        })
      );
      armorCore.position.set(0.15, 1.25, -0.25);
      this.coreGroup.add(armorCore);

      const tags = ['<div>', '<span>', 'flex'];
      tags.forEach((tag, i) => {
        const tex = assets.getCodeLabelTexture(tag, '#431407', '#fb923c');
        const card = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.55, 0.16),
          new THREE.MeshBasicMaterial({ map: tex })
        );
        const angle = (i / tags.length) * Math.PI * 2;
        card.position.set(Math.cos(angle) * 2.7, 1.3 + i * 0.4, Math.sin(angle) * 1.4);
        this.coreGroup.add(card);
        this.animParts.push(card);
      });
    } else if (config.id === 2) {
      // Boss 2: Vòng Lặp Vô Hạn — Thiết kế hình tròn đa tầng xoáy 3D (không bó khung chữ nhật)
      if (this.voxelBody) {
        this.voxelBody.scale.set(0.85, 0.85, 0.85);
        this.voxelBody.rotation.x = -0.55;
      }
      const eyeOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 18, 16),
        new THREE.MeshStandardMaterial({
          color: 0x4ade80,
          emissive: 0x22c55e,
          emissiveIntensity: 0.8,
        })
      );
      eyeOrb.position.set(0, 1.35, 0.35);
      this.coreGroup.add(eyeOrb);

      // 3 vòng tròn đồng tâm xoay ngược chiều nhau tạo hình xoáy tròn
      const radii = [1.75, 2.35, 2.95];
      radii.forEach((r, idx) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.12, 10, 32),
          idx % 2 === 0 ? accentMat : mainMat
        );
        ring.position.set(0, 1.35, 0);
        ring.rotation.x = -0.55 + idx * 0.18;
        this.coreGroup.add(ring);
        this.animParts.push(ring);
      });
    } else if (config.id === 3) {
      // Boss 3: NullPointerException — Bóng ma 3D trong lồng bát diện wireframe + tia sét đỏ
      const cage = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.6, 0),
        new THREE.MeshBasicMaterial({
          color: 0xc084fc,
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        })
      );
      cage.position.set(0, 1.4, 0);
      this.coreGroup.add(cage);
      this.animParts.push(cage);

      for (const side of [-1, 1]) {
        const bolt = new THREE.Mesh(
          new THREE.ConeGeometry(0.28, 1.9, 4),
          new THREE.MeshBasicMaterial({ color: 0xff1e42 })
        );
        bolt.position.set(side * 2.4, 1.6, 0);
        bolt.rotation.z = side * -0.8;
        this.coreGroup.add(bolt);
        this.animParts.push(bolt);
      }
    } else if (config.id === 4) {
      // Boss 4: DROP TABLE — Xe ủi bọc thép 3D + lưỡi ủi vàng-đen + 3 trụ Database bay quanh
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.75, 0.55),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xeab308,
          emissiveIntensity: 0.35,
        })
      );
      blade.position.set(0, 0.15, 1.35);
      this.coreGroup.add(blade);

      const dbGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.85, 12);
      const dbMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
      });
      for (let i = 0; i < 3; i++) {
        const db = new THREE.Mesh(dbGeo, dbMat);
        const angle = (i / 3) * Math.PI * 2;
        db.position.set(Math.cos(angle) * 2.8, 2.1, Math.sin(angle) * 1.4);
        this.coreGroup.add(db);
        this.animParts.push(db);
      }
    } else {
      // Boss 5: DEADLINE — Rồng lửa 3D có đôi cánh sải rộng vỗ nhịp + bảng đồng hồ 00:01:00
      const wingGeo = new THREE.BoxGeometry(2.6, 1.4, 0.18);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48,
        emissive: 0xf97316,
        emissiveIntensity: 0.7,
      });
      const wL = new THREE.Group();
      const wLMesh = new THREE.Mesh(wingGeo, wingMat);
      wLMesh.position.x = -1.4;
      wL.add(wLMesh);
      wL.position.set(-1.3, 1.9, -0.3);
      this.wingLeft = wL;

      const wR = new THREE.Group();
      const wRMesh = new THREE.Mesh(wingGeo, wingMat);
      wRMesh.position.x = 1.4;
      wR.add(wRMesh);
      wR.position.set(1.3, 1.9, -0.3);
      this.wingRight = wR;

      const clockTex = assets.getCodeLabelTexture('00:01:00', '#450a0a', '#facc15');
      const clockBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.85, 0.25),
        new THREE.MeshBasicMaterial({ map: clockTex })
      );
      clockBoard.position.set(0, 1.25, 0.85);
      clockBoard.rotation.x = -0.35;

      // Các tờ giấy deadline bay xoay quanh Boss 5
      const paperGeo = new THREE.BoxGeometry(0.55, 0.7, 0.05);
      const paperMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
      for (let i = 0; i < 4; i++) {
        const paper = new THREE.Mesh(paperGeo, paperMat);
        const angle = (i / 4) * Math.PI * 2;
        paper.position.set(Math.cos(angle) * 3.0, 1.6 + (i % 2) * 0.5, Math.sin(angle) * 1.5);
        this.coreGroup.add(paper);
        this.animParts.push(paper);
      }

      this.coreGroup.add(wL, wR, clockBoard);
    }
  }

  public takeDamage(dmg: number): boolean {
    if (!this.alive || this.isHidden) return false;
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  public update(
    dt: number,
    playerPos: THREE.Vector3,
    maxHalfWidth: number,
    cb: BossUpdateCallbacks
  ): void {
    if (!this.alive) return;
    this.elapsed += dt;

    // Animation riêng cho từng Boss
    if (this.voxelBody) {
      if (this.config.id === 2) {
        this.voxelBody.rotation.z += dt * 1.4; // Boss 2 xoay tròn
      } else {
        this.voxelBody.rotation.y = Math.sin(this.elapsed * 1.1) * 0.22;
      }
    }

    this.animParts.forEach((part, idx) => {
      if (this.config.id === 2) {
        part.rotation.z += dt * (idx % 2 === 0 ? 2.4 : -2.0);
      } else if (this.config.id === 3) {
        part.rotation.y += dt * 1.8;
        part.rotation.x += dt * 1.1;
      } else {
        part.rotation.y += dt * 1.6;
        part.position.y += Math.sin(this.elapsed * 3 + idx) * dt * 0.4;
      }
    });

    if (this.wingLeft && this.wingRight) {
      const flapSpeed = this.currentPhase === 3 ? 10 : 5.5;
      const flap = Math.sin(this.elapsed * flapSpeed) * 0.35;
      this.wingLeft.rotation.y = flap;
      this.wingRight.rotation.y = -flap;
    }

    const hpRatio = this.hp / this.config.maxHp;

    // Kiểm tra mốc 50% HP cho Boss 1..4
    if (this.config.id < 5 && !this.halfTriggered && hpRatio <= 0.5) {
      this.halfTriggered = true;
      cb.onHalfHp(this.config.halfHpLine);

      if (this.config.id === 3) {
        this.isHidden = true;
        this.group.visible = false;
        this.teleportTimer = 1.35;
      } else if (this.config.id === 4) {
        cb.onClearPlayerBullets();
      }
    }

    // Xử lý dịch chuyển cho Boss 3
    if (this.isHidden) {
      this.teleportTimer -= dt;
      if (this.teleportTimer <= 0) {
        this.isHidden = false;
        this.group.visible = true;
        const side = Math.random() > 0.5 ? 1 : -1;
        const limit = Math.max(6, maxHalfWidth - 1.5);
        this.group.position.x = THREE.MathUtils.clamp(playerPos.x + side * 4.0, -limit, limit);
        this.group.position.z = THREE.MathUtils.clamp(playerPos.z - 5.0, -11, 1.5);
      }
      return;
    }

    // Chuyển Phase cho Boss 5: DEADLINE (800 HP, 3 Phase)
    if (this.config.id === 5) {
      if (hpRatio <= 0.66 && this.currentPhase === 1) {
        this.currentPhase = 2;
        cb.onPhaseChange(2, this.config.phase2Line ?? this.config.halfHpLine);
        cb.onClearPlayerBullets();
      } else if (hpRatio <= 0.33 && this.currentPhase === 2) {
        this.currentPhase = 3;
        cb.onPhaseChange(3, this.config.phase3Line ?? 'Còn 1 giờ!!!');
      }
      if (this.currentPhase === 3) {
        cb.onShake(0.16);
      }
    }

    // Di chuyển lượn ngang kịch cả 2 bên màn hình
    const patrolSpan = Math.max(6, maxHalfWidth - 1.5);
    if (this.config.id !== 3 || !this.halfTriggered) {
      this.group.position.x = Math.sin(this.elapsed * 0.66) * patrolSpan;
      this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, -9.5, dt * 1.0);
    } else {
      this.group.position.x = Math.sin(this.elapsed * 0.9) * patrolSpan;
    }

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this.performAttack(playerPos, patrolSpan, cb);
    }
  }

  private performAttack(playerPos: THREE.Vector3, patrolSpan: number, cb: BossUpdateCallbacks): void {
    const origin = this.group.position.clone();
    const effectiveId =
      this.config.id === 5
        ? this.currentPhase === 1
          ? 2
          : this.currentPhase === 2
            ? 4
            : 5
        : this.config.id;

    const bossColor = this.config.color;

    if (effectiveId === 1) {
      this.attackTimer = 2.25;
      for (const offset of [-1.8, 0, 1.8]) {
        cb.onShoot(origin, offset, 5.1, bossColor);
      }
    } else if (effectiveId === 2) {
      this.attackTimer = 0.4;
      this.spiralAngle += 0.45;
      cb.onShoot(origin, Math.cos(this.spiralAngle) * 4.5, Math.sin(this.spiralAngle) * 4.5 + 2.1, bossColor);
    } else if (effectiveId === 3) {
      this.attackTimer = 1.65;
      const dir = playerPos.clone().sub(origin).normalize();
      cb.onShoot(origin, dir.x * 6.6, dir.z * 6.6, bossColor);
    } else if (effectiveId === 4) {
      // DROP TABLE: luân phiên 3 kiểu tấn công tăng độ khó
      this.attackTimer = 1.45;
      const pattern = this.boss4Pattern % 3;
      this.boss4Pattern++;

      if (pattern === 0) {
        const step = Math.max(2.6, patrolSpan / 2.5);
        const shift = this.boss4Pattern % 2 === 0 ? 0.9 : -0.9;
        for (let x = -patrolSpan + shift; x <= patrolSpan; x += step) {
          cb.onShoot(new THREE.Vector3(x, 0.6, origin.z), 0, 5.8, bossColor);
        }
      } else if (pattern === 1) {
        const baseDir = playerPos.clone().sub(origin).normalize();
        const baseAngle = Math.atan2(baseDir.x, baseDir.z);
        for (const offset of [-0.42, -0.21, 0, 0.21, 0.42]) {
          const a = baseAngle + offset;
          cb.onShoot(origin, Math.sin(a) * 6.4, Math.cos(a) * 6.4, bossColor);
        }
      } else {
        cb.onShoot(origin, 0, 6.8, bossColor);
        cb.onShoot(new THREE.Vector3(origin.x - 2.0, 0.6, origin.z), -2.4, 5.8, bossColor);
        cb.onShoot(new THREE.Vector3(origin.x + 2.0, 0.6, origin.z), 2.4, 5.8, bossColor);
        cb.onShoot(new THREE.Vector3(origin.x - 2.0, 0.6, origin.z), 2.2, 5.8, bossColor);
        cb.onShoot(new THREE.Vector3(origin.x + 2.0, 0.6, origin.z), -2.2, 5.8, bossColor);
      }
    } else {
      this.attackTimer = 0.28;
      this.spiralAngle += 0.55;
      cb.onShoot(origin, Math.cos(this.spiralAngle) * 5.7, Math.sin(this.spiralAngle) * 3.6 + 3.9, bossColor);
      cb.onShoot(origin, -Math.cos(this.spiralAngle) * 4.8, 5.7, bossColor);
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
  }
}
