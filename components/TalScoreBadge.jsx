// TalScore 四档金属徽章（共享组件）
// ─────────────────────────────────────────────────────────────────────────────
// 为什么抽成组件：TalScore 徽章原本内联写在 pages/engineer/[id].jsx，而 /talent 浏览卡
// 也要显示同一枚徽章。把 talTier()/TAL_TIERS 抽到这里，两处 import 复用，视觉与阈值单一来源，
// 以后调配色/阈值只改这一处，不会两边漂移。
//
// props.score：综合质量分（0-100，后端 talScore.js 算出）。
//   - null / undefined / 0 / 非数字 → 返回 null 不渲染（"未打分"不该显示一个 0 分或空徽章）。
//   - 正常分数 → 渲染 "🏅 TalScore {score} · {档位}"。

// 金属色系四档：半透明底 + 实色字，明暗主题下都清晰可读。
// 阈值 >=85 白金 / >=70 金 / >=55 银 / 其余 铜（与后端 talScore.js 的 tier 阈值保持一致）。
const TAL_TIERS = [
  { min: 85, label: 'Platinum', fg: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  { min: 70, label: 'Gold',     fg: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { min: 55, label: 'Silver',   fg: '#94a3b8', bg: 'rgba(148,163,184,0.18)' },
  { min: 0,  label: 'Bronze',   fg: '#c2703d', bg: 'rgba(194,112,61,0.16)' },
];

// 把分数映射到档位。未打分/0/非数字一律返回 null（不渲染）：
// !s 一并涵盖了 0、null、undefined、NaN 四种"没有有效分数"的情况，
// 再用 Number.isFinite 兜住 Infinity 这类极端值。
export function talTier(score) {
  const s = Number(score);
  if (!s || !Number.isFinite(s)) return null;
  return TAL_TIERS.find((t) => s >= t.min) || TAL_TIERS[TAL_TIERS.length - 1];
}

export default function TalScoreBadge({ score }) {
  const tier = talTier(score);
  if (!tier) return null; // 未打分不占位，交给调用方优雅回退
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 12, fontWeight: 700,
        color: tier.fg, background: tier.bg,
        padding: '2px 10px', borderRadius: 999,
      }}
    >
      🏅 TalScore {score} · {tier.label}
    </span>
  );
}
