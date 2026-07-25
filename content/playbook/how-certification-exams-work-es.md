---
title: Cómo funcionan los exámenes de certificación en TalEngineer
description: La guía completa del ingeniero sobre los exámenes de certificación de la plataforma — el formato de 10 preguntas, el cronómetro de 40 minutos, cómo funciona la calificación por IA más la revisión humana, la progresión de L1 a L3, el periodo de espera para repetir el examen y por qué el banco de preguntas hace inútil la memorización.
date: 2026-07-24
lang: es
type: certification
track: general
audience: engineer
slug: how-certification-exams-work-es
group: how-certification-exams-work
---

# Cómo funcionan los exámenes de certificación en TalEngineer

En Talengineer, la certificación no es un adorno: es la puerta de entrada. **Solo los ingenieros certificados pueden ser asignados oficialmente a un proyecto, y cuando un proyecto especifica una especialidad de certificación requerida, su certificación debe estar en esa especialidad.** Esa única regla hace que valga la pena entender el examen en detalle antes de presentarse a él. Esta guía cubre exactamente cómo es el examen, cómo se califica, cómo se avanza de L1 a L3 y qué ocurre si no lo aprueba. Todo lo que sigue proviene de la misma configuración de reglas sobre la que corre el propio sistema de exámenes, así que lo que lee aquí es lo que vivirá en la sala de examen.

## Las especialidades y lo que está certificando

La certificación se ofrece en cuatro especialidades, que corresponden a las cuatro disciplinas de la plataforma: **PLC**, **Robótica**, **Visión artificial** y **Eléctrica**. Se certifica por especialidad, y puede tener certificaciones en más de una — muchos ingenieros de automatización en activo dominan PLC y eléctrica, o robótica y visión. Cada especialidad tiene tres niveles, y cada combinación de especialidad y nivel es un examen independiente.

## El formato del examen

<!-- 考试数字单一来源：src/config/training.js（EXAM_QUESTION_MIX 5/3/2、QUESTIONS_PER_EXAM 10、EXAM_MINUTES 40、PASS_SCORE 70、RETAKE_COOLDOWN_DAYS 7、EXAM_BANK_SIZE 20）。本页全部考试数字只出现在本节及其后各一次。 -->
Cada examen consta de **10 preguntas en 40 minutos**, compuestas por tres tipos de pregunta:

- **5 preguntas de opción múltiple.** Cuatro opciones, una correcta. Se califican automáticamente contra una clave de respuestas en el servidor: instantáneo, determinista, sin interpretación de por medio.
- **3 preguntas de escenario.** Problemas de respuesta corta extraídos de situaciones laborales realistas de su especialidad — el tipo de decisión de criterio que enfrentaría en un piso de puesta en marcha real. Se califican por IA contra el razonamiento esperado de la pregunta.
- **2 preguntas de análisis.** Problemas más largos, de varios puntos, que evalúan profundidad: diseñar un enfoque, diagnosticar una falla, sopesar concesiones. También calificadas por IA, y aquí es donde los candidatos de L2 y L3 se distinguen de los de L1.

El cronómetro se aplica del lado del servidor: su plazo queda fijado en el momento en que empieza, y una entrega después del plazo se marca como vencida sin importar lo que muestre su navegador. Planifique su tiempo — dedicar aproximadamente uno o dos minutos por pregunta de opción le deja tiempo real para el trabajo de escenario y análisis, que es donde vive la mayor parte del razonamiento.

## Cómo funciona la calificación — y por qué aprobar no es instantáneo

La **línea de aprobación es 70 sobre 100**, calculada como el promedio de sus respuestas calificadas. Pero aprobar la calificación de la IA no es el final del proceso; es el penúltimo paso:

1. **La IA califica su examen.** Las preguntas de opción se puntúan contra la clave; las respuestas de escenario y análisis las evalúa la IA por corrección y calidad de razonamiento. Usted recibe una puntuación y retroalimentación por pregunta.
2. **Un administrador humano revisa antes de emitir cualquier certificado.** Un intento aprobado por la IA entra en una cola de revisión humana, y solo después de esa revisión la certificación aparece en su perfil. Esto es deliberado: la certificación autoriza trabajo real en sitio donde los errores tienen consecuencias físicas, así que una persona sostiene la última puerta.
3. **Si la calificación por IA no está disponible, el sistema falla de forma segura (cerrado).** Sus respuestas se conservan y se enrutan a calificación manual por el equipo — la plataforma nunca da por aprobado por defecto un examen sin calificar.

Si su puntuación queda por debajo de la línea, verá la retroalimentación, y lo honesto es tratarla como un diagnóstico y no como un insulto — la retroalimentación de escenario y análisis suele señalar exactamente la brecha de razonamiento que hay que cerrar antes de repetir.

## Repeticiones: el periodo de espera de 7 días

Un intento reprobado activa un **periodo de espera de 7 días** antes de poder repetir la misma especialidad y nivel. El periodo de espera existe por una sola razón: hace que intentar el examen a base de repetición rápida sea una estrategia perdedora frente a estudiar de verdad. Aproveche la semana. La retroalimentación de su intento fallido le dice dónde invertirla.

## Progresión: L1 → L2 → L3

Los niveles son secuenciales dentro de una especialidad:

- **L1 está abierto para todos.** Sin prerrequisitos — es la credencial de entrada que demuestra fundamentos competentes.
- **L2 requiere un L1 vigente en la misma especialidad. L3 requiere un L2 vigente.** No puede saltarse niveles; cada examen asume y construye sobre la profundidad certificada por debajo de él.

Esto importa para planificar: si su objetivo es poder ser asignado a trabajo de nivel L3 — puesta en marcha compleja, arquitectura, liderazgo técnico — está viendo tres exámenes en secuencia, no uno grande. Las certificaciones permanecen vigentes a menos que caduquen o sean revocadas, y solo las certificaciones vigentes cuentan para el prerrequisito.

## Por qué memorizar el examen no funciona

Detrás de cada combinación de especialidad, nivel e idioma hay un banco de preguntas con un objetivo de **20 conjuntos de examen distintos**, y su examen se extrae al azar de ese conjunto. El conjunto sigue creciendo hasta alcanzar la capacidad objetivo, lo que significa que las probabilidades de ver un examen que haya memorizado — o que un amigo le haya descrito — están diseñadas para reducirse. Sumado al hecho de que las preguntas de escenario y análisis se califican por razonamiento y no por coincidencia de palabras clave, la única preparación confiable es la poco glamorosa: conocer de verdad su disciplina.

## Antes de presentarse

Lista práctica: elija primero la especialidad que corresponda a su experiencia real más sólida (un buen L2 en una especialidad vale más que un L1 raspado en tres); reserve 40 minutos genuinamente libres, porque el cronómetro del servidor no tiene botón de pausa; y responda las preguntas de escenario como explicaría una decisión a un cliente — el razonamiento primero, la conclusión claramente planteada.

El examen es aprobable por cualquier ingeniero que realmente haga este trabajo. Ese es el punto. No está diseñado para ser un muro — está diseñado para que, cuando un empleador vea su certificación, esta signifique algo.

*¿Listo para empezar? Vaya al [Centro de Capacitación](/training). Para entender cómo la certificación alimenta su posición general en la plataforma, lea [cómo se calcula el TalScore](/playbook/how-talscore-is-computed).*
