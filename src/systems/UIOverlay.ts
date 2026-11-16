export class UIOverlay {
  private readonly root: HTMLElement;

  constructor() {
    const el = document.getElementById('ui-overlay');
    if (!el) {
      throw new Error('Missing #ui-overlay element in index.html');
    }
    this.root = el;
  }

  public getRoot(): HTMLElement {
    return this.root;
  }

  public clear(): void {
    this.root.innerHTML = '';
  }

  public showDialogue(
    speaker: string,
    text: string,
    type: 'mentor' | 'boss' = 'mentor',
    durationMs = 3400,
    bossId?: number
  ): void {
    const existing = this.root.querySelector('.dialogue-container');
    if (existing) existing.remove();

    const avatarHtml =
      type === 'mentor'
        ? `<img src="./assets/mentor.png" alt="Mentor" onerror="this.replaceWith(document.createTextNode('👨‍🏫'))" />`
        : bossId
          ? `<img src="./assets/bosses/boss-${bossId}.png" alt="Boss" onerror="this.replaceWith(document.createTextNode('👾'))" />`
          : '👾';

    const box = document.createElement('div');
    box.className = `dialogue-container ${type === 'boss' ? 'boss-speak' : ''}`;
    box.innerHTML = `
      <div class="dialogue-avatar">${avatarHtml}</div>
      <div>
        <div class="dialogue-speaker">${this.escapeHtml(speaker)}</div>
        <div class="dialogue-text">${this.escapeHtml(text)}</div>
      </div>
    `;
    this.root.appendChild(box);

    if (durationMs > 0) {
      window.setTimeout(() => {
        if (box.parentNode) box.remove();
      }, durationMs);
    }
  }

  public escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

