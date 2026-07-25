// 方向 × 行业 垂直页矩阵的内容数据（数据驱动，页面 pages/hire/[track]/[industry].jsx 消费）。
//
// 设计约定：
// - 费率区间 REGIONS 与 pages/hire/[track].jsx 的 REGIONS 及 /rates 同源同口径，改一处两处都要同步。
// - 每个方向（plc/robotics/vision）的技能标签与认证级别（L1-L3）与 /hire/[track] 保持一致，
//   仅在行业维度补充“行业专属技能”与“行业痛点段”，做到内容有行业真实性、不写空话。
// - 组合枚举自 MATRIX（12 个组合），getStaticPaths 从这里取。
// - electrical 方向只有 TRACKS 元数据（供 getTrackMeta 给职业页/索引页复用），不进 MATRIX：
//   电气方向的行业差异化最弱，写不出"行业真实"的组合内容就不硬凑（首个真正差异化的组合写出来再进）。

// ── 各地区费率区间（与 /hire/[track] REGIONS 及 /rates 同源）──────────────
export const REGIONS = [
  { region: { en: 'North America', zh: '北美' }, rate: '$75–140/hr' },
  { region: { en: 'Western Europe', zh: '西欧' }, rate: '$70–120/hr' },
  { region: { en: 'Eastern Europe', zh: '东欧' }, rate: '$40–75/hr' },
  { region: { en: 'Mexico & Latin America', zh: '墨西哥及拉美' }, rate: '$35–65/hr' },
  { region: { en: 'China', zh: '中国' }, rate: '$35–70/hr' },
  { region: { en: 'Southeast Asia', zh: '东南亚' }, rate: '$30–55/hr' },
  { region: { en: 'India & South Asia', zh: '印度及南亚' }, rate: '$25–50/hr' },
];

// ── 费率说明文案（单一来源，供 4 个消费页统一 import）──────────────────────
// 诚实修复（IA review #3/#14）：REGIONS 是手工维护的静态区间，不是"来自活跃工程师
// 档案、实时更新"的数据——原文案在 4 个页面共 8 处编造了这个溯源。改为诚实地锚定到
// 真正实时的 /rates 基准页，其余内容（中段/现场溢价/托管费率）保持不变。
export const RATES_NOTE = {
  en: 'Indicative blended hourly-rate ranges by region, aligned with our live /rates benchmarks. Development work sits toward the middle of each range; on-site commissioning carries a premium. Platform escrow fee is 15% (5% for founding customers).',
  zh: '各地区综合时薪参考区间，与 /rates 实时基准同口径。开发类工作位于各区间中段，现场调试有溢价。平台托管费为 15%（founding 客户 5%）。',
  es: 'Rangos indicativos de tarifa por hora combinada por región, alineados con nuestros índices de referencia en vivo en /rates. El trabajo de desarrollo se ubica hacia la mitad de cada rango; la puesta en marcha en sitio tiene un recargo. La comisión de depósito en garantía de la plataforma es del 15% (5% para clientes fundadores).',
  vi: 'Khoảng giá theo giờ tổng hợp mang tính tham khảo theo khu vực, đồng bộ với các chỉ số /rates cập nhật trực tiếp của chúng tôi. Công việc phát triển thường nằm ở giữa mỗi khoảng giá; công việc chạy thử tại chỗ có phụ phí. Phí ký quỹ nền tảng là 15% (5% cho khách hàng sáng lập).',
  hi: 'क्षेत्र के अनुसार सांकेतिक मिश्रित प्रति घंटा दर सीमाएं, हमारे लाइव /rates बेंचमार्क के अनुरूप। डेवलपमेंट का काम आमतौर पर हर सीमा के बीच में आता है; ऑन-साइट कमीशनिंग पर प्रीमियम लगता है। प्लेटफ़ॉर्म एस्क्रो शुल्क 15% है (संस्थापक ग्राहकों के लिए 5%)।',
  fr: 'Fourchettes indicatives de tarif horaire moyen par région, alignées sur nos repères /rates en temps réel. Le travail de développement se situe plutôt au milieu de chaque fourchette ; la mise en service sur site comporte une majoration. Les frais de séquestre de la plateforme sont de 15% (5% pour les clients fondateurs).',
  de: 'Indikative, gemischte Stundensatzspannen nach Region, abgestimmt auf unsere aktuellen /rates-Benchmarks. Entwicklungsarbeiten liegen eher in der Mitte der jeweiligen Spanne; die Inbetriebnahme vor Ort wird mit einem Aufschlag berechnet. Die Treuhandgebühr der Plattform beträgt 15% (5% für Gründungskunden).',
  ja: '地域別の目安となる複合時間単価レンジで、当社のリアルタイム /rates ベンチマークに準拠しています。開発作業は各レンジの中央付近に位置し、現場での試運転には割増料金がかかります。プラットフォームのエスクロー手数料は15%です（ファウンディングクライアントは5%）。',
  ko: '지역별 참고용 혼합 시간당 요율 범위로, 당사의 실시간 /rates 벤치마크와 일치합니다. 개발 작업은 각 범위의 중간대에 위치하며, 현장 시운전에는 할증이 붙습니다. 플랫폼 에스크로 수수료는 15%입니다(파운딩 고객은 5%).',
};

// ── 方向元数据：与 /hire/[track] 同口径（技能 + 认证级别描述）───────────────
// 注：这里刻意与 pages/hire/[track].jsx 的 TRACKS 保持同源同文，是母页与矩阵页的一致性来源。
const TRACKS = {
  plc: {
    label: { en: 'PLC', zh: 'PLC', es: 'PLC', vi: 'PLC', hi: 'PLC', fr: 'PLC', de: 'PLC', ja: 'PLC', ko: 'PLC' },
    kicker: {
      en: 'PLC & Controls', zh: 'PLC 与控制', es: 'PLC y control', vi: 'PLC & điều khiển',
      hi: 'PLC और कंट्रोल', fr: 'PLC et contrôle-commande', de: 'PLC und Steuerungstechnik',
      ja: 'PLCと制御', ko: 'PLC 및 제어',
    },
    serviceBase: 'PLC Programming Talent',
    skills: ['Siemens TIA Portal', 'Rockwell Studio 5000', 'Ladder / ST', 'Mitsubishi', 'Beckhoff TwinCAT', 'Safety PLC'],
    levels: {
      en: {
        l1: 'Solid fundamentals — executes well-specified ladder/ST work under some guidance.',
        l2: 'Owns a scope end to end, makes sound design decisions, delivers with minimal oversight.',
        l3: 'Architects control systems, handles difficult commissioning and safety, leads technically.',
      },
      zh: {
        l1: '基础扎实——在一定指导下完成范围明确的 ladder/ST 工作。',
        l2: '能端到端负责一个范围，做出合理设计决策，少量监督即可交付。',
        l3: '能架构控制系统，处理疑难调试与安全，技术上带队。',
      },
      es: {
        l1: 'Fundamentos sólidos: ejecuta trabajo de ladder/ST bien especificado con cierta orientación.',
        l2: 'Se hace cargo de un alcance de principio a fin, toma decisiones de diseño acertadas y entrega con supervisión mínima.',
        l3: 'Diseña arquitecturas de sistemas de control, maneja puestas en marcha difíciles y de seguridad, y lidera técnicamente.',
      },
      vi: {
        l1: 'Nền tảng vững — thực hiện tốt công việc ladder/ST được xác định rõ dưới một số hướng dẫn.',
        l2: 'Làm chủ một phạm vi công việc từ đầu đến cuối, đưa ra quyết định thiết kế hợp lý, bàn giao với sự giám sát tối thiểu.',
        l3: 'Kiến trúc hệ thống điều khiển, xử lý các ca chạy thử và an toàn khó, dẫn dắt về mặt kỹ thuật.',
      },
      hi: {
        l1: 'मज़बूत बुनियाद — कुछ मार्गदर्शन में स्पष्ट रूप से तय किया गया ladder/ST काम करता है।',
        l2: 'एक स्कोप को शुरू से अंत तक खुद संभालता है, सही डिज़ाइन निर्णय लेता है, न्यूनतम निगरानी में डिलीवर करता है।',
        l3: 'कंट्रोल सिस्टम को architect करता है, कठिन कमीशनिंग और सुरक्षा संभालता है, तकनीकी रूप से नेतृत्व करता है।',
      },
      fr: {
        l1: 'Bases solides — exécute un travail ladder/ST bien spécifié sous une certaine supervision.',
        l2: 'Prend en charge un périmètre de bout en bout, fait des choix de conception judicieux, livre avec un encadrement minimal.',
        l3: 'Conçoit l’architecture de systèmes de contrôle-commande, gère les mises en service difficiles et la sécurité, dirige techniquement.',
      },
      de: {
        l1: 'Solide Grundlagen — führt klar spezifizierte Ladder-/ST-Arbeiten unter gewisser Anleitung aus.',
        l2: 'Verantwortet einen Aufgabenbereich von Anfang bis Ende eigenständig, trifft fundierte Designentscheidungen, liefert mit minimaler Aufsicht.',
        l3: 'Entwirft Steuerungssystemarchitekturen, meistert anspruchsvolle Inbetriebnahmen und Sicherheitsthemen, führt fachlich.',
      },
      ja: {
        l1: '基礎がしっかりしており、ある程度の指導のもとで仕様が明確なラダー/ST作業を実行できます。',
        l2: '担当範囲を最初から最後まで一人で担い、妥当な設計判断を下し、最小限の監督で納品できます。',
        l3: '制御システムを設計し、難易度の高い試運転や安全対応を担当し、技術面でチームを牽引します。',
      },
      ko: {
        l1: '탄탄한 기본기 — 어느 정도의 지도 아래 명확하게 규정된 래더/ST 작업을 수행합니다.',
        l2: '범위를 처음부터 끝까지 스스로 책임지고, 합리적인 설계 결정을 내리며, 최소한의 감독으로 결과물을 전달합니다.',
        l3: '제어 시스템을 설계하고, 까다로운 시운전과 안전 문제를 처리하며, 기술적으로 팀을 이끕니다.',
      },
    },
  },
  robotics: {
    label: {
      en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot công nghiệp', hi: 'रोबोटिक्स',
      fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스',
    },
    kicker: {
      en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot công nghiệp', hi: 'रोबोटिक्स',
      fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스',
    },
    serviceBase: 'Industrial Robotics Talent',
    skills: ['Fanuc', 'KUKA', 'ABB', 'Yaskawa', 'Cell commissioning', 'Path optimization'],
    levels: {
      en: {
        l1: 'Executes taught programs and well-defined cell work with guidance.',
        l2: 'Programs and commissions a cell independently, integrates PLC and peripherals.',
        l3: 'Designs complex cells, tunes cycle time, leads difficult multi-robot commissioning.',
      },
      zh: {
        l1: '在指导下执行示教程序与范围明确的工作站工作。',
        l2: '独立完成工作站编程与调试，集成 PLC 与外围设备。',
        l3: '设计复杂工作站，优化节拍，带队完成疑难的多机联调。',
      },
      es: {
        l1: 'Ejecuta programas enseñados (teach) y trabajo de celda bien definido con orientación.',
        l2: 'Programa y pone en marcha una celda de forma independiente, integra PLC y periféricos.',
        l3: 'Diseña celdas complejas, ajusta el tiempo de ciclo, lidera puestas en marcha difíciles con múltiples robots.',
      },
      vi: {
        l1: 'Thực hiện các chương trình đã được dạy sẵn và công việc tế bào được xác định rõ dưới sự hướng dẫn.',
        l2: 'Lập trình và chạy thử một tế bào độc lập, tích hợp PLC và các thiết bị ngoại vi.',
        l3: 'Thiết kế các tế bào phức tạp, tối ưu thời gian chu kỳ, dẫn dắt các ca chạy thử đa robot khó.',
      },
      hi: {
        l1: 'मार्गदर्शन में सिखाए गए (taught) प्रोग्राम और स्पष्ट रूप से परिभाषित सेल कार्य निष्पादित करता है।',
        l2: 'स्वतंत्र रूप से एक सेल को प्रोग्राम और कमीशन करता है, PLC और पेरिफेरल्स को इंटीग्रेट करता है।',
        l3: 'जटिल सेल डिज़ाइन करता है, साइकल टाइम ट्यून करता है, कठिन मल्टी-रोबोट कमीशनिंग का नेतृत्व करता है।',
      },
      fr: {
        l1: 'Exécute des programmes appris (teach) et des tâches de cellule bien définies sous supervision.',
        l2: 'Programme et met en service une cellule de manière autonome, intègre l’automate et les périphériques.',
        l3: 'Conçoit des cellules complexes, ajuste le temps de cycle, dirige des mises en service multi-robots difficiles.',
      },
      de: {
        l1: 'Führt eingelernte (Teach-in-)Programme und klar definierte Zellenarbeiten unter Anleitung aus.',
        l2: 'Programmiert und nimmt eine Zelle eigenständig in Betrieb, integriert PLC und Peripherie.',
        l3: 'Entwirft komplexe Zellen, optimiert die Taktzeit, führt anspruchsvolle Mehrroboter-Inbetriebnahmen.',
      },
      ja: {
        l1: '指導のもとでティーチング済みプログラムと定義の明確なセル作業を実行できます。',
        l2: 'セルを独立してプログラム・試運転し、PLCと周辺機器を統合できます。',
        l3: '複雑なセルを設計し、サイクルタイムを調整し、難易度の高いマルチロボット試運転を主導します。',
      },
      ko: {
        l1: '지도 아래 티칭된 프로그램과 명확히 정의된 셀 작업을 수행합니다.',
        l2: '셀을 독립적으로 프로그래밍하고 시운전하며, PLC와 주변기기를 통합합니다.',
        l3: '복잡한 셀을 설계하고, 사이클 타임을 조정하며, 까다로운 다중 로봇 시운전을 이끕니다.',
      },
    },
  },
  vision: {
    label: {
      en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy',
      hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전',
    },
    kicker: {
      en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy',
      hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전',
    },
    serviceBase: 'Machine Vision Talent',
    skills: ['Cognex', 'Keyence', 'Halcon', 'Lighting & optics', 'Calibration', 'Inspection & guidance'],
    levels: {
      en: {
        l1: 'Configures well-defined inspections and sets up standard lighting.',
        l2: 'Designs robust inspection/guidance, handles calibration and variation independently.',
        l3: 'Architects demanding vision systems, solves difficult lighting and accuracy problems.',
      },
      zh: {
        l1: '配置范围明确的检测，搭建标准打光。',
        l2: '设计稳健的检测/引导，独立处理标定与变化。',
        l3: '架构高要求的视觉系统，解决疑难的打光与精度问题。',
      },
      es: {
        l1: 'Configura inspecciones bien definidas y prepara la iluminación estándar.',
        l2: 'Diseña inspección/guiado robustos, maneja la calibración y la variación de forma independiente.',
        l3: 'Diseña arquitecturas de sistemas de visión exigentes, resuelve problemas difíciles de iluminación y precisión.',
      },
      vi: {
        l1: 'Cấu hình các phép kiểm tra được xác định rõ và thiết lập ánh sáng tiêu chuẩn.',
        l2: 'Thiết kế hệ thống kiểm tra/dẫn hướng bền vững, tự xử lý hiệu chuẩn và biến thiên.',
        l3: 'Kiến trúc các hệ thống thị giác đòi hỏi cao, giải quyết các bài toán khó về ánh sáng và độ chính xác.',
      },
      hi: {
        l1: 'स्पष्ट रूप से परिभाषित इंस्पेक्शन कॉन्फ़िगर करता है और मानक लाइटिंग सेट करता है।',
        l2: 'मज़बूत इंस्पेक्शन/गाइडेंस डिज़ाइन करता है, कैलिब्रेशन और वेरिएशन को स्वतंत्र रूप से संभालता है।',
        l3: 'मांग वाले विज़न सिस्टम को architect करता है, कठिन लाइटिंग और सटीकता की समस्याएं सुलझाता है।',
      },
      fr: {
        l1: 'Configure des contrôles bien définis et met en place l’éclairage standard.',
        l2: 'Conçoit une inspection/un guidage robustes, gère le calibrage et la variation de manière autonome.',
        l3: 'Conçoit l’architecture de systèmes de vision exigeants, résout des problèmes difficiles d’éclairage et de précision.',
      },
      de: {
        l1: 'Konfiguriert klar definierte Prüfungen und richtet die Standardbeleuchtung ein.',
        l2: 'Entwirft robuste Prüf-/Führungslösungen, übernimmt Kalibrierung und Varianz eigenständig.',
        l3: 'Entwirft anspruchsvolle Bildverarbeitungssysteme, löst schwierige Beleuchtungs- und Genauigkeitsprobleme.',
      },
      ja: {
        l1: '定義の明確な検査を設定し、標準的な照明をセットアップできます。',
        l2: '堅牢な検査・ガイダンスを設計し、キャリブレーションとばらつきを独立して扱えます。',
        l3: '要求水準の高いビジョンシステムを設計し、難しい照明・精度の課題を解決します。',
      },
      ko: {
        l1: '명확히 정의된 검사를 구성하고 표준 조명을 설정합니다.',
        l2: '견고한 검사/가이던스를 설계하고, 캘리브레이션과 변동을 독립적으로 처리합니다.',
        l3: '까다로운 비전 시스템을 설계하고, 어려운 조명 및 정확도 문제를 해결합니다.',
      },
    },
  },
  // electrical：只提供方向元数据（getTrackMeta 消费，职业页 /occupations/electrical-engineer 与
  // /hire 索引页复用），刻意不进 MATRIX——见文件头注释。文案与 pages/hire/[track].jsx 同源同文。
  electrical: {
    label: {
      en: 'Electrical', zh: '电气', es: 'Eléctrico', vi: 'Điện', hi: 'इलेक्ट्रिकल',
      fr: 'Électricité', de: 'Elektrotechnik', ja: '電気', ko: '전기',
    },
    kicker: {
      en: 'Electrical', zh: '电气', es: 'Eléctrico', vi: 'Điện', hi: 'इलेक्ट्रिकल',
      fr: 'Électricité', de: 'Elektrotechnik', ja: '電気', ko: '전기',
    },
    serviceBase: 'Industrial Electrical Engineering Talent',
    skills: ['Panel design', 'EPLAN', 'VFD / drives', 'Schematic capture', 'UL / IEC', 'Power distribution'],
    levels: {
      en: {
        l1: 'Produces standard panel layouts and schematics under guidance.',
        l2: 'Designs compliant panels and drive systems independently, owns the electrical scope.',
        l3: 'Architects power distribution and complex electrical systems, handles code and safety.',
      },
      zh: {
        l1: '在指导下完成标准电柜布局与图纸。',
        l2: '独立设计合规的电柜与驱动系统，负责电气范围。',
        l3: '架构配电与复杂电气系统，处理规范与安全。',
      },
      es: {
        l1: 'Elabora distribuciones de tableros y planos estándar bajo orientación.',
        l2: 'Diseña tableros y sistemas de variadores conformes de forma independiente, se hace cargo del alcance eléctrico.',
        l3: 'Diseña arquitecturas de distribución eléctrica y sistemas eléctricos complejos, maneja normativa y seguridad.',
      },
      vi: {
        l1: 'Tạo ra các bố trí tủ điện và sơ đồ tiêu chuẩn dưới sự hướng dẫn.',
        l2: 'Tự thiết kế tủ điện và hệ thống biến tần tuân thủ quy chuẩn, làm chủ phạm vi công việc điện.',
        l3: 'Kiến trúc hệ thống phân phối điện và hệ thống điện phức tạp, xử lý quy chuẩn và an toàn.',
      },
      hi: {
        l1: 'मार्गदर्शन में मानक पैनल लेआउट और स्कीमैटिक्स तैयार करता है।',
        l2: 'स्वतंत्र रूप से अनुपालन वाले पैनल और ड्राइव सिस्टम डिज़ाइन करता है, इलेक्ट्रिकल स्कोप का मालिक होता है।',
        l3: 'पावर डिस्ट्रीब्यूशन और जटिल इलेक्ट्रिकल सिस्टम को architect करता है, कोड और सुरक्षा संभालता है।',
      },
      fr: {
        l1: 'Réalise des implantations d’armoires et des schémas standard sous supervision.',
        l2: 'Conçoit de manière autonome des armoires et systèmes de variateurs conformes, prend en charge le périmètre électrique.',
        l3: 'Conçoit l’architecture de la distribution électrique et de systèmes électriques complexes, gère les normes et la sécurité.',
      },
      de: {
        l1: 'Erstellt unter Anleitung Standard-Schaltschranklayouts und Schaltpläne.',
        l2: 'Entwirft eigenständig normkonforme Schaltschränke und Antriebssysteme, verantwortet den elektrischen Aufgabenbereich.',
        l3: 'Entwirft die Architektur der Energieverteilung und komplexer elektrischer Systeme, handhabt Normen und Sicherheit.',
      },
      ja: {
        l1: '指導のもとで標準的な盤レイアウトと回路図を作成できます。',
        l2: '規格に適合した制御盤と駆動システムを独立して設計し、電気領域を担当します。',
        l3: '配電と複雑な電気システムを設計し、規格と安全対応を担う。',
      },
      ko: {
        l1: '지도 아래 표준 패널 배치도와 도면을 작성합니다.',
        l2: '규정을 준수하는 패널과 구동 시스템을 독립적으로 설계하고, 전기 범위를 책임집니다.',
        l3: '배전 및 복잡한 전기 시스템을 설계하고, 규격과 안전을 처리합니다.',
      },
    },
  },
};

// ── 行业显示名（内链标签、serviceType 拼装用）────────────────────────────
const INDUSTRIES = {
  automotive: { en: 'Automotive Manufacturing', zh: '汽车制造', short: { en: 'Automotive', zh: '汽车' } },
  semiconductor: { en: 'Semiconductor Fabs', zh: '半导体', short: { en: 'Semiconductor', zh: '半导体' } },
  'food-beverage': { en: 'Food & Beverage', zh: '食品饮料', short: { en: 'Food & Beverage', zh: '食品饮料' } },
  pharma: { en: 'Pharmaceutical Manufacturing', zh: '制药', short: { en: 'Pharma', zh: '制药' } },
  '3c-electronics': { en: '3C Electronics', zh: '3C 电子', short: { en: '3C Electronics', zh: '3C 电子' } },
  packaging: { en: 'Packaging', zh: '包装', short: { en: 'Packaging', zh: '包装' } },
};

// ── 12 个方向×行业组合（键 = `${track}/${industry}`）─────────────────────
// 每个组合的行业痛点段必须行业具体（GMP/节拍/洁净室这类真词），拒绝可互换到任意行业的空话。
const MATRIX = {
  'plc/automotive': {
    track: 'plc',
    industry: 'automotive',
    industrySkills: ['Takt-time logic', 'Safety PLC (PLe / SIL)', 'Line changeover', 'Profinet / EtherNet-IP', 'Andon & traceability'],
    en: {
      title: 'Hire Certified PLC Programmers for Automotive Manufacturing',
      sub: 'Takt-critical, safety-rated controls for body-in-white and powertrain lines — Siemens and Rockwell programmers verified on real automotive commissioning.',
      pain1:
        'Automotive lines live and die by takt time. A PLC program that merely runs but cannot hold cycle time, or that stalls on a changeover between models, quietly costs you units every shift. Hiring for this floor means finding programmers who write logic that holds the beat — and who treat a body-in-white or powertrain line as a safety system first.',
      pain2:
        'Safety PLC work here is not optional: light curtains, robot interlocks and E-stop zones must be designed to the required performance level (PLe / SIL) and documented so an auditor can follow them. We screen for programmers who have commissioned safety-rated logic on Siemens or Rockwell and can prove it, not just claim it.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 汽车制造',
      sub: '面向车身(BIW)与动力总成产线的节拍关键、安全等级控制——Siemens、Rockwell 程序员经真实汽车调试验证。',
      pain1:
        '汽车产线的成败系于节拍。一个只是"能跑"却守不住节拍、或在换型时卡壳的 PLC 程序，每个班次都在悄悄吃掉你的产量。为这条线招人，意味着要找到能写出"踩得住节拍"逻辑的程序员——并且把车身(BIW)或动力总成产线首先当作一套安全系统来对待。',
      pain2:
        '这里的安全 PLC 不是可选项：光幕、机器人互锁与急停区必须按所需性能等级(PLe / SIL)设计，并写成审核员能顺下来的文档。我们筛选的是在 Siemens 或 Rockwell 上真正调试过安全等级逻辑、并且能拿出证据的程序员，而不是只在简历上写写。',
    },
    es: {
      title: 'Contrate programadores de PLC certificados para manufactura automotriz',
      sub: 'Controles críticos por tiempo de takt y certificados en seguridad para líneas de carrocería en blanco y de tren motriz — programadores de Siemens y Rockwell verificados en puestas en marcha automotrices reales.',
      pain1:
        'Las líneas automotrices viven y mueren por el tiempo de takt. Un programa de PLC que simplemente funciona pero no sostiene el ciclo, o que se atasca en un cambio entre modelos, le cuesta unidades en silencio cada turno. Contratar para este piso significa encontrar programadores que escriben lógica que sostiene el ritmo, y que tratan una línea de carrocería en blanco o de tren motriz ante todo como un sistema de seguridad.',
      pain2:
        'El trabajo de PLC de seguridad aquí no es opcional: las cortinas de luz, los enclavamientos de robots y las zonas de paro de emergencia deben diseñarse al nivel de desempeño requerido (PLe / SIL) y documentarse para que un auditor pueda seguirlos. Filtramos programadores que han puesto en marcha lógica de seguridad certificada en Siemens o Rockwell y pueden demostrarlo, no solo afirmarlo.',
    },
    vi: {
      title: 'Thuê lập trình viên PLC có chứng chỉ cho ngành sản xuất ô tô',
      sub: 'Điều khiển an toàn, gắn chặt với thời gian takt cho dây chuyền thân xe (BIW) và động cơ — lập trình viên Siemens và Rockwell đã được xác minh qua các đợt chạy thử ô tô thực tế.',
      pain1:
        'Dây chuyền ô tô sống chết theo thời gian takt. Một chương trình PLC chỉ "chạy được" nhưng không giữ được nhịp chu kỳ, hoặc bị kẹt khi đổi model, âm thầm khiến bạn mất sản lượng mỗi ca. Tuyển người cho khu vực này nghĩa là tìm lập trình viên viết được logic giữ đúng nhịp — và luôn coi dây chuyền thân xe hay động cơ trước hết là một hệ thống an toàn.',
      pain2:
        'PLC an toàn ở đây không phải là tùy chọn: rèm sáng, khóa liên động robot và vùng dừng khẩn cấp phải được thiết kế theo đúng mức hiệu năng yêu cầu (PLe / SIL) và ghi thành tài liệu để kiểm toán viên có thể theo dõi được. Chúng tôi sàng lọc những lập trình viên đã thực sự chạy thử logic an toàn trên Siemens hoặc Rockwell và có thể chứng minh điều đó, chứ không chỉ ghi trong hồ sơ.',
    },
    hi: {
      title: 'ऑटोमोटिव मैन्युफैक्चरिंग के लिए प्रमाणित PLC प्रोग्रामर हायर करें',
      sub: 'बॉडी-इन-व्हाइट और पावरट्रेन लाइनों के लिए टैक्ट-क्रिटिकल, सेफ्टी-रेटेड कंट्रोल्स — Siemens और Rockwell प्रोग्रामर, वास्तविक ऑटोमोटिव कमीशनिंग पर सत्यापित।',
      pain1:
        'ऑटोमोटिव लाइनें टैक्ट टाइम पर ही जीती-मरती हैं। एक PLC प्रोग्राम जो सिर्फ चलता है पर साइकल टाइम नहीं थाम पाता, या मॉडल बदलते समय अटक जाता है, हर शिफ्ट में चुपचाप आपकी यूनिट्स की लागत बढ़ाता रहता है। इस फ्लोर के लिए हायरिंग का मतलब है ऐसे प्रोग्रामर ढूंढना जो लय थामने वाला लॉजिक लिखें — और बॉडी-इन-व्हाइट या पावरट्रेन लाइन को सबसे पहले एक सेफ्टी सिस्टम मानें।',
      pain2:
        'यहां सेफ्टी PLC काम वैकल्पिक नहीं है: लाइट कर्टेन, रोबोट इंटरलॉक और E-stop ज़ोन को आवश्यक परफॉर्मेंस लेवल (PLe / SIL) पर डिज़ाइन किया जाना चाहिए और इस तरह डॉक्यूमेंट किया जाना चाहिए कि कोई ऑडिटर उसे फॉलो कर सके। हम ऐसे प्रोग्रामर छांटते हैं जिन्होंने Siemens या Rockwell पर सेफ्टी-रेटेड लॉजिक वाकई कमीशन किया है और उसे साबित कर सकते हैं, सिर्फ दावा नहीं करते।',
    },
    fr: {
      title: 'Recrutez des programmeurs PLC certifiés pour l’industrie automobile',
      sub: 'Contrôle-commande critique pour le temps de takt et à sécurité certifiée, sur les lignes de caisse en blanc et de groupe motopropulseur — programmeurs Siemens et Rockwell vérifiés sur de véritables mises en service automobiles.',
      pain1:
        'Sur une ligne automobile, tout se joue au temps de takt. Un programme PLC qui fonctionne mais ne tient pas le temps de cycle, ou qui cale lors d’un changement de modèle, vous coûte silencieusement des unités à chaque équipe. Recruter pour cet atelier, c’est trouver des programmeurs qui écrivent une logique qui tient la cadence — et qui traitent une ligne de caisse en blanc ou de groupe motopropulseur d’abord comme un système de sécurité.',
      pain2:
        'Le travail PLC de sécurité n’est pas optionnel ici : barrières immatérielles, verrouillages robot et zones d’arrêt d’urgence doivent être conçus au niveau de performance requis (PLe / SIL) et documentés pour qu’un auditeur puisse les suivre. Nous sélectionnons des programmeurs ayant réellement mis en service une logique de sécurité certifiée sur Siemens ou Rockwell, preuves à l’appui, pas seulement une mention sur un CV.',
    },
    de: {
      title: 'Zertifizierte PLC-Programmierer für die Automobilfertigung engagieren',
      sub: 'Taktkritische, sicherheitszertifizierte Steuerungen für Rohbau- und Antriebsstranglinien — Siemens- und Rockwell-Programmierer, verifiziert an echten Automobil-Inbetriebnahmen.',
      pain1:
        'Automobillinien leben und sterben mit der Taktzeit. Ein PLC-Programm, das zwar läuft, aber den Takt nicht hält, oder das bei einem Modellwechsel stockt, kostet Sie still und leise Stückzahlen in jeder Schicht. Für diese Halle zu rekrutieren heißt, Programmierer zu finden, die Logik schreiben, die den Takt hält — und die eine Rohbau- oder Antriebsstranglinie zuerst als Sicherheitssystem behandeln.',
      pain2:
        'Sicherheits-PLC-Arbeit ist hier nicht optional: Lichtvorhänge, Roboter-Verriegelungen und Not-Halt-Zonen müssen auf dem erforderlichen Performance Level (PLe / SIL) ausgelegt und so dokumentiert werden, dass ein Auditor sie nachvollziehen kann. Wir prüfen Programmierer, die sicherheitszertifizierte Logik auf Siemens oder Rockwell tatsächlich in Betrieb genommen haben und das belegen können — nicht nur behaupten.',
    },
    ja: {
      title: '自動車製造向けの認定PLCプログラマーを採用',
      sub: 'ボディインホワイトとパワートレインラインのためのタクトクリティカルかつ安全等級の制御——実際の自動車試運転で検証されたSiemens・Rockwellプログラマー。',
      pain1:
        '自動車ラインはタクトタイムで生死が決まります。ただ「動く」だけでサイクルタイムを維持できない、あるいは機種切替で止まってしまうPLCプログラムは、シフトごとに静かに生産台数を蝕んでいきます。この現場の採用とは、拍を守るロジックを書けるプログラマーを見つけることであり、ボディインホワイトやパワートレインラインを何よりもまず安全システムとして扱う人材を見つけることです。',
      pain2:
        'ここでの安全PLC対応はオプションではありません。ライトカーテン、ロボットのインターロック、非常停止ゾーンは要求される性能レベル（PLe / SIL）で設計し、監査員が追跡できる形で文書化しなければなりません。当社はSiemensまたはRockwellで安全等級ロジックを実際に試運転し、それを証明できるプログラマーを審査します——履歴書に書いてあるだけでは通りません。',
    },
    ko: {
      title: '자동차 제조를 위한 인증 PLC 프로그래머 채용',
      sub: '차체(BIW)와 파워트레인 라인을 위한 택트 크리티컬, 안전 등급 제어 — 실제 자동차 시운전에서 검증된 Siemens 및 Rockwell 프로그래머.',
      pain1:
        '자동차 라인은 택트타임에 사활을 겁니다. 그저 "돌아가기만" 할 뿐 사이클타임을 지키지 못하거나 모델 전환 시 멈춰버리는 PLC 프로그램은 매 교대마다 조용히 생산량을 갉아먹습니다. 이 현장을 위한 채용이란 박자를 지키는 로직을 작성할 수 있는 프로그래머를 찾는 것이며, 차체나 파워트레인 라인을 무엇보다 먼저 안전 시스템으로 다루는 사람을 찾는 것입니다.',
      pain2:
        '여기서 세이프티 PLC 작업은 선택 사항이 아닙니다. 라이트커튼, 로봇 인터록, 비상정지 구역은 요구되는 성능 레벨(PLe / SIL)에 맞춰 설계되고, 감사자가 따라갈 수 있도록 문서화되어야 합니다. 우리는 Siemens나 Rockwell에서 안전 등급 로직을 실제로 시운전하고 이를 증명할 수 있는 프로그래머를 심사합니다 — 이력서에 적혀 있는 것만으로는 통과되지 않습니다.',
    },
  },
  'plc/semiconductor': {
    track: 'plc',
    industry: 'semiconductor',
    industrySkills: ['Cleanroom discipline', 'SECS/GEM interface', 'Gas & chemical interlocks', 'Minimal-downtime commissioning', 'Tool uptime'],
    en: {
      title: 'Hire Certified PLC Programmers for Semiconductor Fabs',
      sub: 'Cleanroom-grade equipment controls with SECS/GEM and gas/chemical interlocks — programmers who work to fab change-control discipline.',
      pain1:
        'Controls work inside a fab is unforgiving. Equipment runs in a cleanroom where every intervention is gowned, scheduled and expensive, so the PLC logic has to be right before it ever touches the tool. Sub-micron process windows mean a sloppy sequence does not just slow throughput — it scraps wafers.',
      pain2:
        'Fab controls also carry integration weight most factories never see: SECS/GEM host communication, interlocks on gas and chemical delivery, and abatement handshakes that cannot fail silently. We match you with programmers who have worked to fab discipline — change control, minimal-downtime commissioning windows, and documentation a process engineer will actually trust.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 半导体',
      sub: '洁净室级设备控制，含 SECS/GEM 与气体/化学品互锁——按晶圆厂变更管理纪律做事的程序员。',
      pain1:
        '晶圆厂里的控制活容不得半点马虎。设备运行在洁净室里，每一次介入都要穿无尘服、要排期、代价高昂，所以 PLC 逻辑必须在碰到设备之前就是对的。亚微米的工艺窗口意味着一段草率的时序不只是拖慢产能——它会报废晶圆。',
      pain2:
        '晶圆厂控制还背着大多数工厂从未见过的集成重量：SECS/GEM 主机通讯、气体与化学品输送的互锁、以及不能静默失败的尾气处理握手。我们为你匹配按晶圆厂纪律做过事的程序员——变更管理、最小停机的调试窗口、以及工艺工程师真正信得过的文档。',
    },
    es: {
      title: 'Contrate programadores de PLC certificados para fabricación de semiconductores',
      sub: 'Controles de equipos de grado sala limpia con SECS/GEM e interbloqueos de gases/químicos — programadores que trabajan con la disciplina de control de cambios de la fábrica.',
      pain1:
        'El trabajo de controles dentro de una fábrica de semiconductores no perdona errores. El equipo opera en una sala limpia donde cada intervención requiere vestimenta especial, está programada y es costosa, así que la lógica del PLC tiene que estar correcta antes de tocar la herramienta. Las ventanas de proceso submicrónicas significan que una secuencia descuidada no solo ralentiza el rendimiento: desecha obleas.',
      pain2:
        'Los controles de fábrica también cargan un peso de integración que la mayoría de las plantas nunca ve: comunicación de host SECS/GEM, interbloqueos en el suministro de gases y químicos, y protocolos de mitigación que no pueden fallar en silencio. Le emparejamos con programadores que han trabajado con la disciplina de la fábrica: control de cambios, ventanas de puesta en marcha de tiempo mínimo de inactividad y documentación en la que un ingeniero de proceso realmente confiará.',
    },
    vi: {
      title: 'Thuê lập trình viên PLC có chứng chỉ cho sản xuất bán dẫn',
      sub: 'Điều khiển thiết bị cấp phòng sạch với giao diện SECS/GEM và khóa liên động khí/hóa chất — lập trình viên làm việc theo kỷ luật kiểm soát thay đổi của nhà máy bán dẫn.',
      pain1:
        'Công việc điều khiển bên trong một nhà máy bán dẫn không khoan nhượng. Thiết bị vận hành trong phòng sạch, nơi mỗi lần can thiệp đều phải mặc đồ bảo hộ, lên lịch và tốn kém, vì vậy logic PLC phải đúng trước khi chạm vào thiết bị. Cửa sổ quy trình dưới micron nghĩa là một trình tự cẩu thả không chỉ làm chậm sản lượng — nó phế bỏ cả tấm wafer.',
      pain2:
        'Điều khiển nhà máy bán dẫn còn mang trọng lượng tích hợp mà hầu hết nhà máy khác chưa từng gặp: giao tiếp host SECS/GEM, khóa liên động trên đường cấp khí và hóa chất, và các bắt tay xử lý khí thải không được phép lỗi trong im lặng. Chúng tôi ghép bạn với lập trình viên đã làm việc theo kỷ luật nhà máy — kiểm soát thay đổi, cửa sổ chạy thử với thời gian dừng tối thiểu, và tài liệu mà kỹ sư quy trình thực sự tin tưởng.',
    },
    hi: {
      title: 'सेमीकंडक्टर फैब्स के लिए प्रमाणित PLC प्रोग्रामर हायर करें',
      sub: 'SECS/GEM और गैस/केमिकल इंटरलॉक्स के साथ क्लीनरूम-ग्रेड इक्विपमेंट कंट्रोल्स — फैब चेंज-कंट्रोल अनुशासन के मुताबिक काम करने वाले प्रोग्रामर।',
      pain1:
        'फैब के अंदर कंट्रोल्स का काम माफ नहीं करता। इक्विपमेंट क्लीनरूम में चलता है जहां हर इंटरवेंशन गाउन पहनकर, शेड्यूल्ड और महंगा होता है, इसलिए PLC लॉजिक टूल को छूने से पहले ही सही होना चाहिए। सब-माइक्रॉन प्रोसेस विंडो का मतलब है कि लापरवाह सीक्वेंस सिर्फ थ्रूपुट धीमा नहीं करता — वेफर्स स्क्रैप कर देता है।',
      pain2:
        'फैब कंट्रोल्स एक ऐसा इंटीग्रेशन बोझ भी उठाते हैं जो ज़्यादातर फैक्ट्रियां कभी नहीं देखतीं: SECS/GEM होस्ट कम्युनिकेशन, गैस व केमिकल डिलीवरी पर इंटरलॉक्स, और ऐसे एबेटमेंट हैंडशेक जो चुपचाप फेल नहीं हो सकते। हम आपको ऐसे प्रोग्रामर से मिलाते हैं जिन्होंने फैब अनुशासन में काम किया है — चेंज कंट्रोल, न्यूनतम-डाउनटाइम कमीशनिंग विंडो, और ऐसा डॉक्यूमेंटेशन जिस पर प्रोसेस इंजीनियर वाकई भरोसा करेगा।',
    },
    fr: {
      title: 'Recrutez des programmeurs PLC certifiés pour la fabrication de semi-conducteurs',
      sub: 'Contrôle-commande d’équipements de niveau salle blanche avec interfaces SECS/GEM et interverrouillages gaz/produits chimiques — programmeurs formés à la discipline de gestion du changement des fabs.',
      pain1:
        'Le travail de contrôle-commande à l’intérieur d’une fab est sans pitié. L’équipement fonctionne en salle blanche, où chaque intervention exige une tenue, doit être planifiée et coûte cher ; la logique PLC doit donc être juste avant même de toucher la machine. Avec des fenêtres de procédé submicroniques, une séquence bâclée ne ralentit pas seulement le débit — elle met des wafers au rebut.',
      pain2:
        'Le contrôle-commande en fab impose aussi une charge d’intégration que la plupart des usines ne connaissent jamais : communication hôte SECS/GEM, interverrouillages sur l’alimentation en gaz et produits chimiques, et des échanges d’abattement qui ne peuvent pas échouer silencieusement. Nous vous associons à des programmeurs ayant travaillé selon la discipline des fabs — gestion du changement, fenêtres de mise en service à temps d’arrêt minimal, et une documentation à laquelle un ingénieur procédé fera réellement confiance.',
    },
    de: {
      title: 'Zertifizierte PLC-Programmierer für Halbleiterfabs engagieren',
      sub: 'Reinraumtaugliche Anlagensteuerungen mit SECS/GEM und Gas-/Chemikalien-Verriegelungen — Programmierer, die nach der Änderungskontrolldisziplin der Fab arbeiten.',
      pain1:
        'Steuerungsarbeit innerhalb einer Fab verzeiht nichts. Die Anlage läuft in einem Reinraum, in dem jeder Eingriff mit Schutzkleidung, Terminplanung und hohen Kosten verbunden ist — die PLC-Logik muss also stimmen, bevor sie das Tool überhaupt berührt. Submikron-Prozessfenster bedeuten, dass eine schlampige Sequenz nicht nur den Durchsatz verlangsamt — sie verschrottet Wafer.',
      pain2:
        'Fab-Steuerungen tragen zudem ein Integrationsgewicht, das die meisten Fabriken nie sehen: SECS/GEM-Host-Kommunikation, Verriegelungen bei Gas- und Chemikalienzufuhr sowie Abluftreinigungs-Handshakes, die nicht stillschweigend ausfallen dürfen. Wir vermitteln Ihnen Programmierer, die nach Fab-Disziplin gearbeitet haben — Änderungskontrolle, Inbetriebnahmefenster mit minimaler Stillstandszeit und Dokumentation, der ein Prozessingenieur tatsächlich vertraut.',
    },
    ja: {
      title: '半導体ファブ向けの認定PLCプログラマーを採用',
      sub: 'SECS/GEMとガス・薬液インターロックを備えたクリーンルーム級設備制御——ファブの変更管理規律に従って働くプログラマー。',
      pain1:
        'ファブ内での制御業務は容赦がありません。設備はクリーンルームで稼働し、あらゆる介入がガウン着用・スケジュール管理・高コストを伴うため、PLCロジックは設備に触れる前に正しくなければなりません。サブミクロンのプロセスウィンドウでは、雑なシーケンスはスループットを落とすだけでなく、ウェハーを廃棄させます。',
      pain2:
        'ファブの制御は、ほとんどの工場が経験しない統合の重みも背負います——SECS/GEMホスト通信、ガス・薬液供給のインターロック、そして静かに失敗してはならない排ガス処理のハンドシェイクです。当社はファブの規律の中で働いてきたプログラマーとあなたを引き合わせます——変更管理、最小停止時間の試運転ウィンドウ、そしてプロセスエンジニアが本当に信頼できる文書です。',
    },
    ko: {
      title: '반도체 팹을 위한 인증 PLC 프로그래머 채용',
      sub: 'SECS/GEM 및 가스/화학물질 인터록을 갖춘 클린룸급 설비 제어 — 팹의 변경 관리 규율에 따라 일하는 프로그래머.',
      pain1:
        '팹 내부의 제어 작업은 용서가 없습니다. 설비는 클린룸에서 가동되며 모든 개입에는 방진복, 일정 조율, 높은 비용이 따르므로 PLC 로직은 장비에 손대기 전에 이미 정확해야 합니다. 서브마이크론 공정 윈도우는 허술한 시퀀스가 처리량을 늦추는 것을 넘어 웨이퍼를 스크랩시킨다는 뜻입니다.',
      pain2:
        '팹 제어는 대부분의 공장이 결코 겪지 않는 통합 부담도 짊어집니다. SECS/GEM 호스트 통신, 가스 및 화학물질 공급의 인터록, 그리고 조용히 실패해서는 안 되는 배기 처리 핸드셰이크입니다. 우리는 팹의 규율 안에서 일해온 프로그래머와 매칭해 드립니다 — 변경 관리, 최소 다운타임 시운전 윈도우, 그리고 공정 엔지니어가 진짜로 신뢰할 문서까지.',
    },
  },
  'plc/food-beverage': {
    track: 'plc',
    industry: 'food-beverage',
    industrySkills: ['CIP / SIP sequencing', 'ISA-88 batch control', 'Recipe management', 'Allergen changeover', 'Lot traceability'],
    en: {
      title: 'Hire Certified PLC Programmers for Food & Beverage',
      sub: 'Sanitary, recipe-driven controls for high-speed lines — CIP/SIP, ISA-88 batch and lot traceability, verified programmers.',
      pain1:
        'Food and beverage lines mix high speed with hard hygiene rules. CIP/SIP cycles, washdown environments and allergen changeovers all live in the PLC, and a recipe or sequencing mistake becomes a food-safety event, not just a downtime event. The programmer has to think about the product on the line, not only the machine.',
      pain2:
        'Batch and recipe control here usually follows ISA-88 (S88) structure, with lot traceability that has to survive an audit. We screen for programmers who have built recipe-driven, sanitary sequences — and who understand that "it runs" is not the bar when the output is something people eat.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 食品饮料',
      sub: '面向高速产线的卫生级、配方驱动控制——CIP/SIP、ISA-88 批次与批号追溯，经验证的程序员。',
      pain1:
        '食品饮料产线把高速度和硬性卫生规则混在一起。CIP/SIP 清洗、冲洗(washdown)环境、过敏原换型全都写在 PLC 里，一个配方或时序错误会变成食品安全事件，而不只是停机事件。程序员必须惦记产线上流的产品，而不只是机器。',
      pain2:
        '这里的批次与配方控制通常遵循 ISA-88(S88)结构，批号追溯要经得起审计。我们筛选的是搭建过配方驱动、卫生级时序的程序员——他们明白当产出是给人吃的东西时，"能跑"远远不是及格线。',
    },
    es: {
      title: 'Contrate programadores de PLC certificados para alimentos y bebidas',
      sub: 'Controles sanitarios impulsados por recetas para líneas de alta velocidad — CIP/SIP, control por lotes ISA-88 y trazabilidad de lotes, programadores verificados.',
      pain1:
        'Las líneas de alimentos y bebidas combinan alta velocidad con reglas de higiene estrictas. Los ciclos CIP/SIP, los entornos de lavado a presión y los cambios por alérgenos viven todos en el PLC, y un error de receta o secuencia se convierte en un evento de inocuidad alimentaria, no solo en tiempo de inactividad. El programador tiene que pensar en el producto que corre por la línea, no solo en la máquina.',
      pain2:
        'El control de lotes y recetas aquí normalmente sigue la estructura ISA-88 (S88), con trazabilidad de lotes que debe sobrevivir a una auditoría. Filtramos programadores que han construido secuencias sanitarias impulsadas por recetas, y que entienden que "funciona" está lejos de ser el estándar cuando el producto es algo que la gente come.',
    },
    vi: {
      title: 'Thuê lập trình viên PLC có chứng chỉ cho ngành thực phẩm và đồ uống',
      sub: 'Điều khiển vệ sinh, dẫn động theo công thức cho dây chuyền tốc độ cao — CIP/SIP, điều khiển mẻ ISA-88 và truy xuất nguồn gốc lô, lập trình viên đã được xác minh.',
      pain1:
        'Dây chuyền thực phẩm và đồ uống kết hợp tốc độ cao với các quy tắc vệ sinh khắt khe. Chu trình CIP/SIP, môi trường rửa xả (washdown) và đổi dòng do chất gây dị ứng đều nằm trong PLC, và một lỗi công thức hay trình tự sẽ trở thành sự cố an toàn thực phẩm, chứ không chỉ là sự cố dừng máy. Lập trình viên phải nghĩ đến sản phẩm đang chạy trên dây chuyền, chứ không chỉ nghĩ đến máy móc.',
      pain2:
        'Điều khiển mẻ và công thức ở đây thường theo cấu trúc ISA-88 (S88), với khả năng truy xuất lô phải chịu được kiểm toán. Chúng tôi sàng lọc những lập trình viên đã xây dựng trình tự vệ sinh, dẫn động theo công thức — và hiểu rằng "chạy được" còn lâu mới là tiêu chuẩn khi sản phẩm đầu ra là thứ con người ăn vào.',
    },
    hi: {
      title: 'फूड एंड बेवरेज के लिए प्रमाणित PLC प्रोग्रामर हायर करें',
      sub: 'हाई-स्पीड लाइनों के लिए सैनिटरी, रेसिपी-ड्रिवन कंट्रोल्स — CIP/SIP, ISA-88 बैच और लॉट ट्रेसेबिलिटी, सत्यापित प्रोग्रामर।',
      pain1:
        'फूड और बेवरेज लाइनें हाई स्पीड को सख्त हाइजीन नियमों के साथ मिलाती हैं। CIP/SIP साइकल, वॉशडाउन एनवायरनमेंट और एलर्जन चेंजओवर सब PLC में रहते हैं, और एक रेसिपी या सीक्वेंसिंग गलती फूड-सेफ्टी इवेंट बन जाती है, सिर्फ डाउनटाइम इवेंट नहीं। प्रोग्रामर को लाइन पर बहते प्रोडक्ट के बारे में सोचना होता है, सिर्फ मशीन के बारे में नहीं।',
      pain2:
        'यहां बैच और रेसिपी कंट्रोल आमतौर पर ISA-88 (S88) संरचना का पालन करता है, जहां लॉट ट्रेसेबिलिटी को ऑडिट झेलना होता है। हम ऐसे प्रोग्रामर छांटते हैं जिन्होंने रेसिपी-ड्रिवन, सैनिटरी सीक्वेंस बनाए हैं — और जो समझते हैं कि जब आउटपुट कुछ ऐसा हो जो लोग खाते हैं, तो "चल रहा है" पास होने की कसौटी नहीं है।',
    },
    fr: {
      title: 'Recrutez des programmeurs PLC certifiés pour l’agroalimentaire',
      sub: 'Contrôle-commande sanitaire piloté par recette pour lignes à haute vitesse — CIP/SIP, contrôle par lots ISA-88 et traçabilité des lots, programmeurs vérifiés.',
      pain1:
        'Les lignes agroalimentaires mêlent haute vitesse et règles d’hygiène strictes. Les cycles CIP/SIP, les environnements de lavage et les changements de série liés aux allergènes sont tous gérés dans le PLC, et une erreur de recette ou de séquencement devient un incident de sécurité alimentaire, pas seulement un arrêt de production. Le programmeur doit penser au produit sur la ligne, pas seulement à la machine.',
      pain2:
        'Le contrôle par lots et recettes suit généralement ici la structure ISA-88 (S88), avec une traçabilité des lots qui doit résister à un audit. Nous sélectionnons des programmeurs ayant construit des séquences sanitaires pilotées par recette — et qui comprennent que « ça tourne » ne suffit pas comme critère quand le produit fini est quelque chose que des gens mangent.',
    },
    de: {
      title: 'Zertifizierte PLC-Programmierer für Lebensmittel & Getränke engagieren',
      sub: 'Hygienische, rezeptgesteuerte Steuerungen für Hochgeschwindigkeitslinien — CIP/SIP, ISA-88-Chargensteuerung und Losrückverfolgbarkeit, verifizierte Programmierer.',
      pain1:
        'Lebensmittel- und Getränkelinien verbinden hohe Geschwindigkeit mit strengen Hygieneregeln. CIP/SIP-Zyklen, Waschumgebungen und Allergen-Umrüstungen leben allesamt in der PLC, und ein Rezept- oder Ablauffehler wird zu einem Lebensmittelsicherheitsvorfall, nicht nur zu einem Stillstand. Der Programmierer muss an das Produkt auf der Linie denken, nicht nur an die Maschine.',
      pain2:
        'Chargen- und Rezeptsteuerung folgt hier meist der ISA-88-Struktur (S88), mit Losrückverfolgbarkeit, die einer Prüfung standhalten muss. Wir prüfen Programmierer, die rezeptgesteuerte, hygienische Abläufe gebaut haben — und die verstehen, dass „es läuft" bei Weitem nicht die Messlatte ist, wenn das Produkt etwas ist, das Menschen essen.',
    },
    ja: {
      title: '食品・飲料向けの認定PLCプログラマーを採用',
      sub: '高速ラインのための衛生的でレシピ駆動の制御——CIP/SIP、ISA-88バッチ制御、ロットトレーサビリティ、検証済みプログラマー。',
      pain1:
        '食品・飲料ラインは高速性と厳しい衛生規則を併せ持ちます。CIP/SIPサイクル、洗浄環境、アレルゲン切替はすべてPLCの中に存在し、レシピや順序のミスは単なるダウンタイムではなく食品安全事故になります。プログラマーはラインの機械だけでなく、ライン上を流れる製品そのものを考えなければなりません。',
      pain2:
        'ここでのバッチ・レシピ制御は通常ISA-88（S88）構造に従い、ロットトレーサビリティは監査に耐えるものでなければなりません。当社はレシピ駆動の衛生的なシーケンスを構築した経験を持つプログラマーを審査します——彼らは、出力が人が口にするものであるとき「動く」ことは合格ラインからほど遠いと理解しています。',
    },
    ko: {
      title: '식품 및 음료를 위한 인증 PLC 프로그래머 채용',
      sub: '고속 라인을 위한 위생적이고 레시피 기반 제어 — CIP/SIP, ISA-88 배치 제어 및 로트 추적성, 검증된 프로그래머.',
      pain1:
        '식품·음료 라인은 고속성과 엄격한 위생 규칙을 함께 다룹니다. CIP/SIP 세정, 워시다운 환경, 알레르기 유발 물질 전환은 모두 PLC 안에 있으며, 레시피나 시퀀스 오류는 단순한 다운타임이 아니라 식품안전 사고가 됩니다. 프로그래머는 기계뿐 아니라 라인 위를 흐르는 제품 자체를 고려해야 합니다.',
      pain2:
        '여기서 배치 및 레시피 제어는 보통 ISA-88(S88) 구조를 따르며, 로트 추적성은 감사를 견뎌내야 합니다. 우리는 레시피 기반의 위생적인 시퀀스를 구축해본 프로그래머를 심사합니다 — 결과물이 사람이 먹는 것일 때 "돌아간다"는 것은 합격선과는 거리가 멀다는 것을 이해하는 사람들입니다.',
    },
  },
  'plc/pharma': {
    track: 'plc',
    industry: 'pharma',
    industrySkills: ['GMP / GAMP 5', '21 CFR Part 11', 'IQ / OQ / PQ validation', 'Audit trail (ALCOA)', 'Change control'],
    en: {
      title: 'Hire Certified PLC Programmers for Pharmaceutical Manufacturing',
      sub: 'Validation-first controls under GMP and GAMP 5 — 21 CFR Part 11 audit trails and IQ/OQ/PQ documentation, from programmers who have done it.',
      pain1:
        'Pharmaceutical controls are validation-first. Under GMP and GAMP 5, a PLC change is not done when it works — it is done when it is documented, tested and validated through IQ/OQ/PQ with a paper trail an inspector can follow. Programmers who have never worked to that discipline tend to underestimate it by an order of magnitude.',
      pain2:
        'Data integrity is the other half: 21 CFR Part 11 audit trails, ALCOA principles and controlled electronic records shape how the logic and HMI are even allowed to be written. We match you with programmers who have delivered validated systems in a GMP environment and can produce the documentation to prove it.',
    },
    zh: {
      title: '雇佣持证 PLC 程序员 · 制药',
      sub: 'GMP 与 GAMP 5 下"验证优先"的控制——21 CFR Part 11 审计追踪与 IQ/OQ/PQ 文档，来自真正做过的程序员。',
      pain1:
        '制药控制是"验证优先"的。在 GMP 与 GAMP 5 之下，一个 PLC 变更不是"能用了"就算完成——而是要经过 IQ/OQ/PQ 记录、测试、验证，并留下检查员能顺下来的书面轨迹。从没按这套纪律做过事的程序员，往往把它的工作量低估一个数量级。',
      pain2:
        '数据完整性是另一半：21 CFR Part 11 审计追踪、ALCOA 原则、以及受控的电子记录，从根上决定了逻辑与 HMI 被"允许"怎么写。我们为你匹配在 GMP 环境里交付过验证系统、并能拿出文档证明的程序员。',
    },
    es: {
      title: 'Contrate programadores de PLC certificados para manufactura farmacéutica',
      sub: 'Controles con enfoque en validación bajo GMP y GAMP 5 — registros de auditoría 21 CFR Part 11 y documentación IQ/OQ/PQ, de programadores que ya lo han hecho.',
      pain1:
        'Los controles farmacéuticos priorizan la validación. Bajo GMP y GAMP 5, un cambio de PLC no está terminado cuando funciona: está terminado cuando está documentado, probado y validado mediante IQ/OQ/PQ con un rastro documental que un inspector puede seguir. Los programadores que nunca han trabajado con esa disciplina tienden a subestimarla por un orden de magnitud.',
      pain2:
        'La integridad de datos es la otra mitad: los registros de auditoría 21 CFR Part 11, los principios ALCOA y los registros electrónicos controlados determinan incluso cómo se permite escribir la lógica y el HMI. Le emparejamos con programadores que han entregado sistemas validados en un entorno GMP y pueden producir la documentación que lo demuestra.',
    },
    vi: {
      title: 'Thuê lập trình viên PLC có chứng chỉ cho sản xuất dược phẩm',
      sub: 'Điều khiển ưu tiên thẩm định theo GMP và GAMP 5 — nhật ký kiểm toán 21 CFR Part 11 và tài liệu IQ/OQ/PQ, từ những lập trình viên đã thực sự làm việc này.',
      pain1:
        'Điều khiển dược phẩm ưu tiên thẩm định (validation) hàng đầu. Theo GMP và GAMP 5, một thay đổi PLC chưa hoàn tất khi nó chạy được — nó chỉ hoàn tất khi được ghi tài liệu, kiểm thử và thẩm định qua IQ/OQ/PQ với dấu vết giấy tờ mà thanh tra viên có thể theo dõi. Những lập trình viên chưa từng làm việc theo kỷ luật đó thường đánh giá thấp khối lượng công việc này đến cả một bậc độ lớn.',
      pain2:
        'Tính toàn vẹn dữ liệu là nửa còn lại: nhật ký kiểm toán 21 CFR Part 11, nguyên tắc ALCOA và hồ sơ điện tử được kiểm soát định hình cả việc logic và HMI được phép viết như thế nào. Chúng tôi ghép bạn với những lập trình viên đã bàn giao hệ thống được thẩm định trong môi trường GMP và có thể xuất trình tài liệu chứng minh điều đó.',
    },
    hi: {
      title: 'फार्मास्युटिकल मैन्युफैक्चरिंग के लिए प्रमाणित PLC प्रोग्रामर हायर करें',
      sub: 'GMP और GAMP 5 के तहत वैलिडेशन-फर्स्ट कंट्रोल्स — 21 CFR Part 11 ऑडिट ट्रेल्स और IQ/OQ/PQ डॉक्यूमेंटेशन, ऐसे प्रोग्रामर से जिन्होंने यह वाकई किया है।',
      pain1:
        'फार्मास्युटिकल कंट्रोल्स वैलिडेशन-फर्स्ट होते हैं। GMP और GAMP 5 के तहत, एक PLC बदलाव तब पूरा नहीं होता जब वह काम करने लगे — वह तब पूरा होता है जब वह डॉक्यूमेंटेड, टेस्टेड हो और IQ/OQ/PQ के ज़रिए ऐसे पेपर ट्रेल के साथ वैलिडेट हो जिसे कोई इंस्पेक्टर फॉलो कर सके। जिन प्रोग्रामर्स ने कभी इस अनुशासन में काम नहीं किया, वे अक्सर इसे एक ऑर्डर ऑफ मैग्नीट्यूड तक कम आंकते हैं।',
      pain2:
        'डेटा इंटीग्रिटी दूसरा आधा हिस्सा है: 21 CFR Part 11 ऑडिट ट्रेल्स, ALCOA सिद्धांत, और नियंत्रित इलेक्ट्रॉनिक रिकॉर्ड्स ही तय करते हैं कि लॉजिक और HMI को कैसे लिखने की "इजाज़त" है। हम आपको ऐसे प्रोग्रामर से मिलाते हैं जिन्होंने GMP माहौल में वैलिडेटेड सिस्टम डिलीवर किए हैं और इसे साबित करने वाला डॉक्यूमेंटेशन दिखा सकते हैं।',
    },
    fr: {
      title: 'Recrutez des programmeurs PLC certifiés pour la fabrication pharmaceutique',
      sub: 'Contrôle-commande axé sur la validation sous GMP et GAMP 5 — pistes d’audit 21 CFR Part 11 et documentation IQ/OQ/PQ, par des programmeurs qui l’ont déjà fait.',
      pain1:
        'Le contrôle-commande pharmaceutique donne la priorité à la validation. Sous GMP et GAMP 5, une modification de PLC n’est pas terminée quand elle fonctionne : elle est terminée quand elle est documentée, testée et validée via IQ/OQ/PQ avec une piste documentaire qu’un inspecteur peut suivre. Les programmeurs n’ayant jamais travaillé avec cette discipline ont tendance à en sous-estimer l’ampleur d’un ordre de grandeur.',
      pain2:
        'L’intégrité des données est l’autre moitié : les pistes d’audit 21 CFR Part 11, les principes ALCOA et les enregistrements électroniques contrôlés déterminent jusqu’à la manière dont la logique et l’IHM sont autorisées à être écrites. Nous vous associons à des programmeurs ayant livré des systèmes validés en environnement GMP et pouvant produire la documentation le prouvant.',
    },
    de: {
      title: 'Zertifizierte PLC-Programmierer für die Pharmafertigung engagieren',
      sub: 'Validierungsorientierte Steuerungen unter GMP und GAMP 5 — 21-CFR-Part-11-Audit-Trails und IQ/OQ/PQ-Dokumentation, von Programmierern, die das bereits getan haben.',
      pain1:
        'Pharma-Steuerungen sind validierungsorientiert. Unter GMP und GAMP 5 ist eine PLC-Änderung nicht fertig, wenn sie funktioniert — sie ist fertig, wenn sie dokumentiert, getestet und über IQ/OQ/PQ mit einer für einen Inspektor nachvollziehbaren Papierspur validiert ist. Programmierer, die nie nach dieser Disziplin gearbeitet haben, unterschätzen sie tendenziell um eine Größenordnung.',
      pain2:
        'Datenintegrität ist die andere Hälfte: 21-CFR-Part-11-Audit-Trails, ALCOA-Prinzipien und kontrollierte elektronische Aufzeichnungen bestimmen sogar, wie Logik und HMI überhaupt geschrieben werden dürfen. Wir vermitteln Ihnen Programmierer, die validierte Systeme in einer GMP-Umgebung geliefert haben und die Dokumentation dafür vorlegen können.',
    },
    ja: {
      title: '製薬製造向けの認定PLCプログラマーを採用',
      sub: 'GMPおよびGAMP 5のもとでのバリデーション優先制御——21 CFR Part 11の監査証跡とIQ/OQ/PQ文書、実際に経験を積んだプログラマーによる。',
      pain1:
        '製薬の制御はバリデーション優先です。GMPとGAMP 5のもとでは、PLCの変更は動くようになった時点では完了せず——IQ/OQ/PQを通じて文書化・テスト・バリデーションされ、検査官が追跡できる書面の記録が残って初めて完了します。この規律で働いたことのないプログラマーは、たいてい作業量を桁違いに過小評価します。',
      pain2:
        'データインテグリティはもう半分の要です。21 CFR Part 11の監査証跡、ALCOA原則、管理された電子記録が、ロジックとHMIをそもそもどう書くことが許されるかを根本から規定します。当社はGMP環境でバリデーション済みシステムを納品し、それを証明する文書を提示できるプログラマーとあなたを引き合わせます。',
    },
    ko: {
      title: '제약 제조를 위한 인증 PLC 프로그래머 채용',
      sub: 'GMP 및 GAMP 5 하에서 밸리데이션 우선 제어 — 21 CFR Part 11 감사 추적 및 IQ/OQ/PQ 문서화, 실제로 이를 해본 프로그래머로부터.',
      pain1:
        '제약 제어는 밸리데이션이 최우선입니다. GMP와 GAMP 5 하에서 PLC 변경은 작동한다고 끝나는 것이 아닙니다 — 검사관이 따라갈 수 있는 서류 흔적과 함께 IQ/OQ/PQ를 통해 문서화, 테스트, 밸리데이션되어야 비로소 완료됩니다. 이 규율로 일해본 적 없는 프로그래머는 대개 그 작업량을 한 자릿수 단위로 과소평가합니다.',
      pain2:
        '데이터 무결성이 나머지 절반입니다. 21 CFR Part 11 감사 추적, ALCOA 원칙, 통제된 전자 기록은 로직과 HMI를 애초에 어떻게 작성해도 "허용"되는지를 근본적으로 규정합니다. 우리는 GMP 환경에서 밸리데이션된 시스템을 납품하고 이를 증명하는 문서를 제시할 수 있는 프로그래머와 매칭해 드립니다.',
    },
  },
  'robotics/automotive': {
    track: 'robotics',
    industry: 'automotive',
    industrySkills: ['Spot welding / BIW', 'Multi-robot cells', 'Cycle-time tuning', 'Dress-out & tooling', 'Safety zones'],
    en: {
      title: 'Hire Certified Robotics Engineers for Automotive Manufacturing',
      sub: 'Body-in-white and powertrain robot cells at takt — Fanuc, KUKA and ABB specialists verified on real multi-robot commissioning.',
      pain1:
        'Automotive is where industrial robotics lives at its most demanding — body-in-white shops run dozens of robots spot welding, handling and sealing at a takt time that never relaxes. Cycle time is money measured per second, so path and dress-out decisions that look minor decide whether the line makes its number.',
      pain2:
        'These are also multi-robot cells with tight safety choreography: shared work zones, interlocks and E-stop logic that must be commissioned without surprises. We screen robotics engineers on real automotive cell problems — cycle-time tuning, collision-free pathing and safe multi-robot commissioning — and certify them so you can match seniority to the risk.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 汽车制造',
      sub: '踩着节拍的车身(BIW)与动力总成机器人工作站——Fanuc、KUKA、ABB 专家，经真实多机联调验证。',
      pain1:
        '汽车是工业机器人最吃功力的战场——车身车间里几十台机器人同时点焊、搬运、涂胶，节拍从不松劲。节拍是按秒计价的钱，所以那些看似不起眼的路径与线缆布置(dress-out)决策，直接决定这条线能不能做到产量。',
      pain2:
        '这些还是安全编排极紧的多机工作站：共享工作区、互锁、急停逻辑，都必须调试到"不出意外"。我们在真实的汽车工作站问题上筛选机器人工程师——节拍优化、无碰撞路径、安全的多机联调——并发放认证，让你按风险匹配资历。',
    },
    es: {
      title: 'Contrate ingenieros de robótica certificados para manufactura automotriz',
      sub: 'Celdas de robots de carrocería en blanco y tren motriz al ritmo del takt — especialistas en Fanuc, KUKA y ABB verificados en puestas en marcha multi-robot reales.',
      pain1:
        'La automotriz es donde la robótica industrial vive en su forma más exigente: los talleres de carrocería en blanco operan docenas de robots soldando por puntos, manipulando y sellando a un tiempo de takt que nunca se relaja. El tiempo de ciclo es dinero medido por segundo, así que decisiones de trayectoria y de disposición de cables que parecen menores deciden si la línea alcanza su número.',
      pain2:
        'Estas son también celdas multi-robot con una coreografía de seguridad muy ajustada: zonas de trabajo compartidas, interbloqueos y lógica de paro de emergencia que debe ponerse en marcha sin sorpresas. Evaluamos a los ingenieros de robótica con problemas reales de celdas automotrices — ajuste de tiempo de ciclo, trayectorias sin colisión y puesta en marcha segura multi-robot — y los certificamos para que pueda emparejar la seniority con el riesgo.',
    },
    vi: {
      title: 'Thuê kỹ sư robot có chứng chỉ cho ngành sản xuất ô tô',
      sub: 'Các tế bào robot thân xe (BIW) và động cơ chạy đúng nhịp takt — chuyên gia Fanuc, KUKA và ABB đã được xác minh qua các đợt chạy thử đa robot thực tế.',
      pain1:
        'Ô tô là nơi robot công nghiệp hoạt động ở mức đòi hỏi cao nhất — các xưởng thân xe vận hành hàng chục robot hàn điểm, xử lý và trét keo theo nhịp takt không bao giờ được lơi lỏng. Thời gian chu kỳ là tiền tính theo giây, vì vậy những quyết định về đường đi và bố trí dây cáp tưởng nhỏ nhặt lại quyết định dây chuyền có đạt sản lượng hay không.',
      pain2:
        'Đây cũng là các tế bào đa robot với sự phối hợp an toàn cực kỳ chặt chẽ: vùng làm việc chung, khóa liên động và logic dừng khẩn cấp phải được chạy thử mà không có bất ngờ nào. Chúng tôi sàng lọc kỹ sư robot trên các bài toán tế bào ô tô thực tế — tinh chỉnh thời gian chu kỳ, đường đi không va chạm và chạy thử đa robot an toàn — rồi cấp chứng chỉ để bạn ghép đúng trình độ với mức rủi ro.',
    },
    hi: {
      title: 'ऑटोमोटिव मैन्युफैक्चरिंग के लिए प्रमाणित रोबोटिक्स इंजीनियर हायर करें',
      sub: 'टैक्ट पर चलते बॉडी-इन-व्हाइट और पावरट्रेन रोबोट सेल — Fanuc, KUKA और ABB स्पेशलिस्ट, वास्तविक मल्टी-रोबोट कमीशनिंग पर सत्यापित।',
      pain1:
        'ऑटोमोटिव वह जगह है जहां इंडस्ट्रियल रोबोटिक्स सबसे ज़्यादा मांग वाले रूप में मौजूद है — बॉडी-इन-व्हाइट शॉप्स में दर्जनों रोबोट स्पॉट वेल्डिंग, हैंडलिंग और सीलिंग करते हैं, ऐसे टैक्ट टाइम पर जो कभी ढीला नहीं पड़ता। साइकल टाइम सेकंड-दर-सेकंड नापा जाने वाला पैसा है, इसलिए पाथ और ड्रेस-आउट के फैसले जो मामूली दिखते हैं, तय करते हैं कि लाइन अपना नंबर बनाएगी या नहीं।',
      pain2:
        'ये मल्टी-रोबोट सेल भी हैं जिनकी सेफ्टी कोरियोग्राफी बेहद टाइट होती है: शेयर्ड वर्क ज़ोन, इंटरलॉक्स और E-stop लॉजिक, जिसे बिना किसी सरप्राइज़ के कमीशन करना होता है। हम असली ऑटोमोटिव सेल समस्याओं पर रोबोटिक्स इंजीनियर छांटते हैं — साइकल-टाइम ट्यूनिंग, कोलिज़न-फ्री पाथिंग और सेफ मल्टी-रोबोट कमीशनिंग — और उन्हें प्रमाणित करते हैं ताकि आप रिस्क के हिसाब से सीनियरिटी मैच कर सकें।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en robotique certifiés pour l’industrie automobile',
      sub: 'Cellules robotisées de caisse en blanc et de groupe motopropulseur au rythme du takt — spécialistes Fanuc, KUKA et ABB vérifiés sur de véritables mises en service multi-robots.',
      pain1:
        'L’automobile est le domaine où la robotique industrielle est la plus exigeante — les ateliers de caisse en blanc font fonctionner des dizaines de robots pour le soudage par points, la manutention et l’étanchéité à un temps de takt qui ne se relâche jamais. Le temps de cycle est de l’argent mesuré à la seconde, donc des décisions de trajectoire et d’habillage qui semblent mineures décident si la ligne atteint son objectif.',
      pain2:
        'Ce sont aussi des cellules multi-robots avec une chorégraphie de sécurité très serrée : zones de travail partagées, verrouillages et logique d’arrêt d’urgence qui doivent être mis en service sans surprise. Nous évaluons les ingénieurs en robotique sur de vrais problèmes de cellules automobiles — ajustement du temps de cycle, trajectoires sans collision et mise en service multi-robots sécurisée — et nous les certifions pour que vous puissiez adapter le niveau d’expérience au risque.',
    },
    de: {
      title: 'Zertifizierte Robotik-Ingenieure für die Automobilfertigung engagieren',
      sub: 'Rohbau- und Antriebsstrang-Roboterzellen im Takt — Fanuc-, KUKA- und ABB-Spezialisten, verifiziert an echten Mehrroboter-Inbetriebnahmen.',
      pain1:
        'Die Automobilindustrie ist der anspruchsvollste Einsatzort der Industrierobotik — Rohbauwerke betreiben Dutzende Roboter für Punktschweißen, Handling und Abdichten in einem Takt, der nie nachlässt. Die Taktzeit ist Geld, gemessen in Sekunden, daher entscheiden scheinbar kleine Bahn- und Verkabelungsentscheidungen darüber, ob die Linie ihre Stückzahl erreicht.',
      pain2:
        'Dies sind zudem Mehrroboterzellen mit eng abgestimmter Sicherheitschoreografie: gemeinsame Arbeitsbereiche, Verriegelungen und Not-Halt-Logik, die ohne Überraschungen in Betrieb genommen werden müssen. Wir prüfen Robotik-Ingenieure an echten Automobilzellenproblemen — Taktzeitoptimierung, kollisionsfreie Bahnplanung und sichere Mehrroboter-Inbetriebnahme — und zertifizieren sie, damit Sie Erfahrung passend zum Risiko zuordnen können.',
    },
    ja: {
      title: '自動車製造向けの認定ロボティクスエンジニアを採用',
      sub: 'タクトで動くボディインホワイトとパワートレインのロボットセル——実際のマルチロボット試運転で検証されたFanuc・KUKA・ABBスペシャリスト。',
      pain1:
        '自動車は産業用ロボティクスが最も過酷な形で活躍する場です——ボディインホワイトショップでは数十台のロボットがスポット溶接、ハンドリング、シーリングを、決して緩まないタクトタイムでこなします。サイクルタイムは秒単位で計られる金であり、些細に見える経路やドレスアウトの判断がラインの目標達成を左右します。',
      pain2:
        'これらはまた、安全上の連携が極めてタイトなマルチロボットセルでもあります——共有作業エリア、インターロック、非常停止ロジックは、驚きなく試運転されなければなりません。当社は実際の自動車セルの課題でロボティクスエンジニアを審査します——サイクルタイムの調整、衝突のない経路、安全なマルチロボット試運転——そして三段階の深度で認定し、リスクに応じた経験レベルのマッチングを可能にします。',
    },
    ko: {
      title: '자동차 제조를 위한 인증 로보틱스 엔지니어 채용',
      sub: '택트에 맞춰 움직이는 차체(BIW)와 파워트레인 로봇 셀 — 실제 다중 로봇 시운전에서 검증된 Fanuc, KUKA, ABB 전문가.',
      pain1:
        '자동차는 산업용 로보틱스가 가장 까다로운 형태로 존재하는 곳입니다 — 차체 공장에서는 수십 대의 로봇이 절대 느슨해지지 않는 택트타임에 맞춰 스팟용접, 핸들링, 실링을 수행합니다. 사이클타임은 초 단위로 계산되는 돈이므로, 사소해 보이는 경로 및 배선 배치 결정이 라인이 목표 생산량을 달성하는지를 좌우합니다.',
      pain2:
        '이들은 또한 안전 협조가 매우 촘촘한 다중 로봇 셀이기도 합니다. 공유 작업 구역, 인터록, 비상정지 로직은 예상 밖의 일 없이 시운전되어야 합니다. 우리는 실제 자동차 셀 문제로 로보틱스 엔지니어를 심사합니다 — 사이클타임 조정, 충돌 없는 경로, 안전한 다중 로봇 시운전 — 그리고 3단계 깊이로 인증하여 위험도에 맞게 숙련도를 매칭할 수 있게 합니다.',
    },
  },
  'robotics/3c-electronics': {
    track: 'robotics',
    industry: '3c-electronics',
    industrySkills: ['Vision-guided pick & place', 'Precision assembly', 'SCARA / small 6-axis', 'Force control', 'Fast changeover'],
    en: {
      title: 'Hire Certified Robotics Engineers for 3C Electronics',
      sub: 'Precise, vision-guided assembly for high-mix electronics lines — SCARA and small 6-axis specialists built for fast model changeover.',
      pain1:
        '3C electronics — computers, communications and consumer devices — runs on precision and speed at tiny scale. Robots here place connectors, drive micro-screws and handle delicate parts where microns and grams matter, often with vision guidance closing the loop. The hard part is repeatability at that precision, not raw payload.',
      pain2:
        'The other reality is model churn: 3C lines change product constantly, so cells have to be built for fast, low-error changeover rather than a single fixed job. We match you with robotics engineers who have programmed precise, vision-guided assembly and force-controlled tasks — and who design cells that survive the next model change.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 3C 电子',
      sub: '面向高混线电子产线的精密视觉引导装配——SCARA 与小型六轴专家，为快速换型而生。',
      pain1:
        '3C 电子——计算机、通讯、消费电子——靠的是小尺度下的精度与速度。这里的机器人插连接器、拧微型螺丝、抓取脆弱零件，微米和克都要计较，往往还要靠视觉闭环。真正的难点是在那种精度下的可重复性，而不是负载大小。',
      pain2:
        '另一个现实是机型频繁更替：3C 产线不停换产品，所以工作站要为"快速、低错的换型"而建，而不是为一个固定工件。我们为你匹配编过精密视觉引导装配与力控任务的机器人工程师——他们设计的工作站，扛得住下一次机型切换。',
    },
    es: {
      title: 'Contrate ingenieros de robótica certificados para electrónica 3C',
      sub: 'Ensamble preciso guiado por visión para líneas electrónicas de alta mezcla — especialistas en SCARA y 6 ejes pequeños construidos para cambios rápidos de modelo.',
      pain1:
        'La electrónica 3C — computación, comunicaciones y dispositivos de consumo — funciona con precisión y velocidad a escala diminuta. Los robots aquí colocan conectores, atornillan microtornillos y manipulan piezas delicadas donde las micras y los gramos importan, a menudo con guiado por visión cerrando el lazo. La parte difícil es la repetibilidad a esa precisión, no la capacidad de carga bruta.',
      pain2:
        'La otra realidad es la rotación de modelos: las líneas 3C cambian de producto constantemente, así que las celdas deben construirse para cambios rápidos y de bajo error, no para un trabajo fijo único. Le emparejamos con ingenieros de robótica que han programado ensamble de precisión guiado por visión y tareas con control de fuerza — y que diseñan celdas que sobreviven al próximo cambio de modelo.',
    },
    vi: {
      title: 'Thuê kỹ sư robot có chứng chỉ cho ngành điện tử 3C',
      sub: 'Lắp ráp chính xác dẫn hướng bằng thị giác cho dây chuyền điện tử đa chủng loại — chuyên gia SCARA và 6 trục nhỏ được xây dựng cho đổi model nhanh.',
      pain1:
        'Điện tử 3C — máy tính, viễn thông và thiết bị tiêu dùng — vận hành dựa trên độ chính xác và tốc độ ở quy mô cực nhỏ. Robot ở đây gắn đầu nối, siết vít vi mô và xử lý các bộ phận mỏng manh nơi micron và gram đều quan trọng, thường khép vòng lặp bằng dẫn hướng thị giác. Phần khó không phải tải trọng thô mà là khả năng lặp lại ở độ chính xác đó.',
      pain2:
        'Thực tế khác là vòng đời sản phẩm ngắn: dây chuyền 3C liên tục đổi sản phẩm, nên các tế bào phải được xây dựng cho việc đổi model nhanh, ít lỗi, thay vì một công việc cố định. Chúng tôi ghép bạn với kỹ sư robot đã lập trình lắp ráp chính xác dẫn hướng bằng thị giác và các tác vụ điều khiển lực — những người thiết kế tế bào chịu được lần đổi model tiếp theo.',
    },
    hi: {
      title: '3C इलेक्ट्रॉनिक्स के लिए प्रमाणित रोबोटिक्स इंजीनियर हायर करें',
      sub: 'हाई-मिक्स इलेक्ट्रॉनिक्स लाइनों के लिए सटीक, विज़न-गाइडेड असेंबली — SCARA और छोटे 6-एक्सिस स्पेशलिस्ट, फास्ट मॉडल चेंजओवर के लिए बनाए गए।',
      pain1:
        '3C इलेक्ट्रॉनिक्स — कंप्यूटर, कम्युनिकेशन और कंज़्यूमर डिवाइस — छोटे स्केल पर सटीकता और स्पीड पर चलता है। यहां के रोबोट कनेक्टर लगाते हैं, माइक्रो-स्क्रू कसते हैं और नाज़ुक पार्ट्स हैंडल करते हैं जहां माइक्रॉन और ग्राम मायने रखते हैं, अक्सर विज़न गाइडेंस लूप बंद करते हुए। मुश्किल हिस्सा उस सटीकता पर रिपीटेबिलिटी है, कच्चा पेलोड नहीं।',
      pain2:
        'दूसरी हकीकत मॉडल चर्न है: 3C लाइनें लगातार प्रोडक्ट बदलती हैं, इसलिए सेल को एक फिक्स्ड जॉब के बजाय फास्ट, लो-एरर चेंजओवर के लिए बनाना होता है। हम आपको ऐसे रोबोटिक्स इंजीनियर से मिलाते हैं जिन्होंने सटीक, विज़न-गाइडेड असेंबली और फोर्स-कंट्रोल्ड टास्क प्रोग्राम किए हैं — और जो ऐसे सेल डिज़ाइन करते हैं जो अगले मॉडल बदलाव में भी टिके रहें।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en robotique certifiés pour l’électronique 3C',
      sub: 'Assemblage précis guidé par vision pour lignes électroniques à forte diversité — spécialistes SCARA et petits 6 axes conçus pour des changements de modèle rapides.',
      pain1:
        'L’électronique 3C — ordinateurs, communications et appareils grand public — fonctionne sur la précision et la vitesse à très petite échelle. Les robots y placent des connecteurs, posent des micro-vis et manipulent des pièces délicates où les microns et les grammes comptent, souvent avec un guidage par vision fermant la boucle. La difficulté est la répétabilité à cette précision, pas la charge utile brute.',
      pain2:
        'L’autre réalité est la rotation des modèles : les lignes 3C changent de produit en permanence, donc les cellules doivent être construites pour des changements rapides et à faible taux d’erreur, plutôt que pour une tâche fixe unique. Nous vous associons à des ingénieurs en robotique ayant programmé un assemblage précis guidé par vision et des tâches à contrôle de force — et qui conçoivent des cellules qui survivent au prochain changement de modèle.',
    },
    de: {
      title: 'Zertifizierte Robotik-Ingenieure für 3C-Elektronik engagieren',
      sub: 'Präzise, bildgeführte Montage für hochgemischte Elektroniklinien — SCARA- und Kleinroboter-Spezialisten (6-Achser), gebaut für schnellen Modellwechsel.',
      pain1:
        '3C-Elektronik — Computer, Kommunikation und Konsumgeräte — läuft auf Präzision und Geschwindigkeit im kleinsten Maßstab. Roboter setzen hier Stecker, drehen Mikroschrauben und handhaben empfindliche Teile, bei denen Mikrometer und Gramm zählen, oft mit bildgesteuerter Regelschleife. Die Schwierigkeit liegt in der Wiederholgenauigkeit bei dieser Präzision, nicht in der reinen Traglast.',
      pain2:
        'Die andere Realität ist der Modellwechsel: 3C-Linien wechseln ständig das Produkt, daher müssen Zellen für schnellen, fehlerarmen Umbau ausgelegt sein statt für eine einzige feste Aufgabe. Wir vermitteln Ihnen Robotik-Ingenieure, die präzise, bildgeführte Montage und kraftgeregelte Aufgaben programmiert haben — und die Zellen entwerfen, die den nächsten Modellwechsel überstehen.',
    },
    ja: {
      title: '3C電子機器向けの認定ロボティクスエンジニアを採用',
      sub: '多品種電子ラインのための精密なビジョン誘導組立——迅速な機種切替のために作られたSCARAおよび小型6軸スペシャリスト。',
      pain1:
        '3C電子機器——コンピューター、通信、コンシューマー機器——は極小スケールでの精度とスピードで成り立っています。ここでのロボットはコネクタを挿入し、マイクロネジを締め、ミクロンとグラムが重要な繊細な部品を扱い、しばしばビジョン誘導でループを閉じます。難しいのはその精度での再現性であり、単なるペイロードの大きさではありません。',
      pain2:
        'もう一つの現実は機種の頻繁な入れ替わりです。3Cラインは絶えず製品を切り替えるため、セルは固定の一つの仕事のためではなく、迅速で低エラーな切替のために構築されなければなりません。当社は精密なビジョン誘導組立と力制御タスクをプログラムしてきたロボティクスエンジニアとあなたを引き合わせます——彼らが設計するセルは、次の機種切替にも耐えられます。',
    },
    ko: {
      title: '3C 전자제품을 위한 인증 로보틱스 엔지니어 채용',
      sub: '다품종 전자 라인을 위한 정밀 비전 가이드 조립 — 빠른 모델 전환을 위해 구축된 SCARA 및 소형 6축 전문가.',
      pain1:
        '3C 전자제품 — 컴퓨터, 통신, 소비자 기기 — 은 극소 규모에서의 정밀도와 속도로 돌아갑니다. 여기서 로봇은 커넥터를 꽂고 마이크로 나사를 조이며 미크론과 그램이 중요한 섬세한 부품을 다루며, 종종 비전 가이던스로 루프를 닫습니다. 어려운 부분은 그 정밀도에서의 반복 정확도이지, 단순한 페이로드 크기가 아닙니다.',
      pain2:
        '또 다른 현실은 모델 교체입니다. 3C 라인은 끊임없이 제품을 바꾸므로, 셀은 하나의 고정된 작업이 아니라 빠르고 오류가 적은 전환을 위해 구축되어야 합니다. 우리는 정밀 비전 가이드 조립과 힘 제어 작업을 프로그래밍해본 로보틱스 엔지니어와 매칭해 드립니다 — 다음 모델 전환에도 버티는 셀을 설계하는 사람들입니다.',
    },
  },
  'vision/semiconductor': {
    track: 'vision',
    industry: 'semiconductor',
    industrySkills: ['Wafer / die inspection', 'Sub-micron accuracy', 'Telecentric optics', 'Fiducial alignment', 'Gauge R&R'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Semiconductor',
      sub: 'Sub-micron wafer alignment and defect inspection — telecentric optics, calibration and gauge R&R, verified where accuracy is measured in pixels.',
      pain1:
        'Vision in a fab operates at the edge of what optics and lighting can resolve. Wafer alignment, die inspection and defect detection demand sub-micron repeatability, telecentric optics and lighting that holds stable across shifts — the difference between a real catch and a false reject is measured in pixels.',
      pain2:
        'At that accuracy, calibration and measurement discipline decide everything: fiducial alignment, gauge R&R and a system a process engineer will trust to gate real product. We screen vision engineers on the practical judgment behind high-magnification inspection, not just tool familiarity, and certify them at three depths.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 半导体',
      sub: '亚微米晶圆对位与缺陷检测——远心光学、标定与量具重复性(Gauge R&R)，在"精度以像素计"的地方验证。',
      pain1:
        '晶圆厂里的视觉，工作在光学与打光能分辨的极限边缘。晶圆对位、芯粒(die)检测与缺陷检出，要求亚微米级可重复性、远心光学、以及跨班次都稳的打光——一次"真检出"和一次"误剔除"之间的差距，是以像素来衡量的。',
      pain2:
        '在那种精度下，标定与测量纪律决定一切：基准点(fiducial)对位、量具重复性再现性(Gauge R&R)、以及一套工艺工程师敢用来放行真实产品的系统。我们在高倍检测背后的实操判断上筛选视觉工程师——不只是会用某个工具——并按三个深度发放认证。',
    },
    es: {
      title: 'Contrate ingenieros de visión artificial certificados para semiconductores',
      sub: 'Alineación de obleas submicrónica e inspección de defectos — óptica telecéntrica, calibración y Gauge R&R, verificados donde la precisión se mide en píxeles.',
      pain1:
        'La visión en una fábrica de semiconductores opera al límite de lo que la óptica y la iluminación pueden resolver. La alineación de obleas, la inspección de dados y la detección de defectos exigen repetibilidad submicrónica, óptica telecéntrica e iluminación que se mantiene estable turno tras turno: la diferencia entre una detección real y un rechazo falso se mide en píxeles.',
      pain2:
        'A esa precisión, la calibración y la disciplina de medición lo deciden todo: alineación de referencias (fiducial), Gauge R&R y un sistema en el que un ingeniero de proceso confiará para liberar producto real. Evaluamos a los ingenieros de visión sobre el juicio práctico detrás de la inspección de alta magnificación, no solo la familiaridad con una herramienta, y los certificamos en tres niveles de profundidad.',
    },
    vi: {
      title: 'Thuê kỹ sư thị giác máy có chứng chỉ cho ngành bán dẫn',
      sub: 'Căn chỉnh wafer dưới micron và kiểm tra khuyết tật — quang học viễn tâm, hiệu chuẩn và Gauge R&R, được xác minh nơi độ chính xác được đo bằng pixel.',
      pain1:
        'Thị giác máy trong một nhà máy bán dẫn hoạt động ở giới hạn mà quang học và ánh sáng có thể phân giải. Căn chỉnh wafer, kiểm tra die và phát hiện khuyết tật đòi hỏi độ lặp lại dưới micron, quang học viễn tâm và ánh sáng ổn định qua các ca — khoảng cách giữa một lần phát hiện thật và một lần loại bỏ giả được đo bằng pixel.',
      pain2:
        'Ở độ chính xác đó, kỷ luật hiệu chuẩn và đo lường quyết định tất cả: căn chỉnh điểm chuẩn (fiducial), độ lặp lại và tái lập của thiết bị đo (Gauge R&R), và một hệ thống mà kỹ sư quy trình dám dùng để cho phép xuất xưởng sản phẩm thật. Chúng tôi sàng lọc kỹ sư thị giác dựa trên khả năng phán đoán thực tế đằng sau việc kiểm tra độ phóng đại cao — không chỉ là sự quen thuộc với một công cụ — và cấp chứng chỉ theo ba mức độ.',
    },
    hi: {
      title: 'सेमीकंडक्टर के लिए प्रमाणित मशीन विज़न इंजीनियर हायर करें',
      sub: 'सब-माइक्रॉन वेफर अलाइनमेंट और डिफेक्ट इंस्पेक्शन — टेलीसेंट्रिक ऑप्टिक्स, कैलिब्रेशन और गेज R&R, ऐसी जगह सत्यापित जहां सटीकता पिक्सल में नापी जाती है।',
      pain1:
        'फैब में विज़न ऑप्टिक्स और लाइटिंग जो रिज़ॉल्व कर सकते हैं उसकी सीमा पर काम करता है। वेफर अलाइनमेंट, डाई इंस्पेक्शन और डिफेक्ट डिटेक्शन को सब-माइक्रॉन रिपीटेबिलिटी, टेलीसेंट्रिक ऑप्टिक्स और ऐसी लाइटिंग चाहिए जो शिफ्ट्स में स्थिर बनी रहे — असली पकड़ और झूठे रिजेक्ट के बीच का फर्क पिक्सल में नापा जाता है।',
      pain2:
        'उस सटीकता पर, कैलिब्रेशन और मेज़रमेंट अनुशासन सब कुछ तय करता है: फिड्यूशियल अलाइनमेंट, गेज R&R, और एक ऐसा सिस्टम जिस पर प्रोसेस इंजीनियर असली प्रोडक्ट पास करने के लिए भरोसा करेगा। हम हाई-मैग्निफिकेशन इंस्पेक्शन के पीछे के प्रैक्टिकल जजमेंट पर विज़न इंजीनियर छांटते हैं — सिर्फ किसी टूल की जानकारी पर नहीं — और तीन गहराइयों पर प्रमाणित करते हैं।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en vision industrielle certifiés pour les semi-conducteurs',
      sub: 'Alignement de wafers submicronique et inspection de défauts — optique télécentrique, calibrage et Gauge R&R, vérifiés là où la précision se mesure en pixels.',
      pain1:
        'La vision dans une fab opère à la limite de ce que l’optique et l’éclairage peuvent résoudre. L’alignement des wafers, l’inspection des puces et la détection de défauts exigent une répétabilité submicronique, une optique télécentrique et un éclairage stable d’une équipe à l’autre — la différence entre une véritable détection et un faux rejet se mesure en pixels.',
      pain2:
        'À cette précision, le calibrage et la discipline de mesure décident de tout : alignement de repères (fiducial), Gauge R&R, et un système auquel un ingénieur procédé fera confiance pour libérer un produit réel. Nous évaluons les ingénieurs vision sur le jugement pratique derrière l’inspection à fort grossissement, pas seulement la familiarité avec un outil, et nous les certifions à trois niveaux de profondeur.',
    },
    de: {
      title: 'Zertifizierte Bildverarbeitungs-Ingenieure für Halbleiter engagieren',
      sub: 'Submikron-Waferausrichtung und Fehlerinspektion — telezentrische Optik, Kalibrierung und Gauge R&R, verifiziert dort, wo Genauigkeit in Pixeln gemessen wird.',
      pain1:
        'Bildverarbeitung in einer Fab arbeitet an der Grenze dessen, was Optik und Beleuchtung auflösen können. Waferausrichtung, Chipinspektion und Fehlererkennung verlangen Submikron-Wiederholgenauigkeit, telezentrische Optik und Beleuchtung, die über Schichten hinweg stabil bleibt — der Unterschied zwischen einem echten Fund und einer Fehlausschussmeldung wird in Pixeln gemessen.',
      pain2:
        'Bei dieser Genauigkeit entscheiden Kalibrierungs- und Messdisziplin über alles: Passermarken-Ausrichtung (Fiducial), Gauge R&R und ein System, dem ein Prozessingenieur vertraut, um echtes Produkt freizugeben. Wir prüfen Bildverarbeitungs-Ingenieure anhand des praktischen Urteilsvermögens hinter hochauflösender Inspektion — nicht nur der Vertrautheit mit einem Tool — und zertifizieren sie auf drei Tiefenstufen.',
    },
    ja: {
      title: '半導体向けの認定マシンビジョンエンジニアを採用',
      sub: 'サブミクロンのウェハーアライメントと欠陥検査——テレセントリック光学系、キャリブレーション、ゲージR&R、精度がピクセル単位で測られる現場で検証。',
      pain1:
        'ファブにおけるビジョンは、光学系と照明が解像できる限界で動作します。ウェハーアライメント、ダイ検査、欠陥検出にはサブミクロンの再現性、テレセントリック光学系、シフトを超えて安定する照明が求められます——本当の検出と誤リジェクトの差はピクセル単位で測られます。',
      pain2:
        'その精度では、キャリブレーションと測定規律がすべてを決めます。基準点（フィデューシャル）アライメント、ゲージR&R、そしてプロセスエンジニアが実際の製品を通す判断に使えるシステムです。当社はツールへの習熟度だけでなく、高倍率検査の背後にある実務的判断力でビジョンエンジニアを審査し、三段階の深度で認定します。',
    },
    ko: {
      title: '반도체를 위한 인증 머신 비전 엔지니어 채용',
      sub: '서브마이크론 웨이퍼 정렬 및 결함 검사 — 텔레센트릭 광학계, 캘리브레이션, Gauge R&R, 정밀도가 픽셀 단위로 측정되는 현장에서 검증.',
      pain1:
        '팹 내 비전은 광학계와 조명이 분해할 수 있는 한계에서 작동합니다. 웨이퍼 정렬, 다이 검사, 결함 검출은 서브마이크론 반복 정확도, 텔레센트릭 광학계, 교대 근무를 넘어 안정적인 조명을 요구합니다 — 실제 검출과 오탐 리젝트의 차이는 픽셀 단위로 측정됩니다.',
      pain2:
        '그 정밀도에서는 캘리브레이션과 측정 규율이 모든 것을 결정합니다. 기준점(fiducial) 정렬, Gauge R&R, 그리고 공정 엔지니어가 실제 제품을 통과시키는 데 신뢰할 수 있는 시스템입니다. 우리는 단순한 도구 숙련도가 아니라 고배율 검사 이면의 실무적 판단력으로 비전 엔지니어를 심사하고, 3단계 깊이로 인증합니다.',
    },
  },
  'vision/packaging': {
    track: 'vision',
    industry: 'packaging',
    industrySkills: ['OCR / OCV verification', 'Barcode / DMC read rate', 'High-speed reject timing', 'Reflective-surface lighting', 'Print inspection'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Packaging',
      sub: 'Label, date/lot and seal verification at line speed — OCR/OCV and read-rate reliability on reflective, curved and moving surfaces.',
      pain1:
        'Packaging vision is a speed-and-variation problem. Lines run fast, products change constantly, and the system has to verify labels, print, date/lot codes and seals on reflective, curved or moving surfaces without slowing the line or throwing false rejects. Read rate and OCV reliability are the whole game.',
      pain2:
        'Getting there is mostly lighting, optics and reject timing — not the algorithm. Reading a date code on a shiny curved bottle at line speed, and firing the reject on the right part, is exactly the practical judgment that separates a demo from a production system. We screen and certify vision engineers on that real-world reliability.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 包装',
      sub: '产线速度下的标签、日期/批号与封口核验——在反光、曲面、运动表面上的 OCR/OCV 与读取率可靠性。',
      pain1:
        '包装视觉是一个"速度 + 变化"的问题。产线跑得快，产品不停换，系统要在反光、曲面、运动的表面上核验标签、印刷、日期/批号码与封口，既不能拖慢产线，也不能乱剔除。读取率和 OCV 可靠性就是全部的胜负手。',
      pain2:
        '做到这一点，靠的多是打光、光学与剔除时序——而不是算法。在产线速度下读出一个亮曲面瓶子上的生产日期，并在正确的那件产品上触发剔除，正是把 demo 和量产系统区分开的实操判断。我们就在这种现实世界的可靠性上筛选并认证视觉工程师。',
    },
    es: {
      title: 'Contrate ingenieros de visión artificial certificados para empaque',
      sub: 'Verificación de etiquetas, fecha/lote y sello a la velocidad de la línea — fiabilidad de OCR/OCV y tasa de lectura en superficies reflectantes, curvas y en movimiento.',
      pain1:
        'La visión en empaque es un problema de velocidad y variación. Las líneas corren rápido, los productos cambian constantemente, y el sistema tiene que verificar etiquetas, impresión, códigos de fecha/lote y sellos en superficies reflectantes, curvas o en movimiento sin frenar la línea ni generar falsos rechazos. La tasa de lectura y la fiabilidad de OCV son todo el juego.',
      pain2:
        'Lograrlo depende sobre todo de la iluminación, la óptica y el tiempo de rechazo, no del algoritmo. Leer un código de fecha en una botella curva y brillante a la velocidad de la línea, y disparar el rechazo en la pieza correcta, es exactamente el juicio práctico que separa una demo de un sistema de producción. Evaluamos y certificamos a los ingenieros de visión en esa fiabilidad del mundo real.',
    },
    vi: {
      title: 'Thuê kỹ sư thị giác máy có chứng chỉ cho ngành đóng gói',
      sub: 'Xác minh nhãn, ngày/lô và niêm phong ở tốc độ dây chuyền — độ tin cậy OCR/OCV và tỷ lệ đọc trên bề mặt phản chiếu, cong và chuyển động.',
      pain1:
        'Thị giác máy trong đóng gói là bài toán tốc độ và biến động. Dây chuyền chạy nhanh, sản phẩm thay đổi liên tục, và hệ thống phải xác minh nhãn, bản in, mã ngày/lô và niêm phong trên bề mặt phản chiếu, cong hoặc chuyển động mà không làm chậm dây chuyền hay gây loại bỏ giả. Tỷ lệ đọc và độ tin cậy OCV là toàn bộ cuộc chơi.',
      pain2:
        'Để đạt được điều đó, phần lớn nằm ở ánh sáng, quang học và thời điểm loại bỏ — không phải thuật toán. Đọc được mã ngày trên một chai cong sáng bóng ở tốc độ dây chuyền, và kích hoạt loại bỏ đúng sản phẩm, chính là khả năng phán đoán thực tế phân biệt một bản demo với một hệ thống sản xuất thật. Chúng tôi sàng lọc và cấp chứng chỉ cho kỹ sư thị giác dựa trên độ tin cậy thực tế đó.',
    },
    hi: {
      title: 'पैकेजिंग के लिए प्रमाणित मशीन विज़न इंजीनियर हायर करें',
      sub: 'लाइन स्पीड पर लेबल, डेट/लॉट और सील वेरिफिकेशन — रिफ्लेक्टिव, कर्व्ड और मूविंग सतहों पर OCR/OCV और रीड-रेट रिलायबिलिटी।',
      pain1:
        'पैकेजिंग विज़न स्पीड-और-वेरिएशन की समस्या है। लाइनें तेज़ चलती हैं, प्रोडक्ट लगातार बदलते हैं, और सिस्टम को रिफ्लेक्टिव, कर्व्ड या मूविंग सतहों पर लेबल, प्रिंट, डेट/लॉट कोड और सील वेरिफाई करने होते हैं, वो भी बिना लाइन धीमी किए या झूठे रिजेक्ट फेंके। रीड रेट और OCV रिलायबिलिटी ही पूरा खेल हैं।',
      pain2:
        'वहां तक पहुंचना ज़्यादातर लाइटिंग, ऑप्टिक्स और रिजेक्ट टाइमिंग पर निर्भर है — एल्गोरिदम पर नहीं। लाइन स्पीड पर एक चमकदार कर्व्ड बोतल पर डेट कोड पढ़ना, और सही प्रोडक्ट पर रिजेक्ट फायर करना — यही वह प्रैक्टिकल जजमेंट है जो डेमो और प्रोडक्शन सिस्टम को अलग करता है। हम इसी असल-दुनिया की रिलायबिलिटी पर विज़न इंजीनियर छांटते और प्रमाणित करते हैं।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en vision industrielle certifiés pour l’emballage',
      sub: 'Vérification d’étiquettes, de date/lot et de scellage à la vitesse de la ligne — fiabilité OCR/OCV et taux de lecture sur surfaces réfléchissantes, courbes et en mouvement.',
      pain1:
        'La vision en emballage est un problème de vitesse et de variation. Les lignes vont vite, les produits changent en permanence, et le système doit vérifier étiquettes, impression, codes de date/lot et scellages sur des surfaces réfléchissantes, courbes ou en mouvement sans ralentir la ligne ni provoquer de faux rejets. Le taux de lecture et la fiabilité OCV sont tout l’enjeu.',
      pain2:
        'Y parvenir tient surtout à l’éclairage, à l’optique et à la synchronisation du rejet — pas à l’algorithme. Lire un code de date sur une bouteille brillante et courbe à la vitesse de la ligne, et déclencher le rejet sur la bonne pièce, est exactement le jugement pratique qui distingue une démo d’un système de production. Nous évaluons et certifions les ingénieurs vision sur cette fiabilité réelle.',
    },
    de: {
      title: 'Zertifizierte Bildverarbeitungs-Ingenieure für Verpackung engagieren',
      sub: 'Etiketten-, Datums-/Chargen- und Siegelprüfung bei Linientempo — OCR-/OCV- und Leseraten-Zuverlässigkeit auf reflektierenden, gekrümmten und bewegten Oberflächen.',
      pain1:
        'Verpackungsbildverarbeitung ist ein Geschwindigkeits- und Variationsproblem. Linien laufen schnell, Produkte wechseln ständig, und das System muss Etiketten, Druck, Datums-/Chargencodes und Siegel auf reflektierenden, gekrümmten oder bewegten Oberflächen prüfen, ohne die Linie zu verlangsamen oder Fehlausschuss zu erzeugen. Leserate und OCV-Zuverlässigkeit sind das ganze Spiel.',
      pain2:
        'Das zu erreichen liegt vor allem an Beleuchtung, Optik und Ausschusstiming — nicht am Algorithmus. Einen Datumscode auf einer glänzenden, gekrümmten Flasche bei Linientempo zu lesen und den Ausschuss beim richtigen Teil auszulösen, ist genau das praktische Urteilsvermögen, das eine Demo von einem Produktionssystem unterscheidet. Wir prüfen und zertifizieren Bildverarbeitungs-Ingenieure genau anhand dieser realen Zuverlässigkeit.',
    },
    ja: {
      title: '包装向けの認定マシンビジョンエンジニアを採用',
      sub: 'ラインスピードでのラベル・日付/ロット・シール検証——反射面、曲面、移動面でのOCR/OCVと読み取り率の信頼性。',
      pain1:
        '包装ビジョンは速度とばらつきの問題です。ラインは高速で稼働し、製品は絶えず変わり、システムは反射面・曲面・移動面上のラベル、印刷、日付/ロットコード、シールを、ラインを減速させることも誤リジェクトを出すこともなく検証しなければなりません。読み取り率とOCVの信頼性がすべてを決めます。',
      pain2:
        'そこに到達するのは、アルゴリズムよりも照明・光学系・リジェクトタイミングによるところが大きいのです。ラインスピードで光沢のある曲面ボトルの日付コードを読み取り、正しい製品でリジェクトを発火させることこそ、デモと量産システムを分ける実務的判断力です。当社はまさにこの現実世界での信頼性でビジョンエンジニアを審査・認定します。',
    },
    ko: {
      title: '포장을 위한 인증 머신 비전 엔지니어 채용',
      sub: '라인 속도에서의 라벨, 날짜/로트, 씰 검증 — 반사면, 곡면, 이동면에서의 OCR/OCV 및 판독률 신뢰성.',
      pain1:
        '포장 비전은 속도와 변동성의 문제입니다. 라인은 빠르게 돌아가고 제품은 끊임없이 바뀌며, 시스템은 반사, 곡면, 이동하는 표면 위에서 라벨, 인쇄물, 날짜/로트 코드, 씰을 라인을 늦추거나 오탐 리젝트를 내지 않고 검증해야 합니다. 판독률과 OCV 신뢰성이 승부의 전부입니다.',
      pain2:
        '이를 달성하는 것은 대부분 알고리즘이 아니라 조명, 광학, 리젝트 타이밍에 달려 있습니다. 라인 속도에서 광택 있는 곡면 병에 적힌 날짜 코드를 읽고 올바른 제품에서 리젝트를 발동시키는 것이야말로 데모와 양산 시스템을 가르는 실무적 판단력입니다. 우리는 바로 이 실전 신뢰성을 기준으로 비전 엔지니어를 심사하고 인증합니다.',
    },
  },
  // ── 2026-07 扩容的 4 个组合（robotics/packaging、vision/pharma、vision/automotive、
  //    robotics/food-beverage）：只补真正有行业差异化内容的组合，其余候选是可互换的填充物、不上。──
  'robotics/packaging': {
    track: 'robotics',
    industry: 'packaging',
    industrySkills: ['Palletizing & pattern generation', 'Case packing', 'EOAT selection & design', 'Rate matching & buffering', 'Conveyor & line tracking'],
    en: {
      title: 'Hire Certified Robotics Engineers for Packaging',
      sub: 'Palletizing, case packing and end-of-line cells that hold line rate — EOAT selection, pattern generation and rate matching from verified engineers.',
      pain1:
        'End-of-line robotics looks simple on a slide and gets hard on the floor. A palletizing cell has to build stable loads from whatever the line sends it — mixed cases, changing pack patterns, layer sheets and slip sheets — and the pattern-generation logic that decides where each case lands is as much the deliverable as the robot itself. The wrong EOAT choice — vacuum where a clamp was needed — shows up as dropped cases and crushed corners at full speed.',
      pain2:
        'The second trap is rate. A packaging robot never sees a steady stream: upstream fillers and cartoners surge and starve, and the cell has to absorb that with buffering, infeed tracking and conveyor handshakes or it becomes the bottleneck of the entire line. We screen robotics engineers on real end-of-line problems — pattern generation, EOAT selection and rate matching — and certify them at three depths so you can match seniority to the job.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 包装',
      sub: '守得住产线速度的码垛、装箱与线尾工作站——EOAT 选型、垛型生成与节拍匹配，来自经验证的工程师。',
      pain1:
        '线尾机器人在 PPT 上看着简单，到现场就难了。码垛工作站必须把产线送来的任何东西码成稳定的垛——混装箱、变化的垛型、隔层纸与滑托板——而决定每个箱子落在哪的垛型生成逻辑，和机器人本体一样都是交付物。EOAT 选错了——该用夹爪的地方用了真空吸盘——到了全速运行时就会变成掉箱和压塌的箱角。',
      pain2:
        '第二个坑是节拍。包装机器人从来见不到匀速的来料：上游灌装机与装盒机时涌时断，工作站必须靠缓存、来料跟踪与输送线握手把波动吸收掉，否则它自己就成了整条线的瓶颈。我们在真实的线尾问题上筛选机器人工程师——垛型生成、EOAT 选型、节拍匹配——并按三个深度发放认证，让你按任务匹配资历。',
    },
    es: {
      title: 'Contrate ingenieros de robótica certificados para empaque',
      sub: 'Celdas de paletizado, empaque de cajas y fin de línea que mantienen el ritmo de la línea — selección de EOAT, generación de patrones y ajuste de ritmo de ingenieros verificados.',
      pain1:
        'La robótica de fin de línea parece simple en una diapositiva y se vuelve difícil en planta. Una celda de paletizado debe construir cargas estables con lo que sea que la línea le envíe — cajas mixtas, patrones de empaque cambiantes, hojas de capa y hojas antideslizantes — y la lógica de generación de patrones que decide dónde cae cada caja es tan parte del entregable como el robot mismo. La elección incorrecta de EOAT — vacío donde se necesitaba una pinza — se traduce en cajas caídas y esquinas aplastadas a plena velocidad.',
      pain2:
        'La segunda trampa es el ritmo. Un robot de empaque nunca ve un flujo constante: las llenadoras y encartonadoras aguas arriba tienen picos y caídas, y la celda tiene que absorber eso con almacenamiento intermedio, seguimiento de entrada y protocolos con la transportadora, o se convierte en el cuello de botella de toda la línea. Evaluamos a los ingenieros de robótica en problemas reales de fin de línea — generación de patrones, selección de EOAT y ajuste de ritmo — y los certificamos en tres niveles de profundidad para que pueda emparejar la seniority con el trabajo.',
    },
    vi: {
      title: 'Thuê kỹ sư robot có chứng chỉ cho ngành đóng gói',
      sub: 'Các tế bào chất pallet, đóng thùng và cuối dây chuyền giữ đúng nhịp dây chuyền — chọn EOAT, tạo mẫu xếp và khớp nhịp từ kỹ sư đã được xác minh.',
      pain1:
        'Robot cuối dây chuyền trông đơn giản trên slide nhưng khó trên thực địa. Một tế bào chất pallet phải tạo ra các khối hàng ổn định từ bất cứ thứ gì dây chuyền đưa tới — thùng hỗn hợp, mẫu xếp thay đổi, tấm lót lớp và tấm chống trượt — và logic tạo mẫu xếp quyết định mỗi thùng rơi vào đâu cũng là sản phẩm bàn giao ngang với chính con robot. Chọn sai EOAT — dùng hút chân không ở nơi cần kẹp — sẽ hiện ra thành thùng rơi và góc thùng bị bẹp khi chạy hết tốc độ.',
      pain2:
        'Cái bẫy thứ hai là nhịp độ. Robot đóng gói không bao giờ thấy dòng nguyên liệu đều đặn: máy chiết rót và đóng hộp phía trên dao động lúc dồn lúc thiếu, và tế bào phải hấp thụ điều đó bằng bộ đệm, theo dõi đầu vào và bắt tay với băng tải, nếu không chính nó sẽ trở thành nút thắt cổ chai của cả dây chuyền. Chúng tôi sàng lọc kỹ sư robot trên các bài toán cuối dây chuyền thực tế — tạo mẫu xếp, chọn EOAT, khớp nhịp — và cấp chứng chỉ theo ba mức độ để bạn khớp đúng trình độ với công việc.',
    },
    hi: {
      title: 'पैकेजिंग के लिए प्रमाणित रोबोटिक्स इंजीनियर हायर करें',
      sub: 'पैलेटाइज़िंग, केस पैकिंग और एंड-ऑफ-लाइन सेल जो लाइन रेट थामे रखें — सत्यापित इंजीनियरों से EOAT चयन, पैटर्न जनरेशन और रेट मैचिंग।',
      pain1:
        'एंड-ऑफ-लाइन रोबोटिक्स स्लाइड पर आसान दिखती है और फ्लोर पर मुश्किल हो जाती है। एक पैलेटाइज़िंग सेल को लाइन जो भी भेजे उससे स्टेबल लोड बनाने होते हैं — मिक्स्ड केस, बदलते पैक पैटर्न, लेयर शीट्स और स्लिप शीट्स — और हर केस कहां जाएगा यह तय करने वाला पैटर्न-जनरेशन लॉजिक, रोबोट जितना ही डिलीवरेबल है। गलत EOAT चुनना — जहां क्लैंप चाहिए था वहां वैक्यूम — फुल स्पीड पर गिरे हुए केस और चपटे कोनों के रूप में सामने आता है।',
      pain2:
        'दूसरा जाल है रेट। पैकेजिंग रोबोट को कभी स्थिर प्रवाह नहीं मिलता: अपस्ट्रीम फिलर्स और कार्टनर्स कभी उछलते कभी रुकते हैं, और सेल को बफरिंग, इनफीड ट्रैकिंग और कन्वेयर हैंडशेक से इसे सोखना होता है, वरना वह खुद पूरी लाइन की बॉटलनेक बन जाती है। हम असली एंड-ऑफ-लाइन समस्याओं पर रोबोटिक्स इंजीनियर छांटते हैं — पैटर्न जनरेशन, EOAT चयन और रेट मैचिंग — और तीन गहराइयों पर प्रमाणित करते हैं ताकि आप काम के हिसाब से सीनियरिटी मैच कर सकें।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en robotique certifiés pour l’emballage',
      sub: 'Cellules de palettisation, de mise en carton et de fin de ligne qui tiennent la cadence — sélection d’EOAT, génération de motifs et ajustement de cadence par des ingénieurs vérifiés.',
      pain1:
        'La robotique de fin de ligne paraît simple sur une diapositive et devient difficile sur le terrain. Une cellule de palettisation doit construire des charges stables à partir de ce que la ligne lui envoie — caisses mixtes, motifs d’empilage changeants, intercalaires de couche et feuilles de glissement — et la logique de génération de motifs qui décide où atterrit chaque caisse fait autant partie du livrable que le robot lui-même. Un mauvais choix d’EOAT — une préhension par le vide là où il fallait une pince — se traduit par des caisses tombées et des coins écrasés à pleine vitesse.',
      pain2:
        'Le second piège est la cadence. Un robot d’emballage ne voit jamais un flux régulier : les remplisseuses et encartonneuses en amont accélèrent et ralentissent, et la cellule doit absorber cela par la mise en tampon, le suivi d’alimentation et des échanges avec le convoyeur, sinon elle devient elle-même le goulot d’étranglement de toute la ligne. Nous évaluons les ingénieurs en robotique sur de vrais problèmes de fin de ligne — génération de motifs, sélection d’EOAT et ajustement de cadence — et nous les certifions à trois niveaux de profondeur pour que vous puissiez adapter le niveau d’expérience à la tâche.',
    },
    de: {
      title: 'Zertifizierte Robotik-Ingenieure für Verpackung engagieren',
      sub: 'Palettier-, Kartonier- und Linienend-Zellen, die den Linientakt halten — EOAT-Auswahl, Musterbildung und Ratenanpassung von verifizierten Ingenieuren.',
      pain1:
        'Linienend-Robotik wirkt auf einer Folie einfach und wird auf dem Hallenboden schwierig. Eine Palettierzelle muss aus dem, was die Linie liefert, stabile Ladungen bilden — gemischte Kartons, wechselnde Packmuster, Zwischenlagen und Antirutschbögen — und die Musterbildungslogik, die entscheidet, wo jeder Karton landet, ist ebenso Teil der Leistung wie der Roboter selbst. Die falsche EOAT-Wahl — Vakuum, wo ein Greifer nötig war — zeigt sich bei voller Geschwindigkeit als heruntergefallene Kartons und zerdrückte Ecken.',
      pain2:
        'Die zweite Falle ist die Rate. Ein Verpackungsroboter sieht nie einen gleichmäßigen Strom: vorgelagerte Abfüller und Kartonierer schwanken zwischen Überschuss und Mangel, und die Zelle muss das durch Pufferung, Zulauf-Tracking und Förderband-Handshakes auffangen, sonst wird sie selbst zum Engpass der gesamten Linie. Wir prüfen Robotik-Ingenieure an echten Linienend-Problemen — Musterbildung, EOAT-Auswahl und Ratenanpassung — und zertifizieren sie auf drei Tiefenstufen, damit Sie Erfahrung passend zur Aufgabe zuordnen können.',
    },
    ja: {
      title: '包装向けの認定ロボティクスエンジニアを採用',
      sub: 'ラインレートを維持するパレタイジング・ケースパッキング・ライン終端セル——検証済みエンジニアによるEOAT選定、パターン生成、レートマッチング。',
      pain1:
        'ライン終端ロボティクスはスライド上では単純に見えるが、現場では難しくなります。パレタイジングセルは、混載ケース、変化するパックパターン、層シート、滑り止めシートなど、ラインから送られてくるものから安定した積み荷を作らなければならず、各ケースがどこに着地するかを決めるパターン生成ロジックは、ロボット本体と同じくらい成果物の一部です。EOATの選定を誤る——クランプが必要な場所で真空吸着を使う——と、フルスピードでケースの落下や角の潰れとして現れます。',
      pain2:
        '第二の落とし穴はレートです。包装ロボットが一定の流れを見ることは決してありません。上流の充填機やカートナーは波打ち止まりするため、セルはバッファリング、投入トラッキング、コンベアとのハンドシェイクでその変動を吸収しなければならず、さもなければセル自体がライン全体のボトルネックになります。当社は実際のライン終端の課題でロボティクスエンジニアを審査します——パターン生成、EOAT選定、レートマッチング——そして三段階の深度で認定し、業務に応じた経験レベルのマッチングを可能にします。',
    },
    ko: {
      title: '포장을 위한 인증 로보틱스 엔지니어 채용',
      sub: '라인 속도를 유지하는 팔레타이징, 케이스 포장, 라인 끝단 셀 — 검증된 엔지니어의 EOAT 선정, 패턴 생성, 속도 매칭.',
      pain1:
        '라인 끝단 로보틱스는 슬라이드에서는 단순해 보이지만 현장에서는 어려워집니다. 팔레타이징 셀은 라인이 보내는 것이 무엇이든 — 혼합 케이스, 바뀌는 적재 패턴, 층 시트와 미끄럼 방지 시트 — 그것으로 안정적인 적재물을 만들어야 하며, 각 케이스가 어디에 놓일지 결정하는 패턴 생성 로직은 로봇 본체만큼이나 결과물의 일부입니다. EOAT 선택을 잘못하면 — 클램프가 필요한 곳에 진공을 쓰면 — 전속력에서 케이스 낙하와 찌그러진 모서리로 나타납니다.',
      pain2:
        '두 번째 함정은 속도입니다. 포장 로봇은 결코 일정한 흐름을 보지 못합니다. 상류의 충전기와 포장기는 몰렸다 끊겼다 하며, 셀은 버퍼링, 투입 추적, 컨베이어와의 핸드셰이크로 이를 흡수해야 하며, 그렇지 않으면 셀 자체가 전체 라인의 병목이 됩니다. 우리는 실제 라인 끝단 문제로 로보틱스 엔지니어를 심사합니다 — 패턴 생성, EOAT 선정, 속도 매칭 — 그리고 3단계 깊이로 인증하여 작업에 맞게 숙련도를 매칭할 수 있게 합니다.',
    },
  },
  'vision/pharma': {
    track: 'vision',
    industry: 'pharma',
    industrySkills: ['Serialization (DSCSA / EU FMD)', 'Aggregation verification', 'OCV on cartons & labels', 'Code grading & print quality', 'GMP validation discipline'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Pharmaceutical Manufacturing',
      sub: 'Serialization and aggregation verification under DSCSA and EU FMD — OCV on cartons and labels, engineered and documented to GMP discipline.',
      pain1:
        'Pharma vision now carries a regulatory mandate, not just a quality one. Serialization under the US DSCSA and the EU Falsified Medicines Directive means every saleable unit gets a unique code that must be printed, verified and aggregated correctly up through bundle, case and pallet — and a camera that misreads, or a station that breaks the aggregation hierarchy, does not just create rework. It stops product from legally shipping.',
      pain2:
        'The other half is OCV under GMP: verifying that lot, expiry and label text on cartons, foils and curved bottles match the batch record — with the vision system itself validated like any GMP system, specified, challenged and documented so an inspector can follow it. We match you with vision engineers who have delivered serialization and OCV lines under that discipline, not just configured a reader on a bench.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 制药',
      sub: 'DSCSA 与欧盟 FMD 下的序列化与聚合校验——GMP 纪律下的纸盒与标签 OCV，工程与文档并重。',
      pain1:
        '制药视觉如今背负的是监管使命，而不只是质量使命。美国 DSCSA 与欧盟《反伪造药品指令》(FMD)下的序列化，意味着每个最小销售单元都带唯一码，必须正确打印、校验，并沿着中包、箱、托盘逐级正确聚合——相机误读一次、某个工位打断了聚合关系，带来的不只是返工，而是产品在法律上无法出货。',
      pain2:
        '另一半是 GMP 下的 OCV：核验纸盒、铝箔、曲面瓶身上的批号、效期与标签文字和批记录一致——而视觉系统本身也要像任何 GMP 系统一样被验证：有规格、有挑战测试、有检查员能顺下来的文档。我们为你匹配的是在这套纪律下交付过序列化与 OCV 产线的视觉工程师，而不是只在台面上配过读码器的人。',
    },
    es: {
      title: 'Contrate ingenieros de visión artificial certificados para manufactura farmacéutica',
      sub: 'Verificación de serialización y agregación bajo DSCSA y la FMD de la UE — OCV en cajas y etiquetas, diseñado y documentado con disciplina GMP.',
      pain1:
        'La visión farmacéutica hoy carga un mandato regulatorio, no solo uno de calidad. La serialización bajo la DSCSA de EE. UU. y la Directiva de Medicamentos Falsificados (FMD) de la UE significa que cada unidad vendible recibe un código único que debe imprimirse, verificarse y agregarse correctamente hasta el nivel de paquete, caja y tarima — y una cámara que lee mal, o una estación que rompe la jerarquía de agregación, no solo genera retrabajo. Impide que el producto se envíe legalmente.',
      pain2:
        'La otra mitad es el OCV bajo GMP: verificar que el lote, la caducidad y el texto de la etiqueta en cajas, láminas y botellas curvas coincidan con el registro del lote — con el sistema de visión mismo validado como cualquier sistema GMP, especificado, desafiado y documentado para que un inspector pueda seguirlo. Le emparejamos con ingenieros de visión que han entregado líneas de serialización y OCV bajo esa disciplina, no solo configurado un lector en una mesa.',
    },
    vi: {
      title: 'Thuê kỹ sư thị giác máy có chứng chỉ cho sản xuất dược phẩm',
      sub: 'Xác minh serialization và tổng hợp theo DSCSA và FMD của EU — OCV trên hộp và nhãn, được thiết kế và ghi tài liệu theo kỷ luật GMP.',
      pain1:
        'Thị giác dược phẩm giờ đây mang theo yêu cầu bắt buộc từ quy định, không chỉ là chất lượng. Serialization theo DSCSA của Mỹ và Chỉ thị Thuốc giả (FMD) của EU nghĩa là mỗi đơn vị bán ra có một mã duy nhất phải được in, xác minh và tổng hợp đúng lên đến cấp bó, thùng và pallet — và một camera đọc sai, hoặc một trạm phá vỡ cấu trúc tổng hợp, không chỉ tạo ra việc làm lại. Nó ngăn sản phẩm xuất xưởng hợp pháp.',
      pain2:
        'Nửa còn lại là OCV theo GMP: xác minh lô, hạn dùng và chữ trên nhãn của hộp, giấy bạc và chai cong khớp với hồ sơ lô — trong khi bản thân hệ thống thị giác cũng phải được thẩm định như bất kỳ hệ thống GMP nào: có đặc tả, có kiểm thử thách thức, có tài liệu mà thanh tra viên có thể theo dõi. Chúng tôi ghép bạn với kỹ sư thị giác đã bàn giao dây chuyền serialization và OCV theo kỷ luật đó, chứ không chỉ cấu hình một đầu đọc trên bàn thử.',
    },
    hi: {
      title: 'फार्मास्युटिकल मैन्युफैक्चरिंग के लिए प्रमाणित मशीन विज़न इंजीनियर हायर करें',
      sub: 'DSCSA और EU FMD के तहत सीरियलाइज़ेशन और एग्रीगेशन वेरिफिकेशन — कार्टन और लेबल पर OCV, GMP अनुशासन के मुताबिक इंजीनियर्ड और डॉक्यूमेंटेड।',
      pain1:
        'फार्मा विज़न अब एक रेगुलेटरी मैंडेट भी उठाता है, सिर्फ क्वालिटी मैंडेट नहीं। अमेरिकी DSCSA और EU फाल्सिफाइड मेडिसिन्स डायरेक्टिव (FMD) के तहत सीरियलाइज़ेशन का मतलब है कि हर बिकने वाली यूनिट को एक यूनीक कोड मिलता है जो सही तरीके से प्रिंट, वेरिफाई और बंडल, केस, पैलेट तक एग्रीगेट होना चाहिए — और एक कैमरा जो गलत पढ़ता है, या एक स्टेशन जो एग्रीगेशन हायरार्की तोड़ देता है, सिर्फ रीवर्क पैदा नहीं करता। यह प्रोडक्ट को कानूनी तौर पर शिप होने से रोक देता है।',
      pain2:
        'दूसरा आधा है GMP के तहत OCV: कार्टन, फॉयल और कर्व्ड बोतलों पर लॉट, एक्सपायरी और लेबल टेक्स्ट को बैच रिकॉर्ड से मैच करते हुए वेरिफाई करना — जबकि विज़न सिस्टम खुद भी किसी भी GMP सिस्टम की तरह वैलिडेट होता है: स्पेसिफाइड, चैलेंज्ड, और इतना डॉक्यूमेंटेड कि इंस्पेक्टर उसे फॉलो कर सके। हम आपको ऐसे विज़न इंजीनियर से मिलाते हैं जिन्होंने इस अनुशासन में सीरियलाइज़ेशन और OCV लाइनें डिलीवर की हैं, सिर्फ बेंच पर रीडर कॉन्फ़िगर करने वाले नहीं।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en vision industrielle certifiés pour la fabrication pharmaceutique',
      sub: 'Vérification de sérialisation et d’agrégation sous la DSCSA et la FMD de l’UE — OCV sur boîtes et étiquettes, conçu et documenté selon la discipline GMP.',
      pain1:
        'La vision pharmaceutique porte désormais un mandat réglementaire, pas seulement qualité. La sérialisation sous la DSCSA américaine et la directive européenne sur les médicaments falsifiés (FMD) signifie que chaque unité vendable reçoit un code unique qui doit être imprimé, vérifié et agrégé correctement jusqu’au fardeau, à la caisse et à la palette — et une caméra qui lit mal, ou une station qui casse la hiérarchie d’agrégation, ne crée pas seulement de la reprise. Elle empêche le produit d’être expédié légalement.',
      pain2:
        'L’autre moitié est l’OCV sous GMP : vérifier que le lot, la péremption et le texte de l’étiquette sur les boîtes, les feuilles et les bouteilles courbes correspondent au dossier de lot — le système de vision lui-même étant validé comme tout système GMP, spécifié, mis à l’épreuve et documenté pour qu’un inspecteur puisse le suivre. Nous vous associons à des ingénieurs vision ayant livré des lignes de sérialisation et d’OCV sous cette discipline, pas seulement configuré un lecteur sur un établi.',
    },
    de: {
      title: 'Zertifizierte Bildverarbeitungs-Ingenieure für die Pharmafertigung engagieren',
      sub: 'Serialisierungs- und Aggregationsprüfung unter DSCSA und EU-FMD — OCV auf Faltschachteln und Etiketten, nach GMP-Disziplin konstruiert und dokumentiert.',
      pain1:
        'Pharma-Bildverarbeitung trägt heute ein regulatorisches Mandat, nicht nur ein Qualitätsmandat. Serialisierung unter dem US-DSCSA und der EU-Fälschungsschutzrichtlinie (FMD) bedeutet, dass jede verkaufsfähige Einheit einen eindeutigen Code erhält, der bis zu Bündel, Karton und Palette korrekt gedruckt, geprüft und aggregiert werden muss — und eine Kamera, die falsch liest, oder eine Station, die die Aggregationshierarchie bricht, erzeugt nicht nur Nacharbeit. Sie verhindert, dass Produkt legal versendet werden kann.',
      pain2:
        'Die andere Hälfte ist OCV unter GMP: die Prüfung, dass Charge, Verfallsdatum und Etikettentext auf Faltschachteln, Folien und gekrümmten Flaschen mit dem Chargenprotokoll übereinstimmen — wobei das Bildverarbeitungssystem selbst wie jedes GMP-System validiert wird: spezifiziert, herausgefordert und so dokumentiert, dass ein Inspektor es nachvollziehen kann. Wir vermitteln Ihnen Bildverarbeitungs-Ingenieure, die Serialisierungs- und OCV-Linien nach dieser Disziplin geliefert haben — nicht nur einen Leser auf einer Werkbank konfiguriert haben.',
    },
    ja: {
      title: '製薬製造向けの認定マシンビジョンエンジニアを採用',
      sub: '米国DSCSAおよびEU FMDのもとでのシリアライゼーションと集約検証——GMP規律に基づいて設計・文書化されたカートンとラベルのOCV。',
      pain1:
        '製薬ビジョンは今や品質だけでなく規制上の要請も背負っています。米国DSCSAとEUの偽造医薬品指令（FMD）のもとでのシリアライゼーションは、販売可能な各単位が一意のコードを持ち、束・ケース・パレットまで正しく印字・検証・集約されなければならないことを意味します——誤読するカメラや、集約階層を壊すステーションは、単なる手戻りを生むだけでは済みません。製品が合法的に出荷できなくなります。',
      pain2:
        'もう半分はGMPのもとでのOCVです。カートン、箔、曲面ボトルのロット、有効期限、ラベル文字がバッチ記録と一致することを検証します——そしてビジョンシステム自体も、あらゆるGMPシステムと同様に、規格化され、チャレンジテストされ、検査官が追跡できる形で文書化された上でバリデーションされます。当社はこの規律のもとでシリアライゼーションとOCVラインを納品した経験を持つビジョンエンジニアとあなたを引き合わせます——ベンチでリーダーを設定しただけの人材ではありません。',
    },
    ko: {
      title: '제약 제조를 위한 인증 머신 비전 엔지니어 채용',
      sub: '미국 DSCSA 및 EU FMD 하에서의 일련번호화 및 집계 검증 — GMP 규율에 따라 설계 및 문서화된 카톤 및 라벨 OCV.',
      pain1:
        '제약 비전은 이제 품질뿐 아니라 규제상의 의무도 짊어집니다. 미국 DSCSA와 EU 위조의약품지침(FMD) 하의 일련번호화는 판매 가능한 모든 단위가 번들, 케이스, 팔레트까지 올바르게 인쇄, 검증, 집계되어야 하는 고유 코드를 받는다는 뜻입니다 — 오독하는 카메라나 집계 계층을 깨뜨리는 스테이션은 단순한 재작업 이상의 문제를 일으킵니다. 제품이 합법적으로 출하되지 못하게 막습니다.',
      pain2:
        '나머지 절반은 GMP 하의 OCV입니다. 카톤, 포일, 곡면 병에 적힌 로트, 유효기간, 라벨 텍스트가 배치 기록과 일치하는지 검증하는 것입니다 — 비전 시스템 자체도 다른 모든 GMP 시스템처럼 규격화되고, 챌린지 테스트를 거치고, 감사자가 따라갈 수 있도록 문서화되어 밸리데이션됩니다. 우리는 이 규율 하에서 일련번호화와 OCV 라인을 납품해본 비전 엔지니어와 매칭해 드립니다 — 작업대에서 리더기를 설정만 해본 사람이 아닙니다.',
    },
  },
  'vision/automotive': {
    track: 'vision',
    industry: 'automotive',
    industrySkills: ['Weld-seam inspection', 'Gap & flush measurement', '3D robot guidance', 'Bin picking', 'Camera-to-robot calibration'],
    en: {
      title: 'Hire Certified Machine Vision Engineers for Automotive Manufacturing',
      sub: 'Weld-seam inspection, gap-and-flush measurement and 3D robot guidance — vision that survives dark, shiny, oily sheet metal at takt.',
      pain1:
        'Automotive vision fights the worst surfaces in the business: dark e-coat, mirror-shiny stampings and oily panels that defeat naive lighting. On top of that it is asked to do real metrology — weld-seam integrity, sealer beads, gap and flush on closures — where the answer is a measurement in fractions of a millimetre delivered at takt, not a pass/fail on a clean lab part.',
      pain2:
        'The other frontier is guidance: 3D locating of panels in racks, bin picking of castings, and camera-to-robot calibration where an error does not produce a false reject — it drives tooling into a fixture. We screen vision engineers on the judgment this floor demands — lighting hostile surfaces, holding calibration across shifts, proving accuracy with gauge studies — and certify them at three depths.',
    },
    zh: {
      title: '雇佣持证机器视觉工程师 · 汽车制造',
      sub: '焊缝检测、间隙面差测量与 3D 机器人引导——在深色、反光、带油的钣金上、踩着节拍也扛得住的视觉。',
      pain1:
        '汽车视觉对付的是这个行业里最难缠的表面：深色电泳漆、镜面般的冲压件、带油的板件，天真的打光方案在这里全军覆没。在此之上它还被要求做真正的测量——焊缝完整性、涂胶胶条、闭合件的间隙与面差(gap & flush)——答案是踩着节拍交付的零点几毫米的测量值，而不是在实验室干净样件上的合格/不合格。',
      pain2:
        '另一个前沿是引导：料架里板件的 3D 定位、铸件的无序抓取(bin picking)、以及相机与机器人坐标系的标定——这里出错不是产生一次误剔除，而是让工装直接撞上夹具。我们按这个车间要求的判断力筛选视觉工程师——给难缠表面打光、跨班次守住标定、用量具分析证明精度——并按三个深度发放认证。',
    },
    es: {
      title: 'Contrate ingenieros de visión artificial certificados para manufactura automotriz',
      sub: 'Inspección de cordones de soldadura, medición de holgura y enrase, y guiado de robots en 3D — visión que sobrevive a la chapa oscura, brillante y aceitosa al ritmo del takt.',
      pain1:
        'La visión automotriz combate las peores superficies del sector: recubrimiento electroforético oscuro, estampados espejo-brillantes y paneles aceitosos que vencen la iluminación ingenua. Además, se le pide hacer metrología real — integridad del cordón de soldadura, cordones de sellador, holgura y enrase en cierres — donde la respuesta es una medición en fracciones de milímetro entregada al ritmo del takt, no un pasa/no pasa en una pieza de laboratorio limpia.',
      pain2:
        'El otro frente es el guiado: localización 3D de paneles en estantes, bin picking de piezas fundidas y calibrado cámara-robot, donde un error no produce un falso rechazo — hace que el utillaje choque contra un dispositivo. Evaluamos a los ingenieros de visión con el juicio que exige este taller — iluminar superficies hostiles, mantener la calibración turno tras turno, demostrar precisión con estudios de calibre — y los certificamos en tres niveles de profundidad.',
    },
    vi: {
      title: 'Thuê kỹ sư thị giác máy có chứng chỉ cho ngành sản xuất ô tô',
      sub: 'Kiểm tra đường hàn, đo khe hở và độ phẳng bề mặt, dẫn hướng robot 3D — thị giác chịu được kim loại tấm tối màu, sáng bóng, dính dầu ở nhịp takt.',
      pain1:
        'Thị giác ô tô đối đầu với những bề mặt khó nhất trong ngành: lớp sơn điện di tối màu, chi tiết dập bóng như gương và tấm dính dầu đánh bại các phương án chiếu sáng đơn giản. Bên trên đó, nó còn được yêu cầu làm đo lường thực sự — độ toàn vẹn đường hàn, đường keo trét, khe hở và độ phẳng trên các bộ phận đóng mở — nơi câu trả lời là một phép đo tính bằng phần mười milimét được giao đúng nhịp takt, không phải đạt/không đạt trên một mẫu phòng thí nghiệm sạch sẽ.',
      pain2:
        'Mặt trận khác là dẫn hướng: định vị 3D các tấm trong giá đỡ, bin picking các chi tiết đúc, và hiệu chuẩn camera-robot — nơi một lỗi không chỉ tạo ra một lần loại bỏ sai, mà khiến dụng cụ đâm thẳng vào đồ gá. Chúng tôi sàng lọc kỹ sư thị giác theo khả năng phán đoán mà khu vực này đòi hỏi — chiếu sáng các bề mặt khó, giữ vững hiệu chuẩn qua các ca, chứng minh độ chính xác bằng nghiên cứu đo lường — và cấp chứng chỉ theo ba mức độ.',
    },
    hi: {
      title: 'ऑटोमोटिव मैन्युफैक्चरिंग के लिए प्रमाणित मशीन विज़न इंजीनियर हायर करें',
      sub: 'वेल्ड-सीम इंस्पेक्शन, गैप और फ्लश मेज़रमेंट, 3D रोबोट गाइडेंस — ऐसा विज़न जो डार्क, शाइनी, ऑयली शीट मेटल पर टैक्ट पर भी टिका रहे।',
      pain1:
        'ऑटोमोटिव विज़न इस इंडस्ट्री की सबसे मुश्किल सतहों से लड़ता है: डार्क ई-कोट, मिरर-शाइनी स्टैम्पिंग्स और ऑयली पैनल जो नैव लाइटिंग को हरा देते हैं। इसके ऊपर इससे असली मेट्रोलॉजी करने को कहा जाता है — वेल्ड-सीम इंटीग्रिटी, सीलर बीड्स, क्लोज़र्स पर गैप और फ्लश — जहां जवाब टैक्ट पर डिलीवर किया गया मिलीमीटर के अंशों में एक मेज़रमेंट है, किसी साफ लैब पार्ट पर पास/फेल नहीं।',
      pain2:
        'दूसरा फ्रंटियर है गाइडेंस: रैक्स में पैनल्स की 3D लोकेटिंग, कास्टिंग्स की बिन पिकिंग, और कैमरा-टू-रोबोट कैलिब्रेशन — जहां गलती एक झूठा रिजेक्ट पैदा नहीं करती, वह टूलिंग को सीधे फिक्स्चर में घुसा देती है। हम इस फ्लोर की मांग वाले जजमेंट पर विज़न इंजीनियर छांटते हैं — मुश्किल सतहों पर लाइटिंग, शिफ्ट्स में कैलिब्रेशन थामना, गेज स्टडीज़ से सटीकता साबित करना — और तीन गहराइयों पर प्रमाणित करते हैं।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en vision industrielle certifiés pour l’industrie automobile',
      sub: 'Inspection des cordons de soudure, mesure de jeu et d’affleurement, guidage robotique 3D — une vision qui survit à la tôle sombre, brillante et huileuse au rythme du takt.',
      pain1:
        'La vision automobile affronte les pires surfaces du secteur : cataphorèse sombre, emboutis brillants comme des miroirs et panneaux huileux qui déjouent un éclairage naïf. En plus de cela, on lui demande de faire de la vraie métrologie — intégrité du cordon de soudure, joints de mastic, jeu et affleurement sur les ouvrants — où la réponse est une mesure en fractions de millimètre livrée au rythme du takt, pas un simple OK/NOK sur une pièce de laboratoire propre.',
      pain2:
        'L’autre front est le guidage : localisation 3D de panneaux en rack, bin picking de pièces moulées, et calibrage caméra-robot, où une erreur ne produit pas un faux rejet — elle envoie l’outillage directement dans un montage. Nous évaluons les ingénieurs vision sur le jugement qu’exige cet atelier — éclairer des surfaces hostiles, maintenir le calibrage d’une équipe à l’autre, prouver la précision par des études de moyens de contrôle — et nous les certifions à trois niveaux de profondeur.',
    },
    de: {
      title: 'Zertifizierte Bildverarbeitungs-Ingenieure für die Automobilfertigung engagieren',
      sub: 'Schweißnahtinspektion, Spalt- und Bündigkeitsmessung und 3D-Roboterführung — Bildverarbeitung, die dunklem, glänzendem, öligem Blech im Takt standhält.',
      pain1:
        'Automobil-Bildverarbeitung kämpft gegen die schwierigsten Oberflächen der Branche: dunkle Elektrotauchlackierung, spiegelglänzende Stanzteile und ölige Bleche, die naive Beleuchtung überfordern. Zusätzlich wird echte Messtechnik verlangt — Schweißnahtintegrität, Dichtstoffraupen, Spalt und Bündigkeit an Türen und Klappen —, wo die Antwort eine im Takt gelieferte Messung im Bruchteil-Millimeter-Bereich ist, kein Gut/Schlecht an einem sauberen Laborteil.',
      pain2:
        'Die andere Front ist die Führung: 3D-Lokalisierung von Blechteilen in Gestellen, Bin-Picking von Gussteilen und Kamera-Roboter-Kalibrierung, bei der ein Fehler keinen Fehlausschuss erzeugt — er treibt das Werkzeug direkt in eine Vorrichtung. Wir prüfen Bildverarbeitungs-Ingenieure anhand des Urteilsvermögens, das diese Halle verlangt — schwierige Oberflächen beleuchten, Kalibrierung über Schichten hinweg halten, Genauigkeit durch Messmittelstudien belegen — und zertifizieren sie auf drei Tiefenstufen.',
    },
    ja: {
      title: '自動車製造向けの認定マシンビジョンエンジニアを採用',
      sub: '溶接シーム検査、ギャップ・面差測定、3Dロボットガイダンス——タクトを守りながら暗色・光沢・油分のある鋼板にも耐えるビジョン。',
      pain1:
        '自動車ビジョンはこの業界で最も手強い表面と戦います——暗色の電着塗装、鏡のように光るプレス部品、素朴な照明では太刀打ちできない油分を含んだパネル。その上、真の計測——溶接シームの健全性、シーラービード、開閉部のギャップと面差——を求められ、そこでの答えはきれいな実験室サンプルでの合否判定ではなく、タクトで届けられるミリ以下の測定値です。',
      pain2:
        'もう一つの最前線はガイダンスです。ラック内パネルの3D位置決め、鋳造部品のビンピッキング、カメラとロボットのキャリブレーション——ここでのミスは誤リジェクトではなく、治具にツールを直接衝突させることになります。当社はこの現場が求める判断力でビジョンエンジニアを審査します——手強い表面への照明、シフトを超えたキャリブレーションの維持、ゲージスタディによる精度の証明——そして三段階の深度で認定します。',
    },
    ko: {
      title: '자동차 제조를 위한 인증 머신 비전 엔지니어 채용',
      sub: '용접 시임 검사, 간격 및 단차 측정, 3D 로봇 가이던스 — 택트를 지키면서도 어둡고 광택 있고 기름진 판금을 견디는 비전.',
      pain1:
        '자동차 비전은 업계에서 가장 다루기 힘든 표면과 싸웁니다. 어두운 전착도장, 거울처럼 빛나는 프레스 부품, 단순한 조명을 무력화하는 기름진 패널입니다. 그 위에 진짜 계측까지 요구됩니다 — 용접 시임의 무결성, 실러 비드, 도어와 후드 등 개폐부의 간격과 단차 — 여기서 답은 깨끗한 실험실 부품의 합격/불합격이 아니라 택트에 맞춰 전달되는 밀리미터 이하 단위의 측정값입니다.',
      pain2:
        '또 다른 전선은 가이던스입니다. 랙 안 패널의 3D 위치 확인, 주조품의 빈 피킹, 카메라-로봇 캘리브레이션 — 여기서 오류는 오탐 리젝트를 만드는 것이 아니라 툴링을 지그에 그대로 충돌시킵니다. 우리는 이 현장이 요구하는 판단력으로 비전 엔지니어를 심사합니다 — 까다로운 표면에 조명을 비추고, 교대 근무를 넘어 캘리브레이션을 유지하며, 게이지 연구로 정밀도를 입증하는 능력 — 그리고 3단계 깊이로 인증합니다.',
    },
  },
  'robotics/food-beverage': {
    track: 'robotics',
    industry: 'food-beverage',
    industrySkills: ['Washdown / hygienic design', 'IP69K equipment', 'Soft-product handling EOAT', 'Vision-guided picking', 'Allergen & SKU changeover'],
    en: {
      title: 'Hire Certified Robotics Engineers for Food & Beverage',
      sub: 'Washdown-ready robot cells for primary and secondary packaging — hygienic design, IP69K equipment, soft-product handling and fast changeovers.',
      pain1:
        'Food robotics starts with a constraint most integrators never face: the cell gets hosed down. Daily washdown with caustic chemistry at pressure and temperature means IP69K-rated robots or protective covers, stainless and food-grade materials, hygienic design without harborage points, and food-safe lubricants. Get any of that wrong and the cell either corrodes or becomes a contamination risk the auditor will find.',
      pain2:
        'Then comes the product itself: baked goods, fresh produce and proteins are soft, variable and unforgiving, so EOAT and motion have to grip without bruising and place without smearing — usually with vision finding product that never sits in the same place twice. Add frequent SKU and allergen changeovers, and the engineers who win are the ones who design for cleaning and changeover from day one. That is exactly what we screen and certify for.',
    },
    zh: {
      title: '雇佣持证机器人工程师 · 食品饮料',
      sub: '面向一次与二次包装、经得起冲洗的机器人工作站——卫生设计、IP69K 设备、软性产品抓取与快速换型。',
      pain1:
        '食品机器人从一个大多数集成商从未面对的约束开始：整个工作站是要被水枪冲洗的。每天用带腐蚀性的清洗剂、在高压高温下冲洗(washdown)，意味着要用 IP69K 等级的机器人或防护罩、不锈钢与食品级材料、无藏污死角的卫生设计、食品级润滑剂。任何一处做错，工作站要么被腐蚀，要么变成审计员一定会揪出来的污染风险。',
      pain2:
        '然后是产品本身：烘焙品、生鲜与蛋白类产品柔软、多变、不容有失，EOAT 与运动控制必须做到抓而不伤、放而不蹭——通常还要靠视觉去找那些从不待在同一个位置的产品。再叠加频繁的 SKU 与过敏原换型，胜出的工程师是那些从第一天就为清洗和换型做设计的人。这正是我们筛选与认证的内容。',
    },
    es: {
      title: 'Contrate ingenieros de robótica certificados para alimentos y bebidas',
      sub: 'Celdas de robots listas para lavado en empaque primario y secundario — diseño higiénico, equipo IP69K, manipulación de producto blando y cambios rápidos.',
      pain1:
        'La robótica alimentaria comienza con una restricción que la mayoría de los integradores nunca enfrenta: la celda se lava con manguera. El lavado diario con química cáustica a presión y temperatura exige robots con clasificación IP69K o cubiertas protectoras, materiales de acero inoxidable y grado alimentario, diseño higiénico sin puntos de acumulación, y lubricantes aptos para alimentos. Equivocarse en cualquiera de esos puntos hace que la celda se corroa o se convierta en un riesgo de contaminación que el auditor encontrará.',
      pain2:
        'Luego viene el producto mismo: productos horneados, frescos y proteínas son blandos, variables e implacables, así que el EOAT y el movimiento deben sujetar sin magullar y colocar sin embarrar — normalmente con visión localizando producto que nunca está dos veces en el mismo lugar. Sume cambios frecuentes de SKU y alérgenos, y los ingenieros que ganan son los que diseñan para la limpieza y el cambio desde el primer día. Eso es exactamente lo que evaluamos y certificamos.',
    },
    vi: {
      title: 'Thuê kỹ sư robot có chứng chỉ cho ngành thực phẩm và đồ uống',
      sub: 'Các tế bào robot sẵn sàng cho rửa xả trong đóng gói sơ cấp và thứ cấp — thiết kế vệ sinh, thiết bị đạt chuẩn IP69K, xử lý sản phẩm mềm và đổi model nhanh.',
      pain1:
        'Robot thực phẩm bắt đầu với một ràng buộc mà hầu hết nhà tích hợp chưa từng gặp: tế bào bị xịt nước rửa. Việc rửa xả hằng ngày bằng hóa chất ăn mòn ở áp suất và nhiệt độ cao đòi hỏi robot đạt chuẩn IP69K hoặc có vỏ bảo vệ, vật liệu thép không gỉ và cấp thực phẩm, thiết kế vệ sinh không có điểm tích tụ bẩn, và chất bôi trơn an toàn thực phẩm. Sai một trong những điều đó khiến tế bào bị ăn mòn hoặc trở thành rủi ro nhiễm khuẩn mà kiểm toán viên chắc chắn sẽ phát hiện.',
      pain2:
        'Rồi đến chính sản phẩm: đồ nướng, nông sản tươi và protein đều mềm, biến động và không khoan nhượng, nên EOAT và chuyển động phải kẹp mà không làm bầm dập, đặt mà không làm nhòe — thường phải nhờ thị giác tìm sản phẩm không bao giờ nằm đúng cùng một vị trí hai lần. Cộng thêm việc đổi SKU và chất gây dị ứng thường xuyên, những kỹ sư thắng cuộc là những người thiết kế cho việc vệ sinh và đổi model ngay từ ngày đầu. Đó chính xác là điều chúng tôi sàng lọc và cấp chứng chỉ.',
    },
    hi: {
      title: 'फूड एंड बेवरेज के लिए प्रमाणित रोबोटिक्स इंजीनियर हायर करें',
      sub: 'प्राइमरी और सेकेंडरी पैकेजिंग के लिए वॉशडाउन-रेडी रोबोट सेल — हाइजीनिक डिज़ाइन, IP69K इक्विपमेंट, सॉफ्ट-प्रोडक्ट हैंडलिंग और फास्ट चेंजओवर।',
      pain1:
        'फूड रोबोटिक्स एक ऐसी शर्त से शुरू होती है जिसका सामना ज़्यादातर इंटीग्रेटर्स कभी नहीं करते: सेल को होज़ से धोया जाता है। हाई प्रेशर और तापमान पर कॉस्टिक केमिस्ट्री से डेली वॉशडाउन का मतलब है IP69K-रेटेड रोबोट या प्रोटेक्टिव कवर, स्टेनलेस और फूड-ग्रेड मटीरियल्स, बिना हार्बरेज पॉइंट्स के हाइजीनिक डिज़ाइन, और फूड-सेफ लुब्रिकेंट्स। इनमें से कुछ भी गलत हो जाए तो सेल या तो जंग खा जाती है या ऐसा कंटैमिनेशन रिस्क बन जाती है जिसे ऑडिटर ज़रूर पकड़ेगा।',
      pain2:
        'फिर आता है खुद प्रोडक्ट: बेक्ड गुड्स, फ्रेश प्रोड्यूस और प्रोटीन सॉफ्ट, वेरिएबल और बेरहम होते हैं, इसलिए EOAT और मोशन को बिना चोट पहुंचाए पकड़ना और बिना गंदा किए रखना होता है — आमतौर पर विज़न की मदद से ऐसे प्रोडक्ट को ढूंढते हुए जो कभी दो बार एक ही जगह नहीं होता। इसमें बार-बार SKU और एलर्जन चेंजओवर जोड़ दें, तो जीतने वाले इंजीनियर वही होते हैं जो पहले दिन से क्लीनिंग और चेंजओवर के लिए डिज़ाइन करते हैं। यही वह चीज़ है जिसके लिए हम छांटते और प्रमाणित करते हैं।',
    },
    fr: {
      title: 'Recrutez des ingénieurs en robotique certifiés pour l’agroalimentaire',
      sub: 'Cellules robotisées prêtes au lavage pour l’emballage primaire et secondaire — conception hygiénique, équipement IP69K, manipulation de produits mous et changements rapides.',
      pain1:
        'La robotique alimentaire commence par une contrainte que la plupart des intégrateurs ne rencontrent jamais : la cellule est nettoyée au jet. Le lavage quotidien avec une chimie caustique sous pression et température exige des robots certifiés IP69K ou des capots de protection, des matériaux en inox et de qualité alimentaire, une conception hygiénique sans points de rétention, et des lubrifiants de qualité alimentaire. Une erreur sur l’un de ces points, et la cellule se corrode ou devient un risque de contamination que l’auditeur trouvera.',
      pain2:
        'Vient ensuite le produit lui-même : produits de boulangerie, produits frais et protéines sont mous, variables et sans indulgence, donc l’EOAT et le mouvement doivent saisir sans meurtrir et déposer sans maculer — généralement avec la vision localisant un produit qui ne se trouve jamais deux fois au même endroit. Ajoutez des changements fréquents de référence et d’allergènes, et les ingénieurs qui l’emportent sont ceux qui intègrent le nettoyage et les changements de série dès la conception. C’est exactement ce que nous évaluons et certifions.',
    },
    de: {
      title: 'Zertifizierte Robotik-Ingenieure für Lebensmittel & Getränke engagieren',
      sub: 'Waschdown-taugliche Roboterzellen für Primär- und Sekundärverpackung — hygienisches Design, IP69K-Ausrüstung, Handhabung weicher Produkte und schnelle Umrüstungen.',
      pain1:
        'Lebensmittelrobotik beginnt mit einer Einschränkung, der sich die meisten Integratoren nie stellen müssen: Die Zelle wird abgespritzt. Tägliches Waschdown mit ätzender Chemie unter Druck und Temperatur erfordert IP69K-zertifizierte Roboter oder Schutzabdeckungen, Edelstahl- und lebensmitteltaugliche Materialien, hygienisches Design ohne Ablagerungsstellen und lebensmittelechte Schmierstoffe. Ein Fehler an einer dieser Stellen führt dazu, dass die Zelle korrodiert oder zu einem Kontaminationsrisiko wird, das der Auditor findet.',
      pain2:
        'Dann kommt das Produkt selbst: Backwaren, Frischware und Proteine sind weich, variabel und unnachgiebig, daher müssen EOAT und Bewegung greifen, ohne zu quetschen, und ablegen, ohne zu verschmieren — meist mithilfe von Bildverarbeitung, die Produkt findet, das nie zweimal an derselben Stelle liegt. Fügt man häufige SKU- und Allergenwechsel hinzu, gewinnen die Ingenieure, die von Tag eins an für Reinigung und Umrüstung entwerfen. Genau darauf prüfen und zertifizieren wir.',
    },
    ja: {
      title: '食品・飲料向けの認定ロボティクスエンジニアを採用',
      sub: '一次・二次包装のための洗浄対応ロボットセル——衛生設計、IP69K対応設備、軟性製品ハンドリング、迅速な切替。',
      pain1:
        '食品ロボティクスは、ほとんどのインテグレーターが経験しない制約から始まります。セル全体がホースで洗浄されるのです。高圧・高温で腐食性のある薬剤を使う日々の洗浄（washdown）には、IP69K対応ロボットまたは保護カバー、ステンレスと食品グレードの材料、汚れの溜まる箇所のない衛生設計、食品対応の潤滑剤が求められます。そのどれか一つでも間違えれば、セルは腐食するか、監査で必ず見つかる汚染リスクになります。',
      pain2:
        'そして製品そのものです。焼き菓子、生鮮品、タンパク質製品は柔らかく、変動が大きく、容赦がありません。EOATと動作は傷めずに掴み、擦らずに置かなければならず、たいていの場合、同じ位置に二度と置かれない製品をビジョンで見つける必要があります。頻繁なSKUとアレルゲンの切替が加わると、勝つエンジニアとは初日から洗浄と切替のために設計する人材です。それこそが我々が審査し、認定する内容です。',
    },
    ko: {
      title: '식품 및 음료를 위한 인증 로보틱스 엔지니어 채용',
      sub: '1차 및 2차 포장을 위한 워시다운 대응 로봇 셀 — 위생 설계, IP69K 장비, 부드러운 제품 취급, 빠른 전환.',
      pain1:
        '식품 로보틱스는 대부분의 통합업체가 결코 마주치지 않는 제약에서 시작합니다. 셀 전체가 호스로 세척됩니다. 고압·고온에서 부식성 화학물질로 매일 워시다운하려면 IP69K 등급 로봇이나 보호 커버, 스테인리스 및 식품 등급 재질, 오염 축적 지점이 없는 위생 설계, 식품 안전 윤활유가 필요합니다. 이 중 하나라도 잘못되면 셀이 부식되거나 감사자가 반드시 찾아낼 오염 위험이 됩니다.',
      pain2:
        '그다음은 제품 자체입니다. 베이커리 제품, 신선 농산물, 단백질 제품은 부드럽고 가변적이며 용서가 없어서, EOAT와 동작은 멍들게 하지 않고 잡고 얼룩지게 하지 않고 놓아야 하며, 보통 같은 위치에 두 번 놓이지 않는 제품을 비전으로 찾아야 합니다. 여기에 잦은 SKU 및 알레르기 유발 물질 전환까지 더해지면, 승리하는 엔지니어는 첫날부터 세척과 전환을 염두에 두고 설계하는 사람입니다. 이것이 바로 우리가 심사하고 인증하는 내용입니다.',
    },
  },
};

const MATRIX_KEYS = Object.keys(MATRIX);

// ── 对外辅助 ─────────────────────────────────────────────────────────────

// 方向元数据访问器：label/kicker/skills/levels（数据本来就在 TRACKS 里，这里只是开放只读访问）。
// 消费方：/hire 索引页与 lib/occupations.js（职业页要按方向拼 hero/技能/认证级别，不重抄一份文案）。
// 未知方向返回 null，让调用方显式处理（而不是静默 undefined 解构炸掉）。
export function getTrackMeta(track) {
  const t = TRACKS[track];
  if (!t) return null;
  return { label: t.label, kicker: t.kicker, skills: t.skills, levels: t.levels };
}

// getStaticPaths 用：枚举所有 12 个组合的 {track, industry}。
export function getMatrixPaths() {
  return MATRIX_KEYS.map((key) => {
    const [track, industry] = key.split('/');
    return { params: { track, industry } };
  });
}

// 组合是否存在（getStaticProps 校验用）。
export function hasMatrixEntry(track, industry) {
  return Boolean(MATRIX[`${track}/${industry}`]);
}

// /hire/[track] 母页「按行业细分」入口链用：该方向下的行业子页清单（slug + 短标签）。
export function getIndustriesForTrack(track) {
  return MATRIX_KEYS.filter((k) => k.startsWith(`${track}/`)).map((k) => {
    const industry = k.split('/')[1];
    const meta = INDUSTRIES[industry];
    return { industry, label: meta.short || { en: meta.en, zh: meta.zh } };
  });
}

// 拼装页面所需的全部数据：方向元 + 行业元 + 组合内容 + 内链。
export function getMatrixPage(track, industry) {
  const entry = MATRIX[`${track}/${industry}`];
  if (!entry) return null;

  const trackMeta = TRACKS[track];
  const industryMeta = INDUSTRIES[industry];

  // serviceType 带行业，供 Service JSON-LD 用。
  const serviceType = `${trackMeta.serviceBase} — ${industryMeta.en}`;

  // 内链：同方向其他行业。
  const sameTrack = MATRIX_KEYS
    .filter((k) => k.startsWith(`${track}/`) && k !== `${track}/${industry}`)
    .map((k) => {
      const [t, ind] = k.split('/');
      return { track: t, industry: ind, name: INDUSTRIES[ind].short };
    });

  // 内链：其他方向同行业。
  const sameIndustry = MATRIX_KEYS
    .filter((k) => k.endsWith(`/${industry}`) && k !== `${track}/${industry}`)
    .map((k) => {
      const [t, ind] = k.split('/');
      return { track: t, industry: ind, name: TRACKS[t].label };
    });

  return {
    track,
    industry,
    serviceType,
    trackLabel: trackMeta.label,
    trackKicker: trackMeta.kicker,
    industryName: industryMeta,
    skills: [...trackMeta.skills, ...entry.industrySkills],
    levels: trackMeta.levels,
    content: {
      en: entry.en, zh: entry.zh, es: entry.es, vi: entry.vi, hi: entry.hi,
      fr: entry.fr, de: entry.de, ja: entry.ja, ko: entry.ko,
    },
    sameTrack,
    sameIndustry,
  };
}
