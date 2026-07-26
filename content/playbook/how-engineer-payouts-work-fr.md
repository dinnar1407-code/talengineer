---
title: Comment fonctionnent les versements aux ingénieurs sur TalEngineer
description: Un parcours en langage clair du trajet de l’argent pour les ingénieurs — le séquestre par jalons, le montant net perçu de 85%, Stripe Connect et les versements hors ligne, ce qui se passe quand un litige gèle un jalon, et où chaque enregistrement figure dans votre registre.
date: 2026-07-24
lang: fr
type: guide
track: general
audience: engineer
slug: how-engineer-payouts-work-fr
group: how-engineer-payouts-work
---

# Comment fonctionnent les versements aux ingénieurs sur TalEngineer

La plus grande crainte dans l’ingénierie freelance transfrontalière est simple : vous faites le travail, et l’argent n’arrive jamais. Chaque choix de conception du système de paiement de TalEngineer vise à éliminer cette crainte — et à éliminer la crainte symétrique côté employeur, celle de payer pour un travail qui ne sera jamais terminé. Cet article parcourt l’intégralité du trajet de l’argent du point de vue de l’ingénieur, afin que vous sachiez exactement ce qui se passe à chaque étape et ce qu’il faut vérifier avant d’engager votre temps.

## L’argent arrive avant que le travail ne commence

Chaque projet sur la plateforme est découpé en **jalons** — des phases distinctes avec un livrable défini et un montant défini. Avant qu’un jalon ne débute, l’employeur le provisionne : l’argent quitte le compte de l’employeur et est placé sous séquestre, rattaché à ce jalon précis. Vous pouvez voir le statut de provisionnement du jalon dans votre ordre de travail avant de commencer.

Voici la règle à intérioriser : **si un jalon n’est pas provisionné, le travail n’a pas vraiment commencé.** Vous ne vous trouvez jamais dans la position de facturer un inconnu de l’autre côté d’une frontière en espérant être payé. La question « paieront-ils ? » trouve sa réponse avant même que vous n’ouvriez votre ordinateur ou ne montiez dans un avion — l’argent est déjà sous séquestre ; la seule question qui reste est de savoir si le travail correspond à la définition du jalon.

## Ce que vous conservez

<!-- Source unique du chiffre des frais : src/config/fees.js (PLATFORM_FEE = 0.15, montant net perçu par l’ingénieur = 1 - frais). Sur cette page, les frais n’apparaissent qu’une seule fois, dans ce paragraphe. -->
Lorsque l’employeur valide un jalon et le débloque, les frais de plateforme sont prélevés et le reste vous revient. Les frais de plateforme standard s’élèvent à **15% de chaque jalon débloqué, donc vous conservez 85%** — le même chiffre public que sur notre [page des tarifs](/pricing), lu depuis une source de configuration unique dans le code, de sorte qu’il ne peut pas dériver discrètement. Il n’y a ni frais de publication, ni frais d’enchère, ni abonnement, ni facturation pour candidater à un projet. Les frais sont rattachés à un seul et unique événement : un jalon accepté par l’employeur.

Certaines commandes précoces de clients fondateurs bénéficient de frais de plateforme réduits, fixés par la plateforme au cas par cas. Dans ce cas, la déduction sur votre jalon est *plus faible* — un tarif réduit pour l’employeur signifie qu’une plus grande part du jalon vous parvient sur cette commande.

## Comment l’argent vous parvient concrètement

Deux circuits de versement existent, et votre profil détermine lequel s’applique à vous :

- **Stripe Connect (par défaut).** Si le réseau de versement de Stripe couvre votre pays, vous connectez un compte Stripe lors de l’intégration. Lorsqu’un jalon est débloqué, la plateforme envoie un transfert vers votre compte connecté, et Stripe gère le dernier kilomètre jusqu’à votre banque.
- **Versement hors ligne (solution de repli).** La couverture des versements express de Stripe n’atteint pas toutes les régions où vivent d’excellents ingénieurs en automatisation. Si c’est votre cas, votre déblocage est enregistré comme un versement manuel et traité hors ligne par la plateforme. Votre notification de déblocage vous indique explicitement quelle voie votre argent a empruntée, si bien qu’il n’y a jamais d’ambiguïté sur le fait qu’un transfert soit en cours ou non.

Le déblocage lui-même est conçu de manière défensive : le système verrouille le jalon de façon atomique avant d’envoyer l’argent (ainsi, un double clic ou un accès concurrent ne peut jamais déclencher deux transferts), et si un transfert échoue en cours de route, le jalon revient à son état provisionné pour que le déblocage puisse être retenté — l’argent reste sous séquestre plutôt que de disparaître dans un état d’erreur. Vous recevez un e-mail et une notification dans l’application dès qu’un déblocage aboutit.

## Quand un litige gèle un jalon

Si l’employeur conteste qu’un jalon a été livré, il peut ouvrir un litige avant de le débloquer. Voici concrètement ce que cela signifie pour vous :

<!-- Source unique du chiffre de la fenêtre de preuves : src/routes/disputes.js (EVIDENCE_WINDOW_MS = 5 jours). -->
1. **Le jalon est gelé.** Un jalon en litige ne peut pas être débloqué tant que le litige est ouvert — mais il ne peut pas non plus être remboursé discrètement dans votre dos. L’argent reste bloqué sous séquestre jusqu’à la résolution du litige.
2. **Une fenêtre de preuves de 5 jours s’ouvre.** À partir du moment où le litige est déposé, les deux parties disposent de cinq jours pour soumettre des preuves. C’est là que les habitudes de travail sur la plateforme portent leurs fruits : les pointages GPS sur site, les photos téléversées pendant le chantier, les enregistrements du jalon et les messages WarRoom forment ensemble un historique horodaté qui existe *parce que vous avez travaillé via la plateforme*, et non parce que vous avez dû le reconstituer dans l’urgence après coup.
3. **La plateforme examine les preuves et tranche.** La résolution suit le dossier, pas celui qui argumente le plus fort. Selon ce que montrent les preuves, les fonds vous sont débloqués ou renvoyés à l’employeur.

Le conseil pratique : traitez les preuves comme une habitude, pas comme une réaction d’urgence. Pointez sur site, téléversez des photos au fur et à mesure, gardez les échanges sur le périmètre dans le chat du projet. Les ingénieurs avec un historique propre perdent rarement des litiges qu’ils ne devraient pas perdre.

## Votre registre : un seul endroit où tout se recoupe

Chaque événement financier sur votre compte — jalons provisionnés, jalons débloqués, frais déduits — est enregistré dans votre **registre financier**, visible dans votre [tableau de bord Finance](/finance). C’est votre unique source de vérité pour le rapprochement : ce qui a été promis, ce qui a été débloqué, et ce qui vous a été versé, par jalon, avec horodatage. Plus besoin de courir après des factures dans des fils d’e-mails.

## La check-list

Avant de commencer tout jalon : confirmez qu’il est provisionné. Pendant le travail : pointez, photographiez, communiquez sur la plateforme. Au déblocage : vérifiez que la notification correspond à votre registre. C’est tout le système — séquestre avant le travail, des frais publics prélevés une seule fois au déblocage, un circuit de versement adapté à votre région, un processus de litige qui s’appuie sur les preuves, et un registre qui n’oublie jamais rien. Il est conçu pour que la réponse à « serai-je payé ? » soit acquise avant même que la question n’ait besoin d’être posée.

*Le détail des frais et les conditions clients fondateurs figurent sur la [page des tarifs](/pricing). Nouveau sur la plateforme ? Commencez par [comment fonctionnent les examens de certification](/playbook/how-certification-exams-work) — la certification est ce qui vous rend affectable en premier lieu.*
