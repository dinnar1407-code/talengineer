---
title: Nutzungsbedingungen
description: Wie der Talengineer-Marktplatz tatsächlich funktioniert — Konten, Gebühren, Meilenstein-Treuhand, Streitfälle und Zertifizierung — in klarer Sprache. Entwurf, ausstehende Rechtsprüfung.
date: 2026-07-24
lang: de
slug: terms
draft: true
---

<!--
  诚实红线说明（不渲染）：条款草稿只描述仓库里真实存在的机制（托管/费率/纠纷/认证/签到），
  不发明不存在的政策；平台数字各写一次并标注单一来源（fees.js / disputes.js）。
  管辖法律等纯法务决策留白待 Terry 法务审定，不臆造。
-->

Diese Bedingungen beschreiben in klarer Sprache, wie der Talengineer-Marktplatz heute tatsächlich funktioniert und was Sie durch die Nutzung akzeptieren. **Dies ist ein Entwurf mit ausstehender Rechtsprüfung** — er soll die aktuelle Praxis ehrlich abbilden, nicht erschöpfend sein. Fragen richten Sie an **hello@talengineer.us**.

## 1. Was Talengineer ist

Talengineer ist ein Marktplatz, der herstellende Unternehmen („Auftraggeber“) mit unabhängigen Ingenieuren für industrielle Automatisierung („Ingenieure“) für projektbezogene Arbeit verbindet. Ingenieure auf der Plattform sind unabhängige Fachleute, keine Angestellten von uns. Der Werkvertrag für ein Projekt besteht zwischen Auftraggeber und Ingenieur; Talengineer stellt die Infrastruktur für Matching, Treuhand, Kommunikation und Zertifizierung rund um diesen Vertrag bereit.

## 2. Konten

Sie registrieren sich als Auftraggeber oder Ingenieur und erklären sich bereit, korrekte Angaben zu machen. Auftraggeber, die Projekte finanzieren möchten, durchlaufen einen Verifizierungsschritt (Firmendaten, manuell von unserem Team geprüft). Ingenieure absolvieren während des Onboardings ein KI-gestütztes technisches Assessment; die Assessment-Werte dienen dazu, Ingenieure zu ranken und zu empfehlen, und nur Ingenieure mit gültiger Plattformzertifizierung können einem Projekt zugewiesen werden. Sie sind dafür verantwortlich, Ihre Zugangsdaten sicher aufzubewahren; Sitzungen laufen automatisch nach 24 Stunden ab.

## 3. Gebühren

Die Plattform erhebt eine Treuhandgebühr von **15%** jedes Meilensteinbetrags, die bei Freigabe eines Meilensteins an den Ingenieur abgezogen wird. Gründungskunden zahlen eine ermäßigte Gebühr von **5%**, festgelegt pro Projekt. Für das Ausschreiben eines Projekts oder das Anlegen eines Profils fallen keine Gebühren an. <!-- Quelle: src/config/fees.js PLATFORM_FEE + demands.fee_pct (Gründungskunden-Nachlass, feeFor() ist der einzige Berechnungsweg für die Gebühr) -->

## 4. Meilenstein-Treuhand

Projekte werden in Meilensteine unterteilt. Ein Auftraggeber finanziert einen Meilenstein über Stripe Checkout; der Meilenstein wird erst als finanziert markiert, nachdem Stripe die Zahlung bestätigt hat — wir markieren Gelder niemals als treuhänderisch hinterlegt ohne Zahlungsbestätigung. Wenn der Auftraggeber die gelieferte Arbeit abnimmt, wird der Meilenstein freigegeben und der Ingenieur wird ausgezahlt (über Stripe Connect oder eine vereinbarte Alternative), abzüglich der oben beschriebenen Plattformgebühr. Kartennummern erreichen niemals unsere Server; siehe die [Datenschutzerklärung](/privacy) dazu, wie Zahlungsdaten gehandhabt werden.

## 5. Vor-Ort-Einsätze und Check-ins

Bei Vor-Ort-Meilensteinen checken Ingenieure über die Plattform ein. Ein Check-in erfordert eine gültige Plattformzertifizierung und kann GPS-Koordinaten enthalten, die unser Server mit dem Projektstandort vergleicht. Dieser Geofence-Vergleich ist rein informativ: Ein Check-in außerhalb des Bereichs gelingt trotzdem und wird lediglich für Auftraggeber und Administratoren erfasst. Ingenieure sind dafür verantwortlich, die Sicherheits- und Zutrittsregeln des Standorts einzuhalten.

## 6. Streitfälle

Wenn eine Seite mit einem Meilenstein nicht einverstanden ist, kann sie auf der Plattform einen Streitfall eröffnen. Ab dem Moment der Eröffnung haben beide Parteien **5 Tage** Zeit, ihre Nachweise einzureichen. <!-- Quelle: src/routes/disputes.js EVIDENCE_WINDOW_MS (5-Tage-Beweisfrist) --> Nach der Beweisfrist prüft ein Plattform-Administrator, was beide Seiten eingereicht haben, und entscheidet, wie der strittige Meilensteinbetrag aufgeteilt wird. Die Eröffnung eines Streitfalls pausiert den normalen Freigabeprozess für diesen Meilenstein, bis die Entscheidung getroffen ist.

## 7. Zertifizierung und KI-Funktionen

Plattformzertifizierungen werden durch Prüfungen erworben, die mithilfe von KI-Modellen bewertet und anschließend von einem menschlichen Administrator geprüft werden, bevor ein Zertifikat ausgestellt wird. Zertifikate können ablaufen und aus triftigem Grund widerrufen werden (zum Beispiel bei Nachweisen für Betrug). Die Plattform nutzt KI außerdem für technisches Assessment, Projektanalyse und Nachrichtenübersetzung. **Die maschinelle Übersetzung ist ein Komfortmerkmal und kann Fehler enthalten — die Originalnachricht ist stets die maßgebliche Fassung.**

## 8. Zulässige Nutzung

Sie erklären sich einverstanden, Ihre Identität, Qualifikationen oder Ihr Unternehmen nicht falsch darzustellen; keine Inhalte hochzuladen, an denen Sie keine Rechte haben; die Plattform nicht für rechtswidrige Zwecke zu nutzen; und nicht zu versuchen, die Sicherheit der Plattform zu untersuchen oder zu umgehen. Wir können Konten sperren, die gegen diese Regeln verstoßen oder versuchen, den Treuhand- oder Streitfallprozess zu missbrauchen.

## 9. Servicestatus

Talengineer befindet sich derzeit in der **Beta-Phase**. Wir bemühen uns um einen zuverlässigen Service, versprechen aber keine unterbrechungsfreie Verfügbarkeit, und Funktionen können sich im Zuge der Weiterentwicklung der Plattform ändern. Nichts auf der Plattform — einschließlich Satzbenchmarks, Rechnern und Leitfäden — stellt eine rechtliche, steuerliche oder fachliche Beratung dar.

## 10. Beendigung Ihres Kontos

Sie können die Nutzung der Plattform jederzeit beenden. Um Ihr Konto zu schließen und zu löschen, schreiben Sie von Ihrer registrierten Adresse aus an **hello@talengineer.us**; die Löschung wird manuell von unserem Team bearbeitet. Verpflichtungen, die vor der Schließung entstanden sind (zum Beispiel finanzierte Meilensteine und offene Streitfälle), bestehen fort, bis sie geklärt sind.

## 11. Änderungen und offene Punkte

Solange dieses Dokument als Entwurf gekennzeichnet ist, kann es sich im Zuge der Rechtsprüfung ändern. Punkte wie das anwendbare Recht und der förmliche Gerichtsstand für Streitbeilegung sind bewusst dieser Prüfung vorbehalten und werden hier nicht vorweggenommen. Wesentliche Änderungen nach der Veröffentlichung werden auf dieser Seite mit aktualisiertem Datum wiedergegeben.

Verwandt: [Datenschutzerklärung](/privacy)
