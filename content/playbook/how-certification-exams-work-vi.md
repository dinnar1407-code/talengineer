---
title: Cách các kỳ thi chứng chỉ hoạt động trên TalEngineer
description: Hướng dẫn đầy đủ dành cho kỹ sư về các kỳ thi chứng chỉ nền tảng — định dạng 10 câu hỏi, đồng hồ 40 phút, cách chấm điểm bằng AI kết hợp rà soát của con người hoạt động ra sao, lộ trình tiến bậc từ L1 lên L3, thời gian chờ thi lại, và vì sao ngân hàng câu hỏi khiến việc học thuộc lòng trở nên vô nghĩa.
date: 2026-07-24
lang: vi
type: certification
track: general
audience: engineer
slug: how-certification-exams-work-vi
group: how-certification-exams-work
---

# Cách các kỳ thi chứng chỉ hoạt động trên TalEngineer

Trên TalEngineer, chứng chỉ không phải là vật trang trí — đó là cánh cổng bắt buộc. **Chỉ kỹ sư có chứng chỉ mới được phân công chính thức vào một dự án — và khi dự án yêu cầu một hướng chứng chỉ cụ thể, chứng chỉ của bạn phải thuộc đúng hướng đó.** Chỉ một quy tắc đó thôi cũng đủ khiến bạn nên tìm hiểu kỹ kỳ thi trước khi bước vào. Hướng dẫn này trình bày chính xác kỳ thi trông như thế nào, được chấm điểm ra sao, bạn tiến bậc từ L1 lên L3 thế nào, và điều gì xảy ra nếu bạn không đạt. Mọi nội dung dưới đây đến từ đúng cấu hình quy tắc mà hệ thống thi thực sự vận hành theo, nên những gì bạn đọc ở đây chính là những gì bạn sẽ trải qua trong phòng thi.

## Các hướng chứng chỉ và nội dung bạn đang được chứng nhận

Chứng chỉ được cấp theo bốn hướng, tương ứng với bốn chuyên môn của nền tảng: **PLC**, **Robotics**, **Machine Vision** và **Electrical**. Bạn lấy chứng chỉ theo từng hướng, và có thể sở hữu chứng chỉ ở nhiều hơn một hướng — nhiều kỹ sư tự động hóa đang làm việc thực tế thành thạo cả PLC lẫn điện, hoặc cả robot lẫn thị giác máy. Mỗi hướng có ba bậc, và mỗi tổ hợp hướng–bậc là một kỳ thi riêng biệt.

## Định dạng kỳ thi

<!-- 考试数字单一来源：src/config/training.js（EXAM_QUESTION_MIX 5/3/2、QUESTIONS_PER_EXAM 10、EXAM_MINUTES 40、PASS_SCORE 70、RETAKE_COOLDOWN_DAYS 7、EXAM_BANK_SIZE 20）。本页全部考试数字只出现在本节及其后各一次。 -->
Mỗi kỳ thi gồm **10 câu hỏi trong 40 phút**, chia thành ba loại câu hỏi:

- **5 câu hỏi trắc nghiệm.** Bốn phương án, một đáp án đúng. Các câu này được chấm tự động theo đáp án chuẩn trên máy chủ — tức thì, xác định, không có yếu tố diễn giải nào.
- **3 câu hỏi tình huống.** Các bài toán trả lời ngắn lấy từ tình huống công việc thực tế trong hướng của bạn — kiểu quyết định mang tính phán đoán mà bạn sẽ gặp trên sàn chạy thử thực tế. Được AI chấm dựa trên lập luận kỳ vọng của câu hỏi.
- **2 câu hỏi phân tích.** Các bài toán dài hơn, nhiều điểm, kiểm tra chiều sâu: thiết kế một cách tiếp cận, chẩn đoán một lỗi, cân nhắc đánh đổi. Cũng được AI chấm, và đây là nơi các thí sinh L2 và L3 tự tách mình ra khỏi L1.

Đồng hồ được thực thi phía máy chủ: thời hạn của bạn được cố định ngay khi bạn bắt đầu, và một bài nộp sau thời hạn sẽ bị đánh dấu hết hạn bất kể trình duyệt của bạn hiển thị gì. Hãy hoạch định thời gian — dành khoảng một đến hai phút cho mỗi câu trắc nghiệm sẽ để lại thời gian thực sự cho phần tình huống và phân tích, nơi phần lớn tư duy diễn ra.

## Cách chấm điểm hoạt động — và vì sao đạt không có nghĩa là ngay lập tức

**Ngưỡng đạt là 70 trên 100**, tính bằng điểm trung bình trên các câu đã chấm của bạn. Nhưng vượt qua vòng chấm điểm bằng AI chưa phải là điểm cuối của quy trình; đó là bước áp chót:

1. **AI chấm bài của bạn.** Câu trắc nghiệm được so với đáp án chuẩn; câu trả lời tình huống và phân tích được AI đánh giá về tính đúng đắn và chất lượng lập luận. Bạn nhận được điểm số và phản hồi cho từng câu.
2. **Một quản trị viên con người rà soát trước khi bất kỳ chứng chỉ nào được cấp.** Một lượt thi đã được AI cho đạt sẽ vào hàng chờ rà soát của con người, và chỉ sau khi rà soát đó, chứng chỉ mới xuất hiện trên hồ sơ của bạn. Đây là chủ đích: chứng chỉ cho phép thực hiện công việc thực tế tại hiện trường, nơi sai sót có hậu quả vật lý, nên một con người nắm cánh cổng cuối cùng.
3. **Nếu việc chấm điểm bằng AI không khả dụng, hệ thống sẽ đóng an toàn (fail closed).** Câu trả lời của bạn được lưu giữ và chuyển cho đội ngũ chấm thủ công — nền tảng không bao giờ mặc định coi một bài chưa được chấm là đạt.

Nếu điểm của bạn dưới ngưỡng, bạn sẽ thấy phản hồi, và cách tiếp nhận trung thực là coi đó như một chẩn đoán chứ không phải một lời chê trách — phản hồi phần tình huống và phân tích thường chỉ ra chính xác lỗ hổng lập luận cần khắc phục trước khi thi lại.

## Thi lại: thời gian chờ 7 ngày

Một lượt thi không đạt sẽ kích hoạt **thời gian chờ 7 ngày** trước khi bạn có thể thi lại cùng hướng và bậc đó. Thời gian chờ tồn tại vì một lý do duy nhất: nó khiến việc cày kỳ thi bằng cách lặp lại nhanh trở thành một chiến lược thua cuộc so với việc thực sự ôn luyện. Hãy tận dụng tuần đó. Phản hồi từ lượt thi không đạt của bạn cho biết nên dành thời gian đó vào đâu.

## Lộ trình tiến bậc: L1 → L2 → L3

Các bậc là tuần tự trong cùng một hướng:

- **L1 mở cho tất cả mọi người.** Không có điều kiện tiên quyết — đây là chứng chỉ đầu vào chứng minh nền tảng đủ năng lực.
- **L2 yêu cầu có L1 còn hiệu lực trong cùng hướng. L3 yêu cầu có L2 còn hiệu lực.** Bạn không thể bỏ qua các bậc; mỗi kỳ thi giả định và xây dựng dựa trên chiều sâu đã được chứng nhận ở bậc dưới nó.

Điều này quan trọng khi lập kế hoạch: nếu mục tiêu của bạn là có thể được phân công cho công việc cấp L3 — chạy thử phức tạp, kiến trúc hệ thống, dẫn dắt kỹ thuật — thì bạn đang nhìn vào ba kỳ thi liên tiếp, không phải một kỳ thi lớn duy nhất. Chứng chỉ vẫn còn hiệu lực trừ khi hết hạn hoặc bị thu hồi, và chỉ những chứng chỉ còn hiệu lực mới được tính vào điều kiện tiên quyết.

## Vì sao học thuộc lòng đề thi không có tác dụng

Đằng sau mỗi tổ hợp hướng, bậc và ngôn ngữ là một ngân hàng câu hỏi với mục tiêu **20 bộ đề thi riêng biệt**, và đề thi của bạn được rút ngẫu nhiên từ kho đó. Kho đề tiếp tục mở rộng cho đến khi đạt dung lượng mục tiêu, nghĩa là xác suất bạn gặp một bộ đề mà bạn đã học thuộc — hoặc được bạn bè mô tả lại — được thiết kế để ngày càng thấp đi. Kết hợp với việc các câu hỏi tình huống và phân tích được chấm dựa trên lập luận chứ không phải khớp từ khóa, cách chuẩn bị đáng tin cậy duy nhất là cách không hào nhoáng: thực sự am hiểu chuyên môn của bạn.

## Trước khi bước vào phòng thi

Danh sách thực tế: hãy chọn trước hướng phù hợp nhất với kinh nghiệm thực tế mạnh nhất của bạn (một L2 vững chắc ở một hướng tốt hơn một L1 vừa đủ đạt ở ba hướng); dành ra trọn vẹn 40 phút thực sự rảnh, vì đồng hồ của máy chủ không có nút tạm dừng; và trả lời các câu hỏi tình huống theo cách bạn sẽ giải thích một quyết định cho khách hàng — lập luận trước, kết luận nêu rõ ràng.

Kỳ thi có thể vượt qua được bởi bất kỳ kỹ sư nào thực sự làm công việc này. Đó chính là mục đích. Nó không được thiết kế để trở thành một bức tường — nó được thiết kế để khi một nhà tuyển dụng nhìn thấy chứng chỉ của bạn, điều đó thực sự có ý nghĩa.

*Sẵn sàng bắt đầu? Hãy đến [Trung tâm Đào tạo](/training). Để hiểu chứng chỉ đóng góp thế nào vào vị thế tổng thể của bạn trên nền tảng, hãy đọc [cách TalScore được tính toán](/playbook/how-talscore-is-computed).*
