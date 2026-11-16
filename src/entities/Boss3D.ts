import * as THREE from 'three';
import { BossConfig } from '../config/stagesConfig';
import { AssetLoader } from '../systems/AssetLoader';

export interface BossUpdateCallbacks {
  onHalfHp: (line: string) => void;
  onPhaseChange: (phase: 1 | 2 | 3, line: string) => void;
  onShoot: (pos: THREE.Vector3, vx: number, vz: number, color?: number) => void;
  onClearPlayerBullets: () => void;
  onShake: (intensity: number) => void;
}

/**
 * 5 Boss 3D với tạo hình & chiêu thức đặc trưng bám sát kịch bản.
 */
export class Boss3D {
  public readonly group = new THREE.Group();
  public readonly config: BossConfig;
  public hp: number;
  public alive = true;
  public readonly radius = 2.0;

  private readonly coreGroup = new THREE.Group();
  private readonly ringMesh: THREE.Mesh;
  private elapsed = 0;
  private halfTriggered = false;
  private currentPhase: 1 | 2 | 3 = 1;
  private attackTimer = 0.8;
  private spiralAngle = 0;
  private teleportTimer = 0;
  private isHidden = false;

  constructor(scene: THREE.Scene, assets: AssetLoader, config: BossConfig) {
    this.config = config;
    this.hp = config.maxHp;

    this.group.position.set(0, 1.0, -10.5);
    this.group.add(this.coreGroup);

    const bossTex = assets.getBossTexture(config.id);
    if (bossTex) {
      const bossSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: bossTex, transparent: true })
      );
      bossSprite.scale.set(4.2, 5.2, 1);
      bossSprite.position.set(0, 1.4, 0);
      this.coreGroup.add(bossSprite);
    } else {
      const mainMat = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.4,
      });

      // Fallback 3D procedural khi thiếu ảnh Boss
      if (config.id === 1) {
        const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 1.5), mainMat);
        this.coreGroup.add(body);
        const stray = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.7, 0.7),
          new THREE.MeshBasicMaterial({ color: config.accentColor })
        );
        stray.position.set(2.1, 0.4, 0.5);
        this.coreGroup.add(stray);
      } else if (config.id === 2) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 14), mainMat);
        this.coreGroup.add(eye);
      } else if (config.id === 3) {
        const ghost = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.7, 1),
          new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.accentColor,
            emissiveIntensity: 0.6,
            wireframe: true,
          })
        );
        this.coreGroup.add(ghost);
      } else if (config.id === 4) {
        const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.5, 2.0), mainMat);
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.7, 0.5),
          new THREE.MeshStandardMaterial({ color: config.accentColor })
        );
        blade.position.set(0, -0.3, 1.25);
        this.coreGroup.add(hull, blade);
      } else {
        const titan = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 0), mainMat);
        const hornL = new THREE.Mesh(
          new THREE.ConeGeometry(0.45, 1.8, 6),
          new THREE.MeshBasicMaterial({ color: config.accentColor })
        );
        hornL.position.set(-1.7, 1.2, 0);
        hornL.rotation.z = 0.5;
        const hornR = hornL.clone();
        hornR.position.x = 1.7;
        hornR.rotation.z = -0.5;
        this.coreGroup.add(titan, hornL, hornR);
      }
    }

    // Vòng năng lượng 3D xoay quanh Boss
    this.ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2.55, 0.14, 8, 28),
      new THREE.MeshBasicMaterial({ color: config.accentColor })
    );
    this.ringMesh.rotation.x = Math.PI / 2;
    this.coreGroup.add(this.ringMesh);

    scene.add(this.group);
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
    this.ringMesh.rotation.z += dt * (this.config.id === 2 ? 2.7 : 1.1);

    const hpRatio = this.hp / this.config.maxHp;

    // Kiểm tra mốc 50% HP cho Boss 1..4
    if (this.config.id < 5 && !this.halfTriggered && hpRatio <= 0.5) {
      this.halfTriggered = true;
      cb.onHalfHp(this.config.halfHpLine);

      if (this.config.id === 3) {
        // Boss 3: Biến mất rồi hiện sau lưng/vị trí bất ngờ
        this.isHidden = true;
        this.group.visible = false;
        this.teleportTimer = 1.35;
      } else if (this.config.id === 4) {
        // Boss 4: Xóa bớt hàng đạn người chơi
        cb.onClearPlayerBullets();
      }
    }

    // Xử lý dịch chuyển cho Boss 3 (hoặc Boss 5 Phase 2)
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

    // Di chuyển lượn ngang kịch cả 2 bên màn hình (nhịp độ giảm 40%)
    const patrolSpan = Math.max(6, maxHalfWidth - 1.5);
    if (this.config.id !== 3 || !this.halfTriggered) {
      this.group.position.x = Math.sin(this.elapsed * 0.66) * patrolSpan;
      this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, -9.5, dt * 1.0);
    } else {
      this.group.position.x = Math.sin(this.elapsed * 0.9) * patrolSpan;
    }

    // Tấn công theo từng Boss / Phase
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
      // Bắn chùm 3 mảnh thẻ
      this.attackTimer = 2.25;
      for (const offset of [-1.8, 0, 1.8]) {
        cb.onShoot(origin, offset, 5.1, bossColor);
      }
    } else if (effectiveId === 2) {
      // Vòng lặp vô hạn: đạn xoáy tròn liên tục
      this.attackTimer = 0.4;
      this.spiralAngle += 0.45;
      cb.onShoot(origin, Math.cos(this.spiralAngle) * 4.5, Math.sin(this.spiralAngle) * 4.5 + 2.1, bossColor);
    } else if (effectiveId === 3) {
      // NullPointerException: bắn tia nhắm thẳng player
      this.attackTimer = 1.65;
      const dir = playerPos.clone().sub(origin).normalize();
      cb.onShoot(origin, dir.x * 6.6, dir.z * 6.6, bossColor);
    } else if (effectiveId === 4) {
      // DROP TABLE: mưa trụ dữ liệu trải rộng cả 2 bên màn hình
      this.attackTimer = 2.1;
      const step = Math.max(3, patrolSpan / 2);
      for (let x = -patrolSpan; x <= patrolSpan + 0.1; x += step) {
        cb.onShoot(new THREE.Vector3(x, 0.6, origin.z), 0, 5.7, bossColor);
      }
    } else {
      // Boss 5 Phase 3 ("Còn 1 giờ!!!"): mưa đạn dồn dập (nhịp độ giảm 40%)
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

