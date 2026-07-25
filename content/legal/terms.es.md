---
title: Términos de Servicio
description: Cómo funciona realmente el mercado de Talengineer — cuentas, comisiones, depósito en garantía por hitos, disputas y certificación — en lenguaje sencillo. Borrador, pendiente de revisión legal.
date: 2026-07-24
lang: es
slug: terms
draft: true
---

<!--
  诚实红线说明（不渲染）：条款草稿只描述仓库里真实存在的机制（托管/费率/纠纷/认证/签到），
  不发明不存在的政策；平台数字各写一次并标注单一来源（fees.js / disputes.js）。
  管辖法律等纯法务决策留白待 Terry 法务审定，不臆造。
-->

Estos términos describen, en lenguaje sencillo, cómo funciona realmente hoy el mercado de Talengineer y qué acepta usted al usarlo. **Este es un borrador pendiente de revisión legal** — busca ser honesto sobre la práctica actual, más que exhaustivo. Las preguntas van a **hello@talengineer.us**.

## 1. Qué es Talengineer

Talengineer es un mercado que conecta a empresas manufactureras ("empleadores") con ingenieros de automatización industrial independientes ("ingenieros") para trabajo por proyectos. Los ingenieros de la plataforma son profesionales independientes, no empleados nuestros. El contrato de prestación de servicios de un proyecto es entre el empleador y el ingeniero; Talengineer proporciona la infraestructura de emparejamiento, depósito en garantía, comunicación y certificación en torno a él.

## 2. Cuentas

Usted se registra como empleador o ingeniero y acepta proporcionar información precisa. Los empleadores que desean financiar proyectos pasan por un paso de verificación (datos de la empresa, revisados manualmente por nuestro equipo). Los ingenieros completan una evaluación técnica administrada por IA durante el onboarding; las puntuaciones de evaluación se usan para clasificar y recomendar ingenieros, y solo los ingenieros con una certificación de plataforma vigente pueden ser asignados a un proyecto. Usted es responsable de mantener seguras sus credenciales de acceso; las sesiones expiran automáticamente a las 24 horas.

## 3. Comisiones

La plataforma cobra una comisión de depósito en garantía del **15%** de cada monto de hito, deducida cuando un hito se libera al ingeniero. Los clientes fundadores pagan una comisión reducida del **5%**, fijada por proyecto. No hay cargos por publicar un proyecto ni por crear un perfil. <!-- fuente: src/config/fees.js PLATFORM_FEE + demands.fee_pct (descuento para clientes fundadores, feeFor() es la única ruta de cálculo de comisión) -->

## 4. Depósito en garantía por hitos

Los proyectos se dividen en hitos. Un empleador financia un hito a través de Stripe Checkout; el hito se marca como financiado solo después de que Stripe confirma el pago — nunca marcamos fondos como depositados en garantía sin confirmación de pago. Cuando el empleador aprueba el trabajo entregado, el hito se libera y al ingeniero se le paga (mediante Stripe Connect o una alternativa acordada) menos la comisión de la plataforma descrita arriba. Los números de tarjeta nunca tocan nuestros servidores; consulte la [Política de Privacidad](/privacy) para saber cómo se manejan los datos de pago.

## 5. Trabajo en sitio y check-ins

Para los hitos en sitio, los ingenieros hacen check-in a través de la plataforma. Un check-in requiere una certificación de plataforma vigente y puede incluir coordenadas GPS, que nuestro servidor compara con la ubicación del sitio del proyecto. Esta comparación de geocerca es solo informativa: un check-in fuera del área igualmente se completa con éxito y simplemente queda registrado para que lo vean el empleador y los administradores. Los ingenieros son responsables de cumplir las normas de seguridad y acceso del sitio.

## 6. Disputas

Si alguna de las partes está en desacuerdo sobre un hito, puede abrir una disputa en la plataforma. Desde el momento en que se abre una disputa, ambas partes tienen **5 días** para presentar sus evidencias. <!-- fuente: src/routes/disputes.js EVIDENCE_WINDOW_MS (ventana de evidencias de 5 días) --> Después de la ventana de evidencias, un administrador de la plataforma revisa lo que presentaron ambas partes y decide cómo se asigna el monto del hito en disputa. Abrir una disputa pausa el flujo normal de liberación de ese hito hasta que se tome la decisión.

## 7. Certificación y funciones de IA

Las certificaciones de la plataforma se obtienen mediante exámenes que se califican con ayuda de modelos de IA y luego son revisados por un administrador humano antes de emitir cualquier certificado. Los certificados pueden vencer y pueden revocarse por causa justificada (por ejemplo, evidencia de fraude). La plataforma también usa IA para evaluación técnica, análisis de proyectos y traducción de mensajes. **La traducción automática se ofrece como comodidad y puede contener errores — el mensaje original siempre es la versión autorizada.**

## 8. Uso aceptable

Usted acepta no tergiversar su identidad, calificaciones o empresa; no subir contenido que no tenga derecho a compartir; no usar la plataforma para nada ilegal; y no intentar sondear o vulnerar la seguridad de la plataforma. Podemos suspender cuentas que infrinjan estas reglas o que intenten defraudar el proceso de depósito en garantía o de disputas.

## 9. Estado del servicio

Talengineer está actualmente en **beta**. Trabajamos para mantener el servicio confiable, pero no prometemos disponibilidad ininterrumpida, y las funciones pueden cambiar a medida que la plataforma evoluciona. Nada en la plataforma — incluidos los puntos de referencia de tarifas, las calculadoras y las guías — constituye asesoría legal, fiscal o profesional.

## 10. Finalización de su cuenta

Puede dejar de usar la plataforma en cualquier momento. Para cerrar y eliminar su cuenta, escriba a **hello@talengineer.us** desde su dirección registrada; la eliminación la gestiona manualmente nuestro equipo. Las obligaciones surgidas antes del cierre (por ejemplo, hitos financiados y disputas abiertas) subsisten hasta que se resuelvan.

## 11. Cambios y puntos pendientes

Mientras este documento esté marcado como borrador, puede cambiar a medida que avanza en la revisión legal. Cuestiones como la ley aplicable y el foro formal de resolución de disputas se dejan intencionalmente para esa revisión, en lugar de inventarse aquí. Los cambios materiales después de la publicación se reflejarán en esta página con una fecha actualizada.

Relacionado: [Política de Privacidad](/privacy)
