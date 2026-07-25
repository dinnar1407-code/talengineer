---
title: Cách tính điểm TalScore
description: Công thức chính xác đằng sau TalScore của bạn — bốn khía cạnh có trọng số, mức trung bình đánh giá theo Bayes giúp chống thao túng đánh giá, các quy tắc độ tin cậy cùng ranh giới đỏ về tỷ lệ tranh chấp, ngưỡng các hạng, và điều thực sự tác động đến từng con số.
date: 2026-07-24
lang: vi
type: guide
track: general
audience: engineer
slug: how-talscore-is-computed-vi
group: how-talscore-is-computed
---

# Cách tính điểm TalScore

TalScore là điểm chất lượng của bạn trên TalEngineer: một con số duy nhất từ 0 đến 100, gộp bốn tín hiệu có thể kiểm chứng thành một chỉ số mà nhà tuyển dụng có thể dùng để xếp hạng và nền tảng có thể dùng để đặt ngưỡng. Khác với đánh giá sao trên các nền tảng freelance thông thường, mọi yếu tố đầu vào của TalScore đều là thứ chính nền tảng đã xác minh — một bài sàng lọc bạn đã làm, một chứng chỉ bạn đã đạt được, một đánh giá từ dự án đã thanh toán và hoàn thành, một hồ sơ bàn giao có dấu thời gian. Bài viết này trình bày công thức thực tế, vì một điểm số bạn không thể xem xét được thì cũng là một điểm số bạn không thể chủ động cải thiện.

## Bốn khía cạnh và trọng số của chúng

Điểm của bạn là tổng của bốn thành phần có trọng số:

<!-- TalScore 全部数字单一来源：src/services/talScore.js（WEIGHTS 25/25/30/20、CERT_LEVEL_POINTS 8/16/25、RATING_PRIOR 3.5×5、RELIABILITY_COMPLETED_CAP 10、NO_DISPUTE_BONUS 10、DISPUTE_RATE_LIMIT 0.10、TIER_THRESHOLDS 85/70/55）。各数字在本页只出现一次。 -->
| Khía cạnh | Trọng số | Đo lường điều gì |
|---|---|---|
| Sàng lọc AI | 25 | Điểm của bạn trong bài sàng lọc kỹ thuật mà mọi kỹ sư đều làm khi đăng ký |
| Chứng chỉ nền tảng | 25 | Các chứng chỉ bạn đã đạt được, theo hướng chuyên môn và cấp độ |
| Đánh giá của nhà tuyển dụng | 30 | Đánh giá sao từ các dự án đã thanh toán và hoàn thành — tính trung bình theo Bayes |
| Độ tin cậy | 20 | Số đơn hàng đã hoàn thành cộng với hồ sơ tranh chấp sạch |

Các trọng số phản ánh một triết lý có chủ đích: trải nghiệm thực tế của nhà tuyển dụng (đánh giá, 30) được tính cao hơn một chút so với bất kỳ bài kiểm tra đơn lẻ nào, nhưng không khía cạnh nào chiếm ưu thế tuyệt đối — một người làm bài xuất sắc nhưng không có hồ sơ bàn giao, và một người bàn giao nhiều nhưng chưa từng lấy chứng chỉ, cả hai đều dừng lại ở mức thấp hơn một người vững ở mọi mặt.

## Khía cạnh 1: Sàng lọc AI (tối đa 25 điểm)

Kết quả sàng lọc lúc đăng ký của bạn được ánh xạ tuyến tính vào khía cạnh này: điểm sàng lọc 0–100 trở thành 0–25 điểm TalScore. Đây là mức năng lực nền tảng của bạn, được xác định một lần khi bạn tham gia. Cách duy nhất để cải thiện nó là thực sự thể hiện tốt trong bài sàng lọc — không có cách nào "cày" khía cạnh này về sau, và đó chính xác là lý do ba khía cạnh còn lại tồn tại.

## Khía cạnh 2: Chứng chỉ (tối đa 25 điểm)

Với mỗi hướng chuyên môn, chỉ cấp độ **cao nhất** của bạn được tính: **L1 được 8 điểm, L2 được 16 điểm, L3 được 25 điểm**, và khía cạnh này giới hạn ở mức 25. Hãy đọc kỹ các con số này, vì chúng mã hóa một chiến lược: chỉ một chứng chỉ L3 duy nhất đã kịch trần khía cạnh này. Hai chứng chỉ L1 ở hai hướng khác nhau (16 điểm) bằng một L2 — và vẫn kém xa một L3. Ở đây, chiều sâu thắng chiều rộng. Chứng chỉ ở nhiều hướng khác nhau vẫn quan trọng đối với *dự án nào bạn có thể được phân công* — nhưng xét về TalScore, leo hết một bậc thang thì có lợi hơn là bắt đầu ở nhiều bậc thang cùng lúc.

## Khía cạnh 3: Đánh giá — và vì sao một đánh giá 5 sao không thể đưa bạn lên đỉnh ngay lập tức

Điểm trung bình thô rất dễ bị thao túng: một đánh giá 5 sao thân thiện có thể đưa một người mới vượt qua một kỹ sư kỳ cựu với bốn mươi dự án đạt 4.8 sao. Thay vào đó, TalScore dùng **trung bình theo Bayes**: điểm đánh giá của bạn được tính như thể bạn bắt đầu với **5 đánh giá ảo ở mức 3.5 sao** — mức tham chiếu chung toàn nền tảng — rồi hòa trộn với các đánh giá thực của bạn. Kết quả (trên thang 5 sao) sau đó được ánh xạ vào khía cạnh 30 điểm.

Hệ quả bạn cần ghi nhớ: khi số đánh giá còn ít, điểm hiệu dụng của bạn sẽ nằm quanh mức 3.5 bất kể những đánh giá đó tốt đến đâu, và mỗi đánh giá thực bổ sung sẽ kéo nó gần hơn về mức trung bình thật của bạn. Giai đoạn đầu, *khối lượng dự án hoàn thành và được đánh giá tốt* tác động đến khía cạnh này nhiều hơn là sự hoàn hảo ở một dự án đơn lẻ. Theo thời gian, ảnh hưởng của mức tham chiếu sẽ giảm dần và thành tích thực của bạn sẽ chiếm ưu thế. Đây là hệ thống công bằng nhất mà chúng tôi biết để so sánh một người mới với một kỹ sư kỳ cựu mà không khiến bên nào bị đánh giá sai lệch.

## Khía cạnh 4: Độ tin cậy — và ranh giới đỏ

Độ tin cậy là phép tính đơn giản nhất, nhưng cũng là lằn ranh sắc bén nhất:

- **1 điểm cho mỗi đơn hàng hoàn thành, tối đa 10 điểm.** Mười dự án hoàn thành là đủ để kịch trần nửa phần liên quan đến bàn giao.
- **Thưởng 10 điểm nếu không có tranh chấp nào.** Một hồ sơ sạch có giá trị tương đương mười đơn hàng đã hoàn thành.
- **Ranh giới đỏ: nếu tỷ lệ tranh chấp của bạn vượt quá 10% số đơn hàng đã hoàn thành, toàn bộ khía cạnh này về 0.** Không phải giảm bớt — mà về hẳn 0. Và một kỹ sư có tranh chấp nhưng không có đơn hàng hoàn thành nào sẽ bị coi là rủi ro cao nhất.

Ý đồ thiết kế rất rõ ràng: nền tảng thà bạn giao khối lượng công việc ít hơn một chút nhưng không có xung đột, còn hơn là khối lượng lớn nhưng đầy va chạm. Một tranh chấp trên một hồ sơ dài sẽ không đưa bạn về 0 (nó chỉ khiến bạn mất khoản thưởng), nhưng một chuỗi tranh chấp lặp lại là điều gây thiệt hại nhất cho điểm số của bạn.

## Các hạng

Điểm của bạn được ánh xạ thành một huy hiệu hạng hiển thị trên hồ sơ: **từ 85 điểm trở lên là Bạch Kim, 70–84 là Vàng, 55–69 là Bạc**, và dưới mức đó là Đồng. Các hạng chỉ đơn thuần là cách trình bày của cùng một con số — không có một hội đồng xét hạng riêng biệt nào cả.

## Khi nào được cập nhật, và bạn thực sự nên làm gì

TalScore tự động tính lại khi các đầu vào của nó thay đổi — sau khi có đánh giá mới, sau khi cột mốc được giải ngân, khi một chứng chỉ được cấp. Hồ sơ của bạn hiển thị chi tiết theo từng khía cạnh, để bạn có thể thấy chính xác điểm của mình nằm ở đâu và chưa có ở đâu.

Chiến lược rút ra từ công thức này: hãy lấy chứng chỉ sâu ở hướng chuyên môn chính của bạn (chỉ một L3 đã kịch trần khía cạnh chứng chỉ), hoàn thành dự án gọn gàng và để số lượng đánh giá tích lũy vượt qua ảnh hưởng của mức tham chiếu, và coi việc tránh tranh chấp là điều cần làm gần như bằng mọi giá — hãy trao đổi sớm qua nền tảng ngay khi một dự án có dấu hiệu trục trặc, vì một cuộc trao đổi được giải quyết ổn thỏa không khiến bạn mất gì, trong khi một tranh chấp có thể khiến bạn mất tới một phần năm điểm số.

*Xem chi tiết điểm số của chính bạn tại [trang TalScore](/talscore). Để biết điểm số này được sử dụng ra sao trong thực tế, hãy đọc [cách được ghép nối trên TalEngineer](/playbook/getting-matched-on-talengineer).*
