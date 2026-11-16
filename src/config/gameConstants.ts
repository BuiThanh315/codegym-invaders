export interface RankTier {
  minScore: number;
  title: string;
  message: string;
}

export const GAME_CONSTANTS = {
  // Kích thước mặt phẳng gameplay 3D (trục X và trục Z) - mở rộng không giới hạn 2 bên
  FIELD_HALF_WIDTH: 24,
  FIELD_MIN_Z: -16,
  FIELD_MAX_Z: 10.5,

  // Góc nhìn thứ 3 từ trên xuống (~65 độ) - đưa camera lại gần để tăng kích thước tổng quát 50%
  CAMERA_FOV: 48,
  CAMERA_POS_Y: 16.0,
  CAMERA_POS_Z: 12.8,
  CAMERA_LOOK_AT_Z: -2.0,

  // Thông số Player (Laptop có cánh 3D) - nhịp độ giảm 40% êm ái hơn
  PLAYER_START_Z: 7.5,
  PLAYER_MIN_Z: -4.0,
  PLAYER_SPEED: 9.0,
  PLAYER_MAX_HP: 3,
  PLAYER_FIRE_COOLDOWN: 0.25,
  PLAYER_INVULN_TIME: 1.8,
  PLAYER_HIT_RADIUS: 0.8,

  // Đạn hoa hồng 3D
  ROSE_SPEED: 16.0,
  ROSE_DAMAGE: 10,
  MINION_HP: 30, // 3 viên đạn * 10 sát thương = 30 HP
  EASTER_EGG_SPREAD_COUNT: 3,

  // Điểm thưởng & vật phẩm rơi
  SCORE_MINION: 30,
  SCORE_BOSS: 500,
  SCORE_FLOWER_PICKUP: 10,
  SCORE_MAX_HP_BONUS: 50,

  // Giới hạn thời gian mỗi giai đoạn (giây)
  MINION_PHASE_TIME_LIMIT: 60,
  BOSS_PHASE_TIME_LIMIT: 90,
} as const;

export const RANK_BY_PLACEMENT: Record<'top3' | 'mid' | 'newbie', RankTier> = {
  top3: {
    minScore: 1,
    title: 'Học trò ruột của Thầy/Cô',
    message: 'Thầy cô chắc chắn sẽ tự hào về em!',
  },
  mid: {
    minScore: 4,
    title: 'Debug Master',
    message: 'Bug nhìn thấy em là run!',
  },
  newbie: {
    minScore: 8,
    title: 'Học viên mới',
    message: 'Hành trình mới bắt đầu!',
  },
};

/**
 * Cấp danh hiệu dựa trên vị trí (1-based) trên bảng xếp hạng hiện tại:
 * - Hạng 1–3: Học trò ruột của Thầy/Cô
 * - Hạng 4–7: Debug Master
 * - Hạng 8–10 (hoặc ngoài Top 10): Học viên mới
 */
export function getRankByPlacement(placement: number | null): RankTier {
  if (placement !== null && placement >= 1 && placement <= 3) {
    return RANK_BY_PLACEMENT.top3;
  }
  if (placement !== null && placement >= 4 && placement <= 7) {
    return RANK_BY_PLACEMENT.mid;
  }
  return RANK_BY_PLACEMENT.newbie;
}

