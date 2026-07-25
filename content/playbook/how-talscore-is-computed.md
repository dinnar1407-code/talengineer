---
title: How TalScore Is Computed
description: The exact math behind your TalScore — the four weighted dimensions, the Bayesian rating average that protects against review gaming, the reliability rules and the dispute-rate red line, the tier thresholds, and what actually moves each number.
date: 2026-07-24
lang: en
type: guide
track: general
audience: engineer
slug: how-talscore-is-computed
group: how-talscore-is-computed
---

# How TalScore Is Computed

TalScore is your quality score on TalEngineer: a single number from 0 to 100 that folds four verifiable signals into something an employer can sort by and the platform can set thresholds on. Unlike a star rating on a generic freelance site, every input into TalScore is something the platform itself verified — a screening you sat, a certification you earned, a review from a completed paid project, a delivery record with timestamps. This article shows the actual formula, because a score you can't inspect is a score you can't improve deliberately.

## The four dimensions and their weights

<!-- TalScore 全部数字单一来源：src/services/talScore.js（WEIGHTS 25/25/30/20、CERT_LEVEL_POINTS 8/16/25、RATING_PRIOR 3.5×5、RELIABILITY_COMPLETED_CAP 10、NO_DISPUTE_BONUS 10、DISPUTE_RATE_LIMIT 0.10、TIER_THRESHOLDS 85/70/55）。各数字在本页只出现一次。 -->
Your score is the sum of four weighted components:

| Dimension | Weight | What it measures |
|---|---|---|
| AI screening | 25 | Your score on the technical screener every engineer passes at signup |
| Platform certification | 25 | The certifications you've earned, by track and level |
| Employer ratings | 30 | Star ratings from completed, paid projects — Bayesian-averaged |
| Reliability | 20 | Completed orders plus a clean dispute record |

The weights reflect a deliberate philosophy: what employers experienced (ratings, 30) counts slightly more than any single test, but no dimension dominates — a brilliant exam-taker with no delivery record and a prolific deliverer who never certified both plateau below someone strong across the board.

## Dimension 1: AI screening (up to 25 points)

Your screener result from signup maps linearly onto this dimension: a 0–100 screening score becomes 0–25 TalScore points. This is your capability baseline, set once when you join. The way to move it is to have genuinely performed on the screener — there is no grinding this dimension afterward, which is exactly why the other three exist.

## Dimension 2: certification (up to 25 points)

For each track, only your **highest** level counts: **L1 is worth 8 points, L2 is worth 16, L3 is worth 25**, and the dimension caps at 25. Read those numbers carefully, because they encode a strategy: a single L3 maxes out this dimension entirely. Two L1s in different tracks (16 points) equal one L2 — and fall far short of one L3. Depth beats breadth here. Cross-track certifications still matter for *which projects you can be assigned to* — but for TalScore purposes, climbing one ladder pays better than starting several.

## Dimension 3: ratings — and why one 5-star review won't rocket you to the top

Raw averages are gameable: one friendly 5-star review would put a newcomer above a veteran with forty 4.8-star projects. TalScore instead uses a **Bayesian average**: your rating is computed as if you started with **5 phantom reviews at 3.5 stars** — the platform-wide prior — blended with your real ones. The result (out of 5 stars) then maps onto the 30-point dimension.

The consequence you should internalize: with few reviews, your effective rating sits near 3.5 regardless of how good those reviews are, and each additional real review pulls it further toward your true average. Early on, *volume of completed, well-rated projects* moves this dimension more than perfection on a single one. Over time, the prior's influence fades and your real track record dominates. This is the fairest system we know of for comparing a newcomer against a veteran without letting either be misrepresented.

## Dimension 4: reliability — and the red line

Reliability is the simplest arithmetic and the sharpest edge:

- **1 point per completed order, capped at 10.** Ten completed projects max out the delivery half.
- **A 10-point bonus for having zero disputes.** A clean record is worth as much as ten completed orders.
- **The red line: if your dispute rate exceeds 10% of completed orders, the entire dimension drops to zero.** Not reduced — zeroed. And an engineer with disputes but no completions is treated as maximally risky.

The design intent is transparent: the platform would rather you deliver slightly less volume with zero conflict than high volume with friction. One dispute on a long record won't zero you (it costs you the bonus), but a pattern of disputes is the single most damaging thing that can happen to your score.

## Tiers

Your score maps to a tier badge shown on your profile: **85 and above is Platinum, 70–84 is Gold, 55–69 is Silver**, and below that Bronze. Tiers are pure presentation of the same number — there is no separate tier committee.

## When it updates, and what to actually do

TalScore recomputes automatically when its inputs change — after a new review lands, after milestones release, when a certification is issued. Your profile shows the per-dimension breakdown, so you can see exactly where your points are and aren't.

The playbook that falls out of the math: certify deep in your main track (a single L3 maxes the certification dimension on its own), complete projects cleanly and let the review count accumulate past the prior, and treat disputes as the thing to avoid at nearly any cost — communicate early through the platform when a project wobbles, because a resolved conversation costs you nothing while a dispute can cost you a fifth of your score.

*See your own breakdown on the [TalScore page](/talscore). For how the score is used in practice, read [getting matched on TalEngineer](/playbook/getting-matched-on-talengineer).*
