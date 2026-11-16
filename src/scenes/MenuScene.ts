import { classConfig } from '../config/classConfig';
import { PlayerShip } from '../entities/PlayerShip';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class MenuScene implements GameSceneInterface {
  private demoShip: PlayerShip | null = null;
  private elapsed = 0;

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    this.ctx.score = 0;
    this.ctx.easterEggFlowerMode = false;
    this.ctx.sound.setFestiveMode(false);

    // Hiển thị Laptop có cánh 3D xoay nhẹ làm nền Menu
    this.demoShip = new PlayerShip(this.ctx.threeScene, this.ctx.assets);
    this.demoShip.group.position.set(0, 1.5, 2.5);

    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="menu-screen interactive">
        <div class="menu-card">
          <div class="menu-badge">CHÀO MỪNG NGÀY NHÀ GIÁO VIỆT NAM 20/11</div>
          <h1 class="menu-title">CodeGym Invaders:<br/>Bảo vệ ngày 20/11</h1>
          <p class="menu-subtitle">
            Lái chiếc <strong>Laptop có cánh 3D</strong>, bắn hoa hồng và tiêu diệt đàn Bug để trao lá thư tri ân tới <strong>${this.ctx.ui.escapeHtml(classConfig.teacherName)}</strong>!
          </p>
          <div class="input-group">
            <label for="player-name-input">Tên học viên (hoặc mã bí mật):</label>
            <input
              id="player-name-input"
              class="text-input"
              type="text"
              maxlength="32"
              placeholder="Ví dụ: Minh Anh, 20/11..."
              value="${this.ctx.ui.escapeHtml(this.ctx.playerName)}"
            />
          </div>
          <button id="start-game-btn" class="btn-primary">🚀 Bắt đầu Debug</button>
          <div id="easter-egg-feedback"></div>
          <p class="menu-hint">
            Điều khiển: Chuột / Chạm kéo trên màn hình hoặc phím mũi tên / WASD + Space.<br/>
            Mẹo: Thử nhập <code>20/11</code>, tên Thầy/Cô hoặc <code>sudo thank-you</code>!
          </p>
        </div>
      </div>
    `;

    const input = document.getElementById('player-name-input') as HTMLInputElement;
    const btn = document.getElementById('start-game-btn') as HTMLButtonElement;
    const feedback = document.getElementById('easter-egg-feedback') as HTMLElement;

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
        feedback.innerHTML = `<div class="easter-banner">🌹 Easter Egg 20/11: Đạn hoa toàn màn hình & Nhạc lễ hội!</div>`;
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
        this.ctx.playerName = classConfig.className;
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
      this.ctx.playerName = rawName || 'Học viên CodeGym';
      this.ctx.sound.startBgm();
      this.ctx.switchScene('intro');
    });

    checkEasterEgg(input.value);
  }

  public update(dt: number): void {
    this.elapsed += dt;
    if (this.demoShip) {
      this.demoShip.group.rotation.y = Math.sin(this.elapsed * 0.9) * 0.35;
      this.demoShip.group.position.y = 1.5 + Math.sin(this.elapsed * 2.5) * 0.18;
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

