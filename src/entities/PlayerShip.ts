import * as THREE from 'three';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { AssetLoader } from '../systems/AssetLoader';

/**
 * Nhân vật chính: Laptop có cánh 3D ở góc nhìn thứ 3 từ trên xuống (~65°).
 * Quay phần bàn phím & màn hình về phía người chơi, có cánh hologram vỗ nhịp
 * và hiệu ứng nghiêng thân (roll/bank) khi di chuyển trái/phải.
 */
export class PlayerShip {
  public readonly group = new THREE.Group();
  public hp: number = GAME_CONSTANTS.PLAYER_MAX_HP;
  public invulnTimer = 0;

  private readonly bodyGroup = new THREE.Group();
  private readonly leftWing = new THREE.Group();
  private readonly rightWing = new THREE.Group();
  private readonly shieldMesh: THREE.Mesh;
  private readonly thrusterLeft: THREE.Mesh;
  private readonly thrusterRight: THREE.Mesh;

  private targetX = 0;
  private targetZ: number = GAME_CONSTANTS.PLAYER_START_Z;
  private maxHalfWidth: number = GAME_CONSTANTS.FIELD_HALF_WIDTH;
  private usingPointer = false;
  private elapsed = 0;

  constructor(scene: THREE.Scene, assets: AssetLoader) {
    this.group.position.set(0, 0.5, GAME_CONSTANTS.PLAYER_START_Z);
    this.group.add(this.bodyGroup);

    // 1. Thân dưới Laptop (Bàn phím hướng lên trên cho góc nhìn top-down)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.65,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 1.15), baseMat);
    this.bodyGroup.add(baseMesh);

    // Bàn phím RGB phát sáng
    const kbMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
    });
    const kbMesh = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.04, 0.72), kbMat);
    kbMesh.position.set(0, 0.08, 0.05);
    this.bodyGroup.add(kbMesh);

    // Touchpad nhỏ
    const padMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const padMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.22), padMat);
    padMesh.position.set(0, 0.08, 0.45);
    this.bodyGroup.add(padMesh);

    // 2. Màn hình Laptop mở góc ~110°, nghiêng nhẹ về phía camera để thấy biểu tượng </>
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.06, -0.55);
    lidGroup.rotation.x = -0.45;
    this.bodyGroup.add(lidGroup);

    const lidBack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.08), baseMat);
    lidBack.position.set(0, 0.52, 0);
    lidGroup.add(lidBack);

    const screenMat = new THREE.MeshBasicMaterial({
      map: assets.createScreenTexture(),
    });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.92), screenMat);
    screenMesh.position.set(0, 0.52, 0.05);
    lidGroup.add(screenMesh);

    // 3. Đôi cánh thiên thần hologram vàng-cyan
    this.buildWing(this.leftWing, -1);
    this.leftWing.position.set(-0.82, 0.12, -0.05);
    this.bodyGroup.add(this.leftWing);

    this.buildWing(this.rightWing, 1);
    this.rightWing.position.set(0.82, 0.12, -0.05);
    this.bodyGroup.add(this.rightWing);

    // 4. Hai động cơ phản lực ion phía sau
    const thrusterGeo = new THREE.ConeGeometry(0.16, 0.55, 8);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    this.thrusterLeft = new THREE.Mesh(thrusterGeo, thrusterMat);
    this.thrusterLeft.position.set(-0.45, 0, 0.8);
    this.bodyGroup.add(this.thrusterLeft);

    this.thrusterRight = new THREE.Mesh(thrusterGeo, thrusterMat);
    this.thrusterRight.position.set(0.45, 0, 0.8);
    this.bodyGroup.add(this.thrusterRight);

    // 5. Khiên try/catch khi bất tử tạm thời
    const shieldGeo = new THREE.SphereGeometry(1.45, 16, 12);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);

    scene.add(this.group);
  }

  private buildWing(target: THREE.Group, side: -1 | 1): void {
    const featherColors = [0x38bdf8, 0xfacc15, 0xfb7185];
    for (let i = 0; i < 3; i++) {
      const width = 1.1 - i * 0.22;
      const depth = 0.28 - i * 0.04;
      const mat = new THREE.MeshBasicMaterial({
        color: featherColors[i],
        transparent: true,
        opacity: 0.85,
      });
      const feather = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, depth), mat);
      feather.position.set(side * (width * 0.5 + 0.05), 0.04 * i, i * 0.24 - 0.1);
      feather.rotation.y = side * (-0.18 - i * 0.12);
      target.add(feather);
    }
  }

  public setHorizontalLimit(halfWidth: number): void {
    this.maxHalfWidth = Math.max(6, halfWidth);
  }

  public setPointerTarget(worldX: number, worldZ: number): void {
    this.usingPointer = true;
    this.targetX = THREE.MathUtils.clamp(
      worldX,
      -this.maxHalfWidth,
      this.maxHalfWidth
    );
    this.targetZ = THREE.MathUtils.clamp(
      worldZ,
      GAME_CONSTANTS.PLAYER_MIN_Z,
      GAME_CONSTANTS.FIELD_MAX_Z - 1
    );
  }

  public reset(): void {
    this.hp = GAME_CONSTANTS.PLAYER_MAX_HP;
    this.invulnTimer = 0;
    this.group.position.set(0, 0.5, GAME_CONSTANTS.PLAYER_START_Z);
    this.bodyGroup.rotation.set(0, 0, 0);
    this.usingPointer = false;
    this.shieldMesh.visible = false;
    this.group.visible = true;
  }

  public takeDamage(): boolean {
    if (this.invulnTimer > 0) return false;
    this.hp = Math.max(0, this.hp - 1);
    this.invulnTimer = GAME_CONSTANTS.PLAYER_INVULN_TIME;
    return true;
  }

  public getMuzzlePosition(): THREE.Vector3 {
    return new THREE.Vector3(this.group.position.x, 0.5, this.group.position.z - 0.9);
  }

  public update(dt: number, keys: Set<string>): void {
    this.elapsed += dt;

    // Di chuyển bàn phím
    let moveX = 0;
    let moveZ = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) moveX -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) moveX += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) moveZ -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) moveZ += 1;

    const prevX = this.group.position.x;

    if (moveX !== 0 || moveZ !== 0) {
      this.usingPointer = false;
      const len = Math.hypot(moveX, moveZ);
      this.group.position.x += (moveX / len) * GAME_CONSTANTS.PLAYER_SPEED * dt;
      this.group.position.z += (moveZ / len) * GAME_CONSTANTS.PLAYER_SPEED * dt;
    } else if (this.usingPointer) {
      this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, this.targetX, Math.min(1, dt * 14));
      this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, this.targetZ, Math.min(1, dt * 14));
    }

    // Giới hạn theo mép màn hình thực tế (không giới hạn 2 bên side hẹp)
    this.group.position.x = THREE.MathUtils.clamp(
      this.group.position.x,
      -this.maxHalfWidth,
      this.maxHalfWidth
    );
    this.group.position.z = THREE.MathUtils.clamp(
      this.group.position.z,
      GAME_CONSTANTS.PLAYER_MIN_Z,
      GAME_CONSTANTS.FIELD_MAX_Z - 1
    );

    // Hiệu ứng nghiêng cánh 3D (roll/bank) khi lượn trái/phải
    const dx = (this.group.position.x - prevX) / Math.max(dt, 0.001);
    const targetRoll = THREE.MathUtils.clamp(-dx * 0.032, -0.38, 0.38);
    this.bodyGroup.rotation.z = THREE.MathUtils.lerp(this.bodyGroup.rotation.z, targetRoll, Math.min(1, dt * 12));

    // Animation vỗ cánh & phản lực
    const flap = Math.sin(this.elapsed * 9) * 0.22;
    this.leftWing.rotation.z = flap;
    this.rightWing.rotation.z = -flap;
    this.group.position.y = 0.5 + Math.sin(this.elapsed * 4) * 0.08;

    const thrustScale = 0.85 + Math.sin(this.elapsed * 30) * 0.25;
    this.thrusterLeft.scale.set(1, 1, thrustScale);
    this.thrusterRight.scale.set(1, 1, thrustScale);

    // Khiên bất tử
    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      this.shieldMesh.visible = true;
      this.shieldMesh.rotation.y += dt * 3;
    } else {
      this.shieldMesh.visible = false;
    }
  }
}

