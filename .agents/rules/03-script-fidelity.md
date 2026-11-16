---
trigger: always_on
description: Ràng buộc kịch bản, thông số 5 màn chơi, 5 Boss, danh hiệu và Easter Eggs
---

# Ràng buộc Kịch Bản & Cơ Chế Game (Script Fidelity)

## 1. Nhân vật chính & Mở đầu (Intro)
- Học viên nhập tên ở màn hình chờ; điều khiển **Laptop có cánh 3D** bắn **đạn hoa hồng 3D**.
- **Intro:** Chạy hiệu ứng gõ chữ terminal (`> booting CodeGym_System...`) kèm thoại Bug Tổng Quản trước khi vào cắt cảnh Laptop mọc cánh và tin nhắn động viên của Thầy/Cô.

## 2. Hệ thống 5 Màn chơi & 5 Boss
1. **Màn 1 (HTML/CSS):** Quái `<div>`, `<br>`, `<p>`. **Boss 1: Thẻ Không Đóng** (`100 HP`) — có thoại ở 100%, 50% HP và khi bị hạ (`</boss>`).
2. **Màn 2 (JavaScript):** Quái `undefined`, `NaN`, `[object Object]`. **Boss 2: Vòng Lặp Vô Hạn** (`200 HP`) — đạn xoáy tròn liên tục, thoại 50% HP.
3. **Màn 3 (Java Core):** Quái `null`, `Exception`, `ClassNotFound`. **Boss 3: NullPointerException** (`350 HP`) — ở 50% HP phải có cơ chế biến mất rồi dịch chuyển xuất hiện sau lưng/vị trí bất ngờ.
4. **Màn 4 (SQL/Database):** Quái `SELECT *`, `JOIN`, `WHERE 1=1`. **Boss 4: DROP TABLE** (`500 HP`) — ở 50% HP xóa bớt hàng đạn của người chơi trên màn hình.
5. **Màn 5 (Dự án cuối khóa):** Quái tổng hợp cả 4 màn trước. **Boss 5: DEADLINE** (`800 HP`, **3 Phase**):
   - *Phase 1 ("Còn 3 ngày nộp bài!"):* dùng chiêu của Boss 1 & Boss 2.
   - *Phase 2 ("Còn 1 ngày!"):* dùng chiêu của Boss 3 & Boss 4.
   - *Phase 3 ("Còn 1 giờ!!!"):* đạn dồn dập + hiệu ứng **rung màn hình (Camera Shake)**.

## 3. Cảnh kết (Ending) & Danh hiệu
- **Ending:** Bug tan thành hoa, pháo hoa 3D, Thầy/Cô xuất hiện giữa mưa hoa, chuyển sang Lá thư tri ân hiện chữ dần, Credits chạy tên cả lớp, kết thúc bằng dòng `> build success. Cảm ơn Thầy/Cô. ❤`.
- **Danh hiệu cuối game:** Phân loại theo điểm số thành 3 bậc: *Học viên mới*, *Debug Master*, *Học trò ruột của Thầy/Cô*.

## 4. Easter Eggs (Bắt buộc có ở Menu)
- Nhập tên Thầy/Cô hoặc `20/11`: đạn biến thành hoa toàn màn hình, nhạc nền đổi sang giai điệu lễ hội.
- Nhập `sudo thank-you`: bỏ qua gameplay, mở thẳng Lá thư tri ân (`EndingScene`).

