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
    'Từ những ngày đầu bỡ ngỡ với từng cặp thẻ <div>, những lần bối rối trước lỗi undefined hay NullPointerException, cho đến những đêm chạy nước rút cùng dự án cuối khóa — ở chặng đường nào chúng em cũng thấy bóng dáng tận tụy của Thầy/Cô. Thầy/Cô không chỉ dạy chúng em cách viết code chạy được, mà còn truyền cho chúng em sự kiên trì, tư duy giải quyết vấn đề và niềm tin không bao giờ bỏ cuộc trước bất kỳ thử thách nào.',
  studentList: [],
  easterEggKeywords: ['20/11', 'codegym', 'thầy cô', 'thay co'],
  skipToEndingCommand: 'sudo thank-you',
  gameOverMessages: [
    'Debug lại nào, đừng bỏ cuộc!',
    'Lỗi là cách học nhanh nhất. Chơi lại nhé!',
    'Thầy/Cô vẫn tin em. Thử thêm lần nữa!',
  ],
};
