# Tài Liệu Hình Tượng Hóa Nhân Vật & Quái Vật (3D Edition)
**Dự án:** *CodeGym Invaders: Bảo vệ ngày 20/11*  
**Phong cách đồ họa:** **3D Stylized Low-Poly / Neon Arcade** trên nền không gian số `#0F172A`, **góc nhìn thứ 3 từ trên xuống (3rd-person top-down angled ~65°)** (tương tự *Sky Force Reloaded* / *Chicken Invaders 3D*).

---

## 1. Phe Chính Diện (Heroes)

### 1.1. Học Viên — Phi Thuyền 3D "Laptop Có Cánh" (Góc nhìn thứ 3 từ trên xuống)
- **Góc nhìn & Bố cục 3D:** Camera đặt ở phía trên và hơi chếch về phía sau (~65° nhìn xuống mặt phẳng bay `X-Z`). Từ góc nhìn này, người chơi thấy rõ:
  - **Thân Laptop 3D mở góc ~110°:** Phần bàn phím cơ phát sáng đèn nền RGB hướng lên trên, phần màn hình hướng về phía người chơi/chếch lên với biểu tượng `</>` và trái tim nhỏ phát sáng.
  - **Đôi cánh thiên thần 3D:** Hai cánh hologram nhiều lớp màu vàng-cyan (`#FACC15` / `#38BDF8`) gắn ở hai cạnh bản lề laptop, sải rộng sang hai bên và vỗ nhịp nhàng trong không gian 3D.
  - **Động cơ phản lực:** Hai luồng lửa ion xanh ở cạnh sau bàn phím để lại vệt sáng khi bay.
- **Vũ khí (Đạn 3D):** Bắn ra các **bông hoa hồng 3D phát sáng** (`#FB7185` / `#E11D48`) xoay nhẹ theo trục tiến về phía trước (`-Z`), kèm vệt hạt cánh hoa. Khi kích hoạt Easter Egg `20/11` hoặc tên Thầy/Cô, đạn nở rộ thành mưa hoa 3D toàn màn hình.
- **Animation 3D:**
  - *Idle / Bay:* Cánh vỗ nhẹ theo hình sin, thân máy nhấp nhô nhẹ theo trục `Y`.
  - *Di chuyển trái/phải (Strafing):* Toàn bộ mô hình nghiêng cánh (3D roll/bank ±20° quanh trục `Z`) tạo cảm giác lướt mượt mà.
  - *Trúng đạn (Invulnerable):* Bao bọc bởi quả cầu khiên wireframe xanh lá `try { ... } catch`.
- **Concept Art 3D (Góc nhìn thứ 3 từ trên xuống):** [player-laptop-3d-topdown.jpg](file:///d:/20-11%20event/docs/concepts/player-laptop-3d-topdown.jpg)
- **Concept Art Tham Khảo Mentor & Phong Cách Chung:** [hero-and-mentor.jpg](file:///d:/20-11%20event/docs/concepts/hero-and-mentor.jpg)

### 1.2. Thầy / Cô Mentor CodeGym (NPC Đồng Hành)
- **Hình tượng:** Nhân vật Chibi hoạt hình nhỏ nhắn, ấm áp: đeo kính cận tri thức, mặc áo sơ mi / polo CodeGym gọn gàng, một tay cầm **ly cà phê code đêm**, tay kia cầm **que chỉ bảng / viên phấn phát sáng**.
- **Biểu cảm (4 Sprite trạng thái):**
  1. *Động viên (Mở màn):* Cười hiền, giơ ngón tay cái 👍.
  2. *Tự hào (Qua màn):* Vỗ tay giữa ánh sao lấp lánh.
  3. *An ủi (Game Over):* Cười nhẹ nhàng, cầm bảng chữ *"Debug lại nào!"*.
  4. *Tri ân (Ending):* Đứng giữa mưa hoa hồng và pháo hoa 20/11.
- **Vị trí xuất hiện:** Góc dưới trái/phải màn hình dạng hộp thoại Pop-up RPG giữa các màn để không che tầm nhìn bắn súng.

---

## 2. Đàn Bug — Quái Thường (Minions)

Mỗi màn mang màu sắc và hình tượng đặc trưng của ngôn ngữ/công nghệ tương ứng:

| Màn | Chủ đề | Tên Quái | Hình Tượng Hóa (Visual Design) | Hành Vi / Kiểu Bay |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **HTML/CSS** | `<div>` | Khối hộp chữ nhật màu cam (`#F97316`) bị lệch khung, có đôi mắt tròn ngơ ngác và cặp ngoặc `< >` làm càng. | Bay theo đội hình hàng ngang cổ điển, thỉnh thoảng tự đổi kích thước (vỡ layout). |
| **1** | **HTML/CSS** | `<br>` | Sinh vật nhỏ hình chiếc kéo cắt dòng màu vàng (`#FACC15`), nhảy tách tách. | Lao xuống theo đường zíc-zắc để cắt ngang đường bay của người chơi. |
| **1** | **HTML/CSS** | `<p>` | Cục bông chữ màu xanh lơ (`#38BDF8`) mang dấu ngoặc nhọn, trôi lững lờ. | Thả đạn chữ cái rơi chậm từ trên xuống. |
| **2** | **JavaScript** | `undefined` | Slime ma trong suốt màu tím nhạt (`#C084FC`) với dấu `?` nhấp nháy bên trong. | Tàng hình mờ rồi hiện rõ bất ngờ (nhấp nháy opacity). |
| **2** | **JavaScript** | `NaN` | Tiểu quỷ máy tính màu vàng neon (`#EAB308`), mắt xoắn ốc chóng mặt `(@_@)`. | Bay lượn hình sin khó đoán, bắn ra các con số lỗi. |
| **2** | **JavaScript** | `[object Object]` | Một khối hộp bí ẩn bọc dấu ngoặc vuông màu xanh lá (`#4ADE80`), bên trong chứa nhiều mắt nhỏ. | Khi bị bắn vỡ sẽ tách thành 2 bug nhỏ hơn trong 1 giây rồi biến mất. |
| **3** | **Java Core** | `null` | Quả cầu hố đen rỗng ruột (`#1E293B` viền tím `#A855F7`), có đôi mắt tinh quái. | Hút nhẹ các tia đạn gần nó trước khi phát nổ. |
| **3** | **Java Core** | `Exception` | Con dơi tam giác cảnh báo màu đỏ cam (`#EF4444`) có dấu `!` ở giữa ngực, cánh xòe tia lửa. | Lao thẳng nhanh về phía người chơi khi vào tầm ngắm. |
| **3** | **Java Core** | `ClassNotFound` | Bóng ma đeo kính lúp màu xám xanh (`#94A3B8`), tay cầm tờ giấy trắng rỗng. | Bay lượn ở rìa trên, bắn đạn dấu `404 / ?` theo chùm 3 viên. |
| **4** | **SQL/DB** | `SELECT *` | Con cua/nhện máy màu xanh dương (`#3B82F6`) gắn ống hút dữ liệu, cõng các trụ Database trên lưng. | Hút năng lượng rồi nhả loạt đạn hình trụ dữ liệu. |
| **4** | **SQL/DB** | `JOIN` | Hai con bọ cơ khí móc xích chặt vào nhau (`#06B6D4`), xoay tròn như cặp bánh răng. | Bay thành cặp, bắn đạn chéo nhau. |
| **4** | **SQL/DB** | `WHERE 1=1` | Con bọ ổ khóa hai đầu màu đỏ-tím (`#EC4899`), miệng cười ngoác luôn ở trạng thái "True". | Bắn đạn liên tục không nghỉ vì điều kiện luôn đúng. |
| **5** | **Dự án** | *Bug Tổng Hợp* | Biến thể nâng cấp (viền đỏ phát sáng) của các bug từ Màn 1–4. | Phối hợp đội hình đa dạng, tốc độ nhanh hơn 20%. |

- **Concept Art Quái Thường:** [minions-sheet.jpg](file:///d:/20-11%20event/docs/concepts/minions-sheet.jpg)

---

## 3. Hệ Thống 5 Boss & Bug Tổng Quản

### Intro: Bug Tổng Quản (Silhouette / Giọng Vang)
- Xuất hiện dạng bóng đen khổng lồ với đôi mắt đỏ rực trên nền màn hình Terminal lúc mở đầu, là hiện thân tổng hợp của mọi nỗi sợ lập trình trước ngày 20/11.

### Boss 1: Thẻ Không Đóng (Màn 1 — HTML/CSS)
- **HP:** `100`
- **Hình tượng:** Quái vật Golem khổng lồ hình thẻ `<div` bị **mất mảnh giáp bên phải**, lộ ra các khối CSS bị rơi rớt, lệch màu lơ lửng xung quanh.
- **Chiêu thức:**
  - *100% HP:* Bắn các mảnh thẻ `<span`, `<img` làm xô lệch nhẹ khung viền.
  - *50% HP:* Hốt hoảng (*"Á! Sao ngươi biết chỗ chưa đóng?"*), tách các khối CSS bay tỏa ra 4 hướng.
  - *Bị hạ:* Tự khép lại thành `</boss>` rồi nổ tung thành cánh hoa.

### Boss 2: Vòng Lặp Vô Hạn (Màn 2 — JavaScript)
- **HP:** `200`
- **Hình tượng:** Một con mắt cơ khí khổng lồ nằm giữa **vòng xoáy neon xanh lá** (`while(true)`), bao quanh bởi các bánh răng số chạy không ngừng.
- **Chiêu thức:**
  - *100% HP:* Xoay vòng và bắn ra chuỗi đạn hình tròn xoắn ốc (spiral bullet hell nhẹ).
  - *50% HP:* Tăng tốc độ xoay bánh răng (*"Đến giờ nhức đầu rồi."*), đổi chiều xoáy đạn liên tục.
  - *Bị hạ:* Xuất hiện dấu `break;` chém ngang tâm vòng xoáy, dừng lại và phát nổ.

### Boss 3: NullPointerException (Màn 3 — Java Core)
- **HP:** `350`
- **Hình tượng:** Bóng ma glitch tím-cyan nửa thực nửa ảo, thân thể bị xé rách bởi các tia sét stacktrace màu đỏ rực.
- **Chiêu thức:**
  - *100% HP:* Bắn tia sét lỗi đỏ theo hàng dọc.
  - *50% HP:* **Biến mất hoàn toàn** khỏi màn hình trong 1 giây kèm hiệu ứng nhiễu sóng, rồi **dịch chuyển xuất hiện ngay phía sau/bên cạnh** người chơi (*"Ngươi tìm ta ở đâu thế?"*).
  - *Bị hạ:* Hiện khung kiểm tra `if (boss != null)` rồi tan biến.

### Boss 4: DROP TABLE (Màn 4 — SQL/Database)
- **HP:** `500`
- **Hình tượng:** Cỗ xe ủi / Mech hạng nặng bọc thép đỏ-đen, phía trước gắn lưỡi cưa cảnh báo nguy hiểm ⚠️ và các thùng trụ Database đang rơi vỡ.
- **Chiêu thức:**
  - *100% HP:* Ném các trụ dữ liệu nặng từ trên xuống.
  - *50% HP:* Kích hoạt kỹ năng đặc biệt **"Xóa hàng đạn"** (*"Ta xóa hàng đạn của ngươi! Ha ha!"*) — quét sạch đạn hoa hồng đang bay trên màn hình trong 1 nhịp, buộc người chơi phải né và bắn lại.
  - *Bị hạ:* Hiện thông báo `ROLLBACK SUCCESS!`, cỗ máy bốc khói nổ tung.

### Boss 5: DEADLINE (Màn 5 — Dự án cuối khóa)
- **HP:** `800` (3 Phases)
- **Hình tượng:** Trùm cuối khổng lồ hình **Rồng/Titan Đồng Hồ Kỹ Thuật Số** rực lửa đỏ thẫm, hai mắt hiển thị bộ đếm ngược phát sáng `00:01:00`, xung quanh là bão giấy tờ và tia lửa điện.
- **3 Phase Chiến Đấu:**
  1. **Phase 1 (100% – 66% HP) — *"Còn 3 ngày nộp bài!"*:** Kết hợp chiêu ném khối vỡ layout của Boss 1 và đạn xoáy của Boss 2.
  2. **Phase 2 (66% – 33% HP) — *"Còn 1 ngày!"*:** Boss chuyển màu tím-đỏ, dùng chiêu dịch chuyển của Boss 3 và chiêu xóa đạn của Boss 4.
  3. **Phase 3 (< 33% HP) — *"Còn 1 giờ!!!"*:** Bốc cháy toàn thân, **màn hình rung lắc (Camera Shake)**, mưa đạn dồn dập tốc độ cao.
  - *Bị hạ:* Đồng hồ chuyển sang `SUBMITTED ✓`, toàn bộ boss và bug còn sót lại **tan thành cánh hoa hồng & pháo hoa** mở ra cảnh kết tri ân.

- **Concept Art 5 Boss:** [bosses-sheet.jpg](file:///d:/20-11%20event/docs/concepts/bosses-sheet.jpg)

