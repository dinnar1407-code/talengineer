// ── 信息架构数据层测试（lib/hireMatrix getTrackMeta/矩阵扩容 + lib/occupations）──
// 守护 2026-07 IA 改版的两条数据层红线：
//   1. hireMatrix：getTrackMeta 对 4 个方向都给出完整元数据（/hire 索引与职业页都吃它），
//      MATRIX 扩到 12 组合且 electrical 刻意不进（计划 §B3）。
//   2. occupations：6 个职业条目 en/zh 双语齐全、各 4 条 FAQ、track 只指向真实存在的
//      4 条认证方向（scada-engineer 归 plc 是刻意的诚实声明，不是 bug）。
//
// 为什么用动态 import：lib/hireMatrix.js / lib/occupations.js 是 ESM，
// node:test 的 CJS 测试文件里用 await import() 加载最稳（与 playbookContent.test.js 同一模式）。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// 平台仅有的 4 条认证方向（src/config/training.js + /hire/[track] 同口径）。
const CERT_TRACKS = ['plc', 'robotics', 'vision', 'electrical'];

// 全部 6 个职业 slug（计划 §B1 表）。
const ROLE_SLUGS = [
  'plc-programmer',
  'controls-engineer',
  'robotics-engineer',
  'vision-engineer',
  'electrical-engineer',
  'scada-engineer',
];

describe('lib/hireMatrix —— getTrackMeta 与矩阵扩容', () => {

  it('getTrackMeta：4 个方向都返回 label/kicker/skills/levels 完整元数据', async () => {
    const { getTrackMeta } = await import('../lib/hireMatrix.js');
    for (const track of CERT_TRACKS) {
      const meta = getTrackMeta(track);
      assert.ok(meta, `方向 ${track} 缺 getTrackMeta 元数据`);
      // label/kicker 必须 en/zh 双语非空
      assert.ok(meta.label.en && meta.label.zh, `${track} label 双语不全`);
      assert.ok(meta.kicker.en && meta.kicker.zh, `${track} kicker 双语不全`);
      // skills 是非空数组
      assert.ok(Array.isArray(meta.skills) && meta.skills.length > 0, `${track} skills 为空`);
      // levels：en/zh 各有 l1/l2/l3 描述
      for (const lang of ['en', 'zh']) {
        for (const lvl of ['l1', 'l2', 'l3']) {
          assert.ok(meta.levels[lang][lvl], `${track} levels.${lang}.${lvl} 缺失`);
        }
      }
    }
    // 未知方向显式返回 null（而不是 undefined 解构炸掉）
    assert.equal(getTrackMeta('nonexistent'), null);
  });

  it('MATRIX：扩容后共 12 个组合，且 4 个新组合齐全', async () => {
    const { getMatrixPaths, hasMatrixEntry } = await import('../lib/hireMatrix.js');
    assert.equal(getMatrixPaths().length, 12, '组合数应为 12（plc4 + robotics4 + vision4）');

    // 2026-07 新增的 4 个组合必须存在
    const added = [
      ['robotics', 'packaging'],
      ['vision', 'pharma'],
      ['vision', 'automotive'],
      ['robotics', 'food-beverage'],
    ];
    for (const [track, industry] of added) {
      assert.ok(hasMatrixEntry(track, industry), `新组合 ${track}/${industry} 缺失`);
    }

    // electrical 刻意不进 MATRIX（行业差异化最弱，计划 §B3 记录在案）
    const hasElectrical = getMatrixPaths().some((p) => p.params.track === 'electrical');
    assert.equal(hasElectrical, false, 'electrical 不应出现在 MATRIX 组合里');
  });

  it('新组合内容形状与既有组合一致（en/zh 各含 title/sub/pain1/pain2）', async () => {
    const { getMatrixPage } = await import('../lib/hireMatrix.js');
    for (const [track, industry] of [['robotics', 'packaging'], ['vision', 'pharma'], ['vision', 'automotive'], ['robotics', 'food-beverage']]) {
      const page = getMatrixPage(track, industry);
      assert.ok(page, `getMatrixPage(${track}, ${industry}) 返回空`);
      for (const lang of ['en', 'zh']) {
        for (const field of ['title', 'sub', 'pain1', 'pain2']) {
          assert.ok(page.content[lang][field], `${track}/${industry} 的 ${lang}.${field} 缺失`);
        }
      }
      // 行业专属技能已并入技能清单（方向技能 + 行业技能）
      assert.ok(page.skills.length > 6, `${track}/${industry} 应含行业专属技能`);
    }
  });
});

describe('lib/occupations —— 职业页数据层', () => {

  it('getOccupationPaths：恰好 6 个职业，slug 与计划一致', async () => {
    const { getOccupationPaths } = await import('../lib/occupations.js');
    const paths = getOccupationPaths();
    assert.equal(paths.length, 6);
    const slugs = paths.map((p) => p.params.role).sort();
    assert.deepEqual(slugs, [...ROLE_SLUGS].sort());
  });

  it('每个职业：en+zh 双语齐全、恰好 4 条 FAQ、track 是合法认证方向', async () => {
    const { getOccupationPage } = await import('../lib/occupations.js');
    for (const slug of ROLE_SLUGS) {
      const page = getOccupationPage(slug);
      assert.ok(page, `职业 ${slug} 缺数据`);

      // track 只能指向真实存在的 4 条认证方向（scada 归 plc 也在此集合内）
      assert.ok(CERT_TRACKS.includes(page.track), `${slug} 的 track "${page.track}" 不是合法认证方向`);

      // 职业短名与职业技能
      assert.ok(page.name.en && page.name.zh, `${slug} name 双语不全`);
      assert.ok(Array.isArray(page.roleSkills) && page.roleSkills.length > 0, `${slug} roleSkills 为空`);

      // en/zh 内容齐全：kicker/title/sub/lead1/lead2 + 4 条 FAQ（每条 q/a 非空）
      for (const lang of ['en', 'zh']) {
        const c = page.content[lang];
        assert.ok(c, `${slug} 缺 ${lang} 内容`);
        for (const field of ['kicker', 'title', 'sub', 'lead1', 'lead2']) {
          assert.ok(c[field], `${slug} 的 ${lang}.${field} 缺失`);
        }
        assert.equal(c.faq.length, 4, `${slug} 的 ${lang} FAQ 应恰好 4 条`);
        for (const item of c.faq) {
          assert.ok(item.q && item.a, `${slug} 的 ${lang} FAQ 有空 q/a`);
        }
      }

      // 页面拼装：方向元数据 + 全站唯一来源的费率表 + 内链
      assert.ok(page.trackMeta, `${slug} 缺 trackMeta（getTrackMeta 未接通）`);
      assert.equal(page.regions.length, 7, `${slug} 费率表应为 7 个地区（hireMatrix REGIONS 同源）`);
      assert.ok(page.links.trackPage.href === `/hire/${page.track}`, `${slug} 方向母页链接错误`);
      assert.ok(Array.isArray(page.links.industries), `${slug} 缺行业内链数组`);
      assert.ok(Array.isArray(page.links.siblings), `${slug} 缺兄弟职业内链数组`);
      // 兄弟职业内链不包含自己
      assert.ok(!page.links.siblings.some((s) => s.href === `/occupations/${slug}`), `${slug} 兄弟内链包含了自己`);
    }
    // 未知 slug 显式返回 null
    assert.equal(getOccupationPage('nonexistent-role'), null);
  });

  it('getRolesForTrack：4 个方向合计覆盖全部 6 个职业，scada 归 plc', async () => {
    const { getRolesForTrack, getOccupationPage } = await import('../lib/occupations.js');
    const covered = [];
    for (const track of CERT_TRACKS) {
      for (const r of getRolesForTrack(track)) {
        assert.ok(r.role && r.name.en && r.name.zh, `${track} 下的职业条目形状不完整`);
        covered.push(r.role);
      }
    }
    // 无重复（每个职业只归属一个方向）且全覆盖
    assert.equal(new Set(covered).size, covered.length, '有职业被计入多个方向');
    assert.deepEqual([...covered].sort(), [...ROLE_SLUGS].sort(), '4 个方向未覆盖全部 6 个职业');

    // SCADA 认证归属 PLC & Controls（只有 4 条认证方向，诚实红线）
    const plcRoles = getRolesForTrack('plc').map((r) => r.role);
    assert.ok(plcRoles.includes('scada-engineer'), 'scada-engineer 应归入 plc 方向');

    // 相关 Playbook 内链的 slug 必须指向真实存在的文章文件（防死链）
    const fs = require('node:fs');
    const path = require('node:path');
    for (const slug of ROLE_SLUGS) {
      for (const pb of getOccupationPage(slug).links.playbook) {
        const file = path.join(process.cwd(), 'content', 'playbook', `${pb.slug}.md`);
        assert.ok(fs.existsSync(file), `${slug} 关联的 playbook 文章不存在：${pb.slug}`);
      }
    }
  });
});
