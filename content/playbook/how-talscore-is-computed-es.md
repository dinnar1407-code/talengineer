---
title: Cómo se calcula el TalScore
description: La matemática exacta detrás de su TalScore, las cuatro dimensiones ponderadas, el promedio bayesiano de calificaciones que protege contra la manipulación de reseñas, las reglas de fiabilidad y el límite de tasa de disputas, los umbrales de nivel, y qué mueve realmente cada número.
date: 2026-07-24
lang: es
type: guide
track: general
audience: engineer
slug: how-talscore-is-computed-es
group: how-talscore-is-computed
---

# Cómo se calcula el TalScore

El TalScore es su puntuación de calidad en TalEngineer: un único número de 0 a 100 que combina cuatro señales verificables en algo por lo que un empleador puede ordenar candidatos y sobre lo que la plataforma puede fijar umbrales. A diferencia de una calificación por estrellas en un sitio de trabajo freelance genérico, cada dato que alimenta el TalScore es algo que la propia plataforma verificó: una evaluación que usted realizó, una certificación que obtuvo, una reseña de un proyecto pagado y completado, un registro de entrega con marcas de tiempo. Este artículo muestra la fórmula real, porque una puntuación que no se puede inspeccionar es una puntuación que no se puede mejorar de forma deliberada.

## Las cuatro dimensiones y sus ponderaciones

<!-- TalScore 全部数字单一来源：src/services/talScore.js（WEIGHTS 25/25/30/20、CERT_LEVEL_POINTS 8/16/25、RATING_PRIOR 3.5×5、RELIABILITY_COMPLETED_CAP 10、NO_DISPUTE_BONUS 10、DISPUTE_RATE_LIMIT 0.10、TIER_THRESHOLDS 85/70/55）。各数字在本页只出现一次。 -->
Su puntuación es la suma de cuatro componentes ponderados:

| Dimensión | Ponderación | Qué mide |
|---|---|---|
| Evaluación por IA | 25 | Su puntuación en el evaluador técnico que todo ingeniero realiza al registrarse |
| Certificación de la plataforma | 25 | Las certificaciones que ha obtenido, por especialidad y nivel |
| Calificaciones de empleadores | 30 | Calificaciones por estrellas de proyectos pagados y completados, promediadas de forma bayesiana |
| Fiabilidad | 20 | Órdenes completadas más un historial de disputas limpio |

Las ponderaciones reflejan una filosofía deliberada: lo que los empleadores experimentaron (calificaciones, 30) cuenta un poco más que cualquier examen individual, pero ninguna dimensión domina por sí sola — un excelente examinado sin historial de entregas y un entregador prolífico que nunca se certificó se estancan ambos por debajo de alguien sólido en todos los frentes.

## Dimensión 1: evaluación por IA (hasta 25 puntos)

El resultado de su evaluación al registrarse se traslada de forma lineal a esta dimensión: una puntuación de evaluación de 0–100 se convierte en 0–25 puntos de TalScore. Esta es su línea base de capacidad, fijada una sola vez cuando se une a la plataforma. La forma de mejorarla es haber tenido un desempeño genuino en la evaluación — no hay manera de acumular puntos en esta dimensión después, que es exactamente la razón por la que existen las otras tres.

## Dimensión 2: certificación (hasta 25 puntos)

Para cada especialidad, solo cuenta su nivel **más alto**: **L1 vale 8 puntos, L2 vale 16, L3 vale 25**, y la dimensión tiene un tope de 25. Lea estos números con cuidado, porque codifican una estrategia: un solo L3 agota por completo esta dimensión. Dos L1 en especialidades distintas (16 puntos) equivalen a un L2 — y quedan muy por debajo de un solo L3. Aquí la profundidad vence a la amplitud. Las certificaciones cruzadas entre especialidades siguen siendo importantes para *a qué proyectos puede ser asignado* — pero, a efectos del TalScore, subir una sola escalera hasta arriba paga mejor que empezar varias.

## Dimensión 3: calificaciones — y por qué una sola reseña de 5 estrellas no lo catapulta a la cima

Los promedios sin ajustar son fáciles de manipular: una reseña amistosa de 5 estrellas colocaría a un recién llegado por encima de un veterano con cuarenta proyectos de 4.8 estrellas. En su lugar, el TalScore usa un **promedio bayesiano**: su calificación se calcula como si hubiera empezado con **5 reseñas fantasma de 3.5 estrellas** — el promedio de referencia de toda la plataforma — combinadas con sus reseñas reales. El resultado (sobre 5 estrellas) se traslada luego a la dimensión de 30 puntos.

La consecuencia que debe interiorizar: con pocas reseñas, su calificación efectiva se mantiene cerca de 3.5 sin importar qué tan buenas sean esas reseñas, y cada reseña real adicional la acerca más a su promedio verdadero. Al principio, el *volumen de proyectos completados y bien calificados* mueve más esta dimensión que la perfección en uno solo. Con el tiempo, la influencia del valor de referencia se desvanece y su historial real predomina. Este es el sistema más justo que conocemos para comparar a un recién llegado con un veterano sin que ninguno de los dos quede mal representado.

## Dimensión 4: fiabilidad — y la línea roja

La fiabilidad es la aritmética más simple y el filo más afilado:

- **1 punto por orden completada, con un tope de 10.** Diez proyectos completados agotan la mitad correspondiente a la entrega.
- **Un bono de 10 puntos por no tener disputas.** Un historial limpio vale tanto como diez órdenes completadas.
- **La línea roja: si su tasa de disputas supera el 10% de las órdenes completadas, toda la dimensión cae a cero.** No se reduce — se pone en cero. Y un ingeniero con disputas pero sin órdenes completadas se trata como el caso de mayor riesgo posible.

La intención del diseño es transparente: la plataforma prefiere que usted entregue un volumen ligeramente menor sin ningún conflicto, antes que un volumen alto con fricciones. Una sola disputa en un historial largo no lo pondrá en cero (le cuesta el bono), pero un patrón de disputas es lo más dañino que le puede pasar a su puntuación.

## Niveles

Su puntuación se traduce en una insignia de nivel que se muestra en su perfil: **85 o más es Platino, 70–84 es Oro, 55–69 es Plata**, y por debajo de eso, Bronce. Los niveles son pura representación del mismo número — no existe un comité de niveles independiente.

## Cuándo se actualiza, y qué hacer en la práctica

El TalScore se recalcula automáticamente cuando cambian sus entradas: cuando llega una nueva reseña, cuando se liberan hitos, cuando se emite una certificación. Su perfil muestra el desglose por dimensión, para que pueda ver exactamente dónde tiene puntos y dónde no.

La estrategia que se desprende de esta matemática: certifíquese a fondo en su especialidad principal (un solo L3 agota por sí solo la dimensión de certificación), complete proyectos de forma impecable y deje que el número de reseñas se acumule más allá de la influencia del valor de referencia, y trate las disputas como algo que debe evitar a casi cualquier costo — comunique cualquier tropiezo del proyecto lo antes posible a través de la plataforma, porque una conversación resuelta no le cuesta nada, mientras que una disputa puede costarle una quinta parte de su puntuación.

*Consulte su propio desglose en la [página de TalScore](/talscore). Para saber cómo se usa la puntuación en la práctica, lea [cómo se hace el emparejamiento en TalEngineer](/playbook/getting-matched-on-talengineer).*
