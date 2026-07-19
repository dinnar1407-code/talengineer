// 建厂地域用人指南（中国出海线：墨西哥/越南/泰国）的内容数据。
//
// 设计约定：
// - 费率区间复用 lib/hireMatrix.js 的 REGIONS（与 /hire/[track] 及 /rates 同一唯一来源），不另立数字。
// - 当地用人现状写“结构性事实 + 定性描述”，绝不编造具体统计数字。
// - 语言：墨西哥/越南 = en/zh/es/vi 四语；泰国 = en/zh（泰语不在站点九语清单，页内提示九语翻译能力）。

import { REGIONS } from './hireMatrix';

// 复用同一份地区费率，供 getStaticProps 传给页面做“跨境对比表”。
export { REGIONS };

// ── 三个地域指南（键 = region slug）───────────────────────────────────────
const GUIDES = {
  mexico: {
    flag: '🇲🇽',
    langs: ['en', 'zh', 'es', 'vi'],
    rateRegionKey: 'Mexico & Latin America', // 对应 REGIONS 里的英文地区名，取本地区间
    en: {
      title: 'Building a factory in Mexico? Solve your automation staffing.',
      sub: 'Local certified engineers plus cross-border remote and fly-in support — escrow-protected, coordinated across nine languages.',
      status1:
        "Mexico's nearshoring boom has pulled manufacturing investment into the Bajío, Nuevo León and the northern border faster than the local pool of experienced automation engineers can grow. Controls, robotics and machine-vision specialists are in structural short supply, and the ones who exist are usually already committed.",
      status2:
        'The usual fallback — flying engineers in from headquarters — is slow and expensive, and it meets language and time-zone friction on the floor. A Spanish-speaking engineer who can commission the line beats a remote specialist who cannot be there when it matters, but on most projects you need both.',
      solutions: [
        { h: 'Local certified engineers', p: 'Spanish-speaking controls, robotics and vision engineers who have passed our practical AI screen and can be on your line for commissioning and support.' },
        { h: 'Cross-border hybrid', p: 'When local depth runs out, pair a local engineer with a remote or fly-in specialist — design and programming done remotely, commissioning done on site, in one project room.' },
        { h: 'Nine-language project room', p: 'Every message in the project WarRoom is translated across nine languages in real time, so a Chinese HQ, a Spanish-speaking technician and an English lead work from one thread.' },
        { h: 'Milestone escrow', p: 'Funds are held in escrow and released stage by stage as work is accepted, protecting buyer and engineer across the border.' },
      ],
      projects: ['New line commissioning', 'Retrofit & PLC migration', 'Robot cell integration', 'Vision inspection deployment'],
      ratesNote:
        'Local Mexico & Latin America rates run $35–65/hr. The table below compares regions so you can price a local-plus-cross-border mix honestly. Platform escrow fee is 15% (5% for founding customers).',
    },
    zh: {
      title: '在墨西哥建厂？把自动化工程师用人问题解决掉。',
      sub: '本地持证工程师 + 跨境远程与驻场支持——托管保障，九种语言协同。',
      status1:
        '墨西哥的近岸外包(nearshoring)热潮，把制造业投资涌向巴希奥(Bajío)、新莱昂州与北部边境，速度远快于当地经验丰富的自动化工程师池的增长。控制、机器人、机器视觉专家处于结构性短缺，现有的人手大多已被占满。',
      status2:
        '常见的退路——从总部空运工程师过去——既慢又贵，到了现场还撞上语言与时区的摩擦。一个会说西班牙语、能把产线调起来的本地工程师，胜过一个关键时刻不在场的远程专家；但大多数项目，你两者都需要。',
      solutions: [
        { h: '本地持证工程师', p: '会说西班牙语的控制、机器人、视觉工程师，通过我们的实操型 AI 筛选，能到你的产线上做调试与支持。' },
        { h: '跨境混合', p: '当本地深度不够时，让本地工程师搭配一位远程或飞抵的专家——设计与编程远程完成，调试在现场完成，全在一个项目间协同。' },
        { h: '九语项目间', p: '项目沟通间(WarRoom)里的每条消息都在九种语言间实时翻译，中国总部、西语技工、英文负责人共用同一条线索。' },
        { h: '里程碑托管', p: '资金托管，按阶段验收后逐步释放，跨境保护买方与工程师双方。' },
      ],
      projects: ['新产线调试', '旧线改造与 PLC 迁移', '机器人工作站集成', '视觉检测部署'],
      ratesNote:
        '本地墨西哥及拉美区间约 $35–65/hr。下表按地区对比，方便你为"本地 + 跨境"的组合诚实定价。平台托管费为 15%（founding 客户 5%）。',
    },
    es: {
      title: '¿Construyes una fábrica en México? Resuelve tu personal de automatización.',
      sub: 'Ingenieros locales certificados más apoyo remoto y presencial transfronterizo — protegido con depósito en garantía, coordinado en nueve idiomas.',
      status1:
        'El auge del nearshoring en México ha atraído inversión manufacturera al Bajío, Nuevo León y la frontera norte más rápido de lo que crece la reserva local de ingenieros de automatización con experiencia. Los especialistas en control, robótica y visión artificial escasean de forma estructural, y los que existen suelen estar ya comprometidos.',
      status2:
        'El recurso habitual — traer ingenieros desde la matriz — es lento y caro, y choca con la barrera de idioma y de husos horarios en planta. Un ingeniero que habla español y puede poner la línea en marcha vale más que un especialista remoto ausente en el momento clave; pero en la mayoría de los proyectos hacen falta ambos.',
      solutions: [
        { h: 'Ingenieros locales certificados', p: 'Ingenieros de control, robótica y visión que hablan español, han superado nuestra evaluación práctica con IA y pueden estar en tu línea para la puesta en marcha y el soporte.' },
        { h: 'Híbrido transfronterizo', p: 'Cuando la profundidad local se agota, combina un ingeniero local con un especialista remoto o desplazado — diseño y programación en remoto, puesta en marcha en sitio, en una sola sala de proyecto.' },
        { h: 'Sala de proyecto en nueve idiomas', p: 'Cada mensaje de la sala del proyecto (WarRoom) se traduce en tiempo real a nueve idiomas, para que la matriz china, el técnico hispanohablante y el líder en inglés trabajen en un mismo hilo.' },
        { h: 'Depósito por hitos', p: 'Los fondos quedan en garantía y se liberan por etapas conforme se acepta el trabajo, protegiendo a comprador e ingeniero a través de la frontera.' },
      ],
      projects: ['Puesta en marcha de línea nueva', 'Retrofit y migración de PLC', 'Integración de celda robótica', 'Despliegue de inspección por visión'],
      ratesNote:
        'Las tarifas locales de México y Latinoamérica rondan los $35–65/hr. La tabla siguiente compara regiones para que fijes un precio honesto de una mezcla local más transfronteriza. La comisión de depósito de la plataforma es del 15% (5% para clientes fundadores).',
    },
    vi: {
      title: 'Xây nhà máy tại Mexico? Giải quyết nhân sự tự động hóa của bạn.',
      sub: 'Kỹ sư địa phương có chứng nhận cùng hỗ trợ từ xa và có mặt tại chỗ xuyên biên giới — được bảo vệ bằng ký quỹ, phối hợp qua chín ngôn ngữ.',
      status1:
        'Làn sóng nearshoring của Mexico đã kéo đầu tư sản xuất về Bajío, Nuevo León và biên giới phía bắc nhanh hơn tốc độ tăng của đội ngũ kỹ sư tự động hóa giàu kinh nghiệm tại chỗ. Chuyên gia điều khiển, robot và thị giác máy thiếu hụt mang tính cơ cấu, và những người có sẵn thường đã bận việc.',
      status2:
        'Cách xử lý quen thuộc — điều kỹ sư từ trụ sở sang — vừa chậm vừa tốn kém, lại vấp phải rào cản ngôn ngữ và lệch múi giờ tại xưởng. Một kỹ sư nói tiếng Tây Ban Nha có thể chạy thử dây chuyền sẽ hơn một chuyên gia từ xa vắng mặt vào lúc quan trọng; nhưng phần lớn dự án cần cả hai.',
      solutions: [
        { h: 'Kỹ sư địa phương có chứng nhận', p: 'Kỹ sư điều khiển, robot và thị giác nói tiếng Tây Ban Nha, đã vượt qua bài đánh giá thực hành bằng AI của chúng tôi và có thể có mặt tại dây chuyền để chạy thử và hỗ trợ.' },
        { h: 'Kết hợp xuyên biên giới', p: 'Khi năng lực địa phương không đủ, ghép một kỹ sư địa phương với một chuyên gia từ xa hoặc được cử đến — thiết kế và lập trình từ xa, chạy thử tại chỗ, trong cùng một phòng dự án.' },
        { h: 'Phòng dự án chín ngôn ngữ', p: 'Mọi tin nhắn trong phòng dự án (WarRoom) được dịch theo thời gian thực qua chín ngôn ngữ, để trụ sở Trung Quốc, kỹ thuật viên nói tiếng Tây Ban Nha và trưởng dự án nói tiếng Anh cùng làm việc trên một luồng.' },
        { h: 'Ký quỹ theo cột mốc', p: 'Tiền được giữ trong ký quỹ và giải ngân theo từng giai đoạn khi công việc được nghiệm thu, bảo vệ cả bên mua lẫn kỹ sư qua biên giới.' },
      ],
      projects: ['Chạy thử dây chuyền mới', 'Cải tạo và di trú PLC', 'Tích hợp cell robot', 'Triển khai kiểm tra bằng thị giác'],
      ratesNote:
        'Mức giá địa phương của Mexico và Mỹ Latinh vào khoảng $35–65/hr. Bảng dưới đây so sánh các khu vực để bạn định giá trung thực cho phương án kết hợp địa phương và xuyên biên giới. Phí ký quỹ nền tảng là 15% (5% cho khách hàng sáng lập).',
    },
  },

  vietnam: {
    flag: '🇻🇳',
    langs: ['en', 'zh', 'es', 'vi'],
    rateRegionKey: 'Southeast Asia',
    en: {
      title: 'Building a factory in Vietnam? Solve your automation staffing.',
      sub: 'Local certified engineers plus cross-border remote and fly-in support — escrow-protected, coordinated across nine languages.',
      status1:
        'Vietnam has become a primary destination for electronics and light-manufacturing capacity moving out of China, but its automation-engineering pool is young. Experienced PLC, robotics and vision engineers are scarce relative to how fast new lines are being stood up, especially around Bac Ninh, Hai Phong and the southern industrial parks.',
      status2:
        'Bringing engineers from a Chinese or Korean parent company works for a burst of commissioning, but per-diem, travel and rotation costs mount, and time-zone and language gaps slow the daily back-and-forth with local technicians. The durable answer is a local core supported across borders.',
      solutions: [
        { h: 'Local certified engineers', p: 'Vietnamese-speaking controls, robotics and vision engineers who have passed our practical AI screen and can be on your line for commissioning and support.' },
        { h: 'Cross-border hybrid', p: 'Pair a local engineer with a remote or fly-in specialist — design and programming done remotely, commissioning done on site, in one project room.' },
        { h: 'Nine-language project room', p: 'Every message in the project WarRoom is translated across nine languages in real time, so a Chinese or Korean HQ, a Vietnamese technician and an English lead work from one thread.' },
        { h: 'Milestone escrow', p: 'Funds are held in escrow and released stage by stage as work is accepted, protecting buyer and engineer across the border.' },
      ],
      projects: ['New line commissioning', 'Electronics assembly automation', 'Robot cell integration', 'Vision inspection deployment'],
      ratesNote:
        'Local Southeast Asia rates run $30–55/hr. The table below compares regions so you can price a local-plus-cross-border mix honestly. Platform escrow fee is 15% (5% for founding customers).',
    },
    zh: {
      title: '在越南建厂？把自动化工程师用人问题解决掉。',
      sub: '本地持证工程师 + 跨境远程与驻场支持——托管保障，九种语言协同。',
      status1:
        '越南已成为电子与轻制造产能从中国转移的主要目的地，但它的自动化工程师池还很年轻。相对于新产线上马的速度，有经验的 PLC、机器人、视觉工程师稀缺，尤其在北宁、海防与南部工业园一带。',
      status2:
        '从中国或韩国母公司调工程师过去，能应付一波集中调试，但差旅、补贴与轮换成本会累积，时区与语言差距也会拖慢与本地技工的日常往返。可持续的答案，是一个由跨境力量支撑的本地核心团队。',
      solutions: [
        { h: '本地持证工程师', p: '会说越南语的控制、机器人、视觉工程师，通过我们的实操型 AI 筛选，能到你的产线上做调试与支持。' },
        { h: '跨境混合', p: '让本地工程师搭配一位远程或飞抵的专家——设计与编程远程完成，调试在现场完成，全在一个项目间协同。' },
        { h: '九语项目间', p: '项目沟通间(WarRoom)里的每条消息都在九种语言间实时翻译，中国或韩国总部、越南技工、英文负责人共用同一条线索。' },
        { h: '里程碑托管', p: '资金托管，按阶段验收后逐步释放，跨境保护买方与工程师双方。' },
      ],
      projects: ['新产线调试', '电子装配自动化', '机器人工作站集成', '视觉检测部署'],
      ratesNote:
        '本地东南亚区间约 $30–55/hr。下表按地区对比，方便你为"本地 + 跨境"的组合诚实定价。平台托管费为 15%（founding 客户 5%）。',
    },
    es: {
      title: '¿Construyes una fábrica en Vietnam? Resuelve tu personal de automatización.',
      sub: 'Ingenieros locales certificados más apoyo remoto y presencial transfronterizo — protegido con depósito en garantía, coordinado en nueve idiomas.',
      status1:
        'Vietnam se ha convertido en un destino principal para la capacidad de electrónica y manufactura ligera que sale de China, pero su reserva de ingeniería de automatización es joven. Los ingenieros con experiencia en PLC, robótica y visión escasean frente a la velocidad con que se montan líneas nuevas, sobre todo cerca de Bac Ninh, Hai Phong y los parques industriales del sur.',
      status2:
        'Traer ingenieros desde una matriz china o coreana sirve para un empujón de puesta en marcha, pero los costos de viáticos, viajes y rotación se acumulan, y las diferencias de husos horarios e idioma ralentizan el ir y venir diario con los técnicos locales. La respuesta duradera es un núcleo local respaldado a través de la frontera.',
      solutions: [
        { h: 'Ingenieros locales certificados', p: 'Ingenieros de control, robótica y visión que hablan vietnamita, han superado nuestra evaluación práctica con IA y pueden estar en tu línea para la puesta en marcha y el soporte.' },
        { h: 'Híbrido transfronterizo', p: 'Combina un ingeniero local con un especialista remoto o desplazado — diseño y programación en remoto, puesta en marcha en sitio, en una sola sala de proyecto.' },
        { h: 'Sala de proyecto en nueve idiomas', p: 'Cada mensaje de la sala del proyecto (WarRoom) se traduce en tiempo real a nueve idiomas, para que la matriz china o coreana, el técnico vietnamita y el líder en inglés trabajen en un mismo hilo.' },
        { h: 'Depósito por hitos', p: 'Los fondos quedan en garantía y se liberan por etapas conforme se acepta el trabajo, protegiendo a comprador e ingeniero a través de la frontera.' },
      ],
      projects: ['Puesta en marcha de línea nueva', 'Automatización de ensamble electrónico', 'Integración de celda robótica', 'Despliegue de inspección por visión'],
      ratesNote:
        'Las tarifas locales del Sudeste Asiático rondan los $30–55/hr. La tabla siguiente compara regiones para que fijes un precio honesto de una mezcla local más transfronteriza. La comisión de depósito de la plataforma es del 15% (5% para clientes fundadores).',
    },
    vi: {
      title: 'Xây nhà máy tại Việt Nam? Giải quyết nhân sự tự động hóa của bạn.',
      sub: 'Kỹ sư địa phương có chứng nhận cùng hỗ trợ từ xa và có mặt tại chỗ xuyên biên giới — được bảo vệ bằng ký quỹ, phối hợp qua chín ngôn ngữ.',
      status1:
        'Việt Nam đã trở thành điểm đến chính cho năng lực điện tử và sản xuất nhẹ dịch chuyển khỏi Trung Quốc, nhưng đội ngũ kỹ thuật tự động hóa còn non trẻ. Kỹ sư PLC, robot và thị giác giàu kinh nghiệm khan hiếm so với tốc độ dựng dây chuyền mới, nhất là quanh Bắc Ninh, Hải Phòng và các khu công nghiệp phía nam.',
      status2:
        'Điều kỹ sư từ công ty mẹ Trung Quốc hay Hàn Quốc sang có thể lo được một đợt chạy thử, nhưng chi phí công tác phí, đi lại và luân chuyển sẽ dồn lại, còn chênh lệch múi giờ và ngôn ngữ làm chậm việc trao đổi hằng ngày với kỹ thuật viên địa phương. Câu trả lời bền vững là một đội nòng cốt địa phương được hỗ trợ xuyên biên giới.',
      solutions: [
        { h: 'Kỹ sư địa phương có chứng nhận', p: 'Kỹ sư điều khiển, robot và thị giác nói tiếng Việt, đã vượt qua bài đánh giá thực hành bằng AI của chúng tôi và có thể có mặt tại dây chuyền để chạy thử và hỗ trợ.' },
        { h: 'Kết hợp xuyên biên giới', p: 'Ghép một kỹ sư địa phương với một chuyên gia từ xa hoặc được cử đến — thiết kế và lập trình từ xa, chạy thử tại chỗ, trong cùng một phòng dự án.' },
        { h: 'Phòng dự án chín ngôn ngữ', p: 'Mọi tin nhắn trong phòng dự án (WarRoom) được dịch theo thời gian thực qua chín ngôn ngữ, để trụ sở Trung Quốc hoặc Hàn Quốc, kỹ thuật viên Việt Nam và trưởng dự án nói tiếng Anh cùng làm việc trên một luồng.' },
        { h: 'Ký quỹ theo cột mốc', p: 'Tiền được giữ trong ký quỹ và giải ngân theo từng giai đoạn khi công việc được nghiệm thu, bảo vệ cả bên mua lẫn kỹ sư qua biên giới.' },
      ],
      projects: ['Chạy thử dây chuyền mới', 'Tự động hóa lắp ráp điện tử', 'Tích hợp cell robot', 'Triển khai kiểm tra bằng thị giác'],
      ratesNote:
        'Mức giá địa phương của Đông Nam Á vào khoảng $30–55/hr. Bảng dưới đây so sánh các khu vực để bạn định giá trung thực cho phương án kết hợp địa phương và xuyên biên giới. Phí ký quỹ nền tảng là 15% (5% cho khách hàng sáng lập).',
    },
  },

  thailand: {
    flag: '🇹🇭',
    langs: ['en', 'zh'],
    rateRegionKey: 'Southeast Asia',
    // 泰语不在站点九语清单，页内提示九语翻译能力（thaiNote）。
    en: {
      title: 'Building a factory in Thailand? Solve your automation staffing.',
      sub: 'Local certified engineers plus cross-border remote and fly-in support — escrow-protected, with project communication translated across nine languages.',
      status1:
        "Thailand's Eastern Economic Corridor has concentrated automotive, electronics and EV investment, and demand for automation engineers there has outrun local supply. Experienced controls, robotics and machine-vision specialists are hard to hire and slow to replace.",
      status2:
        'Rotating engineers in from a parent company covers a commissioning push but is costly to sustain, and daily coordination crosses language and time-zone lines. A local certified core, backed by cross-border remote and fly-in support, is the durable model.',
      solutions: [
        { h: 'Local certified engineers', p: 'Thai-speaking controls, robotics and vision engineers who have passed our practical AI screen and can be on your line for commissioning and support.' },
        { h: 'Cross-border hybrid', p: 'Pair a local engineer with a remote or fly-in specialist — design and programming done remotely, commissioning done on site, in one project room.' },
        { h: 'Nine-language project room', p: 'Every message in the project WarRoom is translated across nine languages in real time, so an overseas HQ, a Thai technician and an English lead work from one thread.' },
        { h: 'Milestone escrow', p: 'Funds are held in escrow and released stage by stage as work is accepted, protecting buyer and engineer across the border.' },
      ],
      projects: ['EV & automotive line commissioning', 'Electronics assembly automation', 'Robot cell integration', 'Vision inspection deployment'],
      ratesNote:
        'Local Southeast Asia rates run $30–55/hr. The table below compares regions so you can price a local-plus-cross-border mix honestly. Platform escrow fee is 15% (5% for founding customers).',
      thaiNote:
        'Thai is not yet one of our nine in-platform interface languages, but the project WarRoom translates communication across nine languages in real time, and local Thai-speaking engineers bridge the floor.',
    },
    zh: {
      title: '在泰国建厂？把自动化工程师用人问题解决掉。',
      sub: '本地持证工程师 + 跨境远程与驻场支持——托管保障，项目沟通可在九种语言间翻译。',
      status1:
        '泰国的东部经济走廊(EEC)聚集了汽车、电子与电动车投资，当地对自动化工程师的需求已超过本地供给。有经验的控制、机器人、机器视觉专家难招，且替换周期长。',
      status2:
        '从母公司轮换工程师过去，能覆盖一波集中调试，但长期维持成本高，日常协同又要跨语言与时区。一个由跨境远程与驻场支持撑起的本地持证核心团队，才是可持续的模式。',
      solutions: [
        { h: '本地持证工程师', p: '会说泰语的控制、机器人、视觉工程师，通过我们的实操型 AI 筛选，能到你的产线上做调试与支持。' },
        { h: '跨境混合', p: '让本地工程师搭配一位远程或飞抵的专家——设计与编程远程完成，调试在现场完成，全在一个项目间协同。' },
        { h: '九语项目间', p: '项目沟通间(WarRoom)里的每条消息都在九种语言间实时翻译，海外总部、泰国技工、英文负责人共用同一条线索。' },
        { h: '里程碑托管', p: '资金托管，按阶段验收后逐步释放，跨境保护买方与工程师双方。' },
      ],
      projects: ['电动车与汽车产线调试', '电子装配自动化', '机器人工作站集成', '视觉检测部署'],
      ratesNote:
        '本地东南亚区间约 $30–55/hr。下表按地区对比，方便你为"本地 + 跨境"的组合诚实定价。平台托管费为 15%（founding 客户 5%）。',
      thaiNote:
        '泰语暂不在平台九种界面语言之列，但项目沟通间(WarRoom)可在九种语言间实时翻译，本地泰语工程师负责打通现场。',
    },
  },
};

const GUIDE_SLUGS = Object.keys(GUIDES);

// ── 对外辅助 ─────────────────────────────────────────────────────────────

// getStaticPaths 用：枚举三个地域。
export function getGuidePaths() {
  return GUIDE_SLUGS.map((region) => ({ params: { region } }));
}

// 地域是否存在（getStaticProps 校验用）。
export function hasGuide(region) {
  return Boolean(GUIDES[region]);
}

// 拼装页面所需数据：元信息 + 本地区间 + 内容。
export function getGuide(region) {
  const g = GUIDES[region];
  if (!g) return null;
  const local = REGIONS.find((r) => r.region.en === g.rateRegionKey);
  return {
    region,
    flag: g.flag,
    langs: g.langs,
    localRegion: local ? local.region : { en: g.rateRegionKey, zh: g.rateRegionKey },
    localBand: local ? local.rate : '',
    content: {
      en: g.en,
      zh: g.zh,
      es: g.es || null,
      vi: g.vi || null,
    },
  };
}
