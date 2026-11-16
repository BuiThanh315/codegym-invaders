export interface LeaderboardEntry {
  name: string;
  score: number;
  rankTitle: string;
  createdAt: number;
}

const STORAGE_KEY = 'codegym_invaders_20_11_leaderboard_v1';
const MAX_ENTRIES = 10;

/**
 * Quản lý Bảng Xếp Hạng Top 10 người chơi điểm cao nhất (lưu trên localStorage).
 */
export class LeaderboardManager {
  public static getTop10(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item): item is LeaderboardEntry =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as LeaderboardEntry).name === 'string' &&
            typeof (item as LeaderboardEntry).score === 'number'
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
    } catch {
      return [];
    }
  }

  public static saveScore(name: string, score: number, rankTitle: string): void {
    if (score <= 0) return;
    const cleanName = name.trim() || 'Học viên';
    const current = this.getTop10();
    current.push({
      name: cleanName,
      score,
      rankTitle,
      createdAt: Date.now(),
    });
    const top10 = current.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    } catch {
      // Ignore storage quota errors
    }
  }
}

