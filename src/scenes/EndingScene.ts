import * as THREE from 'three';
import { classConfig } from '../config/classConfig';
import { getRankByScore } from '../config/gameConstants';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class EndingScene implements GameSceneInterface {
  private petalTimer = 0;
  private fireworkTimer = 0;
  private typeTimer: number | null = null;

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.ctx.threeScene.background = new THREE.Color(0x0f172a);
    this.ctx.sound.setFestiveMode(true);
    this.ctx.sound.startBgm();

    const rank = getRankByScore(this.ctx.score);
    const letterText = `Gửi ${classConfig.teacherName},

Nhân ngày 20/11, cả lớp ${classConfig.className} muốn nói lời cảm ơn vì đã kiên nhẫn với từng bug, từng câu hỏi ngớ ngẩn, từng buổi tối thầy cô ở lại giải thích.

${classConfig.classMemory}

Chúc ${classConfig.teacherName} luôn khỏe, và mãi là người mentor tuyệt vời của chúng em.

Học trò của Thầy/Cô, ${this.ctx.playerName} và cả lớp ${classConfig.className}.`;

    const creditsHtml = classConfig.studentList
      .map((name) => `<span>✨ ${this.ctx.ui.escapeHtml(name)}</span>`)
      .join('');

    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="ending-screen interactive">
        <div class="letter-card">
          <img src="./assets/mentor.png" class="mentor-portrait" alt="Mentor" onerror="this.style.display='none'" />
          <div class="letter-title">🌹 LÁ THƯ TRI ÂN NGÀY 20/11 🌹</div>
          <div id="letter-body" class="letter-body"></div>
          <div class="rank-box">
            <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Danh hiệu của ${this.ctx.ui.escapeHtml(this.ctx.playerName)} (${this.ctx.score} điểm)</div>
            <div class="rank-badge">🏆 ${this.ctx.ui.escapeHtml(rank.title)}</div>
            <div style="font-size:13px;color:#f8fafc;margin-top:4px;">"${this.ctx.ui.escapeHtml(rank.message)}"</div>
          </div>
          <div class="credits-box">
            <div style="font-size:13px;font-weight:700;color:#fb7185;">TẬP THỂ LỚP ${this.ctx.ui.escapeHtml(classConfig.className)}</div>
            <div class="credits-list">${creditsHtml}</div>
            <div class="build-success">&gt; build success. Cảm ơn Thầy/Cô. ❤</div>
            <button id="replay-btn" class="btn-primary btn-rose">Chơi lại từ đầu</button>
          </div>
        </div>
      </div>
    `;

    const letterEl = document.getElementById('letter-body') as HTMLElement;
    let idx = 0;
    this.typeTimer = window.setInterval(() => {
      idx += 3;
      letterEl.textContent = letterText.slice(0, idx);
      if (idx >= letterText.length && this.typeTimer !== null) {
        clearInterval(this.typeTimer);
        this.typeTimer = null;
      }
    }, 28);

    document.getElementById('replay-btn')?.addEventListener('click', () => {
      this.ctx.switchScene('menu');
    });
  }

  public update(dt: number): void {
    // Mưa hoa hồng 3D
    this.petalTimer += dt;
    if (this.petalTimer >= 0.08) {
      this.petalTimer = 0;
      this.ctx.particles.spawnFallingPetal(12, 8, -12, 8);
    }

    // Pháo hoa 3D
    this.fireworkTimer += dt;
    if (this.fireworkTimer >= 1.1) {
      this.fireworkTimer = 0;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        3 + Math.random() * 4,
        -6 + Math.random() * 6
      );
      this.ctx.particles.spawnBurst(pos, 26, [0xfb7185, 0xfacc15, 0x38bdf8, 0x4ade80], 8);
    }
  }

  public exit(): void {
    if (this.typeTimer !== null) {
      clearInterval(this.typeTimer);
      this.typeTimer = null;
    }
    this.ctx.particles.clear();
    this.ctx.ui.clear();
  }
}

