---
title: Wie der TalScore berechnet wird
description: Die genaue Mathematik hinter Ihrem TalScore — die vier gewichteten Dimensionen, der bayessche Bewertungsdurchschnitt, der vor Review-Manipulation schützt, die Zuverlässigkeitsregeln und die Streitfall-Quoten-Grenze, die Stufen-Schwellenwerte, und was jede Zahl tatsächlich bewegt.
date: 2026-07-24
lang: de
type: guide
track: general
audience: engineer
slug: how-talscore-is-computed-de
group: how-talscore-is-computed
---

# Wie der TalScore berechnet wird

Der TalScore ist Ihr Qualitätswert auf TalEngineer: eine einzige Zahl von 0 bis 100, die vier überprüfbare Signale zu etwas zusammenfasst, wonach ein Auftraggeber sortieren und die Plattform Schwellenwerte festlegen kann. Anders als eine Sternebewertung auf einer gewöhnlichen Freelance-Plattform ist jeder Eingabewert des TalScore etwas, das die Plattform selbst geprüft hat — ein Assessment, das Sie absolviert haben, eine Zertifizierung, die Sie erworben haben, eine Bewertung aus einem abgeschlossenen, bezahlten Projekt, ein Lieferprotokoll mit Zeitstempeln. Dieser Beitrag zeigt die tatsächliche Formel, denn ein Wert, den man nicht nachvollziehen kann, ist ein Wert, den man auch nicht gezielt verbessern kann.

## Die vier Dimensionen und ihre Gewichtung

Ihr Score ist die Summe aus vier gewichteten Komponenten:

| Dimension | Gewichtung | Was sie misst |
|---|---|---|
| KI-Screening | 25 | Ihr Ergebnis im technischen Assessment, das jeder Ingenieur bei der Anmeldung absolviert |
| Plattform-Zertifizierung | 25 | Die Zertifizierungen, die Sie nach Fachrichtung und Stufe erworben haben |
| Bewertungen der Auftraggeber | 30 | Sternebewertungen aus abgeschlossenen, bezahlten Projekten — bayessch gemittelt |
| Zuverlässigkeit | 20 | Abgeschlossene Aufträge plus eine saubere Streitfall-Historie |

Die Gewichtung spiegelt eine bewusste Philosophie wider: Was Auftraggeber tatsächlich erlebt haben (Bewertungen, 30), zählt etwas mehr als jeder einzelne Test, aber keine Dimension dominiert — ein brillanter Prüfungskandidat ohne Lieferhistorie und ein produktiver Lieferant, der sich nie zertifizieren ließ, bleiben beide unter jemandem, der über die gesamte Breite hinweg stark ist.

## Dimension 1: KI-Screening (bis zu 25 Punkte)

Ihr Screening-Ergebnis von der Anmeldung wird linear auf diese Dimension abgebildet: Ein Screening-Wert von 0–100 wird zu 0–25 TalScore-Punkten. Das ist Ihre Fähigkeits-Basislinie, die einmalig bei Ihrem Beitritt festgelegt wird. Der einzige Weg, sie zu verbessern, ist ein tatsächlich starkes Abschneiden im Assessment — diese Dimension lässt sich im Nachhinein nicht „erarbeiten“, und genau deshalb gibt es die anderen drei.

## Dimension 2: Zertifizierung (bis zu 25 Punkte)

Für jede Fachrichtung zählt nur Ihre **höchste** Stufe: **L1 ist 8 Punkte wert, L2 16, L3 25**, und die Dimension ist bei 25 gedeckelt. Lesen Sie diese Zahlen genau, denn sie kodieren eine Strategie: Ein einziges L3 schöpft diese Dimension vollständig aus. Zwei L1 in unterschiedlichen Fachrichtungen (16 Punkte) entsprechen einem L2 — und bleiben weit hinter einem einzigen L3 zurück. Hier schlägt Tiefe die Breite. Fachrichtungsübergreifende Zertifizierungen bleiben wichtig dafür, *für welche Projekte Sie eingesetzt werden können* — aber für den TalScore zahlt sich das Erklimmen einer einzigen Leiter besser aus als der Einstieg in mehrere.

## Dimension 3: Bewertungen — und warum eine einzelne 5-Sterne-Bewertung Sie nicht sofort an die Spitze katapultiert

Rohe Durchschnittswerte lassen sich leicht manipulieren: Eine wohlwollende 5-Sterne-Bewertung würde einen Neuling über einen erfahrenen Ingenieur mit vierzig Projekten zu 4,8 Sternen stellen. Stattdessen verwendet der TalScore einen **bayesschen Durchschnitt**: Ihre Bewertung wird so berechnet, als hätten Sie mit **5 Phantom-Bewertungen zu 3,5 Sternen** begonnen — dem plattformweiten Vorwert — kombiniert mit Ihren echten Bewertungen. Das Ergebnis (von 5 Sternen) wird anschließend auf die 30-Punkte-Dimension abgebildet.

Die Konsequenz, die Sie sich merken sollten: Bei wenigen Bewertungen liegt Ihre effektive Bewertung nahe bei 3,5, unabhängig davon, wie gut diese Bewertungen sind, und jede weitere echte Bewertung zieht sie stärker in Richtung Ihres tatsächlichen Durchschnitts. Am Anfang bewegt das *Volumen abgeschlossener, gut bewerteter Projekte* diese Dimension stärker als Perfektion bei einem einzigen Projekt. Mit der Zeit schwindet der Einfluss des Vorwerts, und Ihre echte Erfolgsbilanz überwiegt. Das ist das fairste System, das uns bekannt ist, um einen Neuling mit einem erfahrenen Ingenieur zu vergleichen, ohne dass einer von beiden falsch dargestellt wird.

## Dimension 4: Zuverlässigkeit — und die rote Linie

Zuverlässigkeit ist die einfachste Rechnung und zugleich die schärfste Kante:

- **1 Punkt pro abgeschlossenem Auftrag, gedeckelt bei 10.** Zehn abgeschlossene Projekte schöpfen die Lieferhälfte vollständig aus.
- **Ein Bonus von 10 Punkten für null Streitfälle.** Eine saubere Historie ist so viel wert wie zehn abgeschlossene Aufträge.
- **Die rote Linie: Übersteigt Ihre Streitfallquote 10% der abgeschlossenen Aufträge, fällt die gesamte Dimension auf null.** Nicht reduziert — auf null gesetzt. Und ein Ingenieur mit Streitfällen, aber ohne abgeschlossene Aufträge, wird als maximal riskant behandelt.

Die Designabsicht ist klar erkennbar: Die Plattform sieht es lieber, wenn Sie ein etwas geringeres Volumen konfliktfrei liefern, als ein hohes Volumen mit Reibung. Ein einzelner Streitfall in einer langen Historie setzt Sie nicht auf null (er kostet Sie nur den Bonus), aber ein Muster wiederholter Streitfälle ist das Schädlichste, was Ihrem Score passieren kann.

## Stufen

Ihr Score wird auf ein Stufen-Badge abgebildet, das in Ihrem Profil angezeigt wird: **85 und mehr ist Platin, 70–84 ist Gold, 55–69 ist Silber**, darunter Bronze. Die Stufen sind reine Darstellung derselben Zahl — es gibt kein separates Stufengremium.

## Wann er aktualisiert wird, und was Sie konkret tun sollten

Der TalScore wird automatisch neu berechnet, wenn sich seine Eingaben ändern — nachdem eine neue Bewertung eingeht, nachdem Meilensteine freigegeben werden, wenn eine Zertifizierung ausgestellt wird. Ihr Profil zeigt die Aufschlüsselung nach Dimension, sodass Sie genau sehen können, wo Ihre Punkte liegen und wo nicht.

Die Strategie, die sich aus dieser Mathematik ergibt: Zertifizieren Sie sich vertieft in Ihrer Hauptfachrichtung (ein einziges L3 schöpft die Zertifizierungsdimension allein aus), schließen Sie Projekte sauber ab und lassen Sie die Zahl der Bewertungen über den Einfluss des Vorwerts hinaus anwachsen, und behandeln Sie Streitfälle als etwas, das es fast um jeden Preis zu vermeiden gilt — kommunizieren Sie frühzeitig über die Plattform, sobald ein Projekt ins Wanken gerät, denn ein gelöstes Gespräch kostet Sie nichts, während ein Streitfall Sie ein Fünftel Ihres Scores kosten kann.

*Sehen Sie Ihre eigene Aufschlüsselung auf der [TalScore-Seite](/talscore). Wie der Score in der Praxis genutzt wird, lesen Sie unter [Wie das Matching auf TalEngineer funktioniert](/playbook/getting-matched-on-talengineer).*
