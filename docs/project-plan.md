# Kế Hoạch Dự Án & Công Nghệ: CodeGym Invaders - Bảo vệ ngày 20/11

## 1. Tổng Quan Dự Án

- **Tên game:** CodeGym Invaders: Bảo vệ ngày 20/11
- **Thể loại:** **3D Arcade Shoot 'em Up** góc nhìn thứ 3 từ trên xuống (3rd-person top-down / angled overhead ~65°, phong cách *Sky Force Reloaded* / *Chicken Invaders 3D*), gồm 5 màn chơi + 5 Boss + Intro Terminal + Ending Lá Thư Tri Ân.
- **Nền tảng mục tiêu:** Web Browser (Desktop & Mobile responsive), chạy mượt mà 60 FPS trên WebGL không cần cài đặt, chia sẻ qua 1 đường link duy nhất cho Giảng viên/Mentor và cả lớp chơi trong buổi lễ 20/11.
- **Điểm nhấn:** Dễ dàng tùy biến thông tin lớp (`[TÊN THẦY/CÔ]`, `[TÊN LỚP]`, `[CÂU CỬA MIỆNG]`, `[KỶ NIỆM]`, `[DANH SÁCH LỚP]`) qua file cấu hình tập trung mà không cần sửa code logic.

---

## 2. Công Nghệ Áp Dụng (Tech Stack)

| Hạng mục                            | Công nghệ đề xuất                                         | Lý do lựa chọn                                                                                                                                                                                                                                                                            |
| :------------------------------------ | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3D Engine**                   | **Three.js (WebGL)**                                     | Engine 3D nhẹ, mạnh mẽ, tối ưu cho trình duyệt; hỗ trợ `PerspectiveCamera` góc nhìn thứ 3 từ trên xuống, ánh sáng Neon/Bloom (`EffectComposer`), hệ thống hạt 3D (hoa hồng, pháo hoa 3D) và Camera Shake cho Boss 5.                                              |
| **Ngôn ngữ**                  | **TypeScript (Strict Mode)**                             | Đảm bảo type-safe cho toàn bộ tọa độ 3D, dữ liệu màn chơi, cấu hình Boss/Phase, thông số đạn và config lớp học; dễ bảo trì và mở rộng.                                                                                                                            |
| **Build Tool**                  | **Vite**                                                 | Khởi tạo nhanh, HMR tức thì khi tinh chỉnh gameplay 3D, đóng gói bundle gọn nhẹ để deploy static.                                                                                                                                                                                |
| **Đồ họa 3D (Models & VFX)** | **Procedural Low-Poly 3D + GLTF/GLB (tùy chọn)**       | Dựng trực tiếp các khối 3D sắc nét (Laptop có cánh 3D, vòng xoáy `while(true)`, khối `<div>`, cỗ máy `DROP TABLE`) bằng Three.js Geometry/Material kết hợp đổ bóng & phát sáng (Emissive/Bloom), giúp tải siêu nhanh và không phụ thuộc file model nặng. |
| **UI / Overlay**                | **HTML5/CSS3 Overlay + Pixel/Retro Font**                | Kết hợp DOM overlay cho màn hình nhập tên, hộp thoại terminal Intro, giao diện Lá thư tri ân, Credits, thoại chibi Thầy/Cô và Easter Egg input (`sudo thank-you`, gõ tên thầy/cô) để hiển thị tiếng Việt có dấu sắc nét.                                     |
| **Âm thanh (Audio)**           | **Web Audio API / ZzFX + Nhạc nền Chiptune (MP3/OGG)** | Tạo hiệu ứng tiếng bắn hoa hồng, tiếng nổ bug, tiếng cảnh báo Boss nhẹ, kết hợp chuyển nhạc nền sang giai điệu lễ hội khi kích hoạt Easter Egg 20/11.                                                                                                                 |
| **Triển khai (Deploy)**        | **Vercel / Netlify / GitHub Pages**                      | Miễn phí, tốc độ cao, HTTPS sẵn sàng, gửi link QR Code cho cả lớp mở chơi ngay trên sân khấu hoặc điện thoại.                                                                                                                                                             |

---

## 3. Kiến Trúc Thư Mục Đề Xuất

```text
codegym-invaders/
├── .agents/
│   └── rules/                  # Rule cho AI Agent (AGENTS.md / codegym-invaders.md)
├── public/
│   ├── assets/
│   │   ├── sprites/            # Sprite nhân vật, quái, 5 boss, đạn hoa hồng
│   │   ├── backgrounds/        # 5 nền màn chơi (Lớp học, JS Matrix, Java, Server, Project)
│   │   └── audio/              # Nhạc nền menu, battle, boss, lễ hội 20/11
├── src/
│   ├── config/
│   │   ├── classConfig.ts      # [QUAN TRỌNG] Nơi điền tên Thầy/Cô, tên lớp, kỷ niệm, danh sách lớp
│   │   ├── stagesConfig.ts     # Cấu hình 5 màn, wave quái, thông số & thoại 5 Boss
│   │   └── gameConstants.ts    # Tốc độ tàu, sát thương hoa hồng, ngưỡng điểm danh hiệu
│   ├── scenes/
│   │   ├── BootScene.ts        # Preload toàn bộ sprite, audio, font
│   │   ├── MenuScene.ts        # Nhập tên học viên, bắt Easter Egg (tên thầy/20-11/sudo thank-you)
│   │   ├── IntroScene.ts       # Hiệu ứng terminal gõ chữ + cắt cảnh Laptop mọc cánh
│   │   ├── GameScene.ts        # Gameplay chính 5 màn, HUD, thoại Mentor giữa màn, Game Over
│   │   └── EndingScene.ts      # Bug tan thành hoa, pháo hoa, Lá thư tri ân & Credits cả lớp
│   ├── entities/
│   │   ├── Player.ts           # Laptop có cánh, bắn hoa hồng, hit-box, bất tử tạm thời
│   │   ├── Enemy.ts            # Quái thường theo hành vi từng màn (<div>, NaN, null, SELECT *...)
│   │   ├── Boss.ts             # Base Boss + 5 Boss với skill riêng & Boss 5 (3 phases)
│   │   └── Projectile.ts       # Đạn hoa hồng, đạn lỗi của quái/boss
│   ├── systems/
│   │   ├── SoundManager.ts     # Quản lý SFX + đổi nhạc lễ hội
│   │   ├── DialogueBox.ts      # Hộp thoại chibi Thầy/Cô & Boss
│   │   └── EasterEggManager.ts # Xử lý cheat/tri ân ở Menu
│   └── main.ts                 # Khởi tạo Phaser Game
├── index.html
├── package.json
└── tsconfig.json
```

---

## 4. Kế Hoạch Triển Khai (Roadmap)

### Giai đoạn 1: Khởi tạo & Core Gameplay 3D

- Khởi tạo dự án **Vite + TypeScript + Three.js**.
- Thiết lập **Camera góc nhìn thứ 3 từ trên xuống (~65°)** nhìn xuống mặt phẳng gameplay `X-Z`, kèm ánh sáng Ambient/Directional và nền không gian 3D cuộn theo từng màn.
- Xây dựng `classConfig.ts` để tách biệt hoàn toàn dữ liệu cá nhân hóa của lớp khỏi code game.
- Dựng mô hình 3D **Laptop có cánh** (nhìn từ trên/phía sau, thấy bàn phím phát sáng, màn hình `</>`, đôi cánh hologram vỗ nhịp và hiệu ứng nghiêng cánh `roll` khi di chuyển trái/phải), bắn đạn hoa hồng 3D và xử lý va chạm AABB/Sphere.
- Xây dựng hệ thống **Wave Spawner**, **Object Pooling** và **Base Enemy / Base Boss 3D**.

### Giai đoạn 2: 5 Màn Chơi, Quái & 5 Boss

- **Màn 1 (HTML/CSS):** Quái `<div>`, `<br>`, `<p>`; Boss 1 *Thẻ Không Đóng* (100 HP) với chiêu làm lệch/vỡ khung hình nhẹ.
- **Màn 2 (JavaScript):** Quái `undefined`, `NaN`, `[object Object]`; Boss 2 *Vòng Lặp Vô Hạn* (200 HP) bắn đạn xoáy tròn liên tục.
- **Màn 3 (Java Core):** Quái `null`, `Exception`, `ClassNotFound`; Boss 3 *NullPointerException* (350 HP) có kỹ năng tàng hình & dịch chuyển sau lưng ở 50% máu.
- **Màn 4 (SQL/Database):** Quái `SELECT *`, `JOIN`, `WHERE 1=1`; Boss 4 *DROP TABLE* (500 HP) có chiêu xóa bớt hàng đạn của người chơi ở 50% máu.
- **Màn 5 (Dự án cuối khóa):** Tổng hợp quái 4 màn; Boss 5 *DEADLINE* (800 HP, 3 Phase: 3 ngày -> 1 ngày -> 1 giờ với màn hình rung và mưa đạn).

### Giai đoạn 3: Kịch Bản, Cảm Xúc 20/11 & Easter Egg

- **IntroScene:** Terminal gõ chữ `> booting CodeGym_System...`, giọng/thoại Bug Tổng Quản, cắt cảnh Laptop mọc cánh, tin nhắn Thầy/Cô.
- **Mentor Dialogue & Game Over:** Chibi Thầy/Cô xuất hiện đầu/cuối mỗi màn; Game Over hiển thị 3 câu động viên ngẫu nhiên (tuyệt đối không dùng "You Died").
- **EndingScene:** Bug tan thành hoa, pháo hoa, Lá thư tri ân gõ từng dòng, Credits chạy tên cả lớp, kết thúc bằng `> build success. Cảm ơn Thầy/Cô. ❤`.
- **Danh hiệu cuối game:** Tính theo điểm (*Học viên mới*, *Debug Master*, *Học trò ruột của Thầy/Cô*).
- **Easter Eggs:**
  - Gõ tên Thầy/Cô hoặc `20/11` ở Menu: đạn biến thành hoa toàn màn hình, nhạc đổi sang giai điệu lễ hội.
  - Gõ `sudo thank-you`: mở thẳng Lá thư tri ân.

### Giai đoạn 4: Âm Thanh, Polish & Kiểm Thử

- Tích hợp SFX bắn/nổ/cảnh báo và nhạc nền.
- Cân bằng độ khó (đảm bảo Thầy/Cô hoặc học viên chơi thử đều có thể phá đảo trong ~5-7 phút để kịp nhịp chương trình 20/11).
- Test trên Desktop (Chrome/Edge) và Mobile (cảm ứng kéo thả), kiểm tra lỗi hiển thị tiếng Việt.
- Deploy lên Vercel/Netlify và tạo QR Code trình chiếu.
