---
title: Conditions d’utilisation
description: Comment la place de marché Talengineer fonctionne réellement — comptes, frais, séquestre par jalons, litiges et certification — en langage clair. Brouillon, en attente de revue juridique.
date: 2026-07-24
lang: fr
slug: terms
draft: true
---

<!--
  诚实红线说明（不渲染）：条款草稿只描述仓库里真实存在的机制（托管/费率/纠纷/认证/签到），
  不发明不存在的政策；平台数字各写一次并标注单一来源（fees.js / disputes.js）。
  管辖法律等纯法务决策留白待 Terry 法务审定，不臆造。
-->

Ces conditions décrivent, en langage clair, comment la place de marché Talengineer fonctionne réellement aujourd’hui et ce à quoi vous consentez en l’utilisant. **Il s’agit d’un brouillon en attente de revue juridique** — l’objectif est d’être honnête sur la pratique actuelle plutôt qu’exhaustif. Pour toute question, écrivez à **hello@talengineer.us**.

## 1. Ce qu’est Talengineer

Talengineer est une place de marché qui met en relation des entreprises manufacturières (« employeurs ») et des ingénieurs en automatisation industrielle indépendants (« ingénieurs ») pour des missions par projet. Les ingénieurs de la plateforme sont des professionnels indépendants et non nos salariés. Le contrat de prestation relatif à un projet est conclu entre l’employeur et l’ingénieur ; Talengineer fournit autour de celui-ci l’infrastructure de mise en relation, de séquestre, de communication et de certification.

## 2. Comptes

Vous vous inscrivez en tant qu’employeur ou ingénieur et acceptez de fournir des informations exactes. Les employeurs souhaitant financer des projets passent par une étape de vérification (informations de l’entreprise, examinées manuellement par notre équipe). Les ingénieurs passent une évaluation technique administrée par IA lors de leur intégration ; les scores d’évaluation servent à classer et recommander les ingénieurs, et seuls les ingénieurs détenant une certification de plateforme valide peuvent être affectés à un projet. Vous êtes responsable de la sécurité de vos identifiants de connexion ; les sessions expirent automatiquement après 24 heures.

## 3. Frais

La plateforme prélève des frais de séquestre de **15%** sur chaque montant de jalon, déduits lors de la libération du jalon au profit de l’ingénieur. Les clients fondateurs bénéficient de frais réduits de **5%**, fixés par projet. Publier un projet ou créer un profil est gratuit. <!-- source : src/config/fees.js PLATFORM_FEE + demands.fee_pct (remise clients fondateurs, feeFor() est l’unique chemin de calcul des frais) -->

## 4. Séquestre par jalons

Les projets sont découpés en jalons. Un employeur finance un jalon via Stripe Checkout ; le jalon n’est marqué comme financé qu’après confirmation du paiement par Stripe — nous ne marquons jamais des fonds comme mis sous séquestre sans confirmation de paiement. Lorsque l’employeur approuve le travail livré, le jalon est libéré et l’ingénieur est payé (via Stripe Connect ou une alternative convenue), déduction faite des frais de plateforme décrits ci-dessus. Les numéros de carte ne touchent jamais nos serveurs ; consultez la [Politique de confidentialité](/privacy) pour savoir comment les données de paiement sont traitées.

## 5. Travail sur site et pointages

Pour les jalons sur site, les ingénieurs pointent via la plateforme. Un pointage requiert une certification de plateforme valide et peut inclure des coordonnées GPS, que notre serveur compare à l’emplacement du site du projet. Cette comparaison de géo-clôture est purement informative : un pointage hors zone réussit tout de même et est simplement enregistré pour que l’employeur et les administrateurs puissent le consulter. Les ingénieurs sont responsables du respect des règles de sécurité et d’accès du site.

## 6. Litiges

Si l’une ou l’autre partie conteste un jalon, elle peut ouvrir un litige sur la plateforme. Dès l’ouverture d’un litige, les deux parties disposent de **5 jours** pour soumettre leurs preuves. <!-- source : src/routes/disputes.js EVIDENCE_WINDOW_MS (fenêtre de preuves de 5 jours) --> Passée la fenêtre de preuves, un administrateur de la plateforme examine ce que les deux parties ont soumis et décide de la répartition du montant du jalon contesté. L’ouverture d’un litige suspend le flux normal de libération de ce jalon jusqu’à la décision.

## 7. Certification et fonctionnalités d’IA

Les certifications de plateforme s’obtiennent par des examens notés à l’aide de modèles d’IA, puis examinés par un administrateur humain avant la délivrance de tout certificat. Les certificats peuvent expirer et être révoqués pour motif valable (par exemple, une preuve de tricherie). La plateforme utilise également l’IA pour l’évaluation technique, l’analyse de projets et la traduction des messages. **La traduction automatique est fournie par commodité et peut contenir des erreurs — le message original fait toujours foi.**

## 8. Usage acceptable

Vous acceptez de ne pas donner de fausses informations sur votre identité, vos qualifications ou votre entreprise ; de ne pas téléverser de contenu que vous n’avez pas le droit de partager ; de ne pas utiliser la plateforme à des fins illégales ; et de ne pas tenter de sonder ou de compromettre la sécurité de la plateforme. Nous pouvons suspendre les comptes qui enfreignent ces règles ou qui tentent de frauder le processus de séquestre ou de litige.

## 9. Statut du service

Talengineer est actuellement en **bêta**. Nous nous efforçons de maintenir un service fiable, mais nous ne promettons pas une disponibilité ininterrompue, et les fonctionnalités peuvent évoluer avec le développement de la plateforme. Rien sur la plateforme — y compris les références de tarifs, les calculateurs et les guides — ne constitue un conseil juridique, fiscal ou professionnel.

## 10. Clôture de votre compte

Vous pouvez cesser d’utiliser la plateforme à tout moment. Pour clôturer et supprimer votre compte, écrivez à **hello@talengineer.us** depuis votre adresse enregistrée ; la suppression est traitée manuellement par notre équipe. Les obligations nées avant la clôture (par exemple, jalons financés et litiges ouverts) subsistent jusqu’à leur résolution.

## 11. Modifications et points en suspens

Tant que ce document est marqué comme brouillon, il peut évoluer au fil de la revue juridique. Des points tels que le droit applicable et le for de résolution formelle des litiges sont volontairement laissés à cette revue plutôt qu’inventés ici. Les modifications importantes postérieures à la publication seront reflétées sur cette page avec une date mise à jour.

À lire aussi : [Politique de confidentialité](/privacy)
