---
title: Politique de confidentialité
description: Quelles données Talengineer collecte, comment elles sont utilisées, quels sous-traitants y ont accès, et comment nous contacter à ce sujet. Brouillon en langage clair, en attente de revue juridique.
date: 2026-07-24
lang: fr
slug: privacy
draft: true
---

<!--
  诚实红线说明（不渲染）：本文件是"按代码库实况写的平实描述"，每一条都对应
  仓库里真实存在的机制；数字均标注单一来源。draft: true 期间页面带 noindex + 草稿横幅，
  Terry 法务终审通过后把 draft 翻成 false 才算发布。
-->

Voici une description en langage clair de ce que la plateforme Talengineer collecte et fait réellement aujourd’hui avec vos données. Elle vise à être exacte plutôt qu’exhaustive au sens juridique. **Il s’agit d’un brouillon en attente de revue juridique** — si un point n’est pas clair, ou si vous souhaitez faire corriger, exporter ou supprimer vos données, écrivez-nous à **hello@talengineer.us** : une personne vous répondra.

Talengineer (« nous ») exploite le site web et la place de marché à l’adresse talengineer.us, qui met en relation des entreprises manufacturières (« employeurs ») et des ingénieurs en automatisation industrielle (« ingénieurs »).

## Ce que nous collectons

**Informations de base du compte.** Lors de votre inscription, nous enregistrons votre adresse e-mail, votre rôle (employeur ou ingénieur) et votre mot de passe. Les mots de passe sont stockés uniquement sous forme de hachages bcrypt salés — nous ne pouvons pas lire votre mot de passe et ne le stockons jamais en clair.

**Session de connexion.** Après connexion, votre navigateur conserve un jeton de session signé (JWT) dans le localStorage afin de vous maintenir connecté. Le jeton expire après 24 heures. <!-- source : src/routes/auth.js JWT_EXPIRES_IN -->

**Vérification de l’employeur (KYC).** Les employeurs souhaitant financer des projets soumettent le nom de leur entreprise et, facultativement, le site web et le numéro de téléphone de celle-ci. Ces informations sont examinées manuellement par notre équipe ; nous conservons l’heure de soumission, le statut d’examen et toute note de l’examinateur.

**Profils des ingénieurs.** Les ingénieurs fournissent les informations professionnelles qu’ils choisissent de publier à destination des employeurs : compétences, tarif horaire, expérience, éléments de portfolio et avatar. Les résultats d’évaluation et de certification (voir ci-dessous) sont rattachés au profil.

**Évaluation technique et examens de certification.** Les ingénieurs passent une évaluation technique administrée par IA et peuvent se présenter à des examens de certification. Nous conservons vos réponses ainsi que les scores et retours générés par l’IA. Les réponses aux examens sont notées à l’aide des modèles Gemini de Google, et chaque certificat est examiné par un administrateur humain avant d’être délivré — un résultat produit par l’IA ne suffit jamais, à lui seul, à délivrer un certificat.

**Vérifications d’antécédents.** Lorsqu’une vérification d’antécédents est enregistrée, le processus actuel est manuel : un administrateur examine les preuves et enregistre un statut réussite/échec, avec un lien de preuve facultatif et une date d’expiration. Nous n’avons activé aucune API automatisée de vérification d’antécédents tierce.

**Documents fiscaux (W-9).** Les ingénieurs peuvent téléverser un formulaire W-9. Ces fichiers sont stockés dans un espace de stockage privé non accessible publiquement ; seuls les administrateurs peuvent les consulter via des URL signées de courte durée (valables environ 5 minutes), et le statut d’examen est enregistré en parallèle. <!-- source : src/routes/uploads.js / src/routes/tax.js espace privé + URL signée de courte durée -->

**Autres téléversements.** Avatars, éléments de portfolio, photos de fin de travaux et attestations d’assurance (COI) sont téléversés via un point d’accès unique acceptant des fichiers JPG, PNG, WebP et PDF jusqu’à 5 Mo. <!-- source : src/routes/uploads.js MAX_FILE_SIZE / ALLOWED_MIME -->

**Pointage GPS pour le travail sur site.** Lorsqu’un ingénieur pointe sur un jalon sur site financé, le pointage peut inclure des coordonnées GPS. Notre serveur les compare aux coordonnées du site du projet (une « géo-clôture »). Cette comparaison est purement informative — un pointage hors zone réussit tout de même, et le résultat est simplement enregistré et visible par l’employeur et les administrateurs. Nous ne suivons la localisation à aucun autre moment ; les coordonnées ne sont capturées qu’à l’instant du pointage.

**Messages de projet et traduction automatique.** Les messages que vous envoyez dans l’espace de travail d’un projet sont conservés afin que les deux parties puissent lire la conversation. Pour faciliter le travail des équipes multilingues, le texte des messages est envoyé à l’API Gemini de Google pour traduction. Le message original reste toujours la version faisant foi.

**Paiements.** Les paiements transitent par Stripe. Lorsqu’un employeur finance un jalon, il paie via une page Stripe Checkout hébergée par Stripe — **les numéros de carte ne touchent jamais nos serveurs**, et nous ne les stockons jamais. Les versements aux ingénieurs utilisent Stripe Connect ; l’identité et les coordonnées bancaires requises pour les versements sont collectées et conservées par Stripe, pas par nous. Nous conservons le statut de paiement, les montants et les écritures de registre nécessaires au fonctionnement du séquestre.

**Newsletter.** Si vous laissez votre e-mail dans les formulaires du calculateur, du livre blanc ou du pied de page, nous le conservons dans une liste d’abonnés. Nous n’avons encore envoyé aucun e-mail de newsletter ; lorsque nous le ferons, chaque envoi comprendra un lien de désabonnement, et vous pourrez également vous désabonner à tout moment en nous écrivant.

## Comment nous les utilisons

Nous utilisons les données ci-dessus pour faire fonctionner la place de marché : mettre en relation les ingénieurs et les projets, gérer le séquestre par jalons, délivrer des certifications, traiter les litiges, envoyer des e-mails transactionnels (via Resend) et assurer la sécurité du service. Nous ne vendons pas vos données et n’exploitons ni réseau publicitaire ni traceur publicitaire sur le site.

## Qui traite vos données

Nous dépendons d’un petit nombre de prestataires d’infrastructure, chacun ne recevant que ce qui est nécessaire à sa mission :

| Prestataire | Ce qu’il fait de vos données |
| --- | --- |
| Supabase | Héberge notre base de données PostgreSQL et le stockage de fichiers |
| Railway | Héberge les serveurs applicatifs |
| Stripe | Traite les paiements et les versements aux ingénieurs (données de carte et bancaires conservées chez Stripe) |
| Google (API Gemini) | Analyse IA, notation des examens et traduction des messages |
| Resend | Envoie les e-mails transactionnels et de notification |
| Sentry | Collecte les rapports d’erreurs afin que nous puissions corriger les plantages |

## Cookies et stockage local

Nous n’utilisons ni cookies publicitaires ni cookies de suivi tiers. Le site stocke quelques éléments dans le localStorage de votre navigateur : votre choix de thème (`tal-theme`), votre choix de langue (`tal_lang`), votre session et un cache de rôle par compte lors de la connexion (`tal_user`, `tal_role_<email>`), ainsi que des indicateurs mémorisant que vous avez ignoré l’invite d’installation de l’application (`tal_pwa_install_dismissed`, `tal-ios-a2hs-dismissed`). La connexion administrateur stocke en outre `tal_admin_token`. Effacer le stockage de votre navigateur supprime l’ensemble de ces éléments. <!-- source : hooks/useTheme.js / hooks/useLang.js / pages/finance.jsx / pages/admin.jsx / components/PwaSetup.jsx -->

## Conservation, rectification et suppression

Nous conservons les données de compte et de transaction tant que votre compte est actif et aussi longtemps que nécessaire à la tenue de nos registres financiers et des dossiers de litige. Pour faire corriger vos données, les exporter ou supprimer votre compte, écrivez à **hello@talengineer.us** depuis votre adresse enregistrée. Les demandes de suppression sont actuellement traitées manuellement par notre équipe ; les enregistrements que nous devons conserver (par exemple les écritures de registre pour des paiements réalisés) peuvent être conservés lorsque cela est requis.

## Sécurité

Outre les mots de passe hachés et les données de carte conservées par Stripe, les documents sensibles résident dans des espaces privés dotés d’une sécurité au niveau des lignes refusant tout accès — chaque accès transite par notre serveur, et les administrateurs ne consultent les documents fiscaux que via des URL signées de courte durée. Si vous pensez avoir découvert un problème de sécurité, veuillez le signaler à **hello@talengineer.us**.

## Modifications

Tant que ce document est marqué comme brouillon, il peut évoluer au fil de la revue juridique. Les modifications importantes postérieures à la publication seront reflétées sur cette page avec une date mise à jour.

À lire aussi : [Conditions d’utilisation](/terms)
