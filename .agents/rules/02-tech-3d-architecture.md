---
trigger: always_on
description: Kiến trúc 3D Three.js, góc nhìn thứ 3 từ trên xuống, cấu trúc thư mục và tối ưu hiệu năng
---

# Kiến Trúc Kỹ Thuật & Đồ Họa 3D

## 1. Tech Stack bắt buộc
- **Stack:** `TypeScript` (strict mode) + `Three.js` (3D WebGL) + `Vite` + HTML5/CSS3 Overlay.

## 2. Góc nhìn & Không gian 3D
- Game sử dụng **đồ họa 3D** với **góc nhìn thứ 3 từ trên xuống (3rd-person top-down / angled overhead ~60°–75°)**, tương tự *Sky Force* / *Chicken Invaders 3D*.
- Nhân vật chính (**Laptop có cánh 3D**) quay lưng/mặt bàn phím về phía camera, bay trên mặt phẳng gameplay cố định (mặt phẳng `X-Z`) để người chơi dễ căn đạn và né tránh.
- Có hiệu ứng nghiêng thân 3D (`roll/bank`) khi di chuyển trái/phải.

## 3. Tách biệt cấu hình & kiến trúc Scene
- **Cấu hình cá nhân hóa:** Mọi thông tin của lớp (`teacherName`, `className`, `teacherCatchphrase`, `classMemory`, `studentList`, `easterEggKeywords`) **BẮT BUỘC** đặt trong `src/config/classConfig.ts`. Tuyệt đối không hardcode vào Scene hay Entity.
- **Dữ liệu màn chơi:** Thông số 5 màn, danh sách quái, máu Boss, lời thoại mở/kết màn và thoại Boss phải nằm trong `src/config/stagesConfig.ts`.
- **Kiến trúc Scene chuẩn:** `BootScene` -> `MenuScene` -> `IntroScene` -> `GameScene` -> `EndingScene` (quản lý qua `SceneManager` + `THREE.Scene`).

## 4. Hiệu năng & Fallback 3D
- **Tối ưu 60 FPS:** Dùng Object Pooling và tái sử dụng `THREE.BufferGeometry` / `THREE.Material` (hoặc `InstancedMesh`) cho đạn hoa hồng, đạn bug và hạt 3D (particles), đặc biệt ở Màn 5 Phase 3 và màn mưa hoa Ending.
- **Asset Fallback:** Mọi asset 3D (`.glb`/`.gltf`), texture hoặc âm thanh phải được preload qua `AssetLoader` ở bước khởi động và **bắt buộc có fallback 3D procedural geometry** (tạo hình khối 3D bằng Three.js) + âm thanh cơ bản nếu thiếu file để game không bao giờ crash.

