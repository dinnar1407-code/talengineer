---
title: Comment le TalScore est calculé
description: Le calcul exact derrière votre TalScore — les quatre dimensions pondérées, la moyenne bayésienne des notes qui protège contre la manipulation des avis, les règles de fiabilité et la ligne rouge du taux de litiges, les seuils de palier, et ce qui fait réellement bouger chaque chiffre.
date: 2026-07-24
lang: fr
type: guide
track: general
audience: engineer
slug: how-talscore-is-computed-fr
group: how-talscore-is-computed
---

# Comment le TalScore est calculé

Le TalScore est votre score de qualité sur TalEngineer : un chiffre unique de 0 à 100 qui condense quatre signaux vérifiables en un indicateur selon lequel un employeur peut trier et sur lequel la plateforme peut fixer des seuils. Contrairement à une notation par étoiles sur un site freelance générique, chaque donnée qui alimente le TalScore est quelque chose que la plateforme elle-même a vérifié : une évaluation que vous avez passée, une certification que vous avez obtenue, un avis issu d'un projet payé et terminé, un historique de livraison horodaté. Cet article présente la formule réelle, car un score que l'on ne peut pas inspecter est un score que l'on ne peut pas améliorer délibérément.

## Les quatre dimensions et leur pondération

Votre score est la somme de quatre composantes pondérées :

| Dimension | Pondération | Ce qu'elle mesure |
|---|---|---|
| Évaluation par IA | 25 | Votre score à l'évaluateur technique que chaque ingénieur passe à l'inscription |
| Certification de plateforme | 25 | Les certifications obtenues, par filière et par niveau |
| Notes des employeurs | 30 | Notes en étoiles issues de projets payés et terminés — moyennées selon une approche bayésienne |
| Fiabilité | 20 | Commandes terminées, plus un historique de litiges propre |

Ces pondérations reflètent une philosophie délibérée : le vécu réel des employeurs (notes, 30) compte un peu plus que n'importe quel test isolé, mais aucune dimension ne domine à elle seule — celui qui excelle aux examens mais n'a aucun historique de livraison et celui qui livre beaucoup sans jamais s'être certifié plafonnent tous deux en dessous d'un profil solide sur tous les fronts.

## Dimension 1 : évaluation par IA (jusqu'à 25 points)

Le résultat de votre évaluation à l'inscription se répercute de façon linéaire sur cette dimension : un score d'évaluation de 0–100 devient 0–25 points de TalScore. C'est votre base de compétence, fixée une seule fois lorsque vous rejoignez la plateforme. Pour la faire monter, il fallait être réellement bon le jour de l'évaluation — cette dimension ne se travaille plus après coup, ce qui explique précisément l'existence des trois autres.

## Dimension 2 : certification (jusqu'à 25 points)

Pour chaque filière, seul votre niveau **le plus élevé** compte : **le L1 vaut 8 points, le L2 vaut 16, le L3 vaut 25**, et la dimension plafonne à 25. Lisez bien ces chiffres, car ils traduisent une stratégie : un seul L3 sature entièrement cette dimension. Deux L1 dans des filières différentes (16 points) équivalent à un L2 — et restent très en deçà d'un seul L3. Ici, la profondeur l'emporte sur l'étendue. Les certifications transversales restent importantes pour déterminer *à quels projets vous pouvez être affecté* — mais du point de vue du TalScore, gravir une seule échelle jusqu'en haut rapporte davantage que d'en entamer plusieurs.

## Dimension 3 : les notes — et pourquoi un seul avis 5 étoiles ne vous propulse pas au sommet

Les moyennes brutes sont faciles à manipuler : un avis complaisant de 5 étoiles placerait un nouvel arrivant au-dessus d'un vétéran ayant quarante projets à 4.8 étoiles. Le TalScore utilise à la place une **moyenne bayésienne** : votre note est calculée comme si vous aviez démarré avec **5 avis fantômes à 3.5 étoiles** — l'a priori de l'ensemble de la plateforme — combinés à vos avis réels. Le résultat (sur 5 étoiles) est ensuite reporté sur la dimension de 30 points.

La conséquence à retenir : avec peu d'avis, votre note effective reste proche de 3.5 quelle que soit la qualité de ces avis, et chaque avis réel supplémentaire la rapproche davantage de votre moyenne véritable. Au début, le *volume de projets terminés et bien notés* fait bouger cette dimension plus que la perfection sur un seul projet. Avec le temps, l'influence de l'a priori s'estompe et votre véritable historique prend le dessus. C'est le système le plus équitable que nous connaissions pour comparer un nouvel arrivant à un vétéran sans desservir l'un ou l'autre.

## Dimension 4 : la fiabilité — et la ligne rouge

La fiabilité est l'arithmétique la plus simple, et la limite la plus tranchante :

- **1 point par commande terminée, plafonné à 10.** Dix projets terminés saturent la moitié consacrée à la livraison.
- **Un bonus de 10 points en l'absence de tout litige.** Un historique propre vaut autant que dix commandes terminées.
- **La ligne rouge : si votre taux de litiges dépasse 10% des commandes terminées, toute la dimension tombe à zéro.** Pas réduite — mise à zéro. Et un ingénieur ayant des litiges mais aucune commande terminée est traité comme présentant le risque maximal.

L'intention de conception est transparente : la plateforme préfère que vous livriez un volume légèrement inférieur sans aucun conflit, plutôt qu'un volume élevé avec des frictions. Un seul litige sur un long historique ne vous met pas à zéro (il vous coûte seulement le bonus), mais un schéma récurrent de litiges est la chose la plus dommageable qui puisse arriver à votre score.

## Paliers

Votre score se traduit en un badge de palier affiché sur votre profil : **85 et plus, c'est Platine ; 70–84, c'est Or ; 55–69, c'est Argent**, et en dessous, Bronze. Les paliers ne sont que la présentation du même chiffre — il n'existe pas de comité de palier distinct.

## Quand il se met à jour, et ce qu'il faut réellement faire

Le TalScore se recalcule automatiquement dès que ses données d'entrée changent — après l'arrivée d'un nouvel avis, après le déblocage de jalons, lors de l'émission d'une certification. Votre profil affiche la répartition par dimension, afin que vous puissiez voir exactement où se trouvent vos points, et où ils manquent.

La stratégie qui découle de ce calcul : certifiez-vous en profondeur dans votre filière principale (un seul L3 sature à lui seul la dimension de certification), terminez vos projets proprement et laissez le nombre d'avis s'accumuler au-delà de l'influence de l'a priori, et traitez les litiges comme quelque chose à éviter presque à tout prix — communiquez tôt via la plateforme dès qu'un projet vacille, car une conversation résolue ne vous coûte rien, tandis qu'un litige peut vous coûter un cinquième de votre score.

*Consultez votre propre répartition sur la [page TalScore](/talscore). Pour savoir comment ce score est utilisé en pratique, lisez [comment fonctionne la mise en relation sur TalEngineer](/playbook/getting-matched-on-talengineer).*
