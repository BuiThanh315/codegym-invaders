import * as THREE from 'three';
import { classConfig } from '../config/classConfig';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { StageConfig, STAGES_CONFIG } from '../config/stagesConfig';
import { Boss3D } from '../entities/Boss3D';
import { Enemy3D } from '../entities/Enemy3D';
import { PickupPool } from '../entities/PickupPool';
import { PlayerShip } from '../entities/PlayerShip';
import { ProjectilePool } from '../entities/ProjectilePool';
import { LeaderboardManager } from '../systems/LeaderboardManager';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class GameScene implements GameSceneInterface {
  private player: PlayerShip | null = null;
  private projectiles: ProjectilePool | null = null;
  private pickups: PickupPool | null = null;
  private enemies: Enemy3D[] = [];
  private boss: Boss3D | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private bgPlane: THREE.Mesh | null = null;

  private stageIndex = 0;
  private waveIndex = 0;
  private waveShootTimer = 2.5;
  private phaseKillCount = 0;
  private formationTime = 0;
  private phaseTimer = 0;
  private state: 'intro_delay' | 'waves' | 'boss' | 'stage_clear' | 'game_over' = 'intro_delay';
  private stateTimer = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;

  private readonly keys = new Set<string>();
  private pointerDown = false;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private readonly playPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);
  private readonly intersectPoint = new THREE.Vector3();

  private hudHeartsEl: HTMLElement | null = null;
  private hudScoreEl: HTMLElement | null = null;
  private hudStageEl: HTMLElement | null = null;
  private hudTimerEl: HTMLElement | null = null;
  private bossBarWrapEl: HTMLElement | null = null;
  private bossNameEl: HTMLElement | null = null;
  private bossHpTextEl: HTMLElement | null = null;
  private bossHpFillEl: HTMLElement | null = null;

  private readonly onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    if (e.code === 'Space' && !e.repeat && this.state !== 'game_over') {
      this.firePlayerBullet();
    }
  };
  private readonly onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private readonly onPointerDown = (e: PointerEvent) => {
    this.pointerDown = true;
    this.updatePointerTarget(e);
    if (this.state !== 'game_over') {
      this.firePlayerBullet();
    }
  };
  private readonly onPointerMove = (e: PointerEvent) => {
    if (this.pointerDown || e.pointerType === 'mouse') {
      this.updatePointerTarget(e);
    }
  };
  private readonly onPointerUp = () => {
    this.pointerDown = false;
  };

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.stageIndex = 0;
    this.ctx.score = 0;

    this.player = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.projectiles = new ProjectilePool(this.ctx.threeScene);
    this.pickups = new PickupPool(this.ctx.threeScene);

    this.buildHud();
    this.bindInputs();
    this.startStage(0);
  }

  private buildHud(): void {
    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div>
        <div class="hud-top">
          <div class="hud-pill">
            <span id="hud-stage">Màn 1</span>
            <span id="hud-timer" class="hud-timer"></span>
            <span id="hud-hearts" class="hud-hearts">❤❤❤</span>
          </div>
          <div class="hud-pill">
            <span>${this.ctx.ui.escapeHtml(this.ctx.playerName)}</span>
            <span id="hud-score" class="hud-score">0</span>
            <button id="hud-mute-btn" class="hud-mute-btn interactive" title="Bật/Tắt âm thanh">🔊</button>
          </div>
        </div>
        <div id="boss-bar-wrap" class="boss-bar-wrap" style="display:none;">
          <div class="boss-bar-header">
            <span id="boss-name">Boss</span>
            <span id="boss-hp-text">100/100</span>
          </div>
          <div class="boss-bar-track">
            <div id="boss-hp-fill" class="boss-bar-fill" style="width:100%"></div>
          </div>
        </div>
      </div>
    `;

    this.hudHeartsEl = document.getElementById('hud-hearts');
    this.hudScoreEl = document.getElementById('hud-score');
    this.hudStageEl = document.getElementById('hud-stage');
    this.hudTimerEl = document.getElementById('hud-timer');
    this.bossBarWrapEl = document.getElementById('boss-bar-wrap');
    this.bossNameEl = document.getElementById('boss-name');
    this.bossHpTextEl = document.getElementById('boss-hp-text');
    this.bossHpFillEl = document.getElementById('boss-hp-fill');

    const muteBtn = document.getElementById('hud-mute-btn');
    muteBtn?.addEventListener('click', () => {
      const muted = this.ctx.sound.toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
      if (!muted) this.ctx.sound.startBgm();
    });

    this.syncHud();
  }

  private bindInputs(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    const canvas = this.ctx.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private unbindInputs(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    const canvas = this.ctx.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }

  private updatePointerTarget(e: PointerEvent): void {
    if (!this.player) return;
    const rect = this.ctx.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.ctx.camera);
    if (this.raycaster.ray.intersectPlane(this.playPlane, this.intersectPoint)) {
      this.player.setPointerTarget(this.intersectPoint.x, this.intersectPoint.z);
    }
  }

  private startStage(index: number): void {
    this.stageIndex = index;
    this.waveIndex = 0;
    this.clearStageEntities();

    const stage = this.currentStage();
    this.updateStageGrid(stage);
    this.syncHud();

    this.state = 'intro_delay';
    this.stateTimer = 2.4;
    this.ctx.ui.showDialogue(classConfig.teacherName, stage.mentorIntro, 'mentor', 3200);
  }

  private updateStageGrid(stage: StageConfig): void {
    if (this.gridHelper) {
      this.ctx.threeScene.remove(this.gridHelper);
    }
    if (this.bgPlane) {
      this.ctx.threeScene.remove(this.bgPlane);
      this.bgPlane = null;
    }

    this.ctx.threeScene.background = new THREE.Color(stage.themeColor);
    if (this.ctx.threeScene.fog instanceof THREE.FogExp2) {
      this.ctx.threeScene.fog.color.setHex(stage.themeColor);
    }

    // Nền không gian 3D sáng rõ trải rộng toàn màn hình
    const bgTex = this.ctx.assets.getBackgroundTexture();
    if (bgTex) {
      const bgMat = new THREE.MeshBasicMaterial({
        map: bgTex,
        color: new THREE.Color(stage.themeColor).lerp(new THREE.Color(0xffffff), 0.72),
        transparent: true,
        opacity: 0.88,
      });
      this.bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), bgMat);
      this.bgPlane.rotation.x = -Math.PI / 2;
      this.bgPlane.position.y = -3.8;
      this.ctx.threeScene.add(this.bgPlane);
    }

    this.gridHelper = new THREE.GridHelper(120, 60, stage.gridColor, 0x334155);
    this.gridHelper.position.y = -0.35;
    (this.gridHelper.material as THREE.Material).transparent = true;
    (this.gridHelper.material as THREE.Material).opacity = 0.45;
    this.ctx.threeScene.add(this.gridHelper);
  }

  private currentStage(): StageConfig {
    return STAGES_CONFIG[this.stageIndex];
  }

  private getVisibleHalfWidth(): number {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const zoomScale = aspect < 1.0 ? Math.min(1.65, 1.05 / aspect) : 1.0;
    const baseCamY = GAME_CONSTANTS.CAMERA_POS_Y * zoomScale;
    const vFovRad = THREE.MathUtils.degToRad(this.ctx.camera.fov);
    const camDist = Math.hypot(baseCamY, GAME_CONSTANTS.CAMERA_POS_Z * zoomScale);
    const rawHalfWidth = Math.tan(vFovRad / 2) * camDist * this.ctx.camera.aspect;
    // Tăng giới hạn thêm 5% mỗi bên (tổng lề 15% mỗi bên -> dùng 85% chiều rộng hiển thị)
    return Math.max(7, rawHalfWidth * 0.85);
  }

  private firePlayerBullet(): void {
    if (!this.player || !this.projectiles) return;
    const pos = this.player.getMuzzlePosition();
    this.ctx.sound.playShoot();
    if (this.ctx.easterEggFlowerMode) {
      for (const angle of [-0.22, 0, 0.22]) {
        this.projectiles.spawnPlayerRose(pos, angle);
      }
    } else {
      this.projectiles.spawnPlayerRose(pos, 0);
    }
  }

  private spawnWave(): void {
    const stage = this.currentStage();
    const rows = 3;
    const cols = 5;
    const total = stage.minionsPerWave; // 15 quái mỗi phase
    const halfSpan = this.getVisibleHalfWidth() * 0.78;
    const spacingX = (halfSpan * 2) / Math.max(1, cols - 1);
    const startX = -halfSpan;
    const startZ = -11.2;
    const rowSpacingZ = 2.4;

    this.waveShootTimer = 2.5;
    this.phaseKillCount = 0;
    this.formationTime = 0;

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols) % rows;
      const col = i % cols;
      // Xếp 3 hàng so le nhau (hàng lẻ lệch nửa bước)
      const staggerOffset = row % 2 === 1 ? spacingX * 0.42 : -spacingX * 0.12;
      const targetX = startX + col * spacingX + staggerOffset;
      const targetZ = startZ + row * rowSpacingZ;

      const type = stage.minionTypes[(i + this.waveIndex) % stage.minionTypes.length];
      const minionHp = stage.stageNumber * GAME_CONSTANTS.ROSE_DAMAGE;
      const enemy = new Enemy3D(
        this.ctx.threeScene,
        this.ctx.assets,
        type,
        targetX,
        targetZ,
        minionHp,
        stage.stageNumber,
        i
      );
      this.enemies.push(enemy);
    }
  }

  private spawnBoss(): void {
    const stage = this.currentStage();
    this.phaseTimer = GAME_CONSTANTS.BOSS_PHASE_TIME_LIMIT;
    this.boss = new Boss3D(this.ctx.threeScene, this.ctx.assets, stage.boss);
    this.ctx.sound.playBossWarning();
    this.ctx.ui.showDialogue(stage.boss.name, stage.boss.introLine, 'boss', 3500, stage.boss.id);
    this.syncBossBar();
    this.syncTimerHud();
  }

  private syncTimerHud(): void {
    if (!this.hudTimerEl) return;
    if (this.state === 'waves' || this.state === 'boss') {
      const secs = Math.ceil(this.phaseTimer);
      this.hudTimerEl.textContent = `⏱️ ${secs}s`;
      this.hudTimerEl.classList.toggle('urgent', secs <= 10);
      this.hudTimerEl.style.display = 'inline-block';
    } else {
      this.hudTimerEl.style.display = 'none';
    }
  }

  private syncHud(): void {
    if (this.hudStageEl) {
      this.hudStageEl.textContent = this.currentStage().title;
    }
    if (this.hudHeartsEl && this.player) {
      this.hudHeartsEl.textContent = '❤'.repeat(this.player.hp) || '0';
    }
    if (this.hudScoreEl) {
      this.hudScoreEl.textContent = `${this.ctx.score}`;
    }
  }

  private syncBossBar(): void {
    if (!this.bossBarWrapEl) return;
    if (!this.boss || !this.boss.alive) {
      this.bossBarWrapEl.style.display = 'none';
      return;
    }
    this.bossBarWrapEl.style.display = 'block';
    if (this.bossNameEl) this.bossNameEl.textContent = this.boss.config.name;
    if (this.bossHpTextEl) {
      this.bossHpTextEl.textContent = `${Math.ceil(this.boss.hp)} / ${this.boss.config.maxHp}`;
    }
    if (this.bossHpFillEl) {
      const pct = Math.max(0, (this.boss.hp / this.boss.config.maxHp) * 100);
      this.bossHpFillEl.style.width = `${pct}%`;
    }
  }

  public update(dt: number): void {
    if (!this.player || !this.projectiles || !this.pickups || this.state === 'game_over') return;

    // Tính giới hạn ngang theo đúng chiều rộng màn hình hiện tại (bỏ giới hạn 2 bên side hẹp)
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const zoomScale = aspect < 1.0 ? Math.min(1.65, 1.05 / aspect) : 1.0;
    const baseCamY = GAME_CONSTANTS.CAMERA_POS_Y * zoomScale;
    const visibleHalfWidth = this.getVisibleHalfWidth();
    this.player.setHorizontalLimit(visibleHalfWidth);

    // Cuộn lưới & nền không gian 3D tạo cảm giác bay tới (nhịp độ giảm 40%)
    if (this.gridHelper) {
      this.gridHelper.position.z = (this.gridHelper.position.z + dt * 2.4) % 2.0;
    }
    const bgTex = this.ctx.assets.getBackgroundTexture();
    if (bgTex) {
      bgTex.offset.y += dt * 0.035;
    }

    // Cập nhật Camera Shake nếu có (Boss 5 Phase 3)
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.ctx.camera.position.x = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.camera.position.y = baseCamY + (Math.random() - 0.5) * this.shakeIntensity;
    } else {
      this.ctx.camera.position.x = THREE.MathUtils.lerp(this.ctx.camera.position.x, 0, dt * 8);
      this.ctx.camera.position.y = THREE.MathUtils.lerp(this.ctx.camera.position.y, baseCamY, dt * 8);
    }

    // Player update (1 click chuột = 1 viên đạn)
    this.player.update(dt, this.keys);
    this.projectiles.update(dt);
    this.pickups.update(dt);

    // State machine của màn chơi
    if (this.state === 'intro_delay') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'waves';
        this.phaseTimer = GAME_CONSTANTS.MINION_PHASE_TIME_LIMIT;
        this.spawnWave();
        this.syncTimerHud();
      }
    } else if (this.state === 'waves') {
      this.phaseTimer = Math.max(0, this.phaseTimer - dt);
      this.syncTimerHud();
      if (this.phaseTimer <= 0) {
        // Hết 60s màn quái thường: xóa quái còn lại và chuyển sang màn Boss của chặng hiện tại
        this.clearStageEntities();
        this.state = 'boss';
        this.spawnBoss();
        return;
      }
      if (this.enemies.length === 0) {
        this.waveIndex++;
        if (this.waveIndex < this.currentStage().waveCount) {
          this.spawnWave();
        } else {
          this.state = 'boss';
          this.spawnBoss();
        }
      }
    } else if (this.state === 'boss') {
      this.phaseTimer = Math.max(0, this.phaseTimer - dt);
      this.syncTimerHud();
      if (this.phaseTimer <= 0) {
        // Hết 90s đấu Boss chưa hạ được Boss: trừ 1 mạng; nếu còn mạng thì trực tiếp chuyển tiếp sang màn tiếp theo
        this.player.hp = Math.max(0, this.player.hp - 1);
        this.ctx.sound.playPlayerHit();
        this.syncHud();
        if (this.player.hp <= 0) {
          this.triggerGameOver('Hết 90 giây đấu Boss và đã hết mạng rồi! Thử lại nhé!');
        } else {
          this.ctx.ui.showDialogue(
            classConfig.teacherName,
            `Hết 90 giây đấu Boss! Trừ 1 ❤ (còn ${this.player.hp} ❤), tiến tới màn tiếp theo nhé!`,
            'mentor',
            2600
          );
          this.advanceToNextStage();
        }
        return;
      }
    } else if (this.state === 'stage_clear') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.stageIndex + 1 < STAGES_CONFIG.length) {
          this.startStage(this.stageIndex + 1);
        } else {
          this.ctx.sound.playVictory();
          this.ctx.switchScene('ending');
          return;
        }
      }
    }

    // Update quái thường: di chuyển vào 3 hàng so le, giữ đội hình & mỗi 1.5s có 3 quái bắn ngẫu nhiên
    this.formationTime += dt;
    for (const enemy of this.enemies) {
      enemy.update(dt, visibleHalfWidth, this.formationTime);
    }

    if (this.state === 'waves' && this.enemies.length > 0) {
      this.waveShootTimer -= dt;
      if (this.waveShootTimer <= 0) {
        this.waveShootTimer = 2.5;
        const readyShooters = this.enemies.filter((e) => e.alive && e.state !== 'entering');
        for (let s = 0; s < 3 && readyShooters.length > 0; s++) {
          const pickIdx = Math.floor(Math.random() * readyShooters.length);
          const shooter = readyShooters.splice(pickIdx, 1)[0];
          this.projectiles.spawnEnemyBullet(
            shooter.group.position.clone(),
            0,
            4.9 + this.stageIndex * 0.36,
            0xff1e42
          );
        }
      }
    }

    // Update Boss
    if (this.boss && this.boss.alive) {
      this.boss.update(dt, this.player.group.position, visibleHalfWidth, {
        onHalfHp: (line) => {
          this.ctx.ui.showDialogue(this.boss!.config.name, line, 'boss', 3200, this.boss!.config.id);
        },
        onPhaseChange: (_phase, line) => {
          this.ctx.ui.showDialogue(this.boss!.config.name, line, 'boss', 3200, this.boss!.config.id);
        },
        onShoot: (pos, vx, vz, color) => {
          this.projectiles?.spawnEnemyBullet(pos, vx, vz, color);
        },
        onClearPlayerBullets: () => {
          this.projectiles?.clearPlayerBullets(0.8);
          this.ctx.particles.spawnBurst(this.boss!.group.position, 24, [0xef4444, 0x38bdf8], 9);
        },
        onShake: (intensity) => {
          this.shakeTimer = 0.12;
          this.shakeIntensity = intensity;
        },
      });
      this.syncBossBar();
    }

    this.handleCollisions();

    // Dọn quái đã chết
    this.enemies = this.enemies.filter((e) => {
      if (!e.alive) {
        e.destroy(this.ctx.threeScene);
        return false;
      }
      return true;
    });
  }

  private handleCollisions(): void {
    if (!this.player || !this.projectiles) return;

    const pPos = this.player.group.position;

    for (const bullet of this.projectiles.items) {
      if (!bullet.active) continue;
      const bPos = bullet.mesh.position;

      if (bullet.isPlayer) {
        // Va chạm đạn hoa hồng -> Quái thường
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          if (bPos.distanceTo(enemy.group.position) < enemy.radius + bullet.radius) {
            bullet.active = false;
            bullet.mesh.visible = false;
            const killed = enemy.takeDamage(bullet.damage);
            if (killed) {
              this.ctx.score += GAME_CONSTANTS.SCORE_MINION;
              this.ctx.sound.playBugExplode();
              this.ctx.particles.spawnBurst(enemy.group.position, 14);
              this.spawnMinionDrop(enemy.group.position);
              this.syncHud();

              // Cứ mỗi 3 quái bị tiêu diệt -> 1 quái ngẫu nhiên lao xuống chỗ người chơi rồi quay lại
              this.phaseKillCount++;
              if (this.phaseKillCount % 3 === 0) {
                const candidates = this.enemies.filter(
                  (e) => e.alive && e.state === 'formation'
                );
                if (candidates.length > 0) {
                  const diver = candidates[Math.floor(Math.random() * candidates.length)];
                  diver.startDive(pPos);
                }
              }
            }
            break;
          }
        }

        // Va chạm đạn hoa hồng -> Boss
        if (bullet.active && this.boss && this.boss.alive && this.boss.group.visible) {
          if (bPos.distanceTo(this.boss.group.position) < this.boss.radius + bullet.radius) {
            bullet.active = false;
            bullet.mesh.visible = false;
            const killed = this.boss.takeDamage(bullet.damage);
            this.syncBossBar();
            if (killed) {
              this.onBossDefeated();
            }
          }
        }
      } else {
        // Va chạm đạn địch -> Player
        if (bPos.distanceTo(pPos) < GAME_CONSTANTS.PLAYER_HIT_RADIUS + bullet.radius) {
          bullet.active = false;
          bullet.mesh.visible = false;
          this.damagePlayer();
        }
      }
    }

    // Va chạm trực tiếp Quái -> Player
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (enemy.group.position.distanceTo(pPos) < enemy.radius + GAME_CONSTANTS.PLAYER_HIT_RADIUS) {
        enemy.alive = false;
        this.ctx.particles.spawnBurst(enemy.group.position, 12);
        this.damagePlayer();
      }
    }

    // Nhặt vật phẩm rơi (Hoa +10đ, Mạng +1 hoặc +50đ khi đủ 5 mạng)
    if (this.pickups) {
      for (const item of this.pickups.items) {
        if (!item.active) continue;
        if (item.mesh.position.distanceTo(pPos) < item.radius + GAME_CONSTANTS.PLAYER_HIT_RADIUS) {
          item.active = false;
          item.mesh.visible = false;
          if (item.kind === 'flower') {
            this.ctx.score += GAME_CONSTANTS.SCORE_FLOWER_PICKUP;
            this.ctx.sound.playPickup(false);
            this.ctx.particles.spawnBurst(item.mesh.position, 8, [0xfb7185, 0xfacc15], 4);
          } else {
            if (this.player.hp < GAME_CONSTANTS.PLAYER_MAX_HP) {
              this.player.hp += 1;
            } else {
              this.ctx.score += GAME_CONSTANTS.SCORE_MAX_HP_BONUS;
            }
            this.ctx.sound.playPickup(true);
            this.ctx.particles.spawnBurst(item.mesh.position, 12, [0x4ade80, 0xfacc15], 5);
          }
          this.syncHud();
        }
      }
    }
  }

  /**
   * Tỷ lệ rơi đồ khi tiêu diệt quái con: 70% 1 hoa, 25% 2 hoa, 5% 1 mạng.
   */
  private spawnMinionDrop(pos: THREE.Vector3): void {
    if (!this.pickups) return;
    const roll = Math.random();
    if (roll < 0.7) {
      this.pickups.spawn('flower', pos);
    } else if (roll < 0.95) {
      this.pickups.spawn('flower', new THREE.Vector3(pos.x - 0.55, pos.y, pos.z));
      this.pickups.spawn('flower', new THREE.Vector3(pos.x + 0.55, pos.y, pos.z));
    } else {
      this.pickups.spawn('life', pos);
    }
  }

  private onBossDefeated(): void {
    if (!this.boss) return;
    const stage = this.currentStage();
    this.ctx.score += GAME_CONSTANTS.SCORE_BOSS;
    this.ctx.sound.playVictory();
    this.ctx.particles.spawnBurst(
      this.boss.group.position,
      45,
      [0xfb7185, 0xfacc15, 0x4ade80, 0x38bdf8],
      11
    );

    this.boss.destroy(this.ctx.threeScene);
    this.boss = null;
    this.projectiles?.clearAll();
    this.pickups?.clearAll();
    this.syncBossBar();
    this.syncHud();

    this.ctx.ui.showDialogue(stage.boss.name, stage.boss.defeatedLine, 'boss', 2200, stage.boss.id);
    window.setTimeout(() => {
      if (this.state === 'stage_clear') {
        this.ctx.ui.showDialogue(classConfig.teacherName, stage.mentorOutro, 'mentor', 2400);
      }
    }, 1500);

    this.state = 'stage_clear';
    this.stateTimer = 3.8;
    this.syncTimerHud();
  }

  private damagePlayer(): void {
    if (!this.player) return;
    if (this.player.takeDamage()) {
      this.ctx.sound.playPlayerHit();
      this.ctx.particles.spawnBurst(this.player.group.position, 10, [0xef4444, 0xfacc15], 6);
      this.syncHud();
      if (this.player.hp <= 0) {
        this.triggerGameOver();
      }
    }
  }

  private triggerGameOver(customQuote?: string, keepRemainingHp = false): void {
    this.state = 'game_over';
    this.syncTimerHud();
    if (!keepRemainingHp) {
      LeaderboardManager.saveScore(this.ctx.playerName, this.ctx.score);
    }

    const msgs = classConfig.gameOverMessages;
    const quote = customQuote ?? msgs[Math.floor(Math.random() * msgs.length)];

    const root = this.ctx.ui.getRoot();
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop interactive';
    modal.innerHTML = `
      <div class="modal-card">
        <img src="./assets/mentor.png" class="mentor-portrait" alt="Mentor" onerror="this.style.display='none'" />
        <h2 style="color:#38bdf8;margin-bottom:6px;">${this.ctx.ui.escapeHtml(classConfig.teacherName)} nhắn nhủ:</h2>
        <p class="mentor-quote">"${this.ctx.ui.escapeHtml(quote)}"</p>
        <button id="retry-stage-btn" class="btn-primary" style="margin-bottom:10px;">🔄 Debug lại màn này</button>
        <button id="back-menu-btn" class="skip-btn" style="width:100%;">Về màn hình chính</button>
      </div>
    `;
    root.appendChild(modal);

    document.getElementById('retry-stage-btn')?.addEventListener('click', () => {
      modal.remove();
      const remainingHp = this.player?.hp ?? 0;
      this.player?.reset();
      if (keepRemainingHp && this.player && remainingHp > 0) {
        this.player.hp = remainingHp;
      }
      this.projectiles?.clearAll();
      this.startStage(this.stageIndex);
    });

    document.getElementById('back-menu-btn')?.addEventListener('click', () => {
      this.ctx.switchScene('menu');
    });
  }

  private advanceToNextStage(): void {
    this.clearStageEntities();
    if (this.stageIndex + 1 < STAGES_CONFIG.length) {
      this.startStage(this.stageIndex + 1);
    } else {
      this.ctx.sound.playVictory();
      this.ctx.switchScene('ending');
    }
  }

  private clearStageEntities(): void {
    for (const enemy of this.enemies) {
      enemy.destroy(this.ctx.threeScene);
    }
    this.enemies = [];
    if (this.boss) {
      this.boss.destroy(this.ctx.threeScene);
      this.boss = null;
    }
    this.projectiles?.clearAll();
    this.pickups?.clearAll();
    this.syncBossBar();
  }

  public exit(): void {
    this.unbindInputs();
    this.clearStageEntities();
    if (this.player) {
      this.ctx.threeScene.remove(this.player.group);
      this.player = null;
    }
    if (this.gridHelper) {
      this.ctx.threeScene.remove(this.gridHelper);
      this.gridHelper = null;
    }
    if (this.bgPlane) {
      this.ctx.threeScene.remove(this.bgPlane);
      this.bgPlane = null;
    }
    this.ctx.camera.position.set(0, GAME_CONSTANTS.CAMERA_POS_Y, GAME_CONSTANTS.CAMERA_POS_Z);
    this.ctx.ui.clear();
  }
}

