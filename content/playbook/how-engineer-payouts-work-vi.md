---
title: Cách hoạt động của việc rút tiền cho kỹ sư trên TalEngineer
description: Giải thích rõ ràng về đường đi của dòng tiền dành cho kỹ sư — ký quỹ theo cột mốc, 85% thực nhận, Stripe Connect và chi trả ngoại tuyến, điều gì xảy ra khi tranh chấp đóng băng một cột mốc, và mọi bản ghi nằm ở đâu trong sổ cái của bạn.
date: 2026-07-24
lang: vi
type: guide
track: general
audience: engineer
slug: how-engineer-payouts-work-vi
group: how-engineer-payouts-work
---

# Cách hoạt động của việc rút tiền cho kỹ sư trên TalEngineer

Nỗi lo lớn nhất trong công việc kỹ sư tự do xuyên biên giới rất đơn giản: bạn đã làm xong việc, nhưng tiền không bao giờ đến. Mọi quyết định thiết kế trong hệ thống thanh toán của TalEngineer đều nhằm loại bỏ nỗi lo đó — và loại bỏ nỗi lo đối xứng ở phía nhà tuyển dụng, tức là trả tiền cho một công việc không bao giờ được hoàn thành. Bài viết này đi qua toàn bộ đường đi của dòng tiền từ góc nhìn của kỹ sư, để bạn biết chính xác điều gì xảy ra ở từng bước và cần kiểm tra gì trước khi bạn bỏ thời gian ra làm.

## Tiền được chuyển vào trước khi công việc bắt đầu

Mỗi dự án trên nền tảng được chia thành các **cột mốc** — những giai đoạn riêng biệt với sản phẩm bàn giao và số tiền được xác định rõ. Trước khi một cột mốc bắt đầu, nhà tuyển dụng nạp tiền cho nó: tiền rời khỏi tài khoản nhà tuyển dụng và nằm trong ký quỹ, gắn với cột mốc cụ thể đó. Bạn có thể xem trạng thái nạp tiền của cột mốc trong lệnh công việc của mình trước khi bắt đầu.

Đây là quy tắc đáng ghi nhớ: **nếu một cột mốc chưa được nạp tiền, công việc thực sự chưa bắt đầu.** Bạn không bao giờ ở trong tình huống phải xuất hóa đơn cho một người lạ ở nước ngoài rồi ngồi hy vọng. Câu hỏi "họ có trả tiền không?" đã được trả lời trước khi bạn mở laptop hay lên máy bay — tiền đã được chuyển; câu hỏi còn lại duy nhất là công việc có đáp ứng đúng định nghĩa của cột mốc hay không.

## Số tiền bạn thực nhận

<!-- Nguồn duy nhất của con số phí: src/config/fees.js (PLATFORM_FEE = 0.15, số tiền kỹ sư thực nhận = 1 - phí). Phí chỉ xuất hiện một lần trên trang này, ở đoạn này. -->
Khi nhà tuyển dụng nghiệm thu và giải ngân một cột mốc, phí nền tảng được trừ ra và phần còn lại là của bạn. Phí nền tảng tiêu chuẩn là **15% của mỗi cột mốc đã giải ngân, nên bạn giữ lại 85%** — cùng một con số công khai trên [trang bảng giá](/pricing) của chúng tôi, được đọc từ một nguồn cấu hình duy nhất trong mã nguồn nên không thể âm thầm trôi dạt. Không có phí đăng tin, không phí đấu thầu, không đăng ký thuê bao, và không thu phí khi ứng tuyển vào dự án. Khoản phí này chỉ gắn với đúng một sự kiện: một cột mốc đã được nhà tuyển dụng chấp nhận.

Một số đơn hàng sớm của khách hàng sáng lập áp dụng mức phí nền tảng đã giảm, do nền tảng thiết lập theo từng đơn. Khi điều đó xảy ra, khoản khấu trừ trên cột mốc của bạn sẽ *nhỏ hơn* — mức phí ưu đãi cho nhà tuyển dụng đồng nghĩa với việc nhiều tiền hơn từ cột mốc đến tay bạn trong đơn hàng đó.

## Tiền đến tay bạn bằng cách nào

Có hai kênh chi trả, và hồ sơ của bạn quyết định bạn thuộc kênh nào:

- **Stripe Connect (mặc định).** Nếu mạng lưới chi trả của Stripe bao phủ quốc gia của bạn, bạn sẽ liên kết một tài khoản Stripe trong quá trình đăng ký. Khi một cột mốc được giải ngân, nền tảng gửi khoản chuyển tiền vào tài khoản đã liên kết của bạn, và Stripe xử lý chặng cuối cùng đến ngân hàng của bạn.
- **Chi trả ngoại tuyến (dự phòng).** Phạm vi chi trả nhanh của Stripe không bao phủ mọi khu vực nơi những kỹ sư tự động hóa giỏi đang sinh sống. Nếu bạn thuộc trường hợp đó, khoản giải ngân của bạn sẽ được ghi nhận là chi trả thủ công và được nền tảng xử lý ngoại tuyến. Thông báo giải ngân sẽ cho bạn biết rõ ràng tiền của bạn đi theo con đường nào, nên không bao giờ có sự mập mờ về việc một khoản chuyển tiền có đang trên đường hay không.

Bản thân quy trình giải ngân được thiết kế phòng vệ chặt chẽ: hệ thống khóa cột mốc theo cách nguyên tử trước khi gửi tiền (nên việc nhấp đúp hay tình trạng tranh chấp truy cập không bao giờ có thể kích hoạt hai lần chuyển tiền), và nếu một khoản chuyển tiền thất bại giữa chừng, cột mốc sẽ quay về trạng thái đã nạp tiền để việc giải ngân có thể thử lại — tiền vẫn nằm trong ký quỹ thay vì biến mất vào một trạng thái lỗi. Bạn sẽ nhận được email và thông báo trong ứng dụng ngay khi một khoản giải ngân hoàn tất.

## Khi tranh chấp đóng băng một cột mốc

Nếu nhà tuyển dụng không đồng ý rằng một cột mốc đã được bàn giao, họ có thể mở tranh chấp trước khi giải ngân. Đây là điều đó có nghĩa gì với bạn, cụ thể:

<!-- Nguồn duy nhất của con số thời hạn nộp bằng chứng: src/routes/disputes.js (EVIDENCE_WINDOW_MS = 5 ngày). -->
1. **Cột mốc bị đóng băng.** Một cột mốc đang tranh chấp không thể được giải ngân trong khi tranh chấp còn mở — nhưng nó cũng không thể bị hoàn tiền âm thầm sau lưng bạn. Tiền vẫn bị khóa trong ký quỹ cho đến khi tranh chấp được giải quyết.
2. **Thời hạn nộp bằng chứng 5 ngày mở ra.** Kể từ thời điểm tranh chấp được nộp, cả hai bên có năm ngày để gửi bằng chứng. Đây là lúc thói quen làm việc trên nền tảng phát huy tác dụng: các lượt check-in GPS từ công việc tại hiện trường, ảnh được tải lên trong quá trình làm việc, hồ sơ cột mốc và tin nhắn WarRoom cùng tạo thành một dấu vết có gắn thời gian tồn tại *vì bạn đã làm việc thông qua nền tảng*, chứ không phải vì bạn phải vội vã dựng lại nó sau đó.
3. **Nền tảng xem xét bằng chứng và phân xử.** Kết quả phân xử dựa theo hồ sơ, không dựa theo ai nói to hơn. Tùy vào những gì bằng chứng thể hiện, tiền sẽ được giải ngân cho bạn hoặc trả lại cho nhà tuyển dụng.

Lời khuyên thực tế: hãy coi việc lưu giữ bằng chứng là một thói quen, không phải phản ứng khẩn cấp. Hãy check-in tại hiện trường, tải ảnh lên trong quá trình làm việc, giữ các trao đổi về phạm vi công việc trong khung chat dự án. Những kỹ sư có dấu vết rõ ràng hiếm khi thua những tranh chấp đáng lẽ họ không nên thua.

## Sổ cái của bạn: một nơi duy nhất đối soát mọi thứ

Mọi sự kiện tài chính trên tài khoản của bạn — cột mốc đã nạp tiền, cột mốc đã giải ngân, phí đã khấu trừ — đều được ghi lại trong **sổ cái tài chính** của bạn, có thể xem trong [bảng điều khiển tài chính](/finance). Đây là nguồn sự thật duy nhất của bạn để đối soát: những gì đã được cam kết, những gì đã giải ngân, và những gì bạn đã được trả, theo từng cột mốc, kèm dấu thời gian. Không phải lần theo hóa đơn qua các luồng email.

## Danh sách kiểm tra

Trước khi bắt đầu bất kỳ cột mốc nào: xác nhận nó đã được nạp tiền. Trong quá trình làm việc: check-in, chụp ảnh, trao đổi ngay trong nền tảng. Khi giải ngân: kiểm tra thông báo có khớp với sổ cái của bạn không. Đó là toàn bộ hệ thống — ký quỹ trước khi làm việc, một khoản phí công khai chỉ thu một lần khi giải ngân, một kênh chi trả phù hợp với khu vực của bạn, một quy trình tranh chấp dựa trên bằng chứng, và một sổ cái không bao giờ quên. Nó được thiết kế để câu trả lời cho câu hỏi "tôi có được trả tiền không?" đã được xác định từ trước khi câu hỏi đó cần được đặt ra.

*Chi tiết về phí và điều khoản dành cho khách hàng sáng lập có tại [trang bảng giá](/pricing). Mới tham gia nền tảng? Hãy bắt đầu với [cách hoạt động của các kỳ thi chứng chỉ](/playbook/how-certification-exams-work) — chứng chỉ là điều kiện để bạn có thể được phân công công việc ngay từ đầu.*
