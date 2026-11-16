---
trigger: always_on
description: Mục tiêu, tinh thần dự án 20/11, quy tắc Game Over và tiêu chuẩn UX tiếng Việt
---

# Quy Tắc Cốt Lõi & Tinh Thần Dự Án

## 1. Mục tiêu & Tinh thần
- Đây là game bắn gà 3D (Shoot 'em Up) 5 màn tri ân Giảng viên/Mentor CodeGym nhân ngày Nhà giáo Việt Nam **20/11**.
- **Tone & Cảm xúc:** Ấm áp, hài hước, đúng chất lập trình viên và truyền cảm hứng. Thông điệp cốt lõi: *"Mỗi bug được fix là một bài học. Đằng sau mỗi lần fix là một người thầy kiên nhẫn."*

## 2. Quy tắc Game Over
- Tuyệt đối **KHÔNG** dùng chữ `"You Died"`, `"Failed"`, `"Thất bại"` hay thông báo tiêu cực.
- Luôn hiển thị nhân vật Thầy/Cô cùng câu động viên ngẫu nhiên lấy từ `classConfig` (ví dụ: *"Debug lại nào, đừng bỏ cuộc!"*, *"Lỗi là cách học nhanh nhất. Chơi lại nhé!"*, *"Thầy vẫn tin em. Thử thêm lần nữa!"*).

## 3. Tiêu chuẩn UX, Tiếng Việt & Nhịp độ sự kiện
- **Tiếng Việt UTF-8:** Mọi font chữ (Canvas/WebGL lẫn HTML Overlay) phải hỗ trợ đầy đủ dấu tiếng Việt, không bị lỗi font hoặc ô vuông.
- **Độ khó sự kiện (Event Pacing):** Game được thiết kế để Thầy/Cô hoặc học viên có thể chơi vui vẻ và phá đảo trọn vẹn trong **5–7 phút** trong buổi lễ 20/11; tránh độ khó quá gắt gây nản hoặc kéo dài quá lâu.
- **Đa nền tảng:** Hỗ trợ điều khiển mượt mà bằng chuột/bàn phím (Desktop) và chạm vuốt (Mobile).

