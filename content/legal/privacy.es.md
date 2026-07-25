---
title: Política de Privacidad
description: Qué datos recopila Talengineer, cómo se usan, qué procesadores los tocan y cómo contactarnos al respecto. Borrador en lenguaje sencillo, pendiente de revisión legal.
date: 2026-07-24
lang: es
slug: privacy
draft: true
---

<!--
  诚实红线说明（不渲染）：本文件是"按代码库实况写的平实描述"，每一条都对应
  仓库里真实存在的机制；数字均标注单一来源。draft: true 期间页面带 noindex + 草稿横幅，
  Terry 法务终审通过后把 draft 翻成 false 才算发布。
-->

Esta es una descripción en lenguaje sencillo de lo que la plataforma Talengineer recopila y hace realmente con sus datos hoy. Está redactada para ser precisa, no para ser un texto legal exhaustivo. **Es un borrador pendiente de revisión legal** — si algo aquí no es claro, o si desea que sus datos se corrijan, exporten o eliminen, escríbanos a **hello@talengineer.us** y una persona le responderá.

Talengineer ("nosotros") opera el sitio web y el mercado en talengineer.us, que conecta a empresas manufactureras ("empleadores") con ingenieros de automatización industrial ("ingenieros").

## Qué recopilamos

**Datos básicos de la cuenta.** Al registrarse almacenamos su dirección de correo electrónico, su rol (empleador o ingeniero) y su contraseña. Las contraseñas se almacenan solo como hashes bcrypt con sal — no podemos leer su contraseña y nunca la guardamos en texto plano.

**Sesión de inicio de sesión.** Después de iniciar sesión, su navegador guarda un token de sesión firmado (JWT) en localStorage para mantenerlo conectado. El token expira a las 24 horas. <!-- fuente: src/routes/auth.js JWT_EXPIRES_IN -->

**Verificación del empleador (KYC).** Los empleadores que desean financiar proyectos envían el nombre de su empresa y, opcionalmente, el sitio web y el teléfono de la empresa. Nuestro equipo los revisa manualmente; almacenamos la hora del envío, el estado de la revisión y cualquier nota del revisor.

**Perfiles de ingenieros.** Los ingenieros aportan la información profesional que eligen publicar para los empleadores: habilidades, tarifa por hora, experiencia, elementos de portafolio y un avatar. Los resultados de evaluación y certificación (ver abajo) se adjuntan al perfil.

**Evaluación técnica y exámenes de certificación.** Los ingenieros realizan una evaluación técnica administrada por IA y pueden presentar exámenes de certificación. Almacenamos sus respuestas y las puntuaciones y comentarios generados por IA. Las respuestas del examen se califican con la ayuda de los modelos Gemini de Google, y cada certificado es revisado por un administrador humano antes de emitirse — la salida de la IA por sí sola nunca emite un certificado.

**Verificación de antecedentes.** Cuando se registra una verificación de antecedentes, el proceso actual es manual: un administrador revisa la evidencia y registra un estado de aprobado/no aprobado, con un enlace de evidencia opcional y una fecha de vencimiento. No hemos habilitado ninguna API automatizada de verificación de antecedentes de terceros.

**Documentos fiscales (W-9).** Los ingenieros pueden subir un W-9. Estos archivos se guardan en un depósito de almacenamiento privado que no es de acceso público; solo los administradores pueden verlos mediante URLs firmadas de corta duración (válidas por aproximadamente 5 minutos), y el estado de revisión se almacena junto con ellos. <!-- fuente: src/routes/uploads.js / src/routes/tax.js depósito privado + URL firmada de corta duración -->

**Otras cargas.** Los avatares, elementos de portafolio, fotos de finalización y certificados de seguro (COI) se suben a través de un único endpoint que acepta archivos JPG, PNG, WebP y PDF de hasta 5 MB. <!-- fuente: src/routes/uploads.js MAX_FILE_SIZE / ALLOWED_MIME -->

**Check-in por GPS para trabajo en sitio.** Cuando un ingeniero hace check-in en un hito financiado en sitio, el check-in puede incluir coordenadas GPS. Nuestro servidor las compara con las coordenadas del sitio del proyecto (una «geocerca»). Esta comparación es solo informativa — un check-in fuera del área igualmente se completa con éxito, y el resultado simplemente queda registrado y visible para el empleador y los administradores. No rastreamos la ubicación en ningún otro momento; las coordenadas se capturan únicamente en el instante del check-in.

**Mensajes de proyecto y traducción automática.** Los mensajes que envía en el espacio de trabajo de un proyecto se almacenan para que ambas partes puedan leer la conversación. Para apoyar a equipos multilingües, el texto de los mensajes se envía a la API Gemini de Google para su traducción. El mensaje original siempre sigue siendo el registro autorizado.

**Pagos.** Los pagos se procesan en Stripe. Cuando un empleador financia un hito, paga a través de una página de Stripe Checkout alojada por Stripe — **los números de tarjeta nunca tocan nuestros servidores** y nunca los almacenamos. Los pagos a los ingenieros usan Stripe Connect; la identidad y los datos bancarios necesarios para los pagos son recopilados y conservados por Stripe, no por nosotros. Almacenamos el estado del pago, los montos y los asientos del libro contable necesarios para operar el depósito en garantía.

**Boletín.** Si deja su correo electrónico en la calculadora, el whitepaper o los formularios del pie de página, lo almacenamos en una lista de suscriptores. Todavía no hemos enviado ningún correo de boletín; cuando lo hagamos, cada envío incluirá un enlace para darse de baja, y también puede darse de baja en cualquier momento escribiéndonos.

## Cómo lo usamos

Usamos los datos anteriores para operar el mercado: emparejar ingenieros con proyectos, gestionar el depósito en garantía por hitos, emitir certificaciones, atender disputas, enviar correo transaccional (a través de Resend) y mantener el servicio seguro. No vendemos sus datos, y no operamos redes publicitarias ni rastreadores publicitarios en el sitio.

## Quién procesa sus datos

Dependemos de un pequeño conjunto de proveedores de infraestructura, cada uno de los cuales solo recibe lo que su función requiere:

| Proveedor | Qué hace con sus datos |
| --- | --- |
| Supabase | Aloja nuestra base de datos PostgreSQL y el almacenamiento de archivos |
| Railway | Aloja los servidores de la aplicación |
| Stripe | Procesa pagos y pagos a ingenieros (los datos de tarjeta y banco residen en Stripe) |
| Google (API Gemini) | Análisis con IA, calificación de exámenes y traducción de mensajes |
| Resend | Envía correo transaccional y de notificación |
| Sentry | Recopila informes de errores para que podamos corregir fallos |

## Cookies y almacenamiento local

No usamos cookies publicitarias ni de rastreo de terceros. El sitio almacena algunos elementos en el localStorage de su navegador: su elección de tema (`tal-theme`), su elección de idioma (`tal_lang`), su sesión y una caché de rol por cuenta al iniciar sesión (`tal_user`, `tal_role_<email>`), e indicadores que recuerdan que descartó el aviso de instalación de la app (`tal_pwa_install_dismissed`, `tal-ios-a2hs-dismissed`). El inicio de sesión de administrador además almacena `tal_admin_token`. Borrar el almacenamiento de su navegador elimina todo esto. <!-- fuente: hooks/useTheme.js / hooks/useLang.js / pages/finance.jsx / pages/admin.jsx / components/PwaSetup.jsx -->

## Conservación, corrección y eliminación

Conservamos los registros de cuenta y transacciones mientras su cuenta esté activa y durante el tiempo necesario para los registros financieros y de disputas. Para corregir sus datos, exportarlos o eliminar su cuenta, escriba a **hello@talengineer.us** desde su dirección registrada. Las solicitudes de eliminación se gestionan actualmente de forma manual por nuestro equipo; los registros que debemos conservar (por ejemplo, los asientos del libro contable de pagos completados) pueden retenerse cuando así lo exija la normativa.

## Seguridad

Además de las contraseñas con hash y los datos de tarjeta que conserva Stripe, los documentos sensibles residen en depósitos privados con seguridad a nivel de fila que deniega todo por defecto — todo acceso pasa por nuestro servidor, y los administradores solo ven los documentos fiscales mediante URLs firmadas de corta duración. Si cree haber encontrado un problema de seguridad, repórtelo a **hello@talengineer.us**.

## Cambios

Mientras este documento esté marcado como borrador, puede cambiar a medida que avanza en la revisión legal. Los cambios materiales después de la publicación se reflejarán en esta página con una fecha actualizada.

Relacionado: [Términos de Servicio](/terms)
