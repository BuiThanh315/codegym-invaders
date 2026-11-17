import * as THREE from 'three';
import { classConfig } from '../config/classConfig';
import { PlayerShip } from '../entities/PlayerShip';
import { LeaderboardManager } from '../systems/LeaderboardManager';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class EndingScene implements GameSceneInterface {
  private petalTimer = 0;
  private fireworkTimer = 0;
  private elapsed = 0;
  private typeTimer: number | null = null;
  private victoryShipLeft: PlayerShip | null = null;
  private victoryShipRight: PlayerShip | null = null;
  private festiveGrid: THREE.GridHelper | null = null;

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.ctx.threeScene.background = new THREE.Color(0x281e46);
    if (this.ctx.threeScene.fog instanceof THREE.FogExp2) {
      this.ctx.threeScene.fog.color.setHex(0x281e46);
    }
    this.ctx.sound.setFestiveMode(true);
    this.ctx.sound.startBgm();

    this.festiveGrid = new THREE.GridHelper(120, 50, 0xfb7185, 0x4c1d95);
    this.festiveGrid.position.y = -2.0;
    (this.festiveGrid.material as THREE.Material).transparent = true;
    (this.festiveGrid.material as THREE.Material).opacity = 0.45;
    this.ctx.threeScene.add(this.festiveGrid);

    this.victoryShipLeft = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.victoryShipLeft.group.position.set(-11.5, 1.2, 1.5);
    this.victoryShipLeft.group.rotation.y = -0.35;

    this.victoryShipRight = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.victoryShipRight.group.position.set(11.5, 1.2, 1.5);
    this.victoryShipRight.group.rotation.y = 0.35;

    const { placement, rank } = LeaderboardManager.saveScore(this.ctx.playerName, this.ctx.score);
    const placementBadge =
      placement !== null
        ? `<span class="ending-stat-pill gold">🏅 Hạng #${placement} BXH</span>`
        : `<span class="ending-stat-pill">✨ Hoàn thành 5 chặng</span>`;

    const letterText = `Kính gửi ${classConfig.teacherName},

Nhân ngày Nhà giáo Việt Nam 20/11, tập thể học viên ${classConfig.className} xin gửi tới ${classConfig.teacherName} lời tri ân sâu sắc và chân thành nhất vì đã luôn kiên nhẫn với từng dòng bug, từng câu hỏi ngớ ngẩn và từng buổi tối ở lại muộn để giảng bài cho chúng em.

${classConfig.classMemory}

Mỗi lỗi code được sửa lại là một bài học quý giá, và đằng sau sự trưởng thành của chúng em ngày hôm nay luôn là sự dìu dắt âm thầm, ấm áp của ${classConfig.teacherName}.

Kính chúc ${classConfig.teacherName} luôn dồi dào sức khỏe, ngập tràn niềm vui, giữ mãi ngọn lửa nhiệt huyết ("100% Uptime • 0 Bug") và mãi là người Mentor tuyệt vời nhất của chúng em!

Học trò của Thầy/Cô — ${this.ctx.playerName} & Tập thể ${classConfig.className}. ❤`;

    const topPlayers = LeaderboardManager.getTop10().slice(0, 5);
    const creditNames =
      classConfig.studentList.length > 0
        ? classConfig.studentList
        : Array.from(new Set(topPlayers.map((e) => e.name)));

    const creditsHtml =
      creditNames.length > 0
        ? creditNames
            .map((name) => `<span class="credit-chip">🌸 ${this.ctx.ui.escapeHtml(name)}</span>`)
            .join('')
        : `<span class="credit-chip">🌸 Tập thể học viên ${this.ctx.ui.escapeHtml(classConfig.className)}</span>`;

    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="ending-screen interactive">
        <div class="ending-bg-decor left-glow"></div>
        <div class="ending-bg-decor right-glow"></div>

        <div class="ending-shell">
          <!-- Thanh trang trí phía trên: Hành trình 5 chặng đã vượt qua -->
          <div class="ending-top-banner">
            <div class="top-banner-brand">🎓 CODEGYM • LỄ TRI ÂN 20/11</div>
            <div class="top-banner-stages">
              <span class="stage-done-pill">✅ Màn 1: HTML/CSS</span>
              <span class="stage-done-pill">✅ Màn 2: JavaScript</span>
              <span class="stage-done-pill">✅ Màn 3: Java Core</span>
              <span class="stage-done-pill">✅ Màn 4: SQL/Database</span>
              <span class="stage-done-pill final">🏆 Màn 5: Vượt DEADLINE</span>
            </div>
          </div>

          <!-- Bố cục 3 cột lấp đầy không gian màn hình -->
          <div class="ending-bento-grid">
            <!-- Cột Trái: Nhật ký 5 chặng kèm hình Boss đã chinh phục -->
            <div class="ending-side-card journey-card">
              <div class="side-card-title">💡 NHẬT KÝ CHINH PHỤC 5 CHẶNG</div>
              <div class="lesson-list">
                <div class="lesson-item">
                  <img src="./assets/bosses/boss-1.png" class="lesson-boss-img" alt="Boss 1" />
                  <div class="lesson-content">
                    <div class="lesson-top-row">
                      <strong>Màn 1: HTML / CSS</strong>
                      <span class="lesson-tag html">&lt;/div&gt;</span>
                    </div>
                    <p>Xây nền tảng vững vàng, mở thẻ nhớ đóng thẻ đầy đủ để giao diện không bao giờ vỡ.</p>
                  </div>
                </div>
                <div class="lesson-item">
                  <img src="./assets/bosses/boss-2.png" class="lesson-boss-img" alt="Boss 2" />
                  <div class="lesson-content">
                    <div class="lesson-top-row">
                      <strong>Màn 2: JavaScript</strong>
                      <span class="lesson-tag js">break;</span>
                    </div>
                    <p>Kiểm soát vòng lặp, biết dừng đúng lúc và bình tĩnh phân tích mọi kiểu dữ liệu.</p>
                  </div>
                </div>
                <div class="lesson-item">
                  <img src="./assets/bosses/boss-3.png" class="lesson-boss-img" alt="Boss 3" />
                  <div class="lesson-content">
                    <div class="lesson-top-row">
                      <strong>Màn 3: Java Core</strong>
                      <span class="lesson-tag java">!= null</span>
                    </div>
                    <p>Tư duy hướng đối tượng chặt chẽ, luôn kiểm tra kỹ lưỡng trước khi thực thi.</p>
                  </div>
                </div>
                <div class="lesson-item">
                  <img src="./assets/bosses/boss-4.png" class="lesson-boss-img" alt="Boss 4" />
                  <div class="lesson-content">
                    <div class="lesson-top-row">
                      <strong>Màn 4: SQL / Database</strong>
                      <span class="lesson-tag sql">BACKUP</span>
                    </div>
                    <p>Dữ liệu là tài sản quý giá, cẩn trọng trong từng câu truy vấn và luôn có bản sao lưu.</p>
                  </div>
                </div>
                <div class="lesson-item">
                  <img src="./assets/bosses/boss-5.png" class="lesson-boss-img" alt="Boss 5" />
                  <div class="lesson-content">
                    <div class="lesson-top-row">
                      <strong>Màn 5: Dự Án Cuối Khóa</strong>
                      <span class="lesson-tag proj">DONE ✓</span>
                    </div>
                    <p>Bền bỉ vượt qua áp lực Deadline để hoàn thành sản phẩm trọn vẹn nhất.</p>
                  </div>
                </div>
              </div>
              <div class="journey-quote-box">
                "Mỗi bug được fix là một bài học.<br/>Đằng sau mỗi lần fix là một người thầy kiên nhẫn."
              </div>
            </div>

            <!-- Cột Giữa: Lá Thư Tri Ân 20/11 (Tâm điểm) -->
            <div class="letter-card">
              <div class="letter-header-row">
                <div class="mentor-frame">
                  <img src="./assets/mentor.png" class="mentor-portrait" alt="Mentor" onerror="this.style.display='none'" />
                </div>
                <div class="letter-header-text">
                  <div class="letter-ribbon">✨ CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11 ✨</div>
                  <h1 class="letter-title">🌹 Lá Thư Tri Ân — Gửi ${this.ctx.ui.escapeHtml(classConfig.teacherName)} 🌹</h1>
                </div>
              </div>

              <div class="letter-paper">
                <div class="letter-quote-mark">❝</div>
                <div id="letter-body" class="letter-body"></div>
                <div class="letter-stamp">20/11 ❤</div>
              </div>
            </div>

            <!-- Cột Phải: Vinh danh Danh hiệu, Thống kê Chiến dịch & Bảng vàng -->
            <div class="ending-side-card honor-card">
              <div class="rank-showcase">
                <div class="side-card-title" style="color:#b45309;margin-bottom:8px;">🏅 CHỨNG NHẬN CHIẾN THẮNG</div>
                <div class="rank-showcase-top">
                  <span class="ending-stat-pill">👤 ${this.ctx.ui.escapeHtml(this.ctx.playerName)}</span>
                  ${placementBadge}
                  <span class="ending-stat-pill rose">⭐ ${this.ctx.score.toLocaleString('vi-VN')} điểm</span>
                </div>
                <div class="rank-badge">🏆 ${this.ctx.ui.escapeHtml(rank.title)}</div>
                <div class="rank-quote">"${this.ctx.ui.escapeHtml(rank.message)}"</div>
              </div>

              <!-- Khung Thống kê & Phẩm chất Người Thầy để lấp đầy bố cục cột phải -->
              <div class="tribute-stats-box">
                <div class="credits-heading" style="margin-bottom:8px;">🌟 DẤU ẤN HÀNH TRÌNH TRI ÂN</div>
                <div class="tribute-stats-grid">
                  <div class="tribute-stat-card">
                    <span class="stat-val">5 / 5</span>
                    <span class="stat-lbl">Chặng Vượt Qua</span>
                  </div>
                  <div class="tribute-stat-card">
                    <span class="stat-val">100%</span>
                    <span class="stat-lbl">Nhiệt Huyết</span>
                  </div>
                  <div class="tribute-stat-card">
                    <span class="stat-val">0</span>
                    <span class="stat-lbl">Syntax Error</span>
                  </div>
                  <div class="tribute-stat-card">
                    <span class="stat-val">∞ ❤</span>
                    <span class="stat-lbl">Lòng Biết Ơn</span>
                  </div>
                </div>
                <div class="virtue-tags">
                  <span>✨ Tận Tâm</span>
                  <span>✨ Kiên Nhẫn</span>
                  <span>✨ Truyền Lửa</span>
                  <span>✨ Dẫn Đường</span>
                </div>
              </div>

              <div class="credits-box">
                <div class="credits-heading">💐 BẢNG VÀNG TRI ÂN — ${this.ctx.ui.escapeHtml(classConfig.className)}</div>
                <div class="credits-list">${creditsHtml}</div>
                <div class="build-success">&gt; build success. Cảm ơn Thầy/Cô. ❤</div>
                <button id="replay-btn" class="btn-primary btn-rose btn-ending">🚀 Chơi lại từ đầu</button>
              </div>
            </div>
          </div>

          <!-- Thanh lời chúc trang trí phía dưới -->
          <div class="ending-bottom-wishes">
            <span>🌹 Chúc Thầy/Cô sức khỏe dồi dào</span>
            <span>☕ Luôn tràn đầy năng lượng mỗi giờ lên lớp</span>
            <span>💻 100% Uptime • 0 Syntax Error</span>
            <span>🎓 Mãi là người truyền lửa tuyệt vời của thế hệ lập trình viên</span>
          </div>
        </div>
      </div>
    `;

    const letterEl = document.getElementById('letter-body') as HTMLElement;
    let idx = 0;
    this.typeTimer = window.setInterval(() => {
      idx += 5;
      letterEl.textContent = letterText.slice(0, idx);
      if (idx >= letterText.length && this.typeTimer !== null) {
        clearInterval(this.typeTimer);
        this.typeTimer = null;
      }
    }, 18);

    document.getElementById('replay-btn')?.addEventListener('click', () => {
      this.ctx.switchScene('menu');
    });
  }

  public update(dt: number): void {
    this.elapsed += dt;

    if (this.festiveGrid) {
      this.festiveGrid.position.z = (this.festiveGrid.position.z + dt * 2.0) % 2.4;
    }

    if (this.victoryShipLeft) {
      this.victoryShipLeft.group.position.y = 1.2 + Math.sin(this.elapsed * 2.4) * 0.35;
      this.victoryShipLeft.group.rotation.z = Math.sin(this.elapsed * 1.8) * 0.15;
    }
    if (this.victoryShipRight) {
      this.victoryShipRight.group.position.y = 1.2 + Math.cos(this.elapsed * 2.4) * 0.35;
      this.victoryShipRight.group.rotation.z = -Math.sin(this.elapsed * 1.8) * 0.15;
    }

    this.petalTimer += dt;
    if (this.petalTimer >= 0.05) {
      this.petalTimer = 0;
      this.ctx.particles.spawnFallingPetal(20, 10, -14, 9);
    }

    this.fireworkTimer += dt;
    if (this.fireworkTimer >= 0.65) {
      this.fireworkTimer = 0;
      const sideX = (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 8);
      const pos = new THREE.Vector3(sideX, 2 + Math.random() * 5, -6 + Math.random() * 7);
      this.ctx.particles.spawnBurst(pos, 32, [0xfb7185, 0xfacc15, 0x38bdf8, 0x4ade80, 0xffffff], 9);
    }
  }

  public exit(): void {
    if (this.typeTimer !== null) {
      clearInterval(this.typeTimer);
      this.typeTimer = null;
    }
    if (this.victoryShipLeft) {
      this.ctx.threeScene.remove(this.victoryShipLeft.group);
      this.victoryShipLeft = null;
    }
    if (this.victoryShipRight) {
      this.ctx.threeScene.remove(this.victoryShipRight.group);
      this.victoryShipRight = null;
    }
    if (this.festiveGrid) {
      this.ctx.threeScene.remove(this.festiveGrid);
      this.festiveGrid = null;
    }
    this.ctx.particles.clear();
    this.ctx.ui.clear();
  }
}
