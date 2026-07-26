---
title: La liste de vérification de diligence raisonnable pour un intégrateur SCADA
description: Une liste pratique pour évaluer un intégrateur SCADA avant de signer — couvrant la profondeur de plateforme, l’architecture, la sécurité, la documentation, les références et la structure de paiement.
date: 2026-07-14
lang: fr
type: guide
track: plc
audience: employer
slug: scada-integrator-due-diligence-checklist-fr
group: scada-integrator-due-diligence-checklist
---

# La liste de vérification de diligence raisonnable pour un intégrateur SCADA

Un projet SCADA se trouve au cœur de votre exploitation. C’est la façon dont vos équipes voient l’usine, la façon dont les alarmes atteignent la bonne personne, et de plus en plus la façon dont les données circulent vers votre MES et vos outils d’analyse. Un intégrateur médiocre ne vous livre pas seulement une interface maladroite : il vous laisse une base de tags impossible à maintenir, une faille de sécurité et aucune documentation à transmettre au prochain ingénieur. Bien choisir mérite une véritable diligence raisonnable. Voici ce qu’il faut vérifier avant de signer, que l’intégrateur soit à côté de chez vous ou à l’étranger.

## 1. Profondeur d’expertise sur votre plateforme précise

Le SCADA n’est pas une catégorie homogène. Ignition, Wonderware / AVEVA, FactoryTalk View, WinCC et Zenon sont des mondes différents. Demandez sur quelle plateforme l’intégrateur a réellement livré des systèmes en production — pas celle sur laquelle il a été formé, celle sur laquelle il a livré. Ensuite, approfondissez :

- Comment structure-t-il les tags et les modèles (templates) ? (Une bonne réponse implique des UDT / modèles réutilisables, pas des milliers de tags construits à la main.)
- Comment gère-t-il la configuration de l’historian et la rétention des données ?
- A-t-il déjà mis en œuvre la redondance et le basculement (failover) sur votre plateforme, si vous en avez besoin ?

Des réponses vagues, réduites à des noms de marque, sont un signal d’alerte. Des réponses précises sur l’architecture sont un bon signe.

## 2. Architecture et évolutivité

Un système SCADA qui fonctionne pour 500 tags peut s’effondrer à 50,000 s’il a été conçu naïvement. Demandez à l’intégrateur de décrire l’architecture qu’il propose : topologie client/serveur, nombre de clients, client léger versus client lourd, historian en périphérie versus centralisé, et la façon dont la conception accompagne la croissance. S’il ne peut pas esquisser cela sur un tableau blanc (ou un document partagé) en quinze minutes, c’est qu’il n’a pas réfléchi à votre échelle.

## 3. Posture en cybersécurité

C’est la section la plus souvent négligée et la plus souvent regrettée. Un intégrateur SCADA en 2026 doit traiter la sécurité comme un livrable de premier plan, pas comme un ajout après coup. Vérifiez :

- La segmentation réseau entre le réseau de contrôle et l’IT / internet.
- Aucun mot de passe par défaut, et un véritable modèle de rôles utilisateurs avec le principe du moindre privilège.
- Un accès distant sécurisé (VPN ou passerelle gérée), jamais un port ouvert.
- Un plan de correctifs (patching) et de sauvegarde pour les serveurs SCADA.

Si le plan de l’intégrateur consiste à mettre un HMI sur le réseau bureautique avec une connexion par défaut « pour que vous puissiez le consulter depuis chez vous », passez votre chemin.

## 4. Documentation et transfert

La différence entre un système maintenable et une prise d’otage, c’est la documentation. Exigez, par écrit, que le livrable comprenne : un schéma d’architecture as-built, un document de convention de nommage des tags, une liste de rationalisation des alarmes et une procédure de sauvegarde/restauration. Demandez à voir un exemple de dossier documentaire d’un projet précédent. Un intégrateur qui documente bien vous dit qu’il s’attend à ce que vous puissiez maintenir le système sans lui — c’est exactement l’intégrateur que vous voulez.

## 5. Références et compétence vérifiée

Demandez deux ou trois références sur la même plateforme et le même secteur, et appelez-les réellement. Posez aux références une question directe : « Feriez-vous de nouveau appel à eux, et qu’est-ce qui n’a pas fonctionné ? » Chaque projet comporte quelque chose qui n’a pas fonctionné ; une référence honnête vous le dira, et la réponse révèle comment l’intégrateur gère les problèmes.

Lorsque vous recrutez au-delà des frontières, les références sont plus difficiles à vérifier et les CV plus faciles à enjoliver — c’est précisément pourquoi une couche de vérification compte. Sur Talengineer, les ingénieurs passent une évaluation pratique par IA et peuvent obtenir la certification de la plateforme ; un profil certifié a donc démontré sa compétence en conditions d’examen avant même que vous n’appeliez une référence. Cela ne remplace pas la vérification des références, mais cela relève le niveau plancher et filtre les profils qui ne sont beaux que sur le papier.

## 6. Structure commerciale et protection du paiement

La façon dont l’accord est structuré vous indique comment le projet va se dérouler. Privilégiez :

- **Un paiement par jalons** lié à des tests de recette, et non une somme forfaitaire unique à « l’achèvement ».
- **Un processus défini d’ordre de modification (change-order)** pour que la dérive du périmètre ne devienne pas un point de friction plus tard.
- **Un séquestre pour le travail transfrontalier**, de sorte que les fonds soient détenus et libérés contre des livrables acceptés, plutôt que virés sur la seule confiance.

Le séquestre par jalons sur Talengineer offre exactement cela, avec des frais de plateforme de 15% (5% pour les clients fondateurs) couvrant le traitement des paiements et un processus défini de résolution des litiges. Cela vous protège en cas de retard de livraison et protège l’intégrateur en cas de retard de paiement.

## 7. Le test de résistance en une ligne

Si vous n’avez le temps que pour une seule question, posez celle-ci : « Décrivez-moi ce que vous transmettriez au prochain ingénieur si vous étiez renversé par un bus en plein milieu du projet. » Un bon intégrateur répond immédiatement — tags documentés, projets sous contrôle de version, un as-built, une sauvegarde. Un intégrateur médiocre reste silencieux, car la réponse honnête est « un désordre que moi seul comprends ». Cette seule question distingue les professionnels des amateurs plus vite que n’importe quel CV.

## Utiliser la liste de vérification

Faites passer chaque candidat par les sept points et notez-le. Vous ne cherchez pas un score parfait — vous cherchez des réponses précises, assurées, et une reconnaissance honnête des compromis. L’intégrateur qui dit « voici comment je concevrais l’architecture, voici le modèle de sécurité, voici la documentation que vous recevrez, et voici une référence qui vous dira ce qui n’a pas fonctionné » vaut plus qu’une offre moins chère accompagnée de vagues assurances.

Prêt à trouver des intégrateurs SCADA dont les compétences sont vérifiées avant même votre entretien ? [Parcourir les ingénieurs certifiés →](/talent)
