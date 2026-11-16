export type MinionType =
  | '<div>'
  | '<br>'
  | '<p>'
  | 'undefined'
  | 'NaN'
  | '[object Object]'
  | 'null'
  | 'Exception'
  | 'ClassNotFound'
  | 'SELECT *'
  | 'JOIN'
  | 'WHERE 1=1';

export interface BossConfig {
  id: number;
  name: string;
  maxHp: number;
  color: number;
  accentColor: number;
  introLine: string;
  halfHpLine: string;
  defeatedLine: string;
  phase1Line?: string;
  phase2Line?: string;
  phase3Line?: string;
}

export interface StageConfig {
  stageNumber: number;
  title: string;
  themeColor: number;
  gridColor: number;
  mentorIntro: string;
  mentorOutro: string;
  minionTypes: MinionType[];
  waveCount: number;
  minionsPerWave: number;
  boss: BossConfig;
}

export const INTRO_SCRIPT = {
  terminalLines: [
    '> booting CodeGym_System...',
    '> WARNING: phát hiện 9999 bug xâm nhập',
    '> Sự kiện bị đe dọa: LỄ TRI ÂN 20/11',
  ],
  bugOverlordLine:
    'Bug Tổng Quản: "Hahaha! Ngày mai là 20/11 phải không? Tao sẽ biến buổi lễ thành một đống Syntax Error!"',
  mentorStartLine:
    'Em ơi, hệ thống đang lỗi. Chúng ta hãy cùng debug nào. Let’s go!',
};

export const STAGES_CONFIG: StageConfig[] = [
  {
    stageNumber: 1,
    title: 'Màn 1: HTML / CSS',
    themeColor: 0x1e293b,
    gridColor: 0xf97316,
    mentorIntro: 'Bắt đầu từ nền tảng nhé. Nhớ đóng thẻ đầy đủ!',
    mentorOutro: 'Làm tốt lắm. Nhưng mới là bài đầu thôi.',
    minionTypes: ['<div>', '<br>', '<p>'],
    waveCount: 2,
    minionsPerWave: 15,
    boss: {
      id: 1,
      name: 'Boss 1: Thẻ Không Đóng',
      maxHp: 100,
      color: 0xf97316,
      accentColor: 0xfacc15,
      introLine: 'Hí hí quên đóng thẻ rồi nhé! Cả trang web của ngươi sẽ vỡ layout!',
      halfHpLine: 'Á! Sao ngươi biết chỗ chưa đóng?',
      defeatedLine: 'Nu pa ka chi... </boss>.',
    },
  },
  {
    stageNumber: 2,
    title: 'Màn 2: JavaScript',
    themeColor: 0x0f172a,
    gridColor: 0x22c55e,
    mentorIntro: 'JavaScript hơi tinh nghịch đấy. Cẩn thận kiểu dữ liệu.',
    mentorOutro: 'Biết dừng đúng lúc cũng là một kỹ năng đấy.',
    minionTypes: ['undefined', 'NaN', '[object Object]'],
    waveCount: 2,
    minionsPerWave: 15,
    boss: {
      id: 2,
      name: 'Boss 2: Vòng Lặp Vô Hạn',
      maxHp: 200,
      color: 0x22c55e,
      accentColor: 0x4ade80,
      introLine: 'while(true) ... Ta sẽ không bao giờ dừng!',
      halfHpLine: 'Đến giờ nhức đầu rồi.',
      defeatedLine: 'Ngươi thêm điều kiện thoát... sao ta không nghĩ ra nhỉ.',
    },
  },
  {
    stageNumber: 3,
    title: 'Màn 3: Java Core',
    themeColor: 0x0b132b,
    gridColor: 0x38bdf8,
    mentorIntro: 'Java chặt chẽ lắm. Một dòng sai là cả chương trình hỏng.',
    mentorOutro: 'Đến đây rồi, em đã giỏi hơn lúc mới vào lớp nhiều lắm.',
    minionTypes: ['null', 'Exception', 'ClassNotFound'],
    waveCount: 2,
    minionsPerWave: 15,
    boss: {
      id: 3,
      name: 'Boss 3: NullPointerException',
      maxHp: 350,
      color: 0xa855f7,
      accentColor: 0xef4444,
      introLine: 'Ta không tồn tại... nhưng ta vẫn làm chương trình ngươi sập.',
      halfHpLine: 'Ngươi tìm ta ở đâu thế?',
      defeatedLine: 'Hóa ra... kiểm tra null trước... Đơn giản vậy sao?',
    },
  },
  {
    stageNumber: 4,
    title: 'Màn 4: SQL / Database',
    themeColor: 0x111827,
    gridColor: 0x3b82f6,
    mentorIntro: 'Dữ liệu là tài sản. Truy vấn cẩn thận nhé.',
    mentorOutro: 'Còn một chặng nữa thôi. Hãy cố lên nào.',
    minionTypes: ['SELECT *', 'JOIN', 'WHERE 1=1'],
    waveCount: 2,
    minionsPerWave: 15,
    boss: {
      id: 4,
      name: 'Boss 4: DROP TABLE',
      maxHp: 500,
      color: 0xef4444,
      accentColor: 0x38bdf8,
      introLine: 'Ta xóa tất cả. Không cần xác nhận!',
      halfHpLine: 'Ta xóa hàng đạn của ngươi! Ha ha!',
      defeatedLine: 'Ngươi có backup sao...@@!.',
    },
  },
  {
    stageNumber: 5,
    title: 'Màn 5: Dự án cuối khóa',
    themeColor: 0x1e1b4b,
    gridColor: 0xfb7185,
    mentorIntro: 'Chặng cuối rồi! Vượt qua Deadline để bảo vệ lễ 20/11 nào!',
    mentorOutro: 'Yeah! Chúng ta làm được rồi.',
    minionTypes: ['<div>', 'NaN', 'Exception', 'SELECT *'],
    waveCount: 2,
    minionsPerWave: 15,
    boss: {
      id: 5,
      name: 'Boss 5: DEADLINE',
      maxHp: 800,
      color: 0xe11d48,
      accentColor: 0xfacc15,
      introLine: 'Còn 3 ngày nộp bài! Ngươi xong rồi :v',
      halfHpLine: 'Còn 1 ngày! Hệ thống vẫn còn lỗi!',
      defeatedLine: 'Ngươi... nộp đúng hạn sao? Ta... thua rồi.',
      phase1Line: 'Còn 3 ngày nộp bài! Ngươi xong rồi :v',
      phase2Line: 'Còn 1 ngày! Hệ thống vẫn còn lỗi!',
      phase3Line: 'Còn 1 giờ!!!',
    },
  },
];

