import * as THREE from 'three';
import { classConfig } from '../config/classConfig';
import { INTRO_SCRIPT } from '../config/stagesConfig';
import { PlayerShip } from '../entities/PlayerShip';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class IntroScene implements GameSceneInterface {
  private timers: number[] = [];
  private typeInterval: number | null = null;
  private heroShip: PlayerShip | null = null;
  private introGrid: THREE.GridHelper | null = null;
  private elapsed = 0;
  private wingsAwakened = false;

  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape' || e.code === 'Enter') {
      this.ctx.switchScene('game');
    }
  };

  constructor(private readonly ctx: GameContext) { }

  public enter(): void {
    this.elapsed = 0;
    this.wingsAwakened = false;

    // Dựng bối cảnh 3D lớp học/không gian số ban đêm phía sau cắt cảnh Intro
    this.ctx.threeScene.background = new THREE.Color(0x0f172a);
    this.introGrid = new THREE.GridHelper(100, 48, 0x38bdf8, 0x1e293b);
    this.introGrid.position.y = -1.2;
    (this.introGrid.material as THREE.Material).transparent = true;
    (this.introGrid.material as THREE.Material).opacity = 0.4;
    this.ctx.threeScene.add(this.introGrid);

    // Tạo Laptop 3D ở giữa màn hình (ban đầu thu nhỏ, sẽ bừng sáng và sải cánh ở bước 3)
    this.heroShip = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.heroShip.group.position.set(0, 1.0, 4.5);
    this.heroShip.group.scale.setScalar(0.75);

    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="intro-screen interactive">
        <div class="intro-shell">
          <!-- Thanh trạng thái hệ thống phía trên -->
          <div class="intro-topbar">
            <div class="intro-brand">
              <span class="pulse-dot"></span>
              <span>CODEGYM DEFENSE OS v20.11</span>
            </div>
            <div id="intro-status-badge" class="intro-status-badge">SYSTEM BOOTING...</div>
            <button id="skip-intro-btn" class="skip-btn intro-skip">Bỏ qua Intro [Enter] &gt;&gt;</button>
          </div>

          <!-- Khu vực chính 2 cột: Terminal gõ chữ & Màn hình Cắt cảnh Trực quan -->
          <div class="intro-main-grid">
            <!-- Cột Trái: Cửa sổ Terminal gõ chữ từng ký tự -->
            <div class="terminal-window">
              <div class="terminal-header">
                <div class="term-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <div class="term-title">bash — codegym_guardian@20-11:~</div>
                <div id="term-bug-counter" class="term-telemetry">BUGS: 0</div>
              </div>
              <div class="terminal-body">
                <div id="terminal-lines" class="terminal-lines"></div>
              </div>
              <div class="terminal-footer">
                <span>TARGET: LỄ TRI ÂN 20/11</span>
                <span>PILOT: ${this.ctx.ui.escapeHtml(this.ctx.playerName)}</span>
              </div>
            </div>

            <!-- Cột Phải: Màn hình Cắt cảnh (Hologram Boss -> Laptop mọc cánh -> Tin nhắn Thầy/Cô) -->
            <div class="cutscene-panel">
              <div id="cutscene-stage-card" class="cutscene-card">
                <div class="radar-scan-box">
                  <div class="radar-circle"></div>
                  <div class="radar-label">ĐANG QUÉT HỆ THỐNG LỚP HỌC...</div>
                  <p class="radar-sub">Kiểm tra toàn vẹn dữ liệu sự kiện 20/11</p>
                </div>
              </div>

              <!-- Hộp tin nhắn động viên của Thầy/Cô xuất hiện ở cuối Intro -->
              <div id="intro-mentor-card" class="intro-mentor-card hidden">
                <img src="./assets/mentor.png" class="intro-mentor-avatar" alt="Mentor" onerror="this.style.display='none'" />
                <div class="intro-mentor-content">
                  <div class="intro-mentor-header">
                    <span class="mentor-tag">📡 TIN NHẮN TỪ ${this.ctx.ui.escapeHtml(classConfig.teacherName)}</span>
                    <span class="mentor-wave">ılılılı</span>
                  </div>
                  <div id="intro-mentor-text" class="intro-mentor-text"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Thanh tiến trình 4 bước cắt cảnh phía dưới -->
          <div class="intro-timeline">
            <div id="step-1" class="timeline-step active">
              <span class="step-num">01</span>
              <span class="step-text">Khởi động hệ thống</span>
            </div>
            <div id="step-2" class="timeline-step">
              <span class="step-num">02</span>
              <span class="step-text">Cảnh báo 9999 Bug</span>
            </div>
            <div id="step-3" class="timeline-step">
              <span class="step-num">03</span>
              <span class="step-text">Laptop mọc cánh 3D</span>
            </div>
            <div id="step-4" class="timeline-step">
              <span class="step-num">04</span>
              <span class="step-text">Lệnh xuất kích</span>
            </div>
          </div>
        </div>
      </div>
    `;

    window.addEventListener('keydown', this.onKeyDown);

    const container = document.getElementById('terminal-lines') as HTMLElement;
    const skipBtn = document.getElementById('skip-intro-btn') as HTMLButtonElement;
    const statusBadge = document.getElementById('intro-status-badge') as HTMLElement;
    const bugCounter = document.getElementById('term-bug-counter') as HTMLElement;
    const cutsceneCard = document.getElementById('cutscene-stage-card') as HTMLElement;
    const mentorCard = document.getElementById('intro-mentor-card') as HTMLElement;
    const mentorText = document.getElementById('intro-mentor-text') as HTMLElement;

    skipBtn.addEventListener('click', () => {
      this.ctx.switchScene('game');
    });

    const activateStep = (stepNum: number) => {
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`step-${i}`);
        if (!el) continue;
        el.classList.toggle('active', i === stepNum);
        el.classList.toggle('done', i < stepNum);
      }
    };

    const appendTypedLine = (text: string, cls: string) => {
      if (this.typeInterval !== null) {
        clearInterval(this.typeInterval);
        this.typeInterval = null;
      }
      const p = document.createElement('div');
      p.className = `${cls} typing-cursor`;
      container.appendChild(p);

      let charIdx = 0;
      this.typeInterval = window.setInterval(() => {
        charIdx += 2;
        p.textContent = text.slice(0, charIdx);
        if (charIdx >= text.length) {
          p.classList.remove('typing-cursor');
          if (this.typeInterval !== null) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
          }
        }
      }, 18);
    };

    // Bước 1: Booting
    this.schedule(150, () => {
      activateStep(1);
      appendTypedLine(INTRO_SCRIPT.terminalLines[0], 'terminal-line');
    });

    // Bước 2: Phát hiện 9999 bug xâm nhập
    this.schedule(1300, () => {
      activateStep(2);
      this.ctx.sound.playBossWarning();
      statusBadge.textContent = '⚠️ WARNING: 9999 BUGS DETECTED';
      statusBadge.classList.add('alert');
      bugCounter.textContent = 'BUGS: 9999 ⚠️';
      bugCounter.classList.add('alert');
      appendTypedLine(INTRO_SCRIPT.terminalLines[1], 'terminal-line warn');
    });

    this.schedule(2300, () => {
      appendTypedLine(INTRO_SCRIPT.terminalLines[2], 'terminal-line warn');
    });

    // Bug Tổng Quản xuất hiện
    this.schedule(3300, () => {
      this.ctx.sound.playBossWarning();
      appendTypedLine(INTRO_SCRIPT.bugOverlordLine, 'terminal-line boss');
      cutsceneCard.innerHTML = `
        <div class="overlord-alert-box">
          <div class="overlord-header">⚡ TÍN HIỆU XÂM NHẬP TRÁI PHÉP ⚡</div>
          <img src="./assets/bosses/boss-5.png" class="overlord-img" alt="Bug Tổng Quản" />
          <div class="overlord-name">BUG TỔNG QUẢN</div>
          <p class="overlord-quote">"Hahaha! Ngày mai là 20/11 phải không? Tao sẽ biến buổi lễ thành một đống Syntax Error!"</p>
        </div>
      `;
    });

    // Bước 3: Cắt cảnh Laptop sáng lên, mọc đôi cánh 3D
    this.schedule(5200, () => {
      activateStep(3);
      this.wingsAwakened = true;
      this.ctx.sound.playPickup(true);
      if (this.heroShip) {
        this.ctx.particles.spawnBurst(
          this.heroShip.group.position,
          40,
          [0x38bdf8, 0xfacc15, 0xfb7185, 0xffffff],
          9
        );
      }
      statusBadge.textContent = '✨ WINGED LAPTOP: ONLINE';
      statusBadge.classList.remove('alert');
      statusBadge.classList.add('ready');

      appendTypedLine(
        `> ✨ Laptop của ${this.ctx.playerName} sáng lên, mọc đôi cánh 3D!`,
        'terminal-line'
      );

      cutsceneCard.innerHTML = `
        <div class="awakening-box">
          <div class="awakening-badge">✨ KÍCH HOẠT PHI THUYỀN CHIẾN ĐẤU ✨</div>
          <div class="awakening-title">LAPTOP CÓ CÁNH 3D — SẴN SÀNG!</div>
          <div class="awakening-specs">
            <span>🪽 Đôi cánh Hologram: <strong>ONLINE</strong></span>
            <span>🌹 Pháo Hoa Hồng: <strong>READY</strong></span>
            <span>🛡️ Khiên Try/Catch: <strong>ACTIVE</strong></span>
          </div>
        </div>
      `;
    });

    // Bước 4: Tin nhắn của Thầy/Cô
    this.schedule(6700, () => {
      activateStep(4);
      this.ctx.sound.playVictory();
      appendTypedLine(
        `${classConfig.teacherName}: "${INTRO_SCRIPT.mentorStartLine}"`,
        'terminal-line mentor'
      );
      mentorCard.classList.remove('hidden');
      mentorText.textContent = `"${INTRO_SCRIPT.mentorStartLine}"`;
      skipBtn.textContent = '🚀 Xuất kích ngay! [Enter]';
      skipBtn.classList.add('ready-cta');
    });

    // Tự động chuyển vào GameScene
    this.schedule(9500, () => {
      this.ctx.switchScene('game');
    });
  }

  private schedule(delayMs: number, fn: () => void): void {
    const id = window.setTimeout(fn, delayMs);
    this.timers.push(id);
  }

  public update(dt: number): void {
    this.elapsed += dt;
    if (this.introGrid) {
      this.introGrid.position.z = (this.introGrid.position.z + dt * (this.wingsAwakened ? 6 : 2)) % 2.0;
    }
    if (this.heroShip) {
      if (this.wingsAwakened) {
        this.heroShip.group.scale.lerp(new THREE.Vector3(1.25, 1.25, 1.25), dt * 4);
        this.heroShip.group.position.y = 1.6 + Math.sin(this.elapsed * 4) * 0.22;
        this.heroShip.group.rotation.y = Math.sin(this.elapsed * 1.8) * 0.35;
      } else {
        this.heroShip.group.position.y = 1.0 + Math.sin(this.elapsed * 2) * 0.1;
        this.heroShip.group.rotation.y = Math.sin(this.elapsed * 0.8) * 0.15;
      }
    }
  }

  public exit(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
    if (this.typeInterval !== null) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    if (this.heroShip) {
      this.ctx.threeScene.remove(this.heroShip.group);
      this.heroShip = null;
    }
    if (this.introGrid) {
      this.ctx.threeScene.remove(this.introGrid);
      this.introGrid = null;
    }
    this.ctx.particles.clear();
    this.ctx.ui.clear();
  }
}
