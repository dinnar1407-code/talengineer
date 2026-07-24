---
title: Privacy Policy
description: What data Talengineer collects, how it is used, which processors touch it, and how to reach us about it. Plain-language draft, pending legal review.
date: 2026-07-24
lang: en
slug: privacy
draft: true
---

<!--
  诚实红线说明（不渲染）：本文件是"按代码库实况写的平实描述"，每一条都对应
  仓库里真实存在的机制；数字均标注单一来源。draft: true 期间页面带 noindex + 草稿横幅，
  Terry 法务终审通过后把 draft 翻成 false 才算发布。
-->

This is a plain-language description of what the Talengineer platform actually collects and does with your data today. It is written to be accurate rather than exhaustive legalese. **It is a draft pending legal review** — if anything here is unclear, or you want your data corrected, exported or deleted, email us at **hello@talengineer.us** and a human will respond.

Talengineer ("we", "us") operates the website and marketplace at talengineer.us, connecting manufacturers ("employers") with industrial automation engineers ("engineers").

## What we collect

**Account basics.** When you register we store your email address, your role (employer or engineer) and your password. Passwords are stored only as salted bcrypt hashes — we cannot read your password and never store it in plain text.

**Login session.** After you sign in, your browser keeps a signed session token (JWT) in localStorage so you stay logged in. The token expires after 24 hours. <!-- source: src/routes/auth.js JWT_EXPIRES_IN -->

**Employer verification (KYC).** Employers who want to fund projects submit their company name, and optionally a company website and phone number. These are reviewed manually by our team; we store the submission time, the review status and any reviewer note.

**Engineer profiles.** Engineers provide professional information they choose to publish to employers: skills, hourly rate, experience, portfolio items and an avatar. Screening and certification results (see below) are attached to the profile.

**Technical screening and certification exams.** Engineers take an AI-administered technical screener, and may sit certification exams. We store your answers and the AI-generated scores and feedback. Exam answers are graded with the help of Google's Gemini models, and every certificate is reviewed by a human administrator before it is issued — AI output alone never issues a certificate.

**Background checks.** Where a background check is recorded, the current process is manual: an administrator reviews evidence and records a pass/fail status with an optional evidence link and expiry date. We have not enabled any automated third-party background-check API.

**Tax documents (W-9).** Engineers may upload a W-9. These files go into a private storage bucket that is not publicly accessible; they can only be viewed by administrators through short-lived signed URLs (valid for roughly 5 minutes), and the review status is stored alongside. <!-- source: src/routes/uploads.js / src/routes/tax.js 私有桶 + 短时签名 URL -->

**Other uploads.** Avatars, portfolio items, completion photos and insurance certificates (COI) are uploaded through a single endpoint that accepts JPG, PNG, WebP and PDF files up to 5 MB. <!-- source: src/routes/uploads.js MAX_FILE_SIZE / ALLOWED_MIME -->

**GPS check-ins for on-site work.** When an engineer checks in to a funded on-site milestone, the check-in can include GPS coordinates. Our server compares them against the project site's coordinates (a "geofence"). This comparison is advisory only — a check-in outside the fence still succeeds, and the result is simply recorded and visible to the employer and administrators. We do not track location at any other time; coordinates are captured only at the moment of check-in.

**Project messages and machine translation.** Messages you send in a project workspace are stored so both sides can read the conversation. To support cross-language teams, message text is sent to Google's Gemini API for translation. The original message always remains the authoritative record.

**Payments.** Payments run on Stripe. When an employer funds a milestone, they pay through a Stripe Checkout page hosted by Stripe — **card numbers never touch our servers** and we never store them. Engineer payouts use Stripe Connect; the identity and bank details required for payouts are collected and held by Stripe, not by us. We store the payment status, amounts and ledger entries needed to run escrow.

**Newsletter.** If you leave your email on the calculator, whitepaper or footer forms, we store it in a subscriber list. We have not sent any newsletter emails yet; when we do, every send will include an unsubscribe link, and you can also unsubscribe at any time by emailing us.

## How we use it

We use the data above to run the marketplace: matching engineers to projects, operating milestone escrow, issuing certifications, handling disputes, sending transactional email (via Resend) and keeping the service secure. We do not sell your data, and we do not run advertising networks or ad trackers on the site.

## Who processes your data

We rely on a small set of infrastructure providers, each of which only receives what its job requires:

| Provider | What it does with your data |
| --- | --- |
| Supabase | Hosts our PostgreSQL database and file storage |
| Railway | Hosts the application servers |
| Stripe | Processes payments and engineer payouts (card and bank data live with Stripe) |
| Google (Gemini API) | AI parsing, exam grading and message translation |
| Resend | Sends transactional and notification email |
| Sentry | Collects error reports so we can fix crashes |

## Cookies and local storage

We do not use advertising or third-party tracking cookies. The site stores a few items in your browser's localStorage: your theme choice (`tal-theme`), your language choice (`tal_lang`), your session and a per-account role cache when you sign in (`tal_user`, `tal_role_<email>`), and flags remembering that you dismissed the app-install prompt (`tal_pwa_install_dismissed`, `tal-ios-a2hs-dismissed`). Admin sign-in additionally stores `tal_admin_token`. Clearing your browser storage removes them all. <!-- source: hooks/useTheme.js / hooks/useLang.js / pages/finance.jsx / pages/admin.jsx / components/PwaSetup.jsx -->

## Retention, correction and deletion

We keep account and transaction records while your account is active and as long as needed for financial and dispute records. To correct your data, export it, or delete your account, email **hello@talengineer.us** from your registered address. Deletion requests are currently handled manually by our team; records that we must keep (for example, ledger entries for completed payments) may be retained where required.

## Security

In addition to hashed passwords and Stripe-held card data, sensitive documents live in private buckets with deny-all row-level security — all access goes through our server, and administrators see tax documents only through short-lived signed URLs. If you believe you have found a security issue, please report it to **hello@talengineer.us**.

## Changes

While this document is marked as a draft, it may change as it goes through legal review. Material changes after publication will be reflected on this page with an updated date.

Related: [Terms of Service](/terms)
