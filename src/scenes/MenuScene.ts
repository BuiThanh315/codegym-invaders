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
    const slotsHtml: string[] = [];
    for (let idx = 0; idx < 10; idx++) {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
      const entry = top10[idx];
      if (entry) {
        slotsHtml.push(`
          <div class="lb-row ${idx < 3 ? 'lb-top' : ''}">
            <span class="lb-rank">${medal}</span>
            <div class="lb-info">
              <div class="lb-name">${this.ctx.ui.escapeHtml(entry.name)}</div>
              <div class="lb-title">${this.ctx.ui.escapeHtml(entry.rankTitle)}</div>
            </div>
            <span class="lb-score">${entry.score.toLocaleString('vi-VN')}</span>
          </div>
        `);
      } else {
        slotsHtml.push(`
          <div class="lb-row lb-placeholder">
            <span class="lb-rank">${medal}</span>
            <div class="lb-info">
              <div class="lb-name">Chờ người chơi ghi danh...</div>
              <div class="lb-title">${idx < 3 ? 'Học trò ruột của Thầy/Cô' : idx < 7 ? 'Debug Master' : 'Học viên mới'}</div>
            </div>
            <span class="lb-score">---</span>
          </div>
        `);
      }
    }

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
            <!-- Cột Trái: Nhiệm vụ, Thể lệ & Danh sách 5 Boss -->
            <div class="menu-card mission-card">
              <div class="lb-header">
                <span class="lb-badge" style="color:#38bdf8;">🎯 NHIỆM VỤ &amp; THỂ LỆ</span>
                <span class="lb-sub">5 Chặng • 5 Boss</span>
              </div>

              <div class="mission-mentor-box">
                <img src="./assets/mentor.png" class="mission-mentor-img" alt="Mentor" onerror="this.style.display='none'" />
                <div>
                  <div class="mission-mentor-name">${this.ctx.ui.escapeHtml(classConfig.teacherName)} nhắn nhủ:</div>
                  <div class="mission-mentor-text">"Hệ thống đang có 9999 bug xâm nhập. Cùng nhau debug bảo vệ buổi lễ 20/11 nhé!"</div>
                </div>
              </div>

              <div class="rules-grid">
                <div class="rule-item">
                  <span class="rule-icon">👾</span>
                  <div class="rule-text">
                    <strong>Hạ Quái Thường (15 quái/đợt)</strong>
                    <p>Màn 1–5 cần 1–5 phát bắn • Rơi hoa &amp; mạng</p>
                  </div>
                  <span class="rule-badge cyan">+30 Đ</span>
                </div>
                <div class="rule-item">
                  <span class="rule-icon">👹</span>
                  <div class="rule-text">
                    <strong>Tiêu Diệt Boss Cuối Màn</strong>
                    <p>Mỗi viên đạn trừ 10 HP của Boss</p>
                  </div>
                  <span class="rule-badge gold">+500 Đ</span>
                </div>
                <div class="rule-item">
                  <span class="rule-icon">🌹</span>
                  <div class="rule-text">
                    <strong>Nhặt Bông Hoa Tri Ân</strong>
                    <p>70% rơi 1 hoa • 25% rơi 2 hoa từ quái</p>
                  </div>
                  <span class="rule-badge rose">+10 Đ</span>
                </div>
                <div class="rule-item">
                  <span class="rule-icon">❤</span>
                  <div class="rule-text">
                    <strong>Nhặt Trái Tim (Tối đa 3 mạng)</strong>
                    <p>Đầy 3 mạng sẽ quy đổi thành điểm thưởng</p>
                  </div>
                  <span class="rule-badge green">+1 ❤ / +50 Đ</span>
                </div>
                <div class="rule-item">
                  <span class="rule-icon">⏱️</span>
                  <div class="rule-text">
                    <strong>Thời Gian Giới Hạn</strong>
                    <p>Hết giờ Boss chưa hạ sẽ bị trừ 1 mạng</p>
                  </div>
                  <span class="rule-badge amber">60s / 90s</span>
                </div>
              </div>

              <div class="boss-lineup-preview">
                <div class="boss-lineup-title">🔥 5 BOSS ĐANG CHỜ PHÍA TRƯỚC</div>
                <div class="boss-lineup-icons">
                  <div class="boss-mini-item"><img src="./assets/bosses/boss-1.png" alt="B1" /><span>Màn 1</span></div>
                  <div class="boss-mini-item"><img src="./assets/bosses/boss-2.png" alt="B2" /><span>Màn 2</span></div>
                  <div class="boss-mini-item"><img src="./assets/bosses/boss-3.png" alt="B3" /><span>Màn 3</span></div>
                  <div class="boss-mini-item"><img src="./assets/bosses/boss-4.png" alt="B4" /><span>Màn 4</span></div>
                  <div class="boss-mini-item"><img src="./assets/bosses/boss-5.png" alt="B5" /><span>Màn 5</span></div>
                </div>
              </div>
            </div>

            <!-- Cột Giữa: Trung tâm Khởi hành & Cấp bậc Danh hiệu -->
            <div class="menu-card landing-hero">
              <div class="hero-top-banner">
                <div class="hero-feature-pills">
                  <span>🎮 Đồ họa 3D WebGL</span>
                  <span>🚀 5 Chặng Lập Trình</span>
                  <span>💌 Lá Thư Tri Ân 20/11</span>
                </div>
                <h1 class="menu-title">CodeGym Invaders:<br/>Bảo vệ ngày 20/11</h1>
                <p class="menu-subtitle">
                  Lái chiếc <strong>Laptop có cánh 3D</strong>, bắn hoa hồng đẩy lùi binh đoàn Bug và gửi lời cảm ơn chân thành đến <strong>${this.ctx.ui.escapeHtml(classConfig.teacherName)}</strong>!
                </p>
              </div>

              <div class="hero-launch-box">
                <div class="input-group">
                  <label for="player-name-input">👤 Nhập tên học viên (hoặc mã Easter Egg):</label>
                  <input
                    id="player-name-input"
                    class="text-input"
                    type="text"
                    maxlength="32"
                    placeholder="Nhập tên của bạn để ghi danh BXH..."
                    value="${this.ctx.ui.escapeHtml(this.ctx.playerName)}"
                  />
                </div>

                <button id="start-game-btn" class="btn-primary btn-glow">🚀 BẮT ĐẦU CHIẾN DỊCH DEBUG</button>
                <div id="easter-egg-feedback"></div>

                <div class="controls-strip">
                  <span>🖱️ Di chuyển chuột &amp; Click để bắn</span>
                  <span>⌨️ WASD / Mũi tên + Space</span>
                  <span>📱 Chạm &amp; Kéo</span>
                </div>
              </div>

              <div class="hero-tier-guide">
                <div class="tier-guide-title">🏅 CẤP BẬC DANH HIỆU THEO BẢNG XẾP HẠNG</div>
                <div class="tier-guide-grid">
                  <div class="tier-pill gold">
                    <strong>🥇 Hạng 1 – 3</strong>
                    <span>Học trò ruột của Thầy/Cô</span>
                  </div>
                  <div class="tier-pill cyan">
                    <strong>🥈 Hạng 4 – 7</strong>
                    <span>Debug Master</span>
                  </div>
                  <div class="tier-pill slate">
                    <strong>🥉 Hạng 8 – 10</strong>
                    <span>Học viên mới</span>
                  </div>
                </div>
                <p class="menu-hint">
                  💡 Mẹo bí mật: Nhập <code>20/11</code> để bật mưa đạn hoa lễ hội, hoặc <code>sudo thank-you</code> để mở thẳng Lá thư tri ân!
                </p>
              </div>
            </div>

            <!-- Cột Phải: Bảng Xếp Hạng Top 10 (Luôn hiển thị đủ 10 vị trí) -->
            <div class="menu-card leaderboard-card">
              <div class="lb-header">
                <span class="lb-badge">🏆 BẢNG XẾP HẠNG TOP 10</span>
                <div class="lb-actions">
                  <span class="lb-sub">Điểm cao nhất</span>
                  ${top10.length > 0 ? '<button id="clear-lb-btn" class="lb-clear-btn" title="Xóa bảng xếp hạng">🗑️ Xóa</button>' : ''}
                </div>
              </div>
              <div id="lb-list" class="lb-list">
                ${slotsHtml.join('')}
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

    clearLbBtn?.addEventListener('click', () => {
      LeaderboardManager.clear();
      this.enter();
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
