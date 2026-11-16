import { classConfig } from '../config/classConfig';
import { INTRO_SCRIPT } from '../config/stagesConfig';
import { GameContext, GameSceneInterface } from './SceneTypes';

export class IntroScene implements GameSceneInterface {
  private timers: number[] = [];

  constructor(private readonly ctx: GameContext) {}

  public enter(): void {
    const root = this.ctx.ui.getRoot();
    root.innerHTML = `
      <div class="terminal-screen interactive">
        <div class="terminal-box">
          <div id="terminal-lines"></div>
        </div>
        <button id="skip-intro-btn" class="skip-btn">Bỏ qua Intro &gt;&gt;</button>
      </div>
    `;

    const container = document.getElementById('terminal-lines') as HTMLElement;
    const skipBtn = document.getElementById('skip-intro-btn') as HTMLButtonElement;

    skipBtn.addEventListener('click', () => {
      this.ctx.switchScene('game');
    });

    const lines: Array<{ text: string; cls: string; delay: number }> = [
      { text: INTRO_SCRIPT.terminalLines[0], cls: 'terminal-line', delay: 250 },
      { text: INTRO_SCRIPT.terminalLines[1], cls: 'terminal-line warn', delay: 1100 },
      { text: INTRO_SCRIPT.terminalLines[2], cls: 'terminal-line warn', delay: 2000 },
      { text: INTRO_SCRIPT.bugOverlordLine, cls: 'terminal-line boss', delay: 3100 },
      {
        text: `✨ Laptop của ${this.ctx.playerName} sáng lên, mọc đôi cánh 3D!`,
        cls: 'terminal-line',
        delay: 4600,
      },
      {
        text: `${classConfig.teacherName}: "${INTRO_SCRIPT.mentorStartLine}"`,
        cls: 'terminal-line mentor',
        delay: 5700,
      },
    ];

    lines.forEach((item) => {
      const id = window.setTimeout(() => {
        const p = document.createElement('div');
        p.className = item.cls;
        p.textContent = item.text;
        container.appendChild(p);
      }, item.delay);
      this.timers.push(id);
    });

    const endTimer = window.setTimeout(() => {
      this.ctx.switchScene('game');
    }, 7800);
    this.timers.push(endTimer);
  }

  public update(_dt: number): void {
    // Terminal intro uses DOM timers
  }

  public exit(): void {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
    this.ctx.ui.clear();
  }
}

