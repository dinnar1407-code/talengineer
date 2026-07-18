import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
// 复用 onboarding 的向导样式（卡片/进度条/按钮），保证视觉一致，不重复造 CSS
import styles from './onboarding.module.css';

const LS_USER_KEY = 'tal_user';

// i18n：与全站一致的页内 DICT 模式（en/zh 先行，其它语言回退英文）
const DICT = {
  en: {
    title: 'Certification Center',
    subtitle: 'Get certified by track and level. A valid platform certification is required before official on-site assignment.',
    myCerts: 'My Certifications', noCerts: 'No certifications yet — pick a track below and start with L1.',
    startExam: 'Start Exam', viewPath: '📚 Training Course', locked: 'Locked',
    typeChoice: 'Multiple choice', typeScenario: 'Scenario', typeAnalysis: 'Analysis',
    analysisHint: 'Structured answer expected: root cause / trade-offs / plan.',
    goStudy: '📚 View Training Course',
    studyLine: (m, h, d) => `Today ${m} min · Total ${h} h · ${d} days checked in`,
    lessonLoading: 'Generating lesson content…', keyPoints: '🔑 Key Points', fieldExample: '🏭 Field Example',
    thisSession: 'This session', backToCourse: '← Back to course',
    quizBtn: '📝 Module Quiz', quizTitle: 'Module Quiz', quizSubmit: 'Submit Answers', quizRetry: 'Try Again',
    quizScoreLabel: 'Score', correctIs: 'Correct answer',
    certified: 'Certified', nextLevel: 'Next', history: 'Exam History',
    examTitle: 'Certification Exam', timeLeft: 'Time left', submit: 'Submit Answers', submitting: 'Grading…',
    answerPh: 'Type your answer here…',
    resultPassed: '✅ Passed AI grading — pending admin review', resultFailed: '❌ Below the pass line',
    resultManual: '📝 Received — will be graded manually by our team',
    overall: 'Overall feedback', perQ: 'Per-question feedback', back: '← Back to tracks',
    pathTitle: 'Learning Path', estHours: 'Estimated study hours', practice: 'Hands-on practice', examTips: 'Exam tips',
    uploadedCourses: 'Instructor courses', pathLoading: 'Generating your learning path…',
    statusMap: { in_progress: 'In progress', submitted: 'Manual grading', ai_passed: 'Pending review', ai_failed: 'Not passed', certified: '🎓 Certified', rejected: 'Rejected', expired: 'Expired' },
    engineersOnly: 'The Certification Center is for engineer accounts. Please sign in as an engineer.',
  },
  zh: {
    title: '认证中心',
    subtitle: '按技能方向分级考证。持有效平台认证，才能获得现场正式工作的指派授权。',
    myCerts: '我的认证', noCerts: '还没有认证——从下面选个方向，从 L1 开始。',
    startExam: '开始考核', viewPath: '📚 培训课程', locked: '未解锁',
    typeChoice: '选择题', typeScenario: '场景题', typeAnalysis: '分析题',
    analysisHint: '需要结构化作答：根因 / 权衡取舍 / 实施方案。',
    goStudy: '📚 查看培训课程',
    studyLine: (m, h, d) => `今日已学 ${m} 分钟 · 累计 ${h} 小时 · 打卡 ${d} 天`,
    lessonLoading: '正在生成课程内容…', keyPoints: '🔑 要点', fieldExample: '🏭 现场案例',
    thisSession: '本次学习', backToCourse: '← 返回课程',
    quizBtn: '📝 随堂 Quiz', quizTitle: '随堂 Quiz', quizSubmit: '提交答案', quizRetry: '再练一次',
    quizScoreLabel: '得分', correctIs: '正确答案',
    certified: '已认证', nextLevel: '下一级', history: '考核记录',
    examTitle: '认证考核', timeLeft: '剩余时间', submit: '交卷', submitting: '评分中…',
    answerPh: '在这里作答…',
    resultPassed: '✅ AI 评分通过——等待平台复核发证', resultFailed: '❌ 未达及格线',
    resultManual: '📝 已收到答卷——将由平台人工阅卷',
    overall: '总体评价', perQ: '逐题反馈', back: '← 返回方向列表',
    pathTitle: '学习路径', estHours: '预计学习时长（小时）', practice: '动手练习', examTips: '考核提示',
    uploadedCourses: '讲师课程', pathLoading: '正在生成学习路径…',
    statusMap: { in_progress: '进行中', submitted: '人工阅卷中', ai_passed: '待复核', ai_failed: '未通过', certified: '🎓 已发证', rejected: '已驳回', expired: '已超时' },
    engineersOnly: '认证中心仅对工程师账号开放，请用工程师身份登录。',
  },
  es: {
    title: 'Centro de Certificación',
    subtitle: 'Certifícate por especialidad y nivel. Se requiere una certificación válida de la plataforma antes de la asignación oficial en sitio.',
    myCerts: 'Mis Certificaciones', noCerts: 'Aún sin certificaciones — elige una especialidad abajo y empieza con L1.',
    startExam: 'Iniciar Examen', viewPath: '📚 Curso de Formación', locked: 'Bloqueado',
    typeChoice: 'Opción múltiple', typeScenario: 'Escenario', typeAnalysis: 'Análisis',
    analysisHint: 'Respuesta estructurada esperada: causa raíz / compensaciones / plan.',
    goStudy: '📚 Ver Curso de Formación',
    studyLine: (m, h, d) => `Hoy ${m} min · Total ${h} h · ${d} días de asistencia`,
    lessonLoading: 'Generando contenido de la lección…', keyPoints: '🔑 Puntos Clave', fieldExample: '🏭 Ejemplo de Campo',
    thisSession: 'Esta sesión', backToCourse: '← Volver al curso',
    quizBtn: '📝 Quiz del Módulo', quizTitle: 'Quiz del Módulo', quizSubmit: 'Enviar Respuestas', quizRetry: 'Intentar de Nuevo',
    quizScoreLabel: 'Puntuación', correctIs: 'Respuesta correcta',
    certified: 'Certificado', nextLevel: 'Siguiente', history: 'Historial de Exámenes',
    examTitle: 'Examen de Certificación', timeLeft: 'Tiempo restante', submit: 'Enviar Respuestas', submitting: 'Calificando…',
    answerPh: 'Escribe tu respuesta aquí…',
    resultPassed: '✅ Aprobado por IA — pendiente de revisión del admin', resultFailed: '❌ Por debajo de la línea de aprobación',
    resultManual: '📝 Recibido — será calificado manualmente por nuestro equipo',
    overall: 'Comentario general', perQ: 'Comentario por pregunta', back: '← Volver a especialidades',
    pathTitle: 'Ruta de Aprendizaje', estHours: 'Horas de estudio estimadas', practice: 'Práctica', examTips: 'Consejos para el examen',
    uploadedCourses: 'Cursos de instructores', pathLoading: 'Generando tu ruta de aprendizaje…',
    statusMap: { in_progress: 'En curso', submitted: 'Calificación manual', ai_passed: 'Pendiente de revisión', ai_failed: 'No aprobado', certified: '🎓 Certificado', rejected: 'Rechazado', expired: 'Expirado' },
    engineersOnly: 'El Centro de Certificación es solo para cuentas de ingeniero. Inicia sesión como ingeniero.',
  },
  vi: {
    title: 'Trung tâm Chứng nhận',
    subtitle: 'Thi chứng chỉ theo chuyên ngành và cấp độ. Cần có chứng nhận nền tảng hợp lệ trước khi được phân công chính thức tại hiện trường.',
    myCerts: 'Chứng nhận của tôi', noCerts: 'Chưa có chứng nhận — chọn một chuyên ngành bên dưới và bắt đầu từ L1.',
    startExam: 'Bắt đầu Thi', viewPath: '📚 Khóa Đào tạo', locked: 'Chưa mở khóa',
    typeChoice: 'Trắc nghiệm', typeScenario: 'Tình huống', typeAnalysis: 'Phân tích',
    analysisHint: 'Yêu cầu trả lời có cấu trúc: nguyên nhân gốc / đánh đổi / phương án.',
    goStudy: '📚 Xem Khóa Đào tạo',
    studyLine: (m, h, d) => `Hôm nay ${m} phút · Tổng ${h} giờ · Điểm danh ${d} ngày`,
    lessonLoading: 'Đang tạo nội dung bài học…', keyPoints: '🔑 Điểm chính', fieldExample: '🏭 Ví dụ Hiện trường',
    thisSession: 'Buổi học này', backToCourse: '← Quay lại khóa học',
    quizBtn: '📝 Quiz Mô-đun', quizTitle: 'Quiz Mô-đun', quizSubmit: 'Nộp Câu trả lời', quizRetry: 'Thử lại',
    quizScoreLabel: 'Điểm', correctIs: 'Đáp án đúng',
    certified: 'Đã chứng nhận', nextLevel: 'Cấp tiếp theo', history: 'Lịch sử Thi',
    examTitle: 'Kỳ thi Chứng nhận', timeLeft: 'Thời gian còn lại', submit: 'Nộp bài', submitting: 'Đang chấm…',
    answerPh: 'Nhập câu trả lời của bạn…',
    resultPassed: '✅ AI chấm đạt — chờ quản trị viên phê duyệt', resultFailed: '❌ Dưới mức đạt',
    resultManual: '📝 Đã nhận bài — đội ngũ sẽ chấm thủ công',
    overall: 'Nhận xét tổng thể', perQ: 'Nhận xét từng câu', back: '← Quay lại danh sách chuyên ngành',
    pathTitle: 'Lộ trình Học tập', estHours: 'Số giờ học ước tính', practice: 'Thực hành', examTips: 'Mẹo thi',
    uploadedCourses: 'Khóa học của giảng viên', pathLoading: 'Đang tạo lộ trình học của bạn…',
    statusMap: { in_progress: 'Đang làm', submitted: 'Đang chấm thủ công', ai_passed: 'Chờ phê duyệt', ai_failed: 'Không đạt', certified: '🎓 Đã cấp chứng chỉ', rejected: 'Bị từ chối', expired: 'Hết hạn' },
    engineersOnly: 'Trung tâm Chứng nhận chỉ dành cho tài khoản kỹ sư. Vui lòng đăng nhập bằng tài khoản kỹ sư.',
  },
  hi: {
    title: 'प्रमाणन केंद्र',
    subtitle: 'ट्रैक और स्तर के अनुसार प्रमाणित हों। आधिकारिक ऑन-साइट असाइनमेंट से पहले वैध प्लेटफ़ॉर्म प्रमाणन आवश्यक है।',
    myCerts: 'मेरे प्रमाणन', noCerts: 'अभी कोई प्रमाणन नहीं — नीचे एक ट्रैक चुनें और L1 से शुरू करें।',
    startExam: 'परीक्षा शुरू करें', viewPath: '📚 प्रशिक्षण कोर्स', locked: 'लॉक है',
    typeChoice: 'बहुविकल्पीय', typeScenario: 'परिदृश्य', typeAnalysis: 'विश्लेषण',
    analysisHint: 'संरचित उत्तर अपेक्षित: मूल कारण / समझौते / योजना।',
    goStudy: '📚 प्रशिक्षण कोर्स देखें',
    studyLine: (m, h, d) => `आज ${m} मिनट · कुल ${h} घंटे · ${d} दिन चेक-इन`,
    lessonLoading: 'पाठ सामग्री तैयार हो रही है…', keyPoints: '🔑 मुख्य बिंदु', fieldExample: '🏭 फ़ील्ड उदाहरण',
    thisSession: 'यह सत्र', backToCourse: '← कोर्स पर वापस',
    quizBtn: '📝 मॉड्यूल क्विज़', quizTitle: 'मॉड्यूल क्विज़', quizSubmit: 'उत्तर जमा करें', quizRetry: 'फिर से करें',
    quizScoreLabel: 'स्कोर', correctIs: 'सही उत्तर',
    certified: 'प्रमाणित', nextLevel: 'अगला', history: 'परीक्षा इतिहास',
    examTitle: 'प्रमाणन परीक्षा', timeLeft: 'शेष समय', submit: 'उत्तर जमा करें', submitting: 'मूल्यांकन हो रहा है…',
    answerPh: 'अपना उत्तर यहाँ लिखें…',
    resultPassed: '✅ AI मूल्यांकन पास — एडमिन समीक्षा लंबित', resultFailed: '❌ पास लाइन से नीचे',
    resultManual: '📝 प्राप्त हुआ — हमारी टीम मैन्युअल रूप से जाँचेगी',
    overall: 'समग्र प्रतिक्रिया', perQ: 'प्रति-प्रश्न प्रतिक्रिया', back: '← ट्रैक सूची पर वापस',
    pathTitle: 'सीखने का मार्ग', estHours: 'अनुमानित अध्ययन घंटे', practice: 'व्यावहारिक अभ्यास', examTips: 'परीक्षा सुझाव',
    uploadedCourses: 'प्रशिक्षक कोर्स', pathLoading: 'आपका सीखने का मार्ग तैयार हो रहा है…',
    statusMap: { in_progress: 'जारी', submitted: 'मैन्युअल जाँच में', ai_passed: 'समीक्षा लंबित', ai_failed: 'पास नहीं', certified: '🎓 प्रमाणित', rejected: 'अस्वीकृत', expired: 'समय समाप्त' },
    engineersOnly: 'प्रमाणन केंद्र केवल इंजीनियर खातों के लिए है। कृपया इंजीनियर के रूप में साइन इन करें।',
  },
  fr: {
    title: 'Centre de Certification',
    subtitle: 'Certifiez-vous par filière et par niveau. Une certification valide de la plateforme est requise avant toute affectation officielle sur site.',
    myCerts: 'Mes Certifications', noCerts: 'Aucune certification — choisissez une filière ci-dessous et commencez par le N1.',
    startExam: "Commencer l'Examen", viewPath: '📚 Cours de Formation', locked: 'Verrouillé',
    typeChoice: 'Choix multiple', typeScenario: 'Scénario', typeAnalysis: 'Analyse',
    analysisHint: 'Réponse structurée attendue : cause racine / compromis / plan.',
    goStudy: '📚 Voir le Cours de Formation',
    studyLine: (m, h, d) => `Aujourd'hui ${m} min · Total ${h} h · ${d} jours de présence`,
    lessonLoading: 'Génération du contenu de la leçon…', keyPoints: '🔑 Points Clés', fieldExample: '🏭 Exemple de Terrain',
    thisSession: 'Cette session', backToCourse: '← Retour au cours',
    quizBtn: '📝 Quiz du Module', quizTitle: 'Quiz du Module', quizSubmit: 'Envoyer les Réponses', quizRetry: 'Réessayer',
    quizScoreLabel: 'Score', correctIs: 'Bonne réponse',
    certified: 'Certifié', nextLevel: 'Suivant', history: 'Historique des Examens',
    examTitle: 'Examen de Certification', timeLeft: 'Temps restant', submit: 'Envoyer les Réponses', submitting: 'Notation…',
    answerPh: 'Saisissez votre réponse ici…',
    resultPassed: "✅ Réussi à l'évaluation IA — en attente de validation admin", resultFailed: '❌ Sous le seuil de réussite',
    resultManual: '📝 Reçu — sera corrigé manuellement par notre équipe',
    overall: 'Commentaire général', perQ: 'Commentaire par question', back: '← Retour aux filières',
    pathTitle: "Parcours d'Apprentissage", estHours: "Heures d'étude estimées", practice: 'Pratique', examTips: "Conseils d'examen",
    uploadedCourses: 'Cours des formateurs', pathLoading: 'Génération de votre parcours…',
    statusMap: { in_progress: 'En cours', submitted: 'Correction manuelle', ai_passed: 'En attente de validation', ai_failed: 'Non réussi', certified: '🎓 Certifié', rejected: 'Rejeté', expired: 'Expiré' },
    engineersOnly: "Le Centre de Certification est réservé aux comptes ingénieurs. Connectez-vous en tant qu'ingénieur.",
  },
  de: {
    title: 'Zertifizierungszentrum',
    subtitle: 'Zertifizierung nach Fachrichtung und Stufe. Eine gültige Plattform-Zertifizierung ist vor dem offiziellen Vor-Ort-Einsatz erforderlich.',
    myCerts: 'Meine Zertifizierungen', noCerts: 'Noch keine Zertifizierungen — wähle unten eine Fachrichtung und starte mit L1.',
    startExam: 'Prüfung starten', viewPath: '📚 Schulungskurs', locked: 'Gesperrt',
    typeChoice: 'Multiple Choice', typeScenario: 'Szenario', typeAnalysis: 'Analyse',
    analysisHint: 'Strukturierte Antwort erwartet: Ursache / Abwägungen / Plan.',
    goStudy: '📚 Schulungskurs ansehen',
    studyLine: (m, h, d) => `Heute ${m} Min · Gesamt ${h} Std · ${d} Tage eingecheckt`,
    lessonLoading: 'Lektionsinhalt wird erstellt…', keyPoints: '🔑 Kernpunkte', fieldExample: '🏭 Praxisbeispiel',
    thisSession: 'Diese Sitzung', backToCourse: '← Zurück zum Kurs',
    quizBtn: '📝 Modul-Quiz', quizTitle: 'Modul-Quiz', quizSubmit: 'Antworten absenden', quizRetry: 'Erneut versuchen',
    quizScoreLabel: 'Punktzahl', correctIs: 'Richtige Antwort',
    certified: 'Zertifiziert', nextLevel: 'Nächste Stufe', history: 'Prüfungsverlauf',
    examTitle: 'Zertifizierungsprüfung', timeLeft: 'Verbleibende Zeit', submit: 'Antworten absenden', submitting: 'Bewertung läuft…',
    answerPh: 'Antwort hier eingeben…',
    resultPassed: '✅ KI-Bewertung bestanden — Admin-Prüfung ausstehend', resultFailed: '❌ Unter der Bestehensgrenze',
    resultManual: '📝 Eingegangen — wird von unserem Team manuell bewertet',
    overall: 'Gesamtfeedback', perQ: 'Feedback pro Frage', back: '← Zurück zu den Fachrichtungen',
    pathTitle: 'Lernpfad', estHours: 'Geschätzte Lernstunden', practice: 'Praxisübungen', examTips: 'Prüfungstipps',
    uploadedCourses: 'Dozentenkurse', pathLoading: 'Dein Lernpfad wird erstellt…',
    statusMap: { in_progress: 'In Bearbeitung', submitted: 'Manuelle Bewertung', ai_passed: 'Prüfung ausstehend', ai_failed: 'Nicht bestanden', certified: '🎓 Zertifiziert', rejected: 'Abgelehnt', expired: 'Abgelaufen' },
    engineersOnly: 'Das Zertifizierungszentrum ist nur für Ingenieurkonten. Bitte als Ingenieur anmelden.',
  },
  ja: {
    title: '認定センター',
    subtitle: '分野・レベル別に認定を取得。現場への正式アサインには有効なプラットフォーム認定が必要です。',
    myCerts: '取得済み認定', noCerts: 'まだ認定がありません — 下から分野を選び、L1 から始めましょう。',
    startExam: '試験を開始', viewPath: '📚 研修コース', locked: 'ロック中',
    typeChoice: '選択式', typeScenario: 'シナリオ', typeAnalysis: '分析',
    analysisHint: '構造化した回答が必要：根本原因 / トレードオフ / 実施計画。',
    goStudy: '📚 研修コースを見る',
    studyLine: (m, h, d) => `今日 ${m} 分 · 累計 ${h} 時間 · ${d} 日チェックイン`,
    lessonLoading: 'レッスン内容を生成中…', keyPoints: '🔑 要点', fieldExample: '🏭 現場事例',
    thisSession: '今回の学習', backToCourse: '← コースに戻る',
    quizBtn: '📝 モジュールクイズ', quizTitle: 'モジュールクイズ', quizSubmit: '回答を送信', quizRetry: 'もう一度',
    quizScoreLabel: 'スコア', correctIs: '正解',
    certified: '認定済み', nextLevel: '次のレベル', history: '試験履歴',
    examTitle: '認定試験', timeLeft: '残り時間', submit: '回答を送信', submitting: '採点中…',
    answerPh: 'ここに回答を入力…',
    resultPassed: '✅ AI 採点合格 — 管理者レビュー待ち', resultFailed: '❌ 合格ラインに未達',
    resultManual: '📝 受領しました — 担当チームが手動で採点します',
    overall: '総合フィードバック', perQ: '設問ごとのフィードバック', back: '← 分野一覧に戻る',
    pathTitle: '学習パス', estHours: '推定学習時間', practice: '実践演習', examTips: '試験のヒント',
    uploadedCourses: '講師コース', pathLoading: '学習パスを生成中…',
    statusMap: { in_progress: '進行中', submitted: '手動採点中', ai_passed: 'レビュー待ち', ai_failed: '不合格', certified: '🎓 認定済み', rejected: '却下', expired: '期限切れ' },
    engineersOnly: '認定センターはエンジニアアカウント専用です。エンジニアとしてログインしてください。',
  },
  ko: {
    title: '인증 센터',
    subtitle: '분야·레벨별 인증 취득. 현장 정식 배정 전에 유효한 플랫폼 인증이 필요합니다.',
    myCerts: '내 인증', noCerts: '아직 인증이 없습니다 — 아래에서 분야를 선택하고 L1부터 시작하세요.',
    startExam: '시험 시작', viewPath: '📚 교육 과정', locked: '잠김',
    typeChoice: '객관식', typeScenario: '시나리오', typeAnalysis: '분석',
    analysisHint: '구조화된 답변 필요: 근본 원인 / 트레이드오프 / 실행 계획.',
    goStudy: '📚 교육 과정 보기',
    studyLine: (m, h, d) => `오늘 ${m}분 · 누적 ${h}시간 · ${d}일 출석`,
    lessonLoading: '강의 내용 생성 중…', keyPoints: '🔑 핵심 포인트', fieldExample: '🏭 현장 사례',
    thisSession: '이번 학습', backToCourse: '← 과정으로 돌아가기',
    quizBtn: '📝 모듈 퀴즈', quizTitle: '모듈 퀴즈', quizSubmit: '답안 제출', quizRetry: '다시 풀기',
    quizScoreLabel: '점수', correctIs: '정답',
    certified: '인증 완료', nextLevel: '다음 레벨', history: '시험 이력',
    examTitle: '인증 시험', timeLeft: '남은 시간', submit: '답안 제출', submitting: '채점 중…',
    answerPh: '여기에 답을 입력하세요…',
    resultPassed: '✅ AI 채점 통과 — 관리자 검토 대기', resultFailed: '❌ 합격선 미달',
    resultManual: '📝 접수 완료 — 팀에서 수동으로 채점합니다',
    overall: '종합 피드백', perQ: '문항별 피드백', back: '← 분야 목록으로',
    pathTitle: '학습 경로', estHours: '예상 학습 시간', practice: '실습', examTips: '시험 팁',
    uploadedCourses: '강사 과정', pathLoading: '학습 경로 생성 중…',
    statusMap: { in_progress: '진행 중', submitted: '수동 채점 중', ai_passed: '검토 대기', ai_failed: '불합격', certified: '🎓 인증 발급', rejected: '반려', expired: '기한 만료' },
    engineersOnly: '인증 센터는 엔지니어 계정 전용입니다. 엔지니어로 로그인해 주세요.',
  },
};

export default function Training() {
  const router = useRouter();
  const toast = useToast();
  const [lang] = useLang();
  const d = DICT[lang] || DICT.en;

  const [currentUser, setCurrentUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [rules, setRules] = useState(null);
  const [my, setMy] = useState({ certifications: [], attempts: [] });
  // view: tracks(主界面) | path(学习路径) | exam(答题) | result(成绩)
  const [view, setView] = useState('tracks');
  const [activeTrack, setActiveTrack] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  // 学习路径
  const [path, setPath] = useState(null);
  const [uploadedCourses, setUploadedCourses] = useState([]);
  const [pathLoading, setPathLoading] = useState(false);
  // 考试
  const [exam, setExam] = useState(null);       // {attempt_id, questions, deadline}
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null); // 秒
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  // 课程详情（知识点点击进入）+ 学习计时
  const [lesson, setLesson] = useState(null);           // {content, module, topic}
  const [lessonLoading, setLessonLoading] = useState(false);
  const [studySession, setStudySession] = useState(null); // {id, startedMs}
  const [studyElapsed, setStudyElapsed] = useState(0);     // 本次学习秒数（展示用）
  const [studySummary, setStudySummary] = useState(null);  // {today_seconds, total_seconds, days_count}
  // 随堂 quiz
  const [quiz, setQuiz] = useState(null);           // {quiz_id, module, questions}
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) { router.push('/finance'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.role !== 'engineer') { setCurrentUser({ notEngineer: true }); return; }
      setCurrentUser(user);
    } catch { router.push('/finance'); }
  }, []);

  useEffect(() => {
    fetch('/api/training/tracks').then(r => r.json()).then(res => {
      if (res.status === 'ok') { setTracks(res.data); setRules(res.rules); }
    }).catch(() => {});
  }, []);

  function loadMy(user) {
    fetch('/api/training/my', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(res => { if (res.status === 'ok') setMy({ certifications: res.certifications, attempts: res.attempts }); })
      .catch(() => {});
  }
  useEffect(() => { if (currentUser?.token) { loadMy(currentUser); loadStudySummary(currentUser); } }, [currentUser]);

  function loadStudySummary(user) {
    fetch('/api/training/study/summary', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(res => { if (res.status === 'ok') setStudySummary(res); })
      .catch(() => {});
  }

  // 本次学习计时（展示用；权威时长由服务端 start/end 结算）
  useEffect(() => {
    if (view !== 'lesson' || !studySession) return undefined;
    const t = setInterval(() => setStudyElapsed(Math.floor((Date.now() - studySession.startedMs) / 1000)), 1000);
    return () => clearInterval(t);
  }, [view, studySession]);

  // 直接关页/跳走时也尽量结算会话（keepalive 请求在页面卸载后仍会送达；
  // 万一没送达，服务端下次 start 会自动补记，封顶防高估）
  const studySessionRef = useRef(null);
  const tokenRef = useRef(null);
  useEffect(() => { studySessionRef.current = studySession; }, [studySession]);
  useEffect(() => { tokenRef.current = currentUser?.token || null; }, [currentUser]);
  useEffect(() => () => {
    const s = studySessionRef.current;
    if (s && tokenRef.current) {
      fetch('/api/training/study/end', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ session_id: s.id }),
      }).catch(() => {});
    }
  }, []);

  // 结束学习会话（返回课程/离开页面时结算打卡时长）
  async function endStudySession() {
    if (!studySession) return;
    const sid = studySession.id;
    setStudySession(null);
    try {
      await fetch('/api/training/study/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ session_id: sid }),
      });
      loadStudySummary(currentUser);
    } catch { /* 结算失败下次 start 会自动补记 */ }
  }

  // 打开知识点详细课程：拉内容 + 开始学习计时（打卡）
  async function openLesson(moduleIdx, topicIdx) {
    if (!path?.id) return;
    setView('lesson'); setLesson(null); setLessonLoading(true); setStudyElapsed(0);
    try {
      const [lessonRes, startRes] = await Promise.all([
        fetch(`/api/training/lesson/${activeTrack.track_key}/${activeLevel}/${moduleIdx}/${topicIdx}?lang=${lang === 'zh' ? 'zh' : 'en'}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }).then(r => r.json().then(data => ({ ok: r.ok, data }))),
        fetch('/api/training/study/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: JSON.stringify({ course_id: path.id, module_index: moduleIdx, topic_index: topicIdx }),
        }).then(r => r.json()).catch(() => null),
      ]);
      if (lessonRes.ok) setLesson(lessonRes.data);
      else { toast.error(lessonRes.data.error || 'Failed to load lesson.'); setView('path'); }
      if (startRes?.session_id) setStudySession({ id: startRes.session_id, startedMs: Date.now() });
    } catch { toast.error('Network error.'); setView('path'); }
    setLessonLoading(false);
  }

  // 打开模块随堂 quiz
  async function openQuiz(moduleIdx) {
    setView('quiz'); setQuiz(null); setQuizResult(null);
    try {
      const res = await fetch(`/api/training/quiz/${activeTrack.track_key}/${activeLevel}/${moduleIdx}?lang=${lang === 'zh' ? 'zh' : 'en'}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to load quiz.'); setView('path'); return; }
      setQuiz(data);
      setQuizAnswers(data.questions.map(() => ''));
    } catch { toast.error('Network error.'); setView('path'); }
  }

  async function submitQuiz() {
    if (quizSubmitting || !quiz) return;
    setQuizSubmitting(true);
    try {
      const res = await fetch(`/api/training/quiz/${quiz.quiz_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ answers: quizAnswers.map(a => ({ a })) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Submit failed.'); setQuizSubmitting(false); return; }
      setQuizResult(data);
    } catch { toast.error('Network error.'); }
    setQuizSubmitting(false);
  }

  // 考试倒计时（展示用；真正的超时判定在服务端 deadline）
  useEffect(() => {
    if (view !== 'exam' || !exam?.deadline) return undefined;
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(exam.deadline).getTime() - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(timerRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, exam]);

  function heldLevel(trackKey) {
    const cert = my.certifications.find(c => c.track_key === trackKey);
    return cert ? cert.level : null;
  }

  async function openPath(track, level) {
    setActiveTrack(track); setActiveLevel(level); setView('path'); setPath(null); setPathLoading(true);
    try {
      const res = await fetch(`/api/training/path/${track.track_key}/${level}?lang=${lang === 'zh' ? 'zh' : 'en'}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (res.ok) { setPath(data.path); setUploadedCourses(data.uploaded_courses || []); }
      else toast.error(data.error || 'Failed to load learning path.');
    } catch { toast.error('Network error.'); }
    setPathLoading(false);
  }

  async function startExam(track, level) {
    setActiveTrack(track); setActiveLevel(level);
    try {
      const res = await fetch('/api/training/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ track_key: track.track_key, level, lang: lang === 'zh' ? 'zh' : 'en' }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Cannot start exam.'); return; }
      setExam(data);
      setAnswers(data.questions.map(() => ''));
      setResult(null);
      setView('exam');
    } catch { toast.error('Network error.'); }
  }

  async function submitExam() {
    if (submitting || !exam) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/training/exam/${exam.attempt_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ answers: answers.map(a => ({ a })), lang: lang === 'zh' ? 'zh' : 'en' }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Submit failed.'); setSubmitting(false); return; }
      setResult(data);
      setView('result');
      loadMy(currentUser);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  if (currentUser?.notEngineer) {
    return (
      <>
        <Head><title>{`${d.title} | TalEngineer`}</title></Head>
        <Navbar />
        <div className={styles.layout}><div className={styles.card}><p>{d.engineersOnly}</p></div></div>
      </>
    );
  }

  const fmtTime = (sec) => `${String(Math.floor((sec || 0) / 60)).padStart(2, '0')}:${String((sec || 0) % 60).padStart(2, '0')}`;
  const trackName = (t) => (lang === 'zh' ? t?.name_zh : t?.name_en) || t?.name_en;

  return (
    <>
      <Head><title>{`${d.title} | TalEngineer`}</title></Head>
      <Navbar />
      <div className={styles.layout}>
        <div className={styles.card} style={{ maxWidth: 860 }}>

          {/* ── 主界面：方向卡片 + 我的认证 + 历史 ── */}
          {view === 'tracks' && (
            <div className={styles.stepContent}>
              <h1 style={{ marginBottom: 4 }}>🎓 {d.title}</h1>
              <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{d.subtitle}</p>
              {/* 学习打卡统计（有学习记录才显示） */}
              {studySummary && studySummary.sessions_count > 0 && (
                <div style={{ fontSize: 13, fontWeight: 600, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, display: 'inline-block' }}>
                  ⏱ {d.studyLine(Math.round(studySummary.today_seconds / 60), (studySummary.total_seconds / 3600).toFixed(1), studySummary.days_count)}
                </div>
              )}

              <h3 style={{ margin: '12px 0 8px' }}>{d.myCerts}</h3>
              {my.certifications.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>{d.noCerts}</p>
                : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {my.certifications.map(c => (
                      <span key={c.track_key} style={{ background: '#065f46', color: '#fff', borderRadius: 16, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
                        🎓 {lang === 'zh' ? c.track_name_zh : c.track_name_en} · L{c.level}
                      </span>
                    ))}
                  </div>
                )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
                {tracks.map(t => {
                  const held = heldLevel(t.track_key);
                  const next = (held || 0) + 1;
                  const maxed = rules && held >= rules.max_level;
                  return (
                    <div key={t.track_key} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>{trackName(t)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', minHeight: 34, marginBottom: 8 }}>{t.description}</div>
                      <div style={{ fontSize: 13, marginBottom: 10 }}>
                        {held ? `${d.certified}: L${held}` : '—'}
                        {!maxed && <span style={{ color: 'var(--muted)' }}>　{d.nextLevel}: L{next}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!maxed && (
                          <button className={styles.btnNext} style={{ flex: 1 }} onClick={() => startExam(t, next)}>
                            {d.startExam} L{next}
                          </button>
                        )}
                        <button className={styles.btnNext} style={{ flex: 1, opacity: 0.8 }} onClick={() => openPath(t, Math.min(next, rules?.max_level || 3))}>
                          {d.viewPath}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {my.attempts.length > 0 && (
                <>
                  <h3 style={{ margin: '22px 0 8px' }}>{d.history}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <tbody>
                        {my.attempts.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 8px' }}>{lang === 'zh' ? a.cert_tracks?.name_zh : a.cert_tracks?.name_en} · L{a.level}</td>
                            <td style={{ padding: '6px 8px' }}>{(d.statusMap[a.status]) || a.status}</td>
                            <td style={{ padding: '6px 8px' }}>{a.score != null ? `${a.score}/100` : '—'}</td>
                            <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── 学习路径 ── */}
          {view === 'path' && (
            <div className={styles.stepContent}>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, marginBottom: 10 }} onClick={() => setView('tracks')}>{d.back}</button>
              <h2>📚 {trackName(activeTrack)} · L{activeLevel} {d.pathTitle}</h2>
              {pathLoading && <p style={{ color: 'var(--muted)' }}>{d.pathLoading}</p>}
              {path?.content && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>{d.estHours}: {path.content.estimated_hours}</p>
                  {(path.content.modules || []).map((m, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 700 }}>{i + 1}. {m.name}</div>
                        {/* 模块随堂 quiz（3 道选择题，练习性质即时反馈） */}
                        <button onClick={() => openQuiz(i)} style={{ fontSize: 12, fontWeight: 700, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                          {d.quizBtn}
                        </button>
                      </div>
                      {/* 知识点可点击进入详细课程（进入即开始学习计时/打卡） */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                        {(m.topics || []).map((tp, j) => (
                          <button
                            key={j}
                            onClick={() => openLesson(i, j)}
                            style={{ textAlign: 'left', fontSize: 14, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', color: 'var(--primary, #0056b3)' }}
                          >
                            📖 {tp} →
                          </button>
                        ))}
                      </div>
                      {m.practice && <div style={{ fontSize: 13, background: 'var(--secondary)', borderRadius: 8, padding: '8px 10px' }}>🔧 {d.practice}: {m.practice}</div>}
                    </div>
                  ))}
                  {path.content.exam_tips && <p style={{ fontSize: 14 }}>💡 {d.examTips}: {path.content.exam_tips}</p>}
                </div>
              )}
              {uploadedCourses.length > 0 && (
                <>
                  <h3 style={{ marginTop: 16 }}>{d.uploadedCourses}</h3>
                  {uploadedCourses.map(c => (
                    <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      {c.content_url && <a href={c.content_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Open course →</a>}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── 知识点详细课程（学习计时中）── */}
          {view === 'lesson' && (
            <div className={styles.stepContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                  onClick={async () => { await endStudySession(); setView('path'); }}
                >{d.backToCourse}</button>
                {studySession && (
                  <span style={{ fontSize: 13, fontWeight: 700, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>
                    ⏱ {d.thisSession} {fmtTime(studyElapsed)}
                  </span>
                )}
              </div>
              {lessonLoading && <p style={{ color: 'var(--muted)' }}>{d.lessonLoading}</p>}
              {lesson?.lesson && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{lesson.module} · {lesson.topic}</div>
                  <h2 style={{ marginBottom: 12 }}>📖 {lesson.lesson.title}</h2>
                  {(lesson.lesson.sections || []).map((s, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <h3 style={{ marginBottom: 6 }}>{s.heading}</h3>
                      <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.body}</div>
                    </div>
                  ))}
                  {Array.isArray(lesson.lesson.key_points) && lesson.lesson.key_points.length > 0 && (
                    <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.keyPoints}</div>
                      <ul style={{ margin: '0 0 0 18px', fontSize: 14 }}>
                        {lesson.lesson.key_points.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  {lesson.lesson.field_example && (
                    <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 14, fontSize: 14, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.fieldExample}</div>
                      {lesson.lesson.field_example}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── 模块随堂 quiz ── */}
          {view === 'quiz' && (
            <div className={styles.stepContent}>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, marginBottom: 10 }} onClick={() => setView('path')}>{d.backToCourse}</button>
              <h2>📝 {quiz?.module ? `${quiz.module} · ` : ''}{d.quizTitle}</h2>
              {!quiz && <p style={{ color: 'var(--muted)' }}>{d.pathLoading}</p>}
              {quiz && quiz.questions.map((q, i) => {
                const graded = quizResult?.per_question?.[i];
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {q.options.map((opt, oi) => {
                        // 判分后高亮：正确选项绿框；选错的自己那项红框
                        const isCorrect = graded && oi === graded.answer_index;
                        const isWrongPick = graded && quizAnswers[i] === oi && !graded.correct;
                        return (
                          <label key={oi} style={{
                            display: 'flex', gap: 8, alignItems: 'flex-start', borderRadius: 8, padding: '8px 12px',
                            cursor: graded ? 'default' : 'pointer',
                            border: `1px solid ${isCorrect ? '#059669' : isWrongPick ? '#ef4444' : 'var(--border)'}`,
                            background: quizAnswers[i] === oi && !graded ? 'var(--secondary)' : 'transparent',
                          }}>
                            <input type="radio" name={`quiz${i}`} disabled={!!graded} checked={quizAnswers[i] === oi}
                              onChange={() => setQuizAnswers(prev => prev.map((a, j) => (j === i ? oi : a)))} />
                            <span style={{ fontSize: 14 }}><b>{String.fromCharCode(65 + oi)}.</b> {opt}{isCorrect ? ' ✅' : isWrongPick ? ' ❌' : ''}</span>
                          </label>
                        );
                      })}
                    </div>
                    {graded && (
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        {d.correctIs}: {String.fromCharCode(65 + graded.answer_index)}。{graded.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
              {quiz && !quizResult && (
                <button className={styles.btnNext} disabled={quizSubmitting} onClick={submitQuiz}>
                  {quizSubmitting ? d.submitting : d.quizSubmit}
                </button>
              )}
              {quizResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>{d.quizScoreLabel}: {quizResult.score}/100</span>
                  <button className={styles.btnNext} onClick={() => { setQuizResult(null); setQuizAnswers(quiz.questions.map(() => '')); }}>{d.quizRetry}</button>
                </div>
              )}
            </div>
          )}

          {/* ── 考核答题 ── */}
          {view === 'exam' && exam && (
            <div className={styles.stepContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>📝 {trackName(activeTrack)} · L{activeLevel} {d.examTitle}</h2>
                <span style={{ fontWeight: 800, fontSize: 18, color: remaining != null && remaining < 300 ? '#ef4444' : 'inherit' }}>
                  ⏱ {d.timeLeft} {fmtTime(remaining)}
                </span>
              </div>
              {exam.questions.map((q, i) => {
                const typeLabel = q.type === 'choice' ? d.typeChoice : q.type === 'analysis' ? d.typeAnalysis : d.typeScenario;
                return (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', marginRight: 8, verticalAlign: 'middle' }}>{typeLabel}</span>
                      Q{i + 1}. {q.q}
                    </div>
                    {q.type === 'choice' ? (
                      // 选择题：单选，答案存选项下标（服务端按答案键判分）
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(q.options || []).map((opt, oi) => (
                          <label key={oi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', background: answers[i] === oi ? 'var(--secondary)' : 'transparent' }}>
                            <input
                              type="radio"
                              name={`q${i}`}
                              checked={answers[i] === oi}
                              onChange={() => setAnswers(prev => prev.map((a, j) => (j === i ? oi : a)))}
                            />
                            <span style={{ fontSize: 14 }}><b>{String.fromCharCode(65 + oi)}.</b> {opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      // 场景短答 / 深度分析：文本作答（分析题更大的输入区 + 结构化提示）
                      <>
                        {q.type === 'analysis' && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>💡 {d.analysisHint}</div>}
                        <textarea
                          className={styles.textarea}
                          rows={q.type === 'analysis' ? 8 : 4}
                          style={{ width: '100%' }}
                          placeholder={d.answerPh}
                          value={answers[i] || ''}
                          onChange={e => setAnswers(prev => prev.map((a, j) => (j === i ? e.target.value : a)))}
                        />
                      </>
                    )}
                  </div>
                );
              })}
              <button className={styles.btnNext} disabled={submitting || remaining === 0} onClick={submitExam}>
                {submitting ? d.submitting : d.submit}
              </button>
            </div>
          )}

          {/* ── 成绩 ── */}
          {view === 'result' && result && (
            <div className={styles.stepContent}>
              <h2>
                {result.result === 'ai_passed' ? d.resultPassed
                  : result.result === 'manual_review' ? d.resultManual
                  : d.resultFailed}
              </h2>
              {result.score != null && (
                <p style={{ fontSize: 40, fontWeight: 800, margin: '10px 0' }}>
                  {result.score}<span style={{ fontSize: 16, color: 'var(--muted)' }}> / 100（{lang === 'zh' ? '及格线' : 'pass'} {result.pass_score}）</span>
                </p>
              )}
              {result.overall_feedback && <p style={{ fontSize: 14 }}>{d.overall}: {result.overall_feedback}</p>}
              {Array.isArray(result.per_question) && (
                <>
                  <h3 style={{ margin: '14px 0 6px' }}>{d.perQ}</h3>
                  {result.per_question.map((g, i) => (
                    <div key={i} style={{ fontSize: 13, borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
                      Q{i + 1}: <b>{g.score}/100</b> — {g.feedback}
                    </div>
                  ))}
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {/* 挂科后直达对应方向×等级的培训课程（用户反馈：课程入口不好找） */}
                {result.result === 'ai_failed' && activeTrack && (
                  <button className={styles.btnNext} onClick={() => openPath(activeTrack, activeLevel)}>{d.goStudy}</button>
                )}
                <button className={styles.btnNext} style={{ opacity: 0.85 }} onClick={() => { setView('tracks'); loadMy(currentUser); }}>{d.back}</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
