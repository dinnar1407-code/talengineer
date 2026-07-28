// ── 项目消息发送：路由与 agent 工具的【唯一】实现 ────────────────────────────
// 为什么要抽这一层：POST /api/messages（人在 /messages/:id 页面手动发）和
// send_project_message（agent 提案 → 用户点确认后发）必须是同一套逻辑，一个字都不能分叉。
//
// 最怕抄歪的是【邮件防轰炸】那段：判断"这条是不是新一轮对话的第一条"必须在插入之前统计。
// 插入之后再查会恒 >0——新插进去的这条自己就是未读——于是 startsNewRound 永远为 false，
// 对方从此再也收不到邮件。这个 bug 不报错、不掉数据，只是安静地停发通知，两份独立实现里
// 几乎不可能同时被发现。所以两条调用路径共用本函数，实现永远只有一份。
//
// 归属校验（assertDemandParticipant）同样在这里：它挡的是一个真实存在过的 IDOR
// （任意登录用户往别人项目的线程里写消息），见 src/routes/messages.js 的注释。别弱化、别绕过。

const { assertDemandParticipant } = require('../middleware/ownership');
const { createNotification } = require('./notificationService');
const { emailNewMessage } = require('./email');

const MAX_CONTENT_LENGTH = 2000;

// ── 错误契约 ────────────────────────────────────────────────────────────────
// 两个调用方要的东西不一样，所以错误同时带 code 与人话 message：
//   - 工具侧：registry.call 把抛出的 Error 直接包成 { ok:false, error: err.message } 给模型/
//     用户看，所以 .message 必须是一句人话（"Forbidden" 不是人话）。
//   - 路由侧：HTTP 状态码与响应体文案是既有对外契约，一个字都不能变，所以路由【只按 code
//     分派】、绝不透传 message。两边文案从此可以各自演进而互不影响。
class MessageError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'MessageError';
    this.code = code; // 'invalid_input' | 'too_long' | 'forbidden' | 'db_error'
  }
}

/**
 * 在某个项目的消息线程里发一条消息（校验 → 归属 → 防轰炸判定 → 落库 → 异步通知）。
 *
 * @param {object}        supabase     已初始化的 Supabase 客户端
 * @param {object}        user         已验证身份 { userId, email, role }（JWT payload / ctx.user，两者同形状）
 * @param {number|string} demandId     目标项目
 * @param {string}        content      消息正文（≤2000 字）
 * @param {string}        [clientMsgId] 离线重放幂等键；不传则不可能触发去重（唯一索引是
 *                                      partial：WHERE client_msg_id IS NOT NULL，见迁移 021）
 * @returns {Promise<{ deduped: boolean, message: object|null }>}
 *          deduped=true 表示这条离线消息此前已写入过（本次未重复插入），message 为 null；
 *          否则 message 是新插入的消息行。返回定长两字段而不是"行 or {deduped:true}"，
 *          是为了让调用方靠字段判断、不用去嗅探返回值形状。
 * @throws {MessageError} 带 code 的失败；其余异常原样上抛。
 */
async function sendMessage({ supabase, user, demandId, content, clientMsgId }) {
  // 1) 入参校验（与原路由逐条等价）
  if (!demandId || !content?.trim()) {
    throw new MessageError('invalid_input', 'Tell me which project to post in and what the message should say.');
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new MessageError('too_long', `That message is too long (max ${MAX_CONTENT_LENGTH} characters).`);
  }

  // 2) 归属校验：必须在任何写入之前。防 IDOR——不校验当事方，任意登录用户就能往别人项目的
  //    线程里写消息（骚扰/钓鱼），inbox 里还会冒出非当事方的消息，破坏消息可见性模型。
  const { allowed } = await assertDemandParticipant(supabase, demandId, user);
  if (!allowed) {
    throw new MessageError('forbidden', 'You are not a participant in that project, so you cannot post in its message thread.');
  }

  // 3) 邮件防轰炸：判断这条是否"新一轮对话的第一条"。
  //    仅当我此前在本 demand 发出的消息对方都已读（未读=0）时，这条才发邮件；否则对方本就
  //    有未读、只需站内通知，避免连发轰炸收件箱。
  //    ⚠️ 必须在插入前统计——新插入的这条也是 read=false，插入后再查会恒 >0（见文件头注释）。
  const { count: unreadFromMe } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('demand_id', demandId)
    .eq('sender_email', user.email)
    .eq('read', false);
  const startsNewRound = (unreadFromMe || 0) === 0;

  // 4) 落库
  const trimmed = content.trim();
  const insertRow = {
    demand_id: demandId,
    sender_email: user.email,
    sender_name: user.name || user.email.split('@')[0],
    sender_role: user.role,
    content: trimmed,
  };
  // 离线重放幂等：客户端带 client_msg_id 时一并写入（online 正常发消息不带，行为不变）。
  // 依赖 (demand_id, client_msg_id) 唯一约束把重复重放挡在数据库层，见下方 23505 处理。
  if (clientMsgId) insertRow.client_msg_id = clientMsgId;

  const { data, error } = await supabase.from('messages').insert(insertRow).select().single();
  if (error) {
    // 23505 = 唯一约束冲突：同一条离线消息被重放了两次，静默幂等返回，不当作错误
    if (error.code === '23505') return { deduped: true, message: null };
    console.error('[messageService] insert failed:', error);
    throw new MessageError('db_error', 'Could not send the message. Please try again.');
  }

  // 5) 通知对方（fire-and-forget：绝不阻塞返回，也绝不因通知失败把已落库的消息报成失败）
  void notifyOtherParty({ supabase, user, demandId, content: trimmed, startsNewRound });

  return { deduped: false, message: data };
}

// 解析收件人并投递通知：雇主发 → 通知被指派的工程师（talents.contact）；
// 其余（工程师 / admin）发 → 通知 demand.contact。整段吞掉自身异常，不影响主流程。
async function notifyOtherParty({ supabase, user, demandId, content, startsNewRound }) {
  try {
    const { data: demand } = await supabase
      .from('demands')
      .select('title, contact, assigned_engineer_id')
      .eq('id', demandId)
      .single();
    if (!demand) return;

    let recipientEmail;
    if (user.role === 'employer') {
      // Notify the assigned engineer
      if (demand.assigned_engineer_id) {
        const { data: eng } = await supabase
          .from('talents')
          .select('contact')
          .eq('id', demand.assigned_engineer_id)
          .single();
        recipientEmail = eng?.contact;
      }
    } else {
      // Notify the employer
      recipientEmail = demand.contact;
    }

    if (recipientEmail && recipientEmail !== user.email) {
      // 站内通知：每条消息都发（不轰炸，只是红点计数）
      createNotification({
        user_email: recipientEmail,
        type: 'new_message',
        title: `New message on "${demand.title}"`,
        body: content.slice(0, 120),
        link: `/messages/${demandId}`,
        demand_id: parseInt(demandId),
      });
      // 邮件：仅新一轮对话的第一条才发（防轰炸）
      if (startsNewRound) {
        emailNewMessage({
          recipientEmail,
          senderName: user.name || user.email.split('@')[0],
          projectTitle: demand.title,
          messagePreview: content,
          threadUrl: `${process.env.DOMAIN || 'https://talengineer.us'}/messages/${demandId}`,
        }).catch(console.error);
      }
    }
  } catch {}
}

module.exports = { sendMessage, MessageError, MAX_CONTENT_LENGTH };
