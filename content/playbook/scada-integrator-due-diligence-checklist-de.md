---
title: Die Due-Diligence-Checkliste für SCADA-Integratoren
description: Eine praktische Checkliste zur Prüfung eines SCADA-Integrators vor der Beauftragung — sie deckt Plattformtiefe, Architektur, Sicherheit, Dokumentation, Referenzen und Zahlungsstruktur ab.
date: 2026-07-14
lang: de
type: guide
track: plc
audience: employer
slug: scada-integrator-due-diligence-checklist-de
group: scada-integrator-due-diligence-checklist
---

# Die Due-Diligence-Checkliste für SCADA-Integratoren

Ein SCADA-Projekt steht im Zentrum Ihres Betriebs. Es bestimmt, wie Ihre Mitarbeiter die Anlage sehen, wie Alarme die richtige Person erreichen und zunehmend, wie Daten in Ihr MES und Ihre Analytik fließen. Ein schwacher Integrator liefert nicht nur eine unhandliche Oberfläche — er hinterlässt Ihnen eine unwartbare Tag-Datenbank, ein Sicherheitsloch und keine Dokumentation, die Sie dem nächsten Ingenieur übergeben können. Die richtige Wahl ist eine echte Due Diligence wert. Diese Checkliste zeigt, was Sie vor der Unterschrift prüfen sollten — egal ob der Integrator um die Ecke sitzt oder im Ausland.

## 1. Plattformtiefe auf Ihrem konkreten Stack

SCADA ist nicht eine einzige Sache. Ignition, Wonderware / AVEVA, FactoryTalk View, WinCC und Zenon sind unterschiedliche Welten. Fragen Sie, auf welcher Plattform der Integrator tatsächlich Produktivsysteme ausgeliefert hat — nicht geschult wurde, sondern ausgeliefert hat. Dann gehen Sie tiefer:

- Wie strukturieren sie Tags und Templates? (Eine gute Antwort umfasst wiederverwendbare UDTs / Templates, nicht Tausende von Hand angelegte Tags.)
- Wie handhaben sie die Historian-Konfiguration und die Datenaufbewahrung?
- Haben sie Redundanz und Failover auf Ihrer Plattform bereits umgesetzt, falls Sie das benötigen?

Vage, markennamenbasierte Antworten sind ein Warnsignal. Konkrete Antworten zur Architektur sind ein gutes Zeichen.

## 2. Architektur und Skalierbarkeit

Ein SCADA-System, das bei 500 Tags funktioniert, kann bei 50.000 zusammenbrechen, wenn es naiv aufgebaut wurde. Bitten Sie den Integrator, die vorgeschlagene Architektur zu beschreiben: Client/Server-Topologie, Anzahl der Clients, Thin-Client versus Thick-Client, Edge- versus zentraler Historian, und wie das Design Wachstum berücksichtigt. Kann er das nicht in fünfzehn Minuten auf einem Whiteboard (oder in einem geteilten Dokument) skizzieren, hat er nicht über Ihre Größenordnung nachgedacht.

## 3. Cybersicherheitshaltung

Dies ist der Abschnitt, der am häufigsten übersprungen und am häufigsten bereut wird. Ein SCADA-Integrator im Jahr 2026 muss Sicherheit als erstklassigen Liefergegenstand behandeln, nicht als nachträglichen Gedanken. Prüfen Sie:

- Netzwerksegmentierung zwischen dem Steuerungsnetz und IT / Internet.
- Keine Standardpasswörter, und ein echtes Benutzerrollenmodell mit minimalen Rechten (Least Privilege).
- Sicherer Fernzugriff (VPN oder ein verwaltetes Gateway), niemals ein offener Port.
- Ein Patch- und Backup-Konzept für die SCADA-Server.

Wenn der Plan des Integrators darin besteht, ein HMI mit Standardanmeldung ins Büronetz zu stellen, „damit Sie es von zu Hause aus prüfen können“, gehen Sie weiter.

## 4. Dokumentation und Übergabe

Der Unterschied zwischen einem wartbaren System und einer Geiselnahme ist die Dokumentation. Verlangen Sie schriftlich, dass der Lieferumfang Folgendes enthält: ein As-built-Architekturdiagramm, ein Dokument zur Tag- / Namenskonvention, eine Liste zur Alarmrationalisierung und ein Backup-/Wiederherstellungsverfahren. Bitten Sie um Einsicht in ein Beispiel-Dokumentationspaket aus einem früheren Projekt. Ein Integrator, der gut dokumentiert, signalisiert Ihnen, dass er erwartet, dass Sie das System auch ohne ihn warten können — genau das ist der Integrator, den Sie wollen.

## 5. Referenzen und verifizierte Fähigkeiten

Bitten Sie um zwei oder drei Referenzen auf derselben Plattform und in derselben Branche, und rufen Sie sie tatsächlich an. Stellen Sie den Referenzen eine unverblümte Frage: „Würden Sie ihn wieder beauftragen, und was ist schiefgelaufen?“ Bei jedem Projekt läuft etwas schief; eine ehrliche Referenz wird es Ihnen sagen, und die Antwort zeigt, wie der Integrator mit Problemen umgeht.

Wenn Sie über Grenzen hinweg beauftragen, sind Referenzen schwerer zu prüfen und Lebensläufe leichter zu beschönigen — genau deshalb ist eine Verifizierungsebene wichtig. Bei Talengineer bestehen Ingenieure einen praxisnahen KI-Techniktest und können eine Plattformzertifizierung erwerben, sodass ein zertifiziertes Profil bereits unter Prüfungsbedingungen Kompetenz nachgewiesen hat, bevor Sie überhaupt eine Referenz anrufen. Das ersetzt keine Referenzprüfung, hebt aber die Untergrenze an und filtert Profile heraus, die nur auf dem Papier gut aussehen.

## 6. Kommerzielle Struktur und Zahlungsschutz

Wie das Geschäft strukturiert ist, sagt viel darüber, wie das Projekt verlaufen wird. Bevorzugen Sie:

- **Meilensteinbasierte Zahlung**, gekoppelt an Abnahmetests, statt einer einzigen Pauschalsumme bei „Fertigstellung“.
- **Einen definierten Change-Order-Prozess**, damit unkontrolliertes Scope Creep nicht später zum Streitpunkt wird.
- **Treuhand für grenzüberschreitende Arbeit**, sodass Mittel gehalten und gegen abgenommene Liefergegenstände freigegeben werden, statt auf Vertrauensbasis überwiesen zu werden.

Meilenstein-Treuhand bei Talengineer bietet genau das, mit einer Plattformgebühr von 15% (5% für Gründungskunden), die die Zahlungsabwicklung und einen definierten Streitbeilegungsprozess abdeckt. Sie schützt Sie, falls sich die Lieferung verzögert, und schützt den Integrator, falls sich die Zahlung verzögert.

## 7. Der Ein-Satz-Stresstest

Wenn Sie nur Zeit für eine Frage haben, stellen Sie diese: „Beschreiben Sie mir, was Sie dem nächsten Ingenieur übergeben würden, wenn Sie mitten im Projekt von einem Bus erfasst würden.“ Ein starker Integrator antwortet sofort — dokumentierte Tags, versionskontrollierte Projekte, ein As-built, ein Backup. Ein schwacher wird still, denn die ehrliche Antwort ist „ein Chaos, das nur ich verstehe“. Diese eine Frage trennt Profis von Hasardeuren schneller als jeder Lebenslauf.

## Die Checkliste anwenden

Führen Sie jeden Kandidaten durch alle sieben Punkte und bewerten Sie ihn. Sie suchen keine perfekte Punktzahl — Sie suchen konkrete, sichere Antworten und ein ehrliches Eingeständnis von Kompromissen. Der Integrator, der sagt „so würde ich es architektonisch aufbauen, das ist das Sicherheitsmodell, das ist die Dokumentation, die Sie erhalten werden, und hier ist eine Referenz, die Ihnen sagt, was schiefgelaufen ist“, ist mehr wert als ein niedrigeres Angebot mit vagen Zusicherungen.

Bereit, SCADA-Integratoren zu finden, deren Fähigkeiten verifiziert sind, bevor Sie sie überhaupt interviewen? [Zertifizierte Ingenieure durchsuchen →](/talent)
