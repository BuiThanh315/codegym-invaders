---
trigger: always_on
description: Quy trình làm việc, bảo toàn kịch bản và kiểm thử TypeScript/Build
---
# Quy Trình Làm Việc & Kiểm Thử

- Luôn chạy kiểm tra TypeScript (`npx tsc --noEmit`) và build (`npm run build`) không có lỗi trước khi báo cáo hoàn thành bất kỳ tính năng nào.
- Không chạy tự động kiểm thử thực tế trên trình duyệt/server khi không có yêu cầu trực tiếp từ người dùng; mỗi yêu cầu kiểm thử thực tế chỉ có hiệu lực trong phiên làm việc đó.
- Không tự ý xóa hoặc thay đổi lời thoại kịch bản gốc trừ khi có yêu cầu trực tiếp từ người dùng.
- Giữ code sạch, tách biệt rõ ràng giữa `config/`, `scenes/`, `entities/` và `systems/`.
- Không tự đoán ngữ cảnh, khi không đủ thông tin phải đưa câu hỏi để người dùng cung cấp thông tin, thực hiện planning để người dùng xác nhận trước khi thực hiện.
- Phát hiện lỗi thì không trực tiếp sửa, phải báo cho người dùng trước để kiểm soát.
