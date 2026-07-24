---
title: Terms of Service
description: How the Talengineer marketplace actually works — accounts, fees, milestone escrow, disputes and certification — in plain language. Draft, pending legal review.
date: 2026-07-24
lang: en
slug: terms
draft: true
---

<!--
  诚实红线说明（不渲染）：条款草稿只描述仓库里真实存在的机制（托管/费率/纠纷/认证/签到），
  不发明不存在的政策；平台数字各写一次并标注单一来源（fees.js / disputes.js）。
  管辖法律等纯法务决策留白待 Terry 法务审定，不臆造。
-->

These terms describe, in plain language, how the Talengineer marketplace actually works today and what you agree to by using it. **This is a draft pending legal review** — it aims to be honest about current practice rather than exhaustive. Questions go to **hello@talengineer.us**.

## 1. What Talengineer is

Talengineer is a marketplace that connects manufacturers ("employers") with independent industrial automation engineers ("engineers") for project-based work. Engineers on the platform are independent professionals, not our employees. The work contract for a project is between the employer and the engineer; Talengineer provides the matching, escrow, communication and certification infrastructure around it.

## 2. Accounts

You register as an employer or an engineer and agree to provide accurate information. Employers who want to fund projects go through a verification step (company details, reviewed manually by our team). Engineers complete an AI-administered technical screening during onboarding; screening scores are used to rank and recommend engineers, and only engineers holding a valid platform certification can be assigned to a project. You are responsible for keeping your login credentials safe; sessions expire automatically after 24 hours.

## 3. Fees

The platform charges an escrow fee of **15%** of each milestone amount, deducted when a milestone is released to the engineer. Founding customers are charged a reduced fee of **5%**, set per project. There are no charges for posting a project or creating a profile. <!-- source: src/config/fees.js PLATFORM_FEE + demands.fee_pct（founding 让利，feeFor() 单一取费路径） -->

## 4. Milestone escrow

Projects are broken into milestones. An employer funds a milestone through Stripe Checkout; the milestone is marked as funded only after Stripe confirms the payment — we never mark funds as escrowed without payment confirmation. When the employer approves the delivered work, the milestone is released and the engineer is paid out (via Stripe Connect or an agreed alternative) minus the platform fee described above. Card numbers never touch our servers; see the [Privacy Policy](/privacy) for how payment data is handled.

## 5. On-site work and check-ins

For on-site milestones, engineers check in through the platform. A check-in requires a valid platform certification and may include GPS coordinates, which our server compares against the project site location. This geofence comparison is advisory: an out-of-range check-in still succeeds and is simply recorded for the employer and administrators to see. Engineers are responsible for complying with the site's safety and access rules.

## 6. Disputes

If either side disagrees about a milestone, they can open a dispute on the platform. From the moment a dispute is opened, both parties have **5 days** to submit their evidence. <!-- source: src/routes/disputes.js EVIDENCE_WINDOW_MS（5 天举证期） --> After the evidence window, a platform administrator reviews what both sides submitted and decides how the disputed milestone amount is allocated. Opening a dispute pauses the normal release flow for that milestone until the decision is made.

## 7. Certification and AI features

Platform certifications are earned through exams that are graded with the help of AI models and then reviewed by a human administrator before any certificate is issued. Certificates can expire and can be revoked for cause (for example, evidence of cheating). The platform also uses AI for technical screening, project parsing and message translation. **Machine translation is provided as a convenience and may contain errors — the original message is always the authoritative version.**

## 8. Acceptable use

You agree not to misrepresent your identity, qualifications or company; not to upload content you have no right to share; not to use the platform for anything unlawful; and not to attempt to probe or break the platform's security. We may suspend accounts that violate these rules or that attempt to defraud the escrow or dispute process.

## 9. Service status

Talengineer is currently in **beta**. We work to keep the service reliable, but we do not promise uninterrupted availability, and features may change as the platform develops. Nothing on the platform — including rate benchmarks, calculators and guides — is legal, tax or professional advice.

## 10. Ending your account

You can stop using the platform at any time. To close and delete your account, email **hello@talengineer.us** from your registered address; deletion is handled manually by our team. Obligations that arose before closure (for example, funded milestones and open disputes) survive until they are resolved.

## 11. Changes and open items

While this document is marked as a draft it may change as it goes through legal review. Items such as the governing law and formal dispute-resolution venue are intentionally left to that review rather than invented here. Material changes after publication will be reflected on this page with an updated date.

Related: [Privacy Policy](/privacy)
