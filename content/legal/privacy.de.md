---
title: Datenschutzerklärung
description: Welche Daten Talengineer erhebt, wie sie verwendet werden, welche Auftragsverarbeiter Zugriff haben und wie Sie uns dazu erreichen. Klartext-Entwurf, ausstehende Rechtsprüfung.
date: 2026-07-24
lang: de
slug: privacy
draft: true
---

<!--
  诚实红线说明（不渲染）：本文件是"按代码库实况写的平实描述"，每一条都对应
  仓库里真实存在的机制；数字均标注单一来源。draft: true 期间页面带 noindex + 草稿横幅，
  Terry 法务终审通过后把 draft 翻成 false 才算发布。
-->

Dies ist eine Beschreibung in klarer Sprache, was die Talengineer-Plattform heute tatsächlich mit Ihren Daten erhebt und tut. Sie soll korrekt sein, nicht juristisch erschöpfend. **Dies ist ein Entwurf mit ausstehender Rechtsprüfung** — wenn etwas hier unklar ist oder Sie Ihre Daten berichtigen, exportieren oder löschen lassen möchten, schreiben Sie uns an **hello@talengineer.us**; ein Mensch antwortet Ihnen.

Talengineer („wir“) betreibt die Website und den Marktplatz unter talengineer.us und verbindet herstellende Unternehmen („Auftraggeber“) mit Ingenieuren für industrielle Automatisierung („Ingenieure“).

## Was wir erheben

**Kontogrundlagen.** Bei der Registrierung speichern wir Ihre E-Mail-Adresse, Ihre Rolle (Auftraggeber oder Ingenieur) und Ihr Passwort. Passwörter werden ausschließlich als gesalzene bcrypt-Hashes gespeichert — wir können Ihr Passwort nicht lesen und speichern es niemals im Klartext.

**Anmeldesitzung.** Nach der Anmeldung speichert Ihr Browser ein signiertes Sitzungstoken (JWT) im localStorage, damit Sie angemeldet bleiben. Das Token läuft nach 24 Stunden ab. <!-- Quelle: src/routes/auth.js JWT_EXPIRES_IN -->

**Auftraggeber-Verifizierung (KYC).** Auftraggeber, die Projekte finanzieren möchten, geben ihren Firmennamen und optional eine Firmenwebsite sowie eine Telefonnummer an. Diese werden von unserem Team manuell geprüft; wir speichern den Einreichungszeitpunkt, den Prüfstatus und etwaige Prüfnotizen.

**Ingenieur-Profile.** Ingenieure stellen die Berufsinformationen bereit, die sie für Auftraggeber veröffentlichen möchten: Fähigkeiten, Stundensatz, Erfahrung, Portfolio-Elemente und ein Profilbild. Assessment- und Zertifizierungsergebnisse (siehe unten) sind dem Profil angehängt.

**Technisches Assessment und Zertifizierungsprüfungen.** Ingenieure absolvieren ein KI-gestütztes technisches Assessment und können Zertifizierungsprüfungen ablegen. Wir speichern Ihre Antworten sowie die KI-generierten Ergebnisse und das Feedback. Prüfungsantworten werden mithilfe der Gemini-Modelle von Google bewertet, und jedes Zertifikat wird vor der Ausstellung von einem menschlichen Administrator geprüft — eine KI-Ausgabe allein stellt niemals ein Zertifikat aus.

**Background-Checks.** Wo ein Background-Check erfasst wird, ist der aktuelle Prozess manuell: Ein Administrator prüft die Nachweise und erfasst einen Bestanden/Nicht-bestanden-Status mit optionalem Nachweislink und Ablaufdatum. Wir haben keine automatisierte Background-Check-API eines Drittanbieters aktiviert.

**Steuerdokumente (W-9).** Ingenieure können ein W-9-Formular hochladen. Diese Dateien liegen in einem privaten Speicher-Bucket, der nicht öffentlich zugänglich ist; sie können nur von Administratoren über kurzlebige signierte URLs (gültig für etwa 5 Minuten) eingesehen werden, der Prüfstatus wird daneben gespeichert. <!-- Quelle: src/routes/uploads.js / src/routes/tax.js privater Bucket + kurzlebige signierte URL -->

**Weitere Uploads.** Profilbilder, Portfolio-Elemente, Fertigstellungsfotos und Versicherungsnachweise (COI) werden über einen einzigen Endpunkt hochgeladen, der JPG-, PNG-, WebP- und PDF-Dateien bis 5 MB akzeptiert. <!-- Quelle: src/routes/uploads.js MAX_FILE_SIZE / ALLOWED_MIME -->

**GPS-Check-in für Vor-Ort-Einsätze.** Wenn sich ein Ingenieur bei einem finanzierten Vor-Ort-Meilenstein eincheckt, kann der Check-in GPS-Koordinaten enthalten. Unser Server vergleicht diese mit den Koordinaten des Projektstandorts (ein „Geofence“). Dieser Vergleich ist rein informativ — ein Check-in außerhalb der Zone gelingt trotzdem, und das Ergebnis wird lediglich erfasst und ist für Auftraggeber und Administratoren sichtbar. Wir verfolgen den Standort zu keinem anderen Zeitpunkt; Koordinaten werden nur im Moment des Check-ins erfasst.

**Projektnachrichten und maschinelle Übersetzung.** Nachrichten, die Sie in einem Projekt-Workspace senden, werden gespeichert, damit beide Seiten den Verlauf lesen können. Um mehrsprachige Teams zu unterstützen, wird der Nachrichtentext zur Übersetzung an die Gemini-API von Google gesendet. Die Originalnachricht bleibt stets die maßgebliche Fassung.

**Zahlungen.** Zahlungen laufen über Stripe. Wenn ein Auftraggeber einen Meilenstein finanziert, zahlt er über eine von Stripe gehostete Stripe-Checkout-Seite — **Kartennummern erreichen niemals unsere Server**, und wir speichern sie nie. Ingenieur-Auszahlungen erfolgen über Stripe Connect; die für Auszahlungen erforderlichen Identitäts- und Bankdaten werden von Stripe erfasst und verwahrt, nicht von uns. Wir speichern den Zahlungsstatus, die Beträge und die Ledger-Einträge, die für den Betrieb der Treuhand nötig sind.

**Newsletter.** Wenn Sie Ihre E-Mail-Adresse im Kostenrechner, im Whitepaper oder in Formularen im Footer hinterlassen, speichern wir sie in einer Abonnentenliste. Wir haben bisher keine Newsletter-E-Mails versandt; sobald wir dies tun, enthält jeder Versand einen Abmeldelink, und Sie können sich außerdem jederzeit per E-Mail bei uns abmelden.

## Wie wir es verwenden

Wir verwenden die oben genannten Daten, um den Marktplatz zu betreiben: Ingenieure mit Projekten zusammenzubringen, die Meilenstein-Treuhand zu betreiben, Zertifizierungen auszustellen, Streitfälle zu bearbeiten, transaktionale E-Mails zu versenden (über Resend) und den Dienst sicher zu halten. Wir verkaufen Ihre Daten nicht und betreiben keine Werbenetzwerke oder Ad-Tracker auf der Website.

## Wer Ihre Daten verarbeitet

Wir verlassen uns auf eine kleine Gruppe von Infrastrukturanbietern, von denen jeder nur das erhält, was seine Aufgabe erfordert:

| Anbieter | Was er mit Ihren Daten tut |
| --- | --- |
| Supabase | Hostet unsere PostgreSQL-Datenbank und den Dateispeicher |
| Railway | Hostet die Anwendungsserver |
| Stripe | Verarbeitet Zahlungen und Ingenieur-Auszahlungen (Karten- und Bankdaten liegen bei Stripe) |
| Google (Gemini-API) | KI-Analyse, Prüfungsbewertung und Nachrichtenübersetzung |
| Resend | Versendet transaktionale E-Mails und Benachrichtigungen |
| Sentry | Sammelt Fehlerberichte, damit wir Abstürze beheben können |

## Cookies und lokaler Speicher

Wir verwenden keine Werbe- oder Third-Party-Tracking-Cookies. Die Website speichert einige Einträge im localStorage Ihres Browsers: Ihre Themenwahl (`tal-theme`), Ihre Sprachwahl (`tal_lang`), Ihre Sitzung und einen kontobezogenen Rollen-Cache bei der Anmeldung (`tal_user`, `tal_role_<email>`) sowie Flags, die sich merken, dass Sie den App-Installationshinweis geschlossen haben (`tal_pwa_install_dismissed`, `tal-ios-a2hs-dismissed`). Die Admin-Anmeldung speichert zusätzlich `tal_admin_token`. Das Löschen Ihres Browserspeichers entfernt alle diese Einträge. <!-- Quelle: hooks/useTheme.js / hooks/useLang.js / pages/finance.jsx / pages/admin.jsx / components/PwaSetup.jsx -->

## Aufbewahrung, Berichtigung und Löschung

Wir bewahren Konto- und Transaktionsdaten auf, solange Ihr Konto aktiv ist und solange es für Finanz- und Streitfallunterlagen erforderlich ist. Um Ihre Daten zu berichtigen, zu exportieren oder Ihr Konto zu löschen, schreiben Sie von Ihrer registrierten Adresse aus an **hello@talengineer.us**. Löschanfragen werden derzeit manuell von unserem Team bearbeitet; Aufzeichnungen, die wir aufbewahren müssen (zum Beispiel Ledger-Einträge für abgeschlossene Zahlungen), können dort aufbewahrt werden, wo dies erforderlich ist.

## Sicherheit

Neben gehashten Passwörtern und den bei Stripe gehaltenen Kartendaten liegen sensible Dokumente in privaten Buckets mit einer Deny-all-Row-Level-Security — jeder Zugriff läuft über unseren Server, und Administratoren sehen Steuerdokumente nur über kurzlebige signierte URLs. Wenn Sie glauben, ein Sicherheitsproblem gefunden zu haben, melden Sie es bitte an **hello@talengineer.us**.

## Änderungen

Solange dieses Dokument als Entwurf gekennzeichnet ist, kann es sich im Zuge der Rechtsprüfung ändern. Wesentliche Änderungen nach der Veröffentlichung werden auf dieser Seite mit aktualisiertem Datum wiedergegeben.

Verwandt: [Nutzungsbedingungen](/terms)
