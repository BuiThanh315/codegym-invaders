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
 * File cấu hình cá nhân hóa cho từng lớp CodeGym.
 * Chỉ cần sửa các giá trị bên dưới để dùng cho buổi lễ 20/11 của lớp bạn.
 */
export const classConfig: ClassConfig = {
  teacherName: 'Thầy Minh',
  teacherTitle: 'Thầy/Cô',
  className: 'C0824G1',
  teacherCatchphrase: 'Đọc kỹ log lỗi trước khi hỏi nhé!',
  classMemory:
    'Nhớ những buổi tối cả lớp cùng nhau ngồi fix lỗi đến tận 10h đêm, rồi vỡ òa khi màn hình hiện chữ Build Success.',
  studentList: [
    'Minh Anh',
    'Hoàng Nam',
    'Thảo Vy',
    'Đức Thịnh',
    'Gia Bảo',
    'Khánh Linh',
    'Quốc Hưng',
    'Ngọc Hà',
    'Tuấn Kiệt',
    'Bảo Trâm',
  ],
  easterEggKeywords: ['20/11', 'thầy minh', 'thay minh', 'codegym'],
  skipToEndingCommand: 'sudo thank-you',
  gameOverMessages: [
    'Debug lại nào, đừng bỏ cuộc!',
    'Lỗi là cách học nhanh nhất. Chơi lại nhé!',
    'Thầy vẫn tin em. Thử thêm lần nữa!',
  ],
};

