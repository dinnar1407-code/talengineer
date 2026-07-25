---
title: Chính Sách Bảo Mật
description: Talengineer thu thập những dữ liệu nào, sử dụng ra sao, các bên xử lý nào tiếp cận được, và cách liên hệ với chúng tôi về vấn đề này. Bản nháp dùng ngôn ngữ đơn giản, đang chờ bộ phận pháp lý xem xét.
date: 2026-07-24
lang: vi
slug: privacy
draft: true
---

<!--
  诚实红线说明（不渲染）：本文件是"按代码库实况写的平实描述"，每一条都对应
  仓库里真实存在的机制；数字均标注单一来源。draft: true 期间页面带 noindex + 草稿横幅，
  Terry 法务终审通过后把 draft 翻成 false 才算发布。
-->

Đây là mô tả bằng ngôn ngữ đơn giản về những gì nền tảng Talengineer hiện đang thực sự thu thập và thực hiện với dữ liệu của bạn. Nội dung được viết để chính xác chứ không nhằm liệt kê đầy đủ theo ngôn ngữ pháp lý. **Đây là bản nháp đang chờ bộ phận pháp lý xem xét** — nếu có điều gì chưa rõ, hoặc bạn muốn dữ liệu của mình được sửa, xuất ra hoặc xóa, hãy gửi email đến **hello@talengineer.us** và sẽ có người trực tiếp phản hồi.

Talengineer ("chúng tôi") vận hành trang web và sàn giao dịch tại talengineer.us, kết nối các doanh nghiệp sản xuất ("nhà tuyển dụng") với kỹ sư tự động hóa công nghiệp ("kỹ sư").

## Những gì chúng tôi thu thập

**Thông tin cơ bản của tài khoản.** Khi bạn đăng ký, chúng tôi lưu địa chỉ email, vai trò của bạn (nhà tuyển dụng hoặc kỹ sư) và mật khẩu. Mật khẩu chỉ được lưu dưới dạng hash bcrypt có muối (salted) — chúng tôi không thể đọc được mật khẩu của bạn và không bao giờ lưu ở dạng văn bản thuần.

**Phiên đăng nhập.** Sau khi đăng nhập, trình duyệt của bạn lưu một token phiên đã ký (JWT) trong localStorage để giữ bạn ở trạng thái đăng nhập. Token hết hạn sau 24 giờ. <!-- nguồn: src/routes/auth.js JWT_EXPIRES_IN -->

**Xác minh nhà tuyển dụng (KYC).** Nhà tuyển dụng muốn nạp tiền cho dự án cần cung cấp tên công ty, và có thể tùy chọn cung cấp website và số điện thoại công ty. Đội ngũ của chúng tôi xem xét thủ công các thông tin này; chúng tôi lưu thời điểm gửi, trạng thái xem xét và ghi chú (nếu có) của người xét duyệt.

**Hồ sơ kỹ sư.** Kỹ sư cung cấp thông tin nghề nghiệp mà họ chọn công khai cho nhà tuyển dụng: kỹ năng, mức phí theo giờ, kinh nghiệm, các mục trong portfolio và ảnh đại diện. Kết quả sàng lọc và chứng chỉ (xem bên dưới) được đính kèm vào hồ sơ.

**Sàng lọc kỹ thuật và các kỳ thi chứng chỉ.** Kỹ sư thực hiện bài sàng lọc kỹ thuật do AI thực hiện, và có thể tham gia các kỳ thi chứng chỉ. Chúng tôi lưu câu trả lời của bạn cùng với điểm số và phản hồi do AI tạo ra. Câu trả lời bài thi được chấm với sự hỗ trợ của các mô hình Gemini của Google, và mọi chứng chỉ đều được quản trị viên là con người xem xét trước khi cấp — chỉ riêng kết quả AI không bao giờ tự cấp chứng chỉ.

**Kiểm tra lý lịch.** Khi có kiểm tra lý lịch được ghi nhận, quy trình hiện tại là thủ công: quản trị viên xem xét bằng chứng và ghi nhận trạng thái đạt/không đạt, kèm liên kết bằng chứng tùy chọn và ngày hết hạn. Chúng tôi chưa bật bất kỳ API kiểm tra lý lịch của bên thứ ba nào theo hình thức tự động.

**Tài liệu thuế (W-9).** Kỹ sư có thể tải lên mẫu W-9. Các tệp này được lưu trong một kho lưu trữ riêng tư không thể truy cập công khai; chỉ quản trị viên mới có thể xem thông qua các URL đã ký có hiệu lực ngắn (khoảng 5 phút), và trạng thái xem xét được lưu kèm theo. <!-- nguồn: src/routes/uploads.js / src/routes/tax.js kho riêng tư + URL đã ký hiệu lực ngắn -->

**Các tệp tải lên khác.** Ảnh đại diện, các mục portfolio, ảnh hoàn công và giấy chứng nhận bảo hiểm (COI) được tải lên qua một endpoint duy nhất chấp nhận các tệp JPG, PNG, WebP và PDF tối đa 5 MB. <!-- nguồn: src/routes/uploads.js MAX_FILE_SIZE / ALLOWED_MIME -->

**Check-in GPS cho công việc tại hiện trường.** Khi kỹ sư check-in vào một cột mốc tại hiện trường đã được nạp tiền, lượt check-in có thể bao gồm tọa độ GPS. Máy chủ của chúng tôi so sánh tọa độ này với tọa độ của địa điểm dự án ("hàng rào địa lý"). So sánh này chỉ mang tính tham khảo — một lượt check-in nằm ngoài phạm vi vẫn thành công, kết quả chỉ đơn giản được ghi nhận và hiển thị cho nhà tuyển dụng và quản trị viên. Chúng tôi không theo dõi vị trí vào bất kỳ thời điểm nào khác; tọa độ chỉ được thu thập tại thời điểm check-in.

**Tin nhắn dự án và dịch máy.** Tin nhắn bạn gửi trong không gian làm việc của dự án được lưu trữ để cả hai bên có thể đọc cuộc trò chuyện. Để hỗ trợ các nhóm đa ngôn ngữ, nội dung tin nhắn được gửi đến API Gemini của Google để dịch. Tin nhắn gốc luôn là bản ghi có giá trị chính thức.

**Thanh toán.** Thanh toán chạy trên Stripe. Khi nhà tuyển dụng nạp tiền cho một cột mốc, họ thanh toán qua trang Stripe Checkout do Stripe lưu trữ — **số thẻ không bao giờ chạm vào máy chủ của chúng tôi** và chúng tôi không bao giờ lưu trữ chúng. Việc trả tiền cho kỹ sư sử dụng Stripe Connect; danh tính và thông tin ngân hàng cần thiết để chi trả được Stripe thu thập và lưu giữ, không phải chúng tôi. Chúng tôi chỉ lưu trạng thái thanh toán, số tiền và các bút toán sổ cái cần thiết để vận hành ký quỹ.

**Bản tin.** Nếu bạn để lại email trên công cụ tính chi phí, sách trắng hoặc các biểu mẫu ở chân trang, chúng tôi lưu vào danh sách người đăng ký. Chúng tôi chưa gửi bất kỳ email bản tin nào; khi gửi, mỗi lần gửi sẽ kèm liên kết hủy đăng ký, và bạn cũng có thể hủy đăng ký bất cứ lúc nào bằng cách gửi email cho chúng tôi.

## Chúng tôi sử dụng dữ liệu như thế nào

Chúng tôi sử dụng dữ liệu trên để vận hành sàn giao dịch: ghép nối kỹ sư với dự án, vận hành ký quỹ theo cột mốc, cấp chứng chỉ, xử lý tranh chấp, gửi email giao dịch (qua Resend) và giữ cho dịch vụ an toàn. Chúng tôi không bán dữ liệu của bạn, và không vận hành mạng quảng cáo hay công cụ theo dõi quảng cáo trên trang web.

## Ai xử lý dữ liệu của bạn

Chúng tôi dựa vào một số ít nhà cung cấp hạ tầng, mỗi bên chỉ nhận những gì công việc của họ yêu cầu:

| Nhà cung cấp | Việc họ làm với dữ liệu của bạn |
| --- | --- |
| Supabase | Lưu trữ cơ sở dữ liệu PostgreSQL và bộ nhớ tệp của chúng tôi |
| Railway | Lưu trữ các máy chủ ứng dụng |
| Stripe | Xử lý thanh toán và chi trả cho kỹ sư (dữ liệu thẻ và ngân hàng nằm tại Stripe) |
| Google (API Gemini) | Phân tích AI, chấm điểm bài thi và dịch tin nhắn |
| Resend | Gửi email giao dịch và thông báo |
| Sentry | Thu thập báo cáo lỗi để chúng tôi khắc phục sự cố |

## Cookie và bộ nhớ cục bộ

Chúng tôi không sử dụng cookie quảng cáo hoặc theo dõi của bên thứ ba. Trang web lưu một số mục trong localStorage của trình duyệt bạn: lựa chọn giao diện (`tal-theme`), lựa chọn ngôn ngữ (`tal_lang`), phiên đăng nhập và bộ nhớ đệm vai trò theo từng tài khoản khi bạn đăng nhập (`tal_user`, `tal_role_<email>`), cùng các cờ ghi nhớ rằng bạn đã bỏ qua lời nhắc cài đặt ứng dụng (`tal_pwa_install_dismissed`, `tal-ios-a2hs-dismissed`). Đăng nhập quản trị viên còn lưu thêm `tal_admin_token`. Xóa bộ nhớ trình duyệt sẽ xóa tất cả các mục này. <!-- nguồn: hooks/useTheme.js / hooks/useLang.js / pages/finance.jsx / pages/admin.jsx / components/PwaSetup.jsx -->

## Lưu trữ, chỉnh sửa và xóa

Chúng tôi lưu giữ hồ sơ tài khoản và giao dịch trong thời gian tài khoản của bạn còn hoạt động và trong thời gian cần thiết cho hồ sơ tài chính và tranh chấp. Để chỉnh sửa dữ liệu, xuất dữ liệu hoặc xóa tài khoản, hãy gửi email đến **hello@talengineer.us** từ địa chỉ đã đăng ký. Yêu cầu xóa hiện được đội ngũ của chúng tôi xử lý thủ công; các hồ sơ bắt buộc phải lưu giữ (ví dụ: các bút toán sổ cái cho các khoản thanh toán đã hoàn tất) có thể được giữ lại khi luật yêu cầu.

## Bảo mật

Ngoài mật khẩu đã băm và dữ liệu thẻ do Stripe lưu giữ, các tài liệu nhạy cảm được lưu trong các kho riêng tư với chính sách bảo mật cấp hàng từ chối tất cả theo mặc định — mọi truy cập đều phải qua máy chủ của chúng tôi, và quản trị viên chỉ xem được tài liệu thuế qua các URL đã ký có hiệu lực ngắn. Nếu bạn phát hiện sự cố bảo mật, vui lòng báo cho chúng tôi tại **hello@talengineer.us**.

## Thay đổi

Trong thời gian tài liệu này còn được đánh dấu là bản nháp, nội dung có thể thay đổi khi trải qua quá trình xem xét pháp lý. Các thay đổi quan trọng sau khi phát hành sẽ được cập nhật trên trang này kèm ngày cập nhật mới.

Liên quan: [Điều Khoản Dịch Vụ](/terms)
