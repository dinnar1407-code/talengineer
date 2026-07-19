// ── Agent 红线守卫测试（G1/G2/G3 + 埋点/循环纯逻辑）─────────────────────────
// 纯逻辑测试：不连库、不调 Gemini——runAgentChat 的模型/工具调用经 deps 注入假实现，
// 埋点用手写 supabase 假对象。覆盖四类：
//   1) 注册表静态扫描：不存在资金/发证/裁决/外发类工具名（G2/G3）；
//   2) create_demand_draft 之外无写工具，且只对 employer 可见；
//   3) 埋点函数 recordAiEvent 对缺表/异常静默（best-effort，绝不影响主流程）；
//   4) sha256 哈希正确性 + 不存原文（≤120 字摘要）+ 工具循环硬上限。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const registry = require('../src/tools/registry');
const {
  runAgentChat,
  sha256Hex,
  recordAiEvent,
  MAX_TOOL_ROUNDS,
} = require('../src/services/agentService');

// 汇总四个角色可见的全部工具（registry 没有"列出所有"接口，按角色并集扫描）
function allRegisteredTools() {
  const byName = new Map();
  for (const role of ['public', 'employer', 'engineer', 'admin']) {
    for (const t of registry.list(role)) byName.set(t.name, t);
  }
  return [...byName.values()];
}

describe('G2/G3 注册表静态扫描（红线：资金/发证/裁决/外发工具永不存在）', () => {
  const tools = allRegisteredTools();

  it('注册表非空（首批 10 个工具已注册）', () => {
    assert.equal(tools.length, 10);
  });

  it('G2：不存在资金类工具名（注资/放款/退款/托管转账）', () => {
    // 只扫 name 不扫 description——描述里合法出现 "never funded" 之类否定表述
    const moneyPattern = /(fund|deposit|payout|refund|escrow|disburse|transfer|withdraw|charge|payment)/i;
    for (const t of tools) {
      assert.equal(moneyPattern.test(t.name), false, `资金类工具名不允许存在: ${t.name}`);
    }
  });

  it('G2：不存在发证/吊销类工具名（get_certification_info 只解释不发证，允许）', () => {
    const issuePattern = /(issue|grant|award|sign|revoke)[-_]?(cert|certificate|certification)|cert\w*[-_](issue|issuance|grant|award|revoke)/i;
    for (const t of tools) {
      assert.equal(issuePattern.test(t.name), false, `发证类工具名不允许存在: ${t.name}`);
      assert.equal(/revoke/i.test(t.name), false, `吊销类工具名不允许存在: ${t.name}`);
    }
  });

  it('G2：不存在纠纷裁决类工具名', () => {
    const disputePattern = /(dispute|adjudicat|arbitrat|ruling|verdict|resolve)/i;
    for (const t of tools) {
      assert.equal(disputePattern.test(t.name), false, `裁决类工具名不允许存在: ${t.name}`);
    }
  });

  it('G3：不存在外发类工具名（邮件/推送/SMS/通知/邀约）', () => {
    const outboundPattern = /(send|email|mail|sms|push|notify|notification|broadcast|invite|outreach)/i;
    for (const t of tools) {
      assert.equal(outboundPattern.test(t.name), false, `外发类工具名不允许存在: ${t.name}`);
    }
  });
});

describe('G2 写面收口：create_demand_draft 是唯一写工具', () => {
  const tools = allRegisteredTools();

  it('写动词前缀的工具名有且只有 create_demand_draft', () => {
    // 写操作按命名约定识别（registry 不暴露 handler，静态扫描只能看名字——
    // 这也正是命名纪律的意义：写工具必须用写动词开头，才逃不过本扫描）
    const writeVerb = /^(create|update|delete|remove|set|write|insert|add|post|submit|publish|assign|approve|reject|cancel|upsert)_/i;
    const writeTools = tools.filter((t) => writeVerb.test(t.name)).map((t) => t.name);
    assert.deepEqual(writeTools, ['create_demand_draft']);
  });

  it('create_demand_draft 仅 employer 角色可见（public/engineer 列表里没有）', () => {
    const draftTool = allRegisteredTools().find((t) => t.name === 'create_demand_draft');
    assert.deepEqual(draftTool.roles, ['employer']);
    for (const role of ['public', 'engineer']) {
      const visible = registry.list(role).map((t) => t.name);
      assert.equal(visible.includes('create_demand_draft'), false, `${role} 不应看到写工具`);
    }
  });

  it('G1：所有工具参数里都没有身份字段（userId/email 类）——防冒充', () => {
    // registry 注册期已有机械防线，这里做端到端复核（扫最终注册产物而非源码）
    const forbidden = /^(user_?id|e-?_?mail|employer_?id|owner_?id|contact|contact_?email)$/i;
    const scan = (schema, path) => {
      for (const [key, def] of Object.entries(schema?.properties || {})) {
        assert.equal(forbidden.test(key), false, `身份字段禁入参: ${path}.${key}`);
        scan(def, `${path}.${key}`);
        if (def?.items) scan(def.items, `${path}.${key}[]`);
      }
    };
    for (const t of allRegisteredTools()) scan(t.parameters, t.name);
  });
});

describe('埋点 recordAiEvent：best-effort，缺表/异常一律静默', () => {
  const evt = { userId: 1, decisionType: 'tool_call', toolCalled: 'search_engineers', input: 'hola', outcome: 'success' };

  it('ai_events 表未建（insert 返回 42P01 error）：不抛错', async () => {
    const supabase = {
      from: () => ({
        insert: async () => ({ error: { code: '42P01', message: 'relation "ai_events" does not exist' } }),
      }),
    };
    await assert.doesNotReject(recordAiEvent(supabase, evt));
  });

  it('supabase 客户端本身同步抛错：不抛错', async () => {
    const supabase = { from: () => { throw new Error('boom'); } };
    await assert.doesNotReject(recordAiEvent(supabase, evt));
  });

  it('supabase 为 null（服务未初始化）：直接跳过不抛错', async () => {
    await assert.doesNotReject(recordAiEvent(null, evt));
  });

  it('不存原文：>120 字输入只落 sha256 哈希 + 120 字截断摘要', async () => {
    const longInput = 'x'.repeat(500);
    let inserted = null;
    const supabase = { from: () => ({ insert: async (row) => { inserted = row; return { error: null }; } }) };
    await recordAiEvent(supabase, { ...evt, input: longInput });

    assert.equal(inserted.input_hash, sha256Hex(longInput));
    assert.equal(inserted.input_summary.length, 120);
    // 任何列都不允许携带完整原文
    for (const value of Object.values(inserted)) {
      assert.notEqual(value, longInput);
    }
  });
});

describe('sha256Hex 正确性', () => {
  it('已知向量：sha256("abc")', () => {
    assert.equal(
      sha256Hex('abc'),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('已知向量：sha256("")（空串）', () => {
    assert.equal(
      sha256Hex(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('utf8 中文与 node:crypto 结果一致', () => {
    const input = '墨西哥蒙特雷工厂需要 PLC 调试工程师';
    const expected = crypto.createHash('sha256').update(input, 'utf8').digest('hex');
    assert.equal(sha256Hex(input), expected);
  });
});

describe('runAgentChat 循环（注入假模型/假工具，纯逻辑）', () => {
  it('模型直接文字回复：无工具事件、draft=null', async () => {
    const seen = [];
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: 'hola' }], user: null },
      {
        supabase: null,
        callTool: async () => { throw new Error('should not be called'); },
        callModel: async (req) => { seen.push(req); return { text: '你好！', functionCalls: [] }; },
      },
    );
    assert.deepEqual(result, { reply: '你好！', toolEvents: [], draft: null });
    // 系统提示写死 G2：资金/发证/裁决只能解释，执行必须在 UI 点击
    assert.match(seen[0].systemInstruction, /NO tools for money movement/);
    assert.match(seen[0].systemInstruction, /clicks the corresponding action in the platform UI/);
    // public 角色只带 public 工具声明（实测 4 个）
    assert.equal(seen[0].tools.length, 4);
  });

  it('一轮工具调用后回复：toolEvents 记录 {tool, ok}，结果以 functionResponse 回传', async () => {
    let modelCalls = 0;
    const toolCalls = [];
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: 'find engineers in Mexico' }, { role: 'assistant', content: 'ok' }, { role: 'user', content: 'go' }] },
      {
        supabase: null,
        callTool: async (name, args, ctx) => {
          toolCalls.push({ name, args, role: ctx.user?.role || 'public' });
          return { ok: true, data: [{ id: 1, name: 'Ana' }] };
        },
        callModel: async ({ contents }) => {
          modelCalls += 1;
          if (modelCalls === 1) {
            return { text: '', functionCalls: [{ name: 'search_engineers', args: { region: 'Mexico' } }] };
          }
          // 第二轮应能看到 functionResponse 回传
          const lastParts = contents[contents.length - 1].parts;
          assert.equal(lastParts[0].functionResponse.name, 'search_engineers');
          assert.equal(lastParts[0].functionResponse.response.ok, true);
          return { text: 'Found 1 engineer.', functionCalls: [] };
        },
      },
    );
    assert.equal(result.reply, 'Found 1 engineer.');
    assert.deepEqual(result.toolEvents, [{ tool: 'search_engineers', ok: true }]);
    assert.equal(result.draft, null); // 搜索不产草稿
    assert.deepEqual(toolCalls, [{ name: 'search_engineers', args: { region: 'Mexico' }, role: 'public' }]);
  });

  it('parse_demand 成功产出 → 作为 draft 返回（可确认草稿卡）', async () => {
    const parsed = {
      title: 'PLC Commissioning',
      role_required: 'Senior PLC Programmer',
      standardized_description: 'Commission S7-1500 line.',
      milestones: [{ phase_name: 'Setup', percentage: 0.3 }],
    };
    let modelCalls = 0;
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: '我要找人调试产线' }] },
      {
        supabase: null,
        callTool: async () => ({ ok: true, data: parsed }),
        callModel: async () => {
          modelCalls += 1;
          return modelCalls === 1
            ? { text: '', functionCalls: [{ name: 'parse_demand', args: { text: '调试产线' } }] }
            : { text: '草稿已生成，请确认。', functionCalls: [] };
        },
      },
    );
    assert.deepEqual(result.draft, parsed);
    assert.deepEqual(result.toolEvents, [{ tool: 'parse_demand', ok: true }]);
  });

  it('工具失败（ok:false）不炸循环：toolEvents 记 ok:false，draft 不吸收失败结果', async () => {
    let modelCalls = 0;
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: 'save my demand' }] },
      {
        supabase: null,
        callTool: async () => ({ ok: false, error: 'Tool "create_demand_draft" is not available for role "public"' }),
        callModel: async () => {
          modelCalls += 1;
          return modelCalls === 1
            ? { text: '', functionCalls: [{ name: 'create_demand_draft', args: { title: 't' } }] }
            : { text: '请先登录雇主账号。', functionCalls: [] };
        },
      },
    );
    assert.deepEqual(result.toolEvents, [{ tool: 'create_demand_draft', ok: false }]);
    assert.equal(result.draft, null);
  });

  it(`工具循环硬上限：模型无限要工具时最多执行 ${MAX_TOOL_ROUNDS} 轮，最后一次强制无工具`, async () => {
    let toolExecutions = 0;
    const toolsPerCall = [];
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: 'loop forever' }] },
      {
        supabase: null,
        callTool: async () => { toolExecutions += 1; return { ok: true, data: { n: toolExecutions } }; },
        callModel: async ({ tools }) => {
          toolsPerCall.push(tools.length);
          // 只要还给工具就一直要求调用（模拟失控模型）
          if (tools.length > 0) return { text: '', functionCalls: [{ name: 'get_rates', args: {} }] };
          return { text: 'done', functionCalls: [] };
        },
      },
    );
    assert.equal(toolExecutions, MAX_TOOL_ROUNDS); // ≤5 轮工具调用
    assert.equal(toolsPerCall.length, MAX_TOOL_ROUNDS + 1); // 最后一次强制无工具收尾
    assert.equal(toolsPerCall[toolsPerCall.length - 1], 0);
    assert.equal(result.reply, 'done');
  });

  it('登录用户：记忆 profile 注入系统提示；ai_memory 缺表时照常对话', async () => {
    const user = { userId: 42, email: 'a@b.c', role: 'employer' };
    const profile = { stacks: ['Siemens'], lang: 'zh' };
    // 链式假 supabase：ai_memory 读到 profile；ai_events 插入静默成功
    const chain = {
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => ({ data: { profile }, error: null }),
      insert: async () => ({ error: null }),
      upsert: async () => ({ error: null }),
    };
    const seen = [];
    const result = await runAgentChat(
      { messages: [{ role: 'user', content: 'hi' }], user, lang: 'zh' },
      {
        supabase: { from: () => chain },
        callTool: async () => ({ ok: true, data: {} }),
        callModel: async (req) => { seen.push(req); return { text: '好的', functionCalls: [] }; },
      },
    );
    assert.equal(result.reply, '好的');
    assert.match(seen[0].systemInstruction, /Siemens/); // 记忆已注入
    assert.match(seen[0].systemInstruction, /zh/); // 语言偏好已注入

    // 同样输入但 ai_memory 缺表（select 链路报错）：对话不 crash，只是无记忆
    const brokenChain = {
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => ({ data: null, error: { code: '42P01', message: 'relation "ai_memory" does not exist' } }),
      insert: async () => ({ error: { code: '42P01' } }),
      upsert: async () => ({ error: { code: '42P01' } }),
    };
    const result2 = await runAgentChat(
      { messages: [{ role: 'user', content: 'hi' }], user },
      {
        supabase: { from: () => brokenChain },
        callTool: async () => ({ ok: true, data: {} }),
        callModel: async () => ({ text: '好的', functionCalls: [] }),
      },
    );
    assert.equal(result2.reply, '好的');
  });
});
