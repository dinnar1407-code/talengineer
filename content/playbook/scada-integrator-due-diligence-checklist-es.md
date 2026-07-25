---
title: La lista de verificación de debida diligencia para integradores SCADA
description: Una lista práctica para evaluar a un integrador SCADA antes de firmar — cubre profundidad de plataforma, arquitectura, seguridad, documentación, referencias y estructura de pago.
date: 2026-07-14
lang: es
type: guide
track: plc
audience: employer
slug: scada-integrator-due-diligence-checklist-es
group: scada-integrator-due-diligence-checklist
---

# La lista de verificación de debida diligencia para integradores SCADA

Un proyecto SCADA está en el centro de su operación. Es la forma en que su personal ve la planta, la forma en que las alarmas llegan a la persona correcta y, cada vez más, la forma en que los datos fluyen hacia su MES y sus analíticas. Un integrador débil no solo le entrega una interfaz torpe: le deja una base de datos de tags imposible de mantener, un hueco de seguridad y ninguna documentación que entregar al siguiente ingeniero. Elegir bien vale la pena una debida diligencia real. Esta lista es lo que debe verificar antes de firmar, ya sea que el integrador esté a la vuelta de la esquina o al otro lado de la frontera.

## 1. Profundidad de plataforma en su stack específico

SCADA no es una sola cosa. Ignition, Wonderware / AVEVA, FactoryTalk View, WinCC y Zenon son mundos distintos. Pregunte en qué plataforma el integrador ha entregado realmente sistemas en producción — no en la que se capacitó, sino en la que entregó. Luego profundice:

- ¿Cómo estructuran los tags y las plantillas? (Una buena respuesta involucra UDT / plantillas reutilizables, no miles de tags construidos a mano.)
- ¿Cómo manejan la configuración del historian y la retención de datos?
- ¿Han hecho redundancia y failover en su plataforma, si usted lo necesita?

Respuestas vagas de nombre de marca son una señal de alerta. Respuestas específicas sobre arquitectura son una señal positiva.

## 2. Arquitectura y escalabilidad

Un sistema SCADA que funciona con 500 tags puede colapsar con 50,000 si se construyó de forma ingenua. Pida al integrador que describa la arquitectura que propone: topología cliente/servidor, cuántos clientes, thin-client versus thick-client, historian de borde versus central, y cómo el diseño acomoda el crecimiento. Si no puede esbozar esto en una pizarra (o en un documento compartido) en quince minutos, no ha pensado en su escala.

## 3. Postura de ciberseguridad

Esta es la sección que más se omite y la que más se lamenta después. Un integrador SCADA en 2026 debe tratar la seguridad como un entregable de primer nivel, no como una idea de último momento. Verifique:

- Segmentación de red entre la red de control e IT / internet.
- Sin contraseñas por defecto, y un modelo real de roles de usuario con privilegio mínimo.
- Acceso remoto seguro (VPN o un gateway gestionado), nunca un puerto abierto.
- Un plan de parcheo y respaldo para los servidores SCADA.

Si el plan del integrador es poner un HMI en la red de oficina con un login por defecto "para que pueda revisarlo desde casa", aléjese.

## 4. Documentación y entrega

La diferencia entre un sistema mantenible y una situación de rehén es la documentación. Exija, por escrito, que el entregable incluya: un diagrama de arquitectura as-built, un documento de tags / convención de nombres, una lista de racionalización de alarmas y un procedimiento de respaldo/restauración. Pida ver un paquete de documentación de muestra de un proyecto anterior. Un integrador que documenta bien le está diciendo que espera que usted pueda mantener el sistema sin él — que es exactamente el integrador que quiere.

## 5. Referencias y habilidad verificada

Pida dos o tres referencias en la misma plataforma e industria, y llámelas de verdad. Hágales una pregunta directa: "¿Lo contrataría de nuevo, y qué salió mal?" Todo proyecto tiene algo que salió mal; una referencia honesta se lo dirá, y la respuesta revela cómo el integrador maneja los problemas.

Cuando contrata a través de fronteras, las referencias son más difíciles de verificar y los currículums son más fáciles de inflar — precisamente por eso importa una capa de verificación. En Talengineer, los ingenieros pasan un evaluador práctico con IA y pueden obtener certificación de la plataforma, así que un perfil certificado ha demostrado habilidad en condiciones de examen antes de que usted llame a una sola referencia. No reemplaza la verificación de referencias, pero eleva el mínimo aceptable y filtra los perfiles que solo se ven bien en papel.

## 6. Estructura comercial y protección de pago

Cómo se estructura el trato le dice cómo irá el proyecto. Favorezca:

- **Pago basado en hitos** vinculado a pruebas de aceptación, no una suma global única al "completar."
- **Un proceso definido de órdenes de cambio** para que el alcance descontrolado no se convierta en un argumento más tarde.
- **Depósito en garantía para trabajo transfronterizo**, de modo que los fondos se mantengan y liberen contra entregables aceptados en lugar de transferirse por confianza.

El depósito en garantía por hitos en Talengineer ofrece exactamente esto, con una comisión de la plataforma del 15% (5% para clientes fundadores) que cubre el manejo de pagos y un proceso definido de resolución de disputas. Lo protege a usted si la entrega se atrasa y protege al integrador si el pago se atrasa.

## 7. La prueba de esfuerzo de una sola línea

Si solo tiene tiempo para una pregunta, haga esta: **"Cuénteme qué le entregaría al siguiente ingeniero si a usted lo atropellara un autobús en medio del proyecto."** Un integrador sólido responde de inmediato — tags documentados, proyectos con control de versiones, un as-built, un respaldo. Uno débil se queda callado, porque la respuesta honesta es "un desorden que solo yo entiendo." Esa sola pregunta separa a los profesionales de los improvisados más rápido que cualquier currículum.

## Cómo usar la lista de verificación

Pase a cada candidato por los siete puntos y califíquelo. No está buscando una puntuación perfecta — está buscando respuestas específicas y seguras, y un reconocimiento honesto de las concesiones (trade-offs). El integrador que dice "así es como lo arquitecturaría, este es el modelo de seguridad, esta es la documentación que recibirá, y aquí hay una referencia que le dirá qué salió mal" vale más que una oferta más baja con garantías vagas.

¿Listo para encontrar integradores SCADA cuyas habilidades están verificadas antes de que usted los entreviste? [Explore ingenieros certificados →](/talent)
