// ── /messages 收件箱页九语 UI 字典（lib/i18n 架构 B，模块风格照抄 lib/i18n/rates.js）──
// 来源：pages/messages/index.jsx 内联 DICT，2026-07-24 逐字节原样搬移（机械搬家，文案零改动）。
const DICT = {
  en: { title: 'Messages', sub: 'Your project conversations', empty: 'No conversations yet.', emptySub: 'Start by applying to a project or messaging an engineer.', backLabel: 'Dashboard', unread: (n) => `${n} unread`, lastMsg: 'No messages yet', you: 'You' },
  zh: { title: '消息', sub: '项目对话', empty: '暂无对话。', emptySub: '申请项目或给工程师发消息后，对话将显示在此。', backLabel: '控制台', unread: (n) => `${n} 条未读`, lastMsg: '暂无消息', you: '我' },
  es: { title: 'Mensajes', sub: 'Conversaciones del proyecto', empty: 'Sin conversaciones.', emptySub: 'Postúlese a un proyecto para empezar.', backLabel: 'Panel', unread: (n) => `${n} no leído${n > 1 ? 's' : ''}`, lastMsg: 'Sin mensajes', you: 'Usted' },
  vi: { title: 'Tin nhắn', sub: 'Cuộc trò chuyện dự án', empty: 'Chưa có cuộc trò chuyện.', emptySub: 'Ứng tuyển một dự án để bắt đầu.', backLabel: 'Bảng điều khiển', unread: (n) => `${n} chưa đọc`, lastMsg: 'Chưa có tin nhắn', you: 'Bạn' },
  hi: { title: 'संदेश', sub: 'प्रोजेक्ट वार्तालाप', empty: 'कोई वार्तालाप नहीं।', emptySub: 'शुरू करने के लिए किसी प्रोजेक्ट में आवेदन करें।', backLabel: 'डैशबोर्ड', unread: (n) => `${n} अपठित`, lastMsg: 'कोई संदेश नहीं', you: 'आप' },
  fr: { title: 'Messages', sub: 'Vos conversations de projet', empty: 'Aucune conversation.', emptySub: 'Postulez à un projet pour commencer.', backLabel: 'Tableau de bord', unread: (n) => `${n} non lu${n > 1 ? 's' : ''}`, lastMsg: 'Aucun message', you: 'Vous' },
  de: { title: 'Nachrichten', sub: 'Projektgespräche', empty: 'Keine Gespräche.', emptySub: 'Bewerben Sie sich auf ein Projekt, um zu beginnen.', backLabel: 'Dashboard', unread: (n) => `${n} ungelesen`, lastMsg: 'Keine Nachrichten', you: 'Sie' },
  ja: { title: 'メッセージ', sub: 'プロジェクトの会話', empty: '会話はまだありません。', emptySub: 'プロジェクトに応募して始めましょう。', backLabel: 'ダッシュボード', unread: (n) => `${n} 件未読`, lastMsg: 'メッセージなし', you: 'あなた' },
  ko: { title: '메시지', sub: '프로젝트 대화', empty: '대화가 없습니다.', emptySub: '프로젝트에 지원하여 시작하세요.', backLabel: '대시보드', unread: (n) => `${n}개 안 읽음`, lastMsg: '메시지 없음', you: '나' },
};

module.exports = { DICT };
