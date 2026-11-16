import { classConfig } from '../config/classConfig';
import { PlayerShip } from '../entities/PlayerShip';
import { LeaderboardManager } from '../systems/LeaderboardManager';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class MenuScene implements GameSceneInterface {
  private demoShip: PlayerShip | null = null;
  private elapsed = 0;

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.ctx.score = 0;
    this.ctx.easterEggFlowerMode = false;
    this.ctx.sound.setFestiveMode(false);

    // Hiển thị Laptop có cánh 3D xoay nhẹ làm nền Landing
    this.demoShip = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.demoShip.group.position.set(0, 1.4, 2.2);

    const top10 = LeaderboardManager.getTop10();
    const leaderboardRows =
      top10.length > 0
        ? top10
            .map((entry, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
              return `
                <div class="lb-row ${idx < 3 ? 'lb-top' : ''}">
                  <span class="lb-rank">${medal}</span>
                  <div class="lb-info">
                    <div class="lb-name">${this.ctx.ui.escapeHtml(entry.name)}</div>
                    <div class="lb-title">${this.ctx.ui.escapeHtml(entry.rankTitle)}</div>
                  </div>
                  <span class="lb-score">${entry.score.toLocaleString('vi-VN')}</span>
                </div>
              `;
            })
            .join('')
        : `<div class="lb-empty">Chưa có lượt chơi nào.<br/>Hãy là người đầu tiên ghi danh! ✨</div>`;

    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="landing-screen interactive">
        <div class="landing-shell">
          <div class="landing-topbar">
            <div class="menu-badge">🌹 CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11</div>
            <div class="stage-roadmap">
              <span>1. HTML/CSS</span>
              <span class="arrow">→</span>
              <span>2. JavaScript</span>
              <span class="arrow">→</span>
              <span>3. Java Core</span>
              <span class="arrow">→</span>
              <span>4. SQL/DB</span>
              <span class="arrow">→</span>
              <span class="final">5. DEADLINE</span>
            </div>
          </div>

          <div class="landing-grid">
            <div class="menu-card landing-hero">
              <h1 class="menu-title">CodeGym Invaders:<br/>Bảo vệ ngày 20/11</h1>
              <p class="menu-subtitle">
                Điều khiển <strong>Laptop có cánh 3D</strong>, bắn hoa hồng tri ân và vượt qua 5 chặng Bug để gửi lá thư cảm ơn đến <strong>${this.ctx.ui.escapeHtml(classConfig.teacherName)}</strong>!
              </p>

              <div class="input-group">
                <label for="player-name-input">Tên người chơi (hoặc mã bí mật)</label>
                <input
                  id="player-name-input"
                  class="text-input"
                  type="text"
                  maxlength="32"
                  placeholder="Nhập tên của bạn..."
                  value="${this.ctx.ui.escapeHtml(this.ctx.playerName)}"
                />
              </div>

              <button id="start-game-btn" class="btn-primary btn-glow">🚀 Bắt đầu Debug</button>
              <div id="easter-egg-feedback"></div>

              <div class="controls-strip">
                <span>🖱️ Di chuyển &amp; Click để bắn</span>
                <span>⌨️ WASD / Mũi tên + Space</span>
                <span>📱 Chạm &amp; Kéo</span>
              </div>
              <p class="menu-hint">
                Mẹo: Thử nhập <code>20/11</code> hoặc <code>sudo thank-you</code>!
              </p>
            </div>

            <div class="menu-card leaderboard-card">
              <div class="lb-header">
                <span class="lb-badge">🏆 BẢNG XẾP HẠNG TOP 10</span>
                <div class="lb-actions">
                  <span class="lb-sub">Điểm cao nhất</span>
                  ${top10.length > 0 ? '<button id="clear-lb-btn" class="lb-clear-btn" title="Xóa bảng xếp hạng">🗑️ Xóa</button>' : ''}
                </div>
              </div>
              <div id="lb-list" class="lb-list">
                ${leaderboardRows}
              </div>
            </div>
          </div>

          <div class="landing-footer">
            "Mỗi bug được fix là một bài học. Đằng sau mỗi lần fix là một người thầy kiên nhẫn." ❤
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById('player-name-input') as HTMLInputElement;
    const btn = document.getElementById('start-game-btn') as HTMLButtonElement;
    const feedback = document.getElementById('easter-egg-feedback') as HTMLElement;
    const clearLbBtn = document.getElementById('clear-lb-btn');
    const lbList = document.getElementById('lb-list');

    clearLbBtn?.addEventListener('click', () => {
      LeaderboardManager.clear();
      if (lbList) {
        lbList.innerHTML = `<div class="lb-empty">Chưa có lượt chơi nào.<br/>Hãy là người đầu tiên ghi danh! ✨</div>`;
      }
      clearLbBtn.remove();
    });

    const checkEasterEgg = (val: string) => {
      const normalized = val.trim().toLowerCase();
      if (normalized === classConfig.skipToEndingCommand.toLowerCase()) {
        feedback.innerHTML = `<div class="easter-banner">✨ Đã kích hoạt: Mở thẳng Lá thư tri ân!</div>`;
        return;
      }
      const isFlowerEgg = classConfig.easterEggKeywords.some((kw) =>
        normalized.includes(kw.toLowerCase())
      );
      if (isFlowerEgg) {
        feedback.innerHTML = `<div class="easter-banner">🌹 Easter Egg 20/11: Đạn hoa toàn màn hình &amp; Nhạc lễ hội!</div>`;
      } else {
        feedback.innerHTML = '';
      }
    };

    input.addEventListener('input', () => checkEasterEgg(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });

    btn.addEventListener('click', () => {
      this.ctx.sound.unlock();
      const rawName = input.value.trim();
      const normalized = rawName.toLowerCase();

      if (normalized === classConfig.skipToEndingCommand.toLowerCase()) {
        this.ctx.playerName = 'Học viên';
        this.ctx.sound.setFestiveMode(true);
        this.ctx.sound.startBgm();
        this.ctx.switchScene('ending');
        return;
      }

      const isFlowerEgg = classConfig.easterEggKeywords.some((kw) =>
        normalized.includes(kw.toLowerCase())
      );
      this.ctx.easterEggFlowerMode = isFlowerEgg;
      this.ctx.sound.setFestiveMode(isFlowerEgg);
      this.ctx.playerName = rawName || 'Học viên';
      this.ctx.sound.startBgm();
      this.ctx.switchScene('intro');
    });

    checkEasterEgg(input.value);
  }

  public update(dt: number): void {
    this.elapsed += dt;
    if (this.demoShip) {
      this.demoShip.group.rotation.y = Math.sin(this.elapsed * 0.9) * 0.35;
      this.demoShip.group.position.y = 1.4 + Math.sin(this.elapsed * 2.5) * 0.18;
    }
  }

  public exit(): void {
    if (this.demoShip) {
      this.ctx.threeScene.remove(this.demoShip.group);
      this.demoShip = null;
    }
    this.ctx.ui.clear();
  }
}
