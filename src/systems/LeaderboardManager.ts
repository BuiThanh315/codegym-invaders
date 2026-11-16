import { getRankByPlacement, RankTier } from '../config/gameConstants';

export interface LeaderboardEntry {
  name: string;
  score: number;
  rankTitle: string;
  createdAt: number;
}

export interface SaveScoreResult {
  placement: number | null;
  rank: RankTier;
}

const STORAGE_KEY = 'codegym_invaders_20_11_leaderboard_v2';
const LEGACY_STORAGE_KEY = 'codegym_invaders_20_11_leaderboard_v1';
const MAX_ENTRIES = 10;

/**
 * Quản lý Bảng Xếp Hạng Top 10 người chơi điểm cao nhất (lưu trên localStorage).
 */
export class LeaderboardManager {
  public static getTop10(): LeaderboardEntry[] {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
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

  public static saveScore(name: string, score: number): SaveScoreResult {
    if (score <= 0) {
      return { placement: null, rank: getRankByPlacement(null) };
    }
    const cleanName = name.trim() || 'Học viên';
    const now = Date.now();
    const newEntry: LeaderboardEntry = {
      name: cleanName,
      score,
      rankTitle: '',
      createdAt: now,
    };

    const current = this.getTop10();
    current.push(newEntry);
    const top10 = current.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES);

    const idx = top10.indexOf(newEntry);
    const placement = idx >= 0 ? idx + 1 : null;
    const rank = getRankByPlacement(placement);
    newEntry.rankTitle = rank.title;

    // Cập nhật lại danh hiệu cho toàn bộ Top 10 theo thứ hạng hiện tại
    top10.forEach((entry, i) => {
      entry.rankTitle = getRankByPlacement(i + 1).title;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    } catch {
      // Ignore storage quota errors
    }

    return { placement, rank };
  }

  public static clear(): void {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

