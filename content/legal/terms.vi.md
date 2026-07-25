---
title: Điều Khoản Dịch Vụ
description: Sàn giao dịch Talengineer thực sự vận hành như thế nào — tài khoản, phí, ký quỹ theo cột mốc, tranh chấp và chứng chỉ — bằng ngôn ngữ đơn giản. Bản nháp, đang chờ bộ phận pháp lý xem xét.
date: 2026-07-24
lang: vi
slug: terms
draft: true
---

<!--
  诚实红线说明（不渲染）：条款草稿只描述仓库里真实存在的机制（托管/费率/纠纷/认证/签到），
  不发明不存在的政策；平台数字各写一次并标注单一来源（fees.js / disputes.js）。
  管辖法律等纯法务决策留白待 Terry 法务审定，不臆造。
-->

Các điều khoản này mô tả, bằng ngôn ngữ đơn giản, cách sàn giao dịch Talengineer thực sự vận hành hôm nay và những gì bạn đồng ý khi sử dụng nó. **Đây là bản nháp đang chờ bộ phận pháp lý xem xét** — mục tiêu là trung thực về thực tiễn hiện tại hơn là liệt kê đầy đủ. Mọi câu hỏi xin gửi đến **hello@talengineer.us**.

## 1. Talengineer là gì

Talengineer là một sàn giao dịch kết nối các doanh nghiệp sản xuất ("nhà tuyển dụng") với các kỹ sư tự động hóa công nghiệp độc lập ("kỹ sư") cho công việc theo dự án. Kỹ sư trên nền tảng là những chuyên gia độc lập, không phải nhân viên của chúng tôi. Hợp đồng dịch vụ của một dự án là giữa nhà tuyển dụng và kỹ sư; Talengineer cung cấp hạ tầng ghép nối, ký quỹ, giao tiếp và chứng chỉ xung quanh hợp đồng đó.

## 2. Tài khoản

Bạn đăng ký với vai trò nhà tuyển dụng hoặc kỹ sư và đồng ý cung cấp thông tin chính xác. Nhà tuyển dụng muốn nạp tiền cho dự án phải trải qua bước xác minh (thông tin công ty, được đội ngũ của chúng tôi xem xét thủ công). Kỹ sư hoàn thành bài sàng lọc kỹ thuật do AI thực hiện trong quá trình onboarding; điểm sàng lọc được dùng để xếp hạng và đề xuất kỹ sư, và chỉ những kỹ sư có chứng chỉ nền tảng còn hiệu lực mới có thể được phân công vào một dự án. Bạn có trách nhiệm giữ an toàn thông tin đăng nhập của mình; phiên đăng nhập tự động hết hạn sau 24 giờ.

## 3. Phí

Nền tảng thu phí ký quỹ **15%** trên mỗi số tiền cột mốc, được trừ khi cột mốc được giải ngân cho kỹ sư. Khách hàng sáng lập được tính phí ưu đãi **5%**, thiết lập theo từng dự án. Không có phí cho việc đăng dự án hay tạo hồ sơ. <!-- nguồn: src/config/fees.js PLATFORM_FEE + demands.fee_pct (ưu đãi cho khách hàng sáng lập, feeFor() là đường tính phí duy nhất) -->

## 4. Ký quỹ theo cột mốc

Dự án được chia thành các cột mốc. Nhà tuyển dụng nạp tiền cho một cột mốc qua Stripe Checkout; cột mốc chỉ được đánh dấu là đã nạp tiền sau khi Stripe xác nhận thanh toán — chúng tôi không bao giờ đánh dấu tiền đã ký quỹ mà không có xác nhận thanh toán. Khi nhà tuyển dụng phê duyệt công việc đã bàn giao, cột mốc được giải ngân và kỹ sư được trả tiền (qua Stripe Connect hoặc phương án thay thế đã thỏa thuận) sau khi trừ phí nền tảng nêu trên. Số thẻ không bao giờ chạm vào máy chủ của chúng tôi; xem [Chính Sách Bảo Mật](/privacy) để biết cách xử lý dữ liệu thanh toán.

## 5. Công việc tại hiện trường và check-in

Đối với các cột mốc tại hiện trường, kỹ sư check-in qua nền tảng. Một lượt check-in yêu cầu chứng chỉ nền tảng còn hiệu lực và có thể bao gồm tọa độ GPS, được máy chủ của chúng tôi so sánh với vị trí địa điểm dự án. So sánh hàng rào địa lý này chỉ mang tính tham khảo: một lượt check-in nằm ngoài phạm vi vẫn thành công và chỉ đơn giản được ghi nhận để nhà tuyển dụng và quản trị viên xem. Kỹ sư có trách nhiệm tuân thủ các quy định an toàn và ra vào của địa điểm.

## 6. Tranh chấp

Nếu một trong hai bên không đồng ý về một cột mốc, họ có thể mở tranh chấp trên nền tảng. Kể từ thời điểm tranh chấp được mở, cả hai bên có **5 ngày** để nộp bằng chứng của mình. <!-- nguồn: src/routes/disputes.js EVIDENCE_WINDOW_MS (thời hạn nộp bằng chứng 5 ngày) --> Sau thời hạn nộp bằng chứng, quản trị viên nền tảng xem xét những gì cả hai bên đã nộp và quyết định cách phân bổ số tiền cột mốc đang tranh chấp. Việc mở tranh chấp sẽ tạm dừng luồng giải ngân bình thường của cột mốc đó cho đến khi có quyết định.

## 7. Chứng chỉ và tính năng AI

Chứng chỉ nền tảng đạt được thông qua các kỳ thi được chấm với sự hỗ trợ của các mô hình AI, sau đó được quản trị viên là con người xem xét trước khi cấp bất kỳ chứng chỉ nào. Chứng chỉ có thể hết hạn và có thể bị thu hồi vì lý do chính đáng (ví dụ: có bằng chứng gian lận). Nền tảng cũng sử dụng AI cho sàng lọc kỹ thuật, phân tích dự án và dịch tin nhắn. **Dịch máy được cung cấp như một tiện ích và có thể chứa lỗi — tin nhắn gốc luôn là phiên bản có giá trị chính thức.**

## 8. Sử dụng hợp lệ

Bạn đồng ý không khai sai danh tính, trình độ hoặc công ty của mình; không tải lên nội dung mà bạn không có quyền chia sẻ; không sử dụng nền tảng cho bất kỳ mục đích bất hợp pháp nào; và không cố dò xét hay phá vỡ hệ thống bảo mật của nền tảng. Chúng tôi có thể tạm ngưng các tài khoản vi phạm những quy tắc này hoặc cố gắng gian lận quy trình ký quỹ hoặc tranh chấp.

## 9. Trạng thái dịch vụ

Talengineer hiện đang trong giai đoạn **beta**. Chúng tôi nỗ lực giữ dịch vụ đáng tin cậy, nhưng không cam kết khả dụng liên tục không gián đoạn, và các tính năng có thể thay đổi khi nền tảng phát triển. Không nội dung nào trên nền tảng — bao gồm các mức phí tham chiếu, công cụ tính toán và hướng dẫn — là tư vấn pháp lý, thuế hay chuyên môn.

## 10. Chấm dứt tài khoản của bạn

Bạn có thể ngừng sử dụng nền tảng bất cứ lúc nào. Để đóng và xóa tài khoản, hãy gửi email đến **hello@talengineer.us** từ địa chỉ đã đăng ký; việc xóa được đội ngũ của chúng tôi xử lý thủ công. Các nghĩa vụ phát sinh trước khi đóng tài khoản (ví dụ: các cột mốc đã nạp tiền và tranh chấp đang mở) vẫn tồn tại cho đến khi được giải quyết.

## 11. Thay đổi và các mục còn để ngỏ

Trong thời gian tài liệu này còn được đánh dấu là bản nháp, nội dung có thể thay đổi khi trải qua quá trình xem xét pháp lý. Các mục như luật áp dụng và địa điểm giải quyết tranh chấp chính thức được cố ý để ngỏ cho quá trình xem xét đó, thay vì tự đặt ra ở đây. Các thay đổi quan trọng sau khi phát hành sẽ được cập nhật trên trang này kèm ngày cập nhật mới.

Liên quan: [Chính Sách Bảo Mật](/privacy)
