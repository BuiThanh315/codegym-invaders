export interface ClassConfig {
  teacherName: string;
  teacherTitle: string;
  className: string;
  teacherCatchphrase: string;
  classMemory: string;
  studentList: string[];
  easterEggKeywords: string[];
  skipToEndingCommand: string;
  gameOverMessages: string[];
}

/**
 * Cấu hình chung cho sự kiện 20/11 (không fix cứng tên thầy/cô hay học viên).
 * Có thể truyền qua URL (?teacher=...&class=...) hoặc sửa trực tiếp tại đây.
 */
function getQueryParam(key: string): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(key)?.trim() ?? '';
}

export const classConfig: ClassConfig = {
  teacherName: getQueryParam('teacher') || 'Thầy/Cô',
  teacherTitle: 'Thầy/Cô',
  className: getQueryParam('class') || 'CodeGym',
  teacherCatchphrase: '',
  classMemory:
    'Cảm ơn Thầy/Cô đã luôn kiên nhẫn lắng nghe từng câu hỏi, đồng hành qua từng dòng code lỗi và truyền cảm hứng cho chúng em mỗi ngày.',
  studentList: [],
  easterEggKeywords: ['20/11', 'codegym', 'thầy cô', 'thay co'],
  skipToEndingCommand: 'sudo thank-you',
  gameOverMessages: [
    'Debug lại nào, đừng bỏ cuộc!',
    'Lỗi là cách học nhanh nhất. Chơi lại nhé!',
    'Thầy/Cô vẫn tin em. Thử thêm lần nữa!',
  ],
};
