---
title: Cómo funcionan los pagos a ingenieros en TalEngineer
description: Un recorrido en lenguaje sencillo por la ruta del dinero para los ingenieros — el depósito en garantía por hitos, el 85% que se lleva a casa, Stripe Connect y los pagos fuera de línea, qué ocurre cuando una disputa congela un hito y dónde queda registrado cada movimiento en su libro mayor.
date: 2026-07-24
lang: es
type: guide
track: general
audience: engineer
slug: how-engineer-payouts-work-es
group: how-engineer-payouts-work
---

# Cómo funcionan los pagos a ingenieros en TalEngineer

El temor más grande en la ingeniería freelance transfronteriza es simple: usted hace el trabajo y el dinero nunca llega. Cada decisión de diseño del sistema de pagos de TalEngineer existe para eliminar ese temor — y para eliminar el temor especular del lado del empleador, que es pagar por un trabajo que nunca se termina. Este artículo recorre toda la ruta del dinero desde el punto de vista del ingeniero, para que sepa exactamente qué ocurre en cada paso y qué verificar antes de comprometer su tiempo.

## El dinero se mueve antes de que empiece el trabajo

Cada proyecto en la plataforma se divide en **hitos** — fases discretas con un entregable definido y un monto definido. Antes de que un hito comience, el empleador lo financia: el dinero sale de la cuenta del empleador y queda en garantía, vinculado a ese hito específico. Usted puede ver el estado de financiamiento del hito en su orden de trabajo antes de empezar.

Esta es la regla que vale la pena interiorizar: **si un hito no está financiado, el trabajo en realidad no ha comenzado.** Usted nunca está en la posición de facturarle a un desconocido al otro lado de una frontera y esperar. La pregunta "¿me van a pagar?" queda respondida antes de que abra su laptop o suba a un avión — el dinero ya se movió; la única pregunta que queda es si el trabajo cumple con la definición del hito.

## Lo que usted se lleva a casa

<!-- Fuente única del número de tarifa: src/config/fees.js (PLATFORM_FEE = 0.15, lo que el ingeniero se lleva a casa = 1 - tarifa). En esta página la tarifa aparece una sola vez, en este párrafo. -->
Cuando el empleador aprueba un hito y lo libera, se descuenta la comisión de la plataforma y el resto es suyo. La comisión estándar de la plataforma es del **15% de cada hito liberado, así que usted conserva el 85%** — el mismo número público de nuestra [página de precios](/pricing), leído desde una única fuente de configuración en el código, de modo que no puede desviarse en silencio. No hay comisiones por publicar, ni por participar en la selección, ni suscripción, ni cobro por postularse a proyectos. La comisión se vincula a un único evento: un hito que el empleador aceptó.

Algunas órdenes tempranas de clientes fundadores llevan una comisión de plataforma reducida, definida por la plataforma por orden. Cuando eso ocurre, el descuento de su hito es *menor* — una tarifa reducida para el empleador significa que más del hito llega a usted en esa orden.

## Cómo llega físicamente el dinero hasta usted

Existen dos vías de pago, y su perfil determina cuál le corresponde:

- **Stripe Connect (predeterminada).** Si la red de pagos de Stripe cubre su país, usted conecta una cuenta de Stripe durante el proceso de incorporación. Cuando un hito se libera, la plataforma envía una transferencia a su cuenta conectada, y Stripe se encarga del último tramo hasta su banco.
- **Pago fuera de línea (alternativa).** La cobertura de pagos exprés de Stripe no llega a todas las regiones donde viven grandes ingenieros de automatización. Si ese es su caso, su liberación se registra como un pago manual y la plataforma lo procesa fuera de línea. Su notificación de liberación le indica explícitamente qué ruta tomó su dinero, así que nunca hay ambigüedad sobre si una transferencia está en camino.

La liberación misma está diseñada de forma defensiva: el sistema reclama el hito de manera atómica antes de enviar el dinero (así un doble clic o una condición de carrera nunca puede disparar dos transferencias), y si una transferencia falla a mitad de camino, el hito vuelve a su estado financiado para que la liberación pueda reintentarse — el dinero se queda en garantía en lugar de desaparecer en un estado de error. Usted recibe un correo electrónico y una notificación en la aplicación en el momento en que se completa una liberación.

## Cuando una disputa congela un hito

Si el empleador no está de acuerdo en que un hito fue entregado, puede abrir una disputa antes de liberarlo. Esto es lo que significa para usted, en concreto:

<!-- Fuente única del número de la ventana de evidencias: src/routes/disputes.js (EVIDENCE_WINDOW_MS = 5 días). -->
1. **El hito se congela.** Un hito en disputa no puede liberarse mientras la disputa está abierta — pero tampoco puede reembolsarse silenciosamente sin que usted se entere. El dinero permanece bloqueado en garantía hasta que la disputa se resuelve.
2. **Se abre una ventana de evidencias de 5 días.** Desde el momento en que se presenta la disputa, ambas partes tienen cinco días para enviar evidencia. Aquí es donde los hábitos de trabajo de la plataforma dan sus frutos: los check-ins por GPS del trabajo en sitio, las fotos subidas durante el trabajo, los registros del hito y los mensajes de WarRoom forman en conjunto un rastro con marca de tiempo que existe *porque usted trabajó a través de la plataforma*, no porque tuvo que reconstruirlo apresuradamente después.
3. **La plataforma revisa la evidencia y falla.** La resolución sigue al registro, no a quien argumenta más fuerte. Según lo que muestre la evidencia, los fondos se liberan a usted o se devuelven al empleador.

El consejo práctico: trate la evidencia como un hábito, no como una respuesta de emergencia. Haga check-in en sitio, suba fotos sobre la marcha, mantenga las conversaciones de alcance en el chat del proyecto. Los ingenieros con un rastro limpio rara vez pierden disputas que no deberían perder.

## Su libro mayor: un solo lugar donde todo concilia

Cada evento financiero en su cuenta — hitos financiados, hitos liberados, comisiones descontadas — queda registrado en su **libro mayor financiero**, visible en su [panel de finanzas](/finance). Esta es su única fuente de verdad para la conciliación: qué se prometió, qué se liberó y qué se le pagó, por hito, con marcas de tiempo. Sin tener que perseguir facturas en hilos de correo.

## La lista de verificación

Antes de empezar cualquier hito: confirme que está financiado. Durante el trabajo: haga check-in, fotografíe, comuníquese dentro de la plataforma. Al liberar: verifique que la notificación coincida con su libro mayor. Ese es todo el sistema — garantía antes del trabajo, una comisión pública que se cobra una sola vez al liberar, una vía de pago que se ajusta a su región, un proceso de disputas que se guía por la evidencia y un libro mayor que nunca olvida. Está diseñado para que la respuesta a "¿me van a pagar?" quede resuelta antes de que la pregunta necesite hacerse.

*Los detalles de la comisión y los términos para clientes fundadores están en la [página de precios](/pricing). ¿Es nuevo en la plataforma? Empiece por [cómo funcionan los exámenes de certificación](/playbook/how-certification-exams-work) — la certificación es lo que le permite ser asignado en primer lugar.*
