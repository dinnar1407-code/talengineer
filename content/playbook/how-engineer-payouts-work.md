---
title: How Engineer Payouts Work on TalEngineer
description: A plain-language walkthrough of the money path for engineers — milestone escrow, the 85% take-home, Stripe Connect and offline payouts, what happens when a dispute freezes a milestone, and where every record lives in your ledger.
date: 2026-07-24
lang: en
type: guide
track: general
audience: engineer
slug: how-engineer-payouts-work
group: how-engineer-payouts-work
---

# How Engineer Payouts Work on TalEngineer

The single biggest fear in cross-border freelance engineering is simple: you do the work, and the money never arrives. Every design decision in TalEngineer's payment system exists to remove that fear — and to remove the mirror-image fear on the employer's side, which is paying for work that never gets done. This article walks through the entire money path from the engineer's point of view, so you know exactly what happens at each step and what to check before you commit your time.

## Money moves in before work starts

Every project on the platform is broken into **milestones** — discrete phases with a defined deliverable and a defined amount. Before a milestone begins, the employer funds it: the money leaves the employer's account and sits in escrow, attached to that specific milestone. You can see the milestone's funding status in your work order before you start.

This is the rule worth internalizing: **if a milestone is not funded, the work has not really started.** You are never in the position of invoicing a stranger across a border and hoping. The question "will they pay?" is answered before you open your laptop or get on a plane — the money already moved; the only remaining question is whether the work meets the milestone's definition.

## What you take home

<!-- 费率数字单一来源：src/config/fees.js（PLATFORM_FEE = 0.15，工程师到手 = 1 - 费率）。本页费率只在此段出现一次。 -->
When the employer approves a milestone and releases it, the platform fee comes out and the rest is yours. The standard platform fee is **15% of each released milestone, so you keep 85%** — the same public number on our [pricing page](/pricing), read from one configuration source in the codebase so it cannot quietly drift. There are no listing fees, no bidding fees, no subscription, and no charge for applying to projects. The fee binds to exactly one event: a milestone the employer accepted.

Some early founding-customer orders carry a reduced platform fee, set by the platform on a per-order basis. When that happens, the deduction from your milestone is *smaller* — a discounted fee for the employer means more of the milestone reaches you on that order.

## How the money physically reaches you

Two payout rails exist, and your profile determines which one you're on:

- **Stripe Connect (default).** If Stripe's payout network covers your country, you connect a Stripe account during onboarding. When a milestone releases, the platform sends a transfer to your connected account, and Stripe handles the last mile to your bank.
- **Offline payout (fallback).** Stripe's express payout coverage does not reach every region where great automation engineers live. If that's you, your release is registered as a manual payout and processed offline by the platform. Your release notification tells you explicitly which path your money took, so there is never ambiguity about whether a transfer is in flight.

The release itself is engineered defensively: the system claims the milestone atomically before sending money (so a double-click or a race can never trigger two transfers), and if a transfer fails mid-flight, the milestone rolls back to its funded state so the release can be retried — the money stays in escrow rather than vanishing into an error state. You get an email and an in-app notification the moment a release goes through.

## When a dispute freezes a milestone

If the employer disagrees that a milestone was delivered, they can open a dispute before releasing it. Here is what that means for you, concretely:

<!-- 举证期数字单一来源：src/routes/disputes.js（EVIDENCE_WINDOW_MS = 5 天）。 -->
1. **The milestone freezes.** A disputed milestone cannot be released while the dispute is open — but it also cannot be quietly refunded out from under you. The money stays locked in escrow until the dispute resolves.
2. **A 5-day evidence window opens.** From the moment the dispute is filed, both sides have five days to submit evidence. This is where the platform's working habits pay off: GPS check-ins from on-site work, photos uploaded during the job, milestone records, and WarRoom messages all form a timestamped trail that exists *because you worked through the platform*, not because you scrambled to reconstruct it afterward.
3. **The platform reviews the evidence and rules.** Resolution follows the record, not whoever argues loudest. Depending on what the evidence shows, funds are released to you or returned to the employer.

The practical advice: treat evidence as a habit, not an emergency response. Check in on site, upload photos as you go, keep scope conversations in the project chat. Engineers with a clean trail rarely lose disputes they shouldn't lose.

## Your ledger: one place where everything reconciles

Every financial event on your account — milestones funded, milestones released, fees deducted — is recorded in your **financial ledger**, visible in your [finance dashboard](/finance). This is your single source of truth for reconciliation: what was promised, what was released, and what you were paid, per milestone, with timestamps. No chasing invoices through email threads.

## The checklist

Before starting any milestone: confirm it's funded. During the work: check in, photograph, communicate in-platform. At release: verify the notification matches your ledger. That's the whole system — escrow before work, a public fee taken once at release, a payout rail that fits your region, a dispute process that reads evidence, and a ledger that never forgets. It's designed so that the answer to "will I get paid?" is settled before the question ever needs asking.

*Fee details and the founding-customer terms live on the [pricing page](/pricing). New to the platform? Start with [how certification exams work](/playbook/how-certification-exams-work) — certification is what makes you assignable in the first place.*
