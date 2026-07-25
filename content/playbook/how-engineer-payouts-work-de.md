---
title: Wie Auszahlungen an Ingenieure bei TalEngineer funktionieren
description: Eine verständliche Erklärung des Geldwegs für Ingenieure — Meilenstein-Treuhand, die 85% Nettobetrag, Stripe Connect und Auszahlungen offline, was passiert, wenn ein Streitfall einen Meilenstein einfriert, und wo jede Buchung in Ihrem Kontobuch landet.
date: 2026-07-24
lang: de
type: guide
track: general
audience: engineer
slug: how-engineer-payouts-work-de
group: how-engineer-payouts-work
---

# Wie Auszahlungen an Ingenieure bei TalEngineer funktionieren

Die größte Angst bei grenzüberschreitender Freelance-Ingenieurarbeit ist einfach: Sie erledigen die Arbeit, und das Geld kommt nie an. Jede Design-Entscheidung im Zahlungssystem von TalEngineer existiert, um genau diese Angst zu beseitigen — und die spiegelbildliche Angst auf Seiten des Auftraggebers, nämlich für Arbeit zu bezahlen, die nie fertiggestellt wird. Dieser Artikel führt den gesamten Geldweg aus der Perspektive des Ingenieurs durch, damit Sie genau wissen, was bei jedem Schritt passiert und was Sie prüfen sollten, bevor Sie Ihre Zeit investieren.

## Das Geld bewegt sich, bevor die Arbeit beginnt

Jedes Projekt auf der Plattform wird in **Meilensteine** unterteilt — abgegrenzte Phasen mit einem definierten Liefergegenstand und einem definierten Betrag. Bevor ein Meilenstein beginnt, finanziert der Auftraggeber ihn: Das Geld verlässt das Konto des Auftraggebers und liegt in der Treuhand, gebunden an genau diesen Meilenstein. Sie sehen den Finanzierungsstatus des Meilensteins in Ihrem Arbeitsauftrag, bevor Sie starten.

Das ist die Regel, die man verinnerlichen sollte: **Ist ein Meilenstein nicht finanziert, hat die Arbeit eigentlich noch nicht begonnen.** Sie sind nie in der Lage, einem Fremden über eine Grenze hinweg eine Rechnung zu stellen und zu hoffen. Die Frage „Werden sie zahlen?“ ist beantwortet, bevor Sie Ihren Laptop aufklappen oder ins Flugzeug steigen — das Geld hat sich bereits bewegt; die einzige verbleibende Frage ist, ob die Arbeit der Definition des Meilensteins entspricht.

## Was Sie netto behalten

<!-- Einzige Quelle der Gebührenzahl: src/config/fees.js (PLATFORM_FEE = 0.15, Nettobetrag des Ingenieurs = 1 - Gebühr). Die Gebühr erscheint auf dieser Seite nur einmal, in diesem Absatz. -->
Wenn der Auftraggeber einen Meilenstein abnimmt und freigibt, wird die Plattformgebühr abgezogen, der Rest gehört Ihnen. Die Standard-Plattformgebühr beträgt **15% jedes freigegebenen Meilensteins, Sie behalten also 85%** — dieselbe öffentliche Zahl wie auf unserer [Preisseite](/pricing), gelesen aus einer einzigen Konfigurationsquelle im Code, sodass sie nicht unbemerkt abweichen kann. Es gibt keine Listungsgebühren, keine Ausschreibungsgebühren, kein Abonnement und keine Kosten für die Bewerbung auf Projekte. Die Gebühr ist an genau ein Ereignis gebunden: einen vom Auftraggeber abgenommenen Meilenstein.

Manche frühen Aufträge von Gründungskunden tragen eine reduzierte Plattformgebühr, die von der Plattform pro Auftrag festgelegt wird. Ist das der Fall, ist der Abzug von Ihrem Meilenstein *kleiner* — ein reduzierter Satz für den Auftraggeber bedeutet, dass bei diesem Auftrag mehr vom Meilenstein bei Ihnen ankommt.

## Wie das Geld physisch bei Ihnen ankommt

Es gibt zwei Auszahlungswege, und Ihr Profil bestimmt, welcher für Sie gilt:

- **Stripe Connect (Standard).** Deckt Stripes Auszahlungsnetzwerk Ihr Land ab, verbinden Sie während des Onboardings ein Stripe-Konto. Wird ein Meilenstein freigegeben, sendet die Plattform eine Überweisung an Ihr verbundenes Konto, und Stripe übernimmt die letzte Etappe bis zu Ihrer Bank.
- **Offline-Auszahlung (Ausweichlösung).** Stripes Express-Auszahlungsabdeckung erreicht nicht jede Region, in der hervorragende Automatisierungsingenieure leben. Trifft das auf Sie zu, wird Ihre Freigabe als manuelle Auszahlung erfasst und von der Plattform offline abgewickelt. Ihre Freigabebenachrichtigung teilt Ihnen ausdrücklich mit, welchen Weg Ihr Geld genommen hat, sodass nie Unklarheit darüber besteht, ob eine Überweisung unterwegs ist.

Die Freigabe selbst ist defensiv konstruiert: Das System beansprucht den Meilenstein atomar, bevor Geld gesendet wird (sodass ein Doppelklick oder eine Race Condition niemals zwei Überweisungen auslösen kann), und schlägt eine Überweisung mitten in der Übertragung fehl, kehrt der Meilenstein in seinen finanzierten Zustand zurück, damit die Freigabe erneut versucht werden kann — das Geld bleibt in der Treuhand, statt in einem Fehlerzustand zu verschwinden. Sie erhalten eine E-Mail und eine In-App-Benachrichtigung in dem Moment, in dem eine Freigabe durchgeht.

## Wenn ein Streitfall einen Meilenstein einfriert

Widerspricht der Auftraggeber der Auffassung, dass ein Meilenstein geliefert wurde, kann er vor der Freigabe einen Streitfall eröffnen. Konkret bedeutet das für Sie:

<!-- Einzige Quelle der Beweisfrist-Zahl: src/routes/disputes.js (EVIDENCE_WINDOW_MS = 5 Tage). -->
1. **Der Meilenstein friert ein.** Ein strittiger Meilenstein kann nicht freigegeben werden, solange der Streitfall offen ist — er kann aber auch nicht stillschweigend hinter Ihrem Rücken erstattet werden. Das Geld bleibt in der Treuhand gesperrt, bis der Streitfall geklärt ist.
2. **Eine Beweisfrist von 5 Tagen beginnt.** Ab dem Moment, in dem der Streitfall eingereicht wird, haben beide Seiten fünf Tage Zeit, Beweise vorzulegen. Hier zahlen sich die Arbeitsgewohnheiten auf der Plattform aus: GPS-Check-ins von Vor-Ort-Einsätzen, während der Arbeit hochgeladene Fotos, Meilenstein-Aufzeichnungen und WarRoom-Nachrichten bilden zusammen eine zeitgestempelte Spur, die *existiert, weil Sie über die Plattform gearbeitet haben*, nicht weil Sie sie hinterher hastig rekonstruieren mussten.
3. **Die Plattform prüft die Beweise und entscheidet.** Die Lösung folgt der Aktenlage, nicht der lautesten Argumentation. Je nachdem, was die Beweise zeigen, werden die Mittel an Sie freigegeben oder an den Auftraggeber zurückgezahlt.

Der praktische Rat: Behandeln Sie Beweissicherung als Gewohnheit, nicht als Notfallreaktion. Checken Sie vor Ort ein, laden Sie laufend Fotos hoch, führen Sie Gespräche zum Leistungsumfang im Projekt-Chat. Ingenieure mit einer sauberen Spur verlieren selten Streitfälle, die sie nicht verlieren sollten.

## Ihr Kontobuch: ein Ort, an dem alles zusammenläuft

Jedes finanzielle Ereignis auf Ihrem Konto — finanzierte Meilensteine, freigegebene Meilensteine, abgezogene Gebühren — wird in Ihrem **Finanz-Kontobuch** erfasst, sichtbar in Ihrem [Finance-Dashboard](/finance). Das ist Ihre einzige verlässliche Quelle für den Abgleich: was zugesagt wurde, was freigegeben wurde und was Sie ausgezahlt bekamen, pro Meilenstein, mit Zeitstempel. Kein Hinterherjagen von Rechnungen in E-Mail-Verläufen.

## Die Checkliste

Bevor Sie einen Meilenstein beginnen: bestätigen Sie, dass er finanziert ist. Während der Arbeit: einchecken, fotografieren, innerhalb der Plattform kommunizieren. Bei der Freigabe: prüfen Sie, ob die Benachrichtigung mit Ihrem Kontobuch übereinstimmt. Das ist das gesamte System — Treuhand vor der Arbeit, eine öffentliche Gebühr, die nur einmal bei der Freigabe erhoben wird, ein Auszahlungsweg, der zu Ihrer Region passt, ein Streitfallprozess, der Beweise liest, und ein Kontobuch, das nichts vergisst. Es ist so konzipiert, dass die Antwort auf „Werde ich bezahlt?“ bereits feststeht, bevor die Frage überhaupt gestellt werden muss.

*Details zur Gebühr und die Bedingungen für Gründungskunden finden Sie auf der [Preisseite](/pricing). Neu auf der Plattform? Beginnen Sie mit [wie Zertifizierungsprüfungen funktionieren](/playbook/how-certification-exams-work) — die Zertifizierung ist es, die Sie überhaupt erst einsatzfähig macht.*
