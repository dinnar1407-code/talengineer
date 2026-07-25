// 建厂地域用人指南（中国出海线：墨西哥/越南/泰国）的内容数据。
//
// 设计约定：
// - 费率区间复用 lib/hireMatrix.js 的 REGIONS（与 /hire/[track] 及 /rates 同一唯一来源），不另立数字。
// - 当地用人现状写“结构性事实 + 定性描述”，绝不编造具体统计数字。
// - 语言：墨西哥/越南 = en/zh/es/vi 四语；泰国 = en/zh（泰语不在站点九语清单，页内提示九语翻译能力）。

import { REGIONS } from './hireMatrix.js';

// 复用同一份地区费率，供 getStaticProps 传给页面做“跨境对比表”。
export { REGIONS };

// ── 三个地域指南（键 = region slug）───────────────────────────────────────
const GUIDES = {
  mexico: {
    flag: '🇲🇽',
    langs: ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'],
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
      title: '¿Construye una fábrica en México? Resuelva su personal de automatización.',
      sub: 'Ingenieros locales certificados más apoyo remoto y presencial transfronterizo — protegido con depósito en garantía, coordinado en nueve idiomas.',
      status1:
        'El auge del nearshoring en México ha atraído inversión manufacturera al Bajío, Nuevo León y la frontera norte más rápido de lo que crece la reserva local de ingenieros de automatización con experiencia. Los especialistas en control, robótica y visión artificial escasean de forma estructural, y los que existen suelen estar ya comprometidos.',
      status2:
        'El recurso habitual — traer ingenieros desde la matriz — es lento y caro, y choca con la barrera de idioma y de husos horarios en planta. Un ingeniero que habla español y puede poner la línea en marcha vale más que un especialista remoto ausente en el momento clave; pero en la mayoría de los proyectos hacen falta ambos.',
      solutions: [
        { h: 'Ingenieros locales certificados', p: 'Ingenieros de control, robótica y visión que hablan español, han superado nuestra evaluación práctica con IA y pueden estar en su línea para la puesta en marcha y el soporte.' },
        { h: 'Híbrido transfronterizo', p: 'Cuando la profundidad local se agota, combine un ingeniero local con un especialista remoto o desplazado — diseño y programación en remoto, puesta en marcha en sitio, en una sola sala de proyecto.' },
        { h: 'Sala de proyecto en nueve idiomas', p: 'Cada mensaje de la sala del proyecto (WarRoom) se traduce en tiempo real a nueve idiomas, para que la matriz china, el técnico hispanohablante y el líder en inglés trabajen en un mismo hilo.' },
        { h: 'Depósito en garantía por hitos', p: 'Los fondos quedan en depósito en garantía y se liberan por etapas conforme se acepta el trabajo, protegiendo a comprador e ingeniero a través de la frontera.' },
      ],
      projects: ['Puesta en marcha de línea nueva', 'Retrofit y migración de PLC', 'Integración de celda robótica', 'Despliegue de inspección por visión'],
      ratesNote:
        'Las tarifas locales de México y Latinoamérica rondan los $35–65/hr. La tabla siguiente compara regiones para que usted fije un precio honesto de una mezcla local más transfronteriza. La comisión de depósito en garantía de la plataforma es del 15% (5% para clientes fundadores).',
    },
    hi: {
      title: 'मेक्सिको में फैक्ट्री बना रहे हैं? अपनी ऑटोमेशन स्टाफिंग सुलझाएं।',
      sub: 'स्थानीय प्रमाणित इंजीनियर प्लस क्रॉस-बॉर्डर रिमोट और फ्लाई-इन सपोर्ट — एस्क्रो-सुरक्षित, नौ भाषाओं में समन्वित।',
      status1:
        'मेक्सिको के नियरशोरिंग बूम ने मैन्युफैक्चरिंग निवेश को बाहीओ, नुएवो लियोन और उत्तरी सीमा में इतनी तेज़ी से खींचा है कि अनुभवी ऑटोमेशन इंजीनियरों का स्थानीय पूल उतनी तेज़ी से नहीं बढ़ पा रहा। कंट्रोल्स, रोबोटिक्स और मशीन-विज़न स्पेशलिस्ट्स की स्ट्रक्चरल कमी है, और जो मौजूद हैं वे आमतौर पर पहले से ही किसी काम में लगे हैं।',
      status2:
        'सामान्य फॉलबैक — मुख्यालय से इंजीनियरों को उड़ाकर लाना — धीमा और महंगा दोनों है, और फ्लोर पर भाषा व टाइम-ज़ोन की रुकावट से टकराता है। एक स्पेनिश-भाषी इंजीनियर जो लाइन कमीशन कर सके, वह उस रिमोट स्पेशलिस्ट से बेहतर है जो ज़रूरी वक्त पर मौजूद नहीं हो सकता; लेकिन ज़्यादातर प्रोजेक्ट्स में आपको दोनों चाहिए।',
      solutions: [
        { h: 'स्थानीय प्रमाणित इंजीनियर', p: 'स्पेनिश-भाषी कंट्रोल्स, रोबोटिक्स और विज़न इंजीनियर, जिन्होंने हमारी प्रैक्टिकल AI स्क्रीन पास की है और कमीशनिंग व सपोर्ट के लिए आपकी लाइन पर मौजूद हो सकते हैं।' },
        { h: 'क्रॉस-बॉर्डर हाइब्रिड', p: 'जब स्थानीय गहराई कम पड़े, तो एक स्थानीय इंजीनियर को रिमोट या फ्लाई-इन स्पेशलिस्ट के साथ जोड़ें — डिज़ाइन और प्रोग्रामिंग रिमोट से, कमीशनिंग साइट पर, सब एक ही प्रोजेक्ट रूम में।' },
        { h: 'नौ-भाषा प्रोजेक्ट रूम', p: 'प्रोजेक्ट WarRoom में हर मैसेज नौ भाषाओं में रियल टाइम में ट्रांसलेट होता है, ताकि चीनी मुख्यालय, स्पेनिश-भाषी टेक्नीशियन और अंग्रेज़ी लीड एक ही थ्रेड से काम कर सकें।' },
        { h: 'माइलस्टोन एस्क्रो', p: 'फंड्स एस्क्रो में रखे जाते हैं और काम स्वीकृत होते ही चरणबद्ध तरीके से रिलीज़ होते हैं, जो सीमा पार खरीदार और इंजीनियर दोनों की रक्षा करता है।' },
      ],
      projects: ['नई लाइन कमीशनिंग', 'रेट्रोफिट और PLC माइग्रेशन', 'रोबोट सेल इंटीग्रेशन', 'विज़न इंस्पेक्शन डिप्लॉयमेंट'],
      ratesNote:
        'स्थानीय मेक्सिको और लैटिन अमेरिका दरें $35–65/hr के आसपास हैं। नीचे दी गई टेबल क्षेत्रों की तुलना करती है ताकि आप "स्थानीय + क्रॉस-बॉर्डर" मिश्रण की ईमानदारी से कीमत तय कर सकें। प्लेटफ़ॉर्म एस्क्रो शुल्क 15% है (संस्थापक ग्राहकों के लिए 5%)।',
    },
    fr: {
      title: 'Vous construisez une usine au Mexique ? Résolvez votre problème de recrutement en automatisation.',
      sub: 'Ingénieurs locaux certifiés plus support transfrontalier à distance et sur site — le tout protégé par séquestre et coordonné en neuf langues.',
      status1:
        'Le boom du nearshoring au Mexique a attiré l’investissement manufacturier vers le Bajío, Nuevo León et la frontière nord plus vite que ne peut croître le vivier local d’ingénieurs en automatisation expérimentés. Les spécialistes en contrôle-commande, robotique et vision industrielle sont en pénurie structurelle, et ceux qui existent sont généralement déjà engagés.',
      status2:
        'Le recours habituel — faire venir des ingénieurs du siège en avion — est lent et coûteux, et se heurte sur le terrain à la barrière de la langue et au décalage horaire. Un ingénieur hispanophone capable de mettre la ligne en service vaut mieux qu’un spécialiste à distance absent au moment critique ; mais la plupart des projets ont besoin des deux.',
      solutions: [
        { h: 'Ingénieurs locaux certifiés', p: 'Ingénieurs hispanophones en contrôle-commande, robotique et vision ayant réussi notre évaluation pratique par IA, disponibles sur votre ligne pour la mise en service et le support.' },
        { h: 'Hybride transfrontalier', p: 'Quand le vivier local s’épuise, associez un ingénieur local à un spécialiste à distance ou en déplacement — conception et programmation à distance, mise en service sur site, dans une seule salle de projet.' },
        { h: 'Salle de projet en neuf langues', p: 'Chaque message dans le WarRoom du projet est traduit en temps réel dans neuf langues, pour qu’un siège chinois, un technicien hispanophone et un chef de projet anglophone travaillent dans un même fil de discussion.' },
        { h: 'Séquestre par jalons', p: 'Les fonds sont conservés sous séquestre et libérés étape par étape à mesure que le travail est accepté, protégeant l’acheteur et l’ingénieur de part et d’autre de la frontière.' },
      ],
      projects: ['Mise en service de nouvelle ligne', 'Rétrofit et migration PLC', 'Intégration de cellule robotique', 'Déploiement d’inspection par vision'],
      ratesNote:
        'Les tarifs locaux au Mexique et en Amérique latine se situent autour de $35–65/h. Le tableau ci-dessous compare les régions pour vous aider à tarifer honnêtement une combinaison de ressources locales et transfrontalières. Les frais de séquestre de la plateforme sont de 15% (5% pour les clients fondateurs).',
    },
    de: {
      title: 'Bauen Sie eine Fabrik in Mexiko? Lösen Sie Ihre Automatisierungs-Personalfrage.',
      sub: 'Lokale zertifizierte Ingenieure plus grenzüberschreitende Remote- und Vor-Ort-Unterstützung — durch Treuhand geschützt, über neun Sprachen koordiniert.',
      status1:
        'Mexikos Nearshoring-Boom hat Fertigungsinvestitionen schneller in den Bajío, nach Nuevo León und an die Nordgrenze gezogen, als der lokale Pool erfahrener Automatisierungsingenieure wachsen kann. Steuerungs-, Robotik- und Bildverarbeitungsspezialisten sind strukturell knapp, und die vorhandenen sind meist bereits gebunden.',
      status2:
        'Der übliche Ausweg — Ingenieure aus der Zentrale einzufliegen — ist langsam und teuer und stößt vor Ort auf Sprach- und Zeitzonenreibung. Ein spanischsprachiger Ingenieur, der die Linie in Betrieb nehmen kann, schlägt einen Remote-Spezialisten, der im entscheidenden Moment nicht da ist; die meisten Projekte brauchen jedoch beides.',
      solutions: [
        { h: 'Lokale zertifizierte Ingenieure', p: 'Spanischsprachige Steuerungs-, Robotik- und Bildverarbeitungsingenieure, die unseren praxisnahen KI-Test bestanden haben und für Inbetriebnahme und Support auf Ihrer Linie verfügbar sind.' },
        { h: 'Grenzüberschreitendes Hybridmodell', p: 'Wenn die lokale Tiefe nicht ausreicht, kombinieren Sie einen lokalen Ingenieur mit einem Remote- oder Vor-Ort-Spezialisten — Design und Programmierung remote, Inbetriebnahme vor Ort, in einem gemeinsamen Projektraum.' },
        { h: 'Projektraum in neun Sprachen', p: 'Jede Nachricht im Projekt-WarRoom wird in Echtzeit in neun Sprachen übersetzt, sodass eine chinesische Zentrale, ein spanischsprachiger Techniker und eine englischsprachige Projektleitung an einem gemeinsamen Thread arbeiten.' },
        { h: 'Meilenstein-Treuhand', p: 'Gelder werden treuhänderisch verwahrt und stufenweise freigegeben, sobald die Arbeit abgenommen ist — das schützt Käufer und Ingenieur über die Grenze hinweg.' },
      ],
      projects: ['Inbetriebnahme neuer Linien', 'Nachrüstung und PLC-Migration', 'Integration von Roboterzellen', 'Einsatz von Bildverarbeitungsprüfung'],
      ratesNote:
        'Lokale Sätze für Mexiko und Lateinamerika liegen bei $35–65/Std. Die folgende Tabelle vergleicht Regionen, damit Sie einen lokal-plus-grenzüberschreitenden Mix ehrlich bepreisen können. Die Treuhandgebühr der Plattform beträgt 15% (5% für Gründungskunden).',
    },
    ja: {
      title: 'メキシコに工場を建設中ですか？自動化人材の課題を解決します。',
      sub: '現地の認定エンジニアに加え、国境を越えたリモート・出張サポート——エスクローで保護され、9言語で連携。',
      status1:
        'メキシコのニアショアリングブームは、経験豊富な自動化エンジニアの現地人材プールが育つよりも速いペースで、製造業投資をバヒオ、ヌエボレオン、北部国境地帯に引き寄せています。制御、ロボティクス、マシンビジョンの専門家は構造的に不足しており、存在する人材はたいてい既に他の仕事を抱えています。',
      status2:
        '通常の代替策——本社からエンジニアを空輸する——は遅く、コストもかかり、現場では言語と時差の摩擦にぶつかります。ラインを試運転できるスペイン語話者のエンジニアは、肝心なときに現場にいられないリモート専門家に勝りますが、ほとんどのプロジェクトでは両方が必要になります。',
      solutions: [
        { h: '現地認定エンジニア', p: '当社の実践的なAIスクリーニングに合格したスペイン語話者の制御・ロボティクス・ビジョンエンジニアが、試運転とサポートのために現場に赴くことができます。' },
        { h: '国境をまたぐハイブリッド', p: '現地の層が足りない場合、現地エンジニアをリモートまたは出張の専門家と組み合わせます——設計とプログラミングはリモートで、試運転は現場で、すべて一つのプロジェクトルームで。' },
        { h: '9言語プロジェクトルーム', p: 'プロジェクトのWarRoom内のすべてのメッセージがリアルタイムで9言語に翻訳され、中国本社、スペイン語話者の技術者、英語のリードが一つのスレッドで作業できます。' },
        { h: 'マイルストーンエスクロー', p: '資金はエスクローに保管され、作業が承認されるたびに段階的に解放され、国境を越えて買い手とエンジニアの双方を保護します。' },
      ],
      projects: ['新規ラインの試運転', 'レトロフィットとPLC移行', 'ロボットセルの統合', 'ビジョン検査の導入'],
      ratesNote:
        'メキシコ・ラテンアメリカの現地レートは$35–65/hr程度。以下の表で地域を比較し、現地+国境を越えたミックスを正直に価格設定できます。プラットフォームのエスクロー手数料は15%です（ファウンディングクライアントは5%）。',
    },
    ko: {
      title: '멕시코에 공장을 짓고 계신가요? 자동화 인력 문제를 해결하세요.',
      sub: '현지 인증 엔지니어에 더해 국경을 넘나드는 원격 및 출장 지원 — 에스크로로 보호되며, 9개 언어로 조율됩니다.',
      status1:
        '멕시코의 니어쇼어링 붐은 경험 많은 자동화 엔지니어의 현지 인력 풀이 성장하는 속도보다 더 빠르게 제조업 투자를 바히오, 누에보레온, 북부 국경 지역으로 끌어들였습니다. 제어, 로보틱스, 머신 비전 전문가는 구조적으로 부족하며, 존재하는 인력은 대개 이미 다른 일에 매여 있습니다.',
      status2:
        '흔한 대안 — 본사에서 엔지니어를 항공편으로 파견하는 것 — 은 느리고 비용이 많이 들며, 현장에서 언어와 시차 마찰에 부딪힙니다. 라인을 시운전할 수 있는 스페인어 구사 엔지니어가, 정작 필요한 순간에 현장에 없는 원격 전문가보다 낫습니다. 하지만 대부분의 프로젝트에는 둘 다 필요합니다.',
      solutions: [
        { h: '현지 인증 엔지니어', p: '당사의 실무형 AI 심사를 통과한 스페인어 구사 제어, 로보틱스, 비전 엔지니어가 시운전과 지원을 위해 귀사의 라인에 상주할 수 있습니다.' },
        { h: '국경 간 하이브리드', p: '현지 역량이 부족할 때는 현지 엔지니어와 원격 또는 출장 전문가를 짝지으세요 — 설계와 프로그래밍은 원격으로, 시운전은 현장에서, 모두 하나의 프로젝트 룸에서 진행됩니다.' },
        { h: '9개 언어 프로젝트 룸', p: '프로젝트 WarRoom의 모든 메시지가 9개 언어로 실시간 번역되어, 중국 본사, 스페인어 구사 기술자, 영어권 리더가 하나의 스레드에서 함께 작업합니다.' },
        { h: '마일스톤 에스크로', p: '자금은 에스크로에 보관되며 작업이 승인될 때마다 단계별로 지급되어, 국경을 넘어 구매자와 엔지니어 모두를 보호합니다.' },
      ],
      projects: ['신규 라인 시운전', '개조 및 PLC 마이그레이션', '로봇 셀 통합', '비전 검사 배포'],
      ratesNote:
        '멕시코 및 라틴아메리카 현지 요율은 시간당 $35–65 수준입니다. 아래 표는 지역별로 비교하여 현지+국경 간 혼합 인력의 가격을 정직하게 책정할 수 있게 해줍니다. 플랫폼 에스크로 수수료는 15%입니다(파운딩 고객은 5%).',
    },
    vi: {
      title: 'Xây nhà máy tại Mexico? Giải quyết nhân sự tự động hóa của bạn.',
      sub: 'Kỹ sư địa phương có chứng chỉ cùng hỗ trợ từ xa và có mặt tại chỗ xuyên biên giới — được bảo vệ bằng ký quỹ, phối hợp qua chín ngôn ngữ.',
      status1:
        'Làn sóng nearshoring của Mexico đã kéo đầu tư sản xuất về Bajío, Nuevo León và biên giới phía bắc nhanh hơn tốc độ tăng của đội ngũ kỹ sư tự động hóa giàu kinh nghiệm tại chỗ. Chuyên gia điều khiển, robot và thị giác máy thiếu hụt mang tính cơ cấu, và những người có sẵn thường đã bận việc.',
      status2:
        'Cách xử lý quen thuộc — điều kỹ sư từ trụ sở sang — vừa chậm vừa tốn kém, lại vấp phải rào cản ngôn ngữ và lệch múi giờ tại xưởng. Một kỹ sư nói tiếng Tây Ban Nha có thể chạy thử dây chuyền sẽ hơn một chuyên gia từ xa vắng mặt vào lúc quan trọng; nhưng phần lớn dự án cần cả hai.',
      solutions: [
        { h: 'Kỹ sư địa phương có chứng chỉ', p: 'Kỹ sư điều khiển, robot và thị giác nói tiếng Tây Ban Nha, đã vượt qua bài đánh giá thực hành bằng AI của chúng tôi và có thể có mặt tại dây chuyền để chạy thử và hỗ trợ.' },
        { h: 'Kết hợp xuyên biên giới', p: 'Khi năng lực địa phương không đủ, ghép một kỹ sư địa phương với một chuyên gia từ xa hoặc được cử đến — thiết kế và lập trình từ xa, chạy thử tại chỗ, trong cùng một phòng dự án.' },
        { h: 'Phòng dự án chín ngôn ngữ', p: 'Mọi tin nhắn trong phòng dự án (WarRoom) được dịch theo thời gian thực qua chín ngôn ngữ, để trụ sở Trung Quốc, kỹ thuật viên nói tiếng Tây Ban Nha và trưởng dự án nói tiếng Anh cùng làm việc trên một luồng.' },
        { h: 'Ký quỹ theo cột mốc', p: 'Tiền được giữ trong ký quỹ và giải ngân theo từng giai đoạn khi công việc được nghiệm thu, bảo vệ cả bên mua lẫn kỹ sư qua biên giới.' },
      ],
      projects: ['Chạy thử dây chuyền mới', 'Cải tạo và chuyển đổi PLC', 'Tích hợp cell robot', 'Triển khai kiểm tra bằng thị giác'],
      ratesNote:
        'Mức giá địa phương của Mexico và Mỹ Latinh vào khoảng $35–65/hr. Bảng dưới đây so sánh các khu vực để bạn định giá trung thực cho phương án kết hợp địa phương và xuyên biên giới. Phí ký quỹ nền tảng là 15% (5% cho khách hàng sáng lập).',
    },
  },

  vietnam: {
    flag: '🇻🇳',
    langs: ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'],
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
      title: '¿Construye una fábrica en Vietnam? Resuelva su personal de automatización.',
      sub: 'Ingenieros locales certificados más apoyo remoto y presencial transfronterizo — protegido con depósito en garantía, coordinado en nueve idiomas.',
      status1:
        'Vietnam se ha convertido en un destino principal para la capacidad de electrónica y manufactura ligera que sale de China, pero su reserva de ingeniería de automatización es joven. Los ingenieros con experiencia en PLC, robótica y visión escasean frente a la velocidad con que se montan líneas nuevas, sobre todo cerca de Bac Ninh, Hai Phong y los parques industriales del sur.',
      status2:
        'Traer ingenieros desde una matriz china o coreana sirve para un empujón de puesta en marcha, pero los costos de viáticos, viajes y rotación se acumulan, y las diferencias de husos horarios e idioma ralentizan el ir y venir diario con los técnicos locales. La respuesta duradera es un núcleo local respaldado a través de la frontera.',
      solutions: [
        { h: 'Ingenieros locales certificados', p: 'Ingenieros de control, robótica y visión que hablan vietnamita, han superado nuestra evaluación práctica con IA y pueden estar en su línea para la puesta en marcha y el soporte.' },
        { h: 'Híbrido transfronterizo', p: 'Combine un ingeniero local con un especialista remoto o desplazado — diseño y programación en remoto, puesta en marcha en sitio, en una sola sala de proyecto.' },
        { h: 'Sala de proyecto en nueve idiomas', p: 'Cada mensaje de la sala del proyecto (WarRoom) se traduce en tiempo real a nueve idiomas, para que la matriz china o coreana, el técnico vietnamita y el líder en inglés trabajen en un mismo hilo.' },
        { h: 'Depósito en garantía por hitos', p: 'Los fondos quedan en depósito en garantía y se liberan por etapas conforme se acepta el trabajo, protegiendo a comprador e ingeniero a través de la frontera.' },
      ],
      projects: ['Puesta en marcha de línea nueva', 'Automatización de ensamble electrónico', 'Integración de celda robótica', 'Despliegue de inspección por visión'],
      ratesNote:
        'Las tarifas locales del Sudeste Asiático rondan los $30–55/hr. La tabla siguiente compara regiones para que usted fije un precio honesto de una mezcla local más transfronteriza. La comisión de depósito en garantía de la plataforma es del 15% (5% para clientes fundadores).',
    },
    hi: {
      title: 'वियतनाम में फैक्ट्री बना रहे हैं? अपनी ऑटोमेशन स्टाफिंग सुलझाएं।',
      sub: 'स्थानीय प्रमाणित इंजीनियर प्लस क्रॉस-बॉर्डर रिमोट और फ्लाई-इन सपोर्ट — एस्क्रो-सुरक्षित, नौ भाषाओं में समन्वित।',
      status1:
        'वियतनाम चीन से बाहर जाती इलेक्ट्रॉनिक्स और लाइट-मैन्युफैक्चरिंग क्षमता के लिए एक प्रमुख गंतव्य बन गया है, लेकिन इसका ऑटोमेशन-इंजीनियरिंग पूल अभी युवा है। अनुभवी PLC, रोबोटिक्स और विज़न इंजीनियर, नई लाइनें खड़ी होने की रफ्तार के मुकाबले दुर्लभ हैं, खासकर बाक निन्ह, है फोंग और दक्षिणी औद्योगिक पार्कों के आसपास।',
      status2:
        'चीनी या कोरियाई पैरेंट कंपनी से इंजीनियर लाना कमीशनिंग के एक झोंके के लिए काम करता है, लेकिन प्रति-दिन भत्ता, यात्रा और रोटेशन लागत बढ़ती जाती है, और टाइम-ज़ोन व भाषा के गैप स्थानीय टेक्नीशियन्स के साथ रोज़ाना के आगे-पीछे को धीमा कर देते हैं। टिकाऊ जवाब है — सीमा पार समर्थित एक स्थानीय कोर टीम।',
      solutions: [
        { h: 'स्थानीय प्रमाणित इंजीनियर', p: 'वियतनामी-भाषी कंट्रोल्स, रोबोटिक्स और विज़न इंजीनियर, जिन्होंने हमारी प्रैक्टिकल AI स्क्रीन पास की है और कमीशनिंग व सपोर्ट के लिए आपकी लाइन पर मौजूद हो सकते हैं।' },
        { h: 'क्रॉस-बॉर्डर हाइब्रिड', p: 'एक स्थानीय इंजीनियर को रिमोट या फ्लाई-इन स्पेशलिस्ट के साथ जोड़ें — डिज़ाइन और प्रोग्रामिंग रिमोट से, कमीशनिंग साइट पर, सब एक ही प्रोजेक्ट रूम में।' },
        { h: 'नौ-भाषा प्रोजेक्ट रूम', p: 'प्रोजेक्ट WarRoom में हर मैसेज नौ भाषाओं में रियल टाइम में ट्रांसलेट होता है, ताकि चीनी या कोरियाई मुख्यालय, वियतनामी टेक्नीशियन और अंग्रेज़ी लीड एक ही थ्रेड से काम कर सकें।' },
        { h: 'माइलस्टोन एस्क्रो', p: 'फंड्स एस्क्रो में रखे जाते हैं और काम स्वीकृत होते ही चरणबद्ध तरीके से रिलीज़ होते हैं, जो सीमा पार खरीदार और इंजीनियर दोनों की रक्षा करता है।' },
      ],
      projects: ['नई लाइन कमीशनिंग', 'इलेक्ट्रॉनिक्स असेंबली ऑटोमेशन', 'रोबोट सेल इंटीग्रेशन', 'विज़न इंस्पेक्शन डिप्लॉयमेंट'],
      ratesNote:
        'स्थानीय दक्षिण-पूर्व एशिया दरें $30–55/hr के आसपास हैं। नीचे दी गई टेबल क्षेत्रों की तुलना करती है ताकि आप "स्थानीय + क्रॉस-बॉर्डर" मिश्रण की ईमानदारी से कीमत तय कर सकें। प्लेटफ़ॉर्म एस्क्रो शुल्क 15% है (संस्थापक ग्राहकों के लिए 5%)।',
    },
    fr: {
      title: 'Vous construisez une usine au Vietnam ? Résolvez votre problème de recrutement en automatisation.',
      sub: 'Ingénieurs locaux certifiés plus support transfrontalier à distance et sur site — le tout protégé par séquestre et coordonné en neuf langues.',
      status1:
        'Le Vietnam est devenu une destination majeure pour les capacités de production électronique et de fabrication légère qui quittent la Chine, mais son vivier d’ingénieurs en automatisation est jeune. Les ingénieurs expérimentés en PLC, robotique et vision sont rares par rapport à la vitesse à laquelle de nouvelles lignes sont mises en place, notamment autour de Bac Ninh, Hai Phong et des parcs industriels du sud.',
      status2:
        'Faire venir des ingénieurs d’une maison mère chinoise ou coréenne fonctionne le temps d’un pic de mise en service, mais les indemnités journalières, les frais de déplacement et de rotation s’accumulent, et le décalage horaire comme la barrière de la langue ralentissent les échanges quotidiens avec les techniciens locaux. La réponse durable est un noyau local soutenu par-delà les frontières.',
      solutions: [
        { h: 'Ingénieurs locaux certifiés', p: 'Ingénieurs en contrôle-commande, robotique et vision parlant vietnamien, ayant réussi notre évaluation pratique par IA, disponibles sur votre ligne pour la mise en service et le support.' },
        { h: 'Hybride transfrontalier', p: 'Associez un ingénieur local à un spécialiste à distance ou en déplacement — conception et programmation à distance, mise en service sur site, dans une seule salle de projet.' },
        { h: 'Salle de projet en neuf langues', p: 'Chaque message dans le WarRoom du projet est traduit en temps réel dans neuf langues, pour qu’un siège chinois ou coréen, un technicien vietnamien et un chef de projet anglophone travaillent dans un même fil de discussion.' },
        { h: 'Séquestre par jalons', p: 'Les fonds sont conservés sous séquestre et libérés étape par étape à mesure que le travail est accepté, protégeant l’acheteur et l’ingénieur de part et d’autre de la frontière.' },
      ],
      projects: ['Mise en service de nouvelle ligne', 'Automatisation de l’assemblage électronique', 'Intégration de cellule robotique', 'Déploiement d’inspection par vision'],
      ratesNote:
        'Les tarifs locaux d’Asie du Sud-Est se situent autour de $30–55/h. Le tableau ci-dessous compare les régions pour vous aider à tarifer honnêtement une combinaison de ressources locales et transfrontalières. Les frais de séquestre de la plateforme sont de 15% (5% pour les clients fondateurs).',
    },
    de: {
      title: 'Bauen Sie eine Fabrik in Vietnam? Lösen Sie Ihre Automatisierungs-Personalfrage.',
      sub: 'Lokale zertifizierte Ingenieure plus grenzüberschreitende Remote- und Vor-Ort-Unterstützung — durch Treuhand geschützt, über neun Sprachen koordiniert.',
      status1:
        'Vietnam ist zu einem wichtigen Ziel für Elektronik- und Leichtfertigungskapazitäten geworden, die aus China abwandern, doch sein Pool an Automatisierungsingenieuren ist jung. Erfahrene PLC-, Robotik- und Bildverarbeitungsingenieure sind knapp im Verhältnis zu dem Tempo, mit dem neue Linien aufgebaut werden, besonders rund um Bac Ninh, Hai Phong und die südlichen Industrieparks.',
      status2:
        'Ingenieure von einer chinesischen oder koreanischen Muttergesellschaft einzufliegen funktioniert für einen Inbetriebnahme-Schub, aber Tagegelder, Reise- und Rotationskosten summieren sich, und Zeitzonen- sowie Sprachlücken verlangsamen den täglichen Austausch mit lokalen Technikern. Die dauerhafte Antwort ist ein lokaler Kern, der grenzüberschreitend unterstützt wird.',
      solutions: [
        { h: 'Lokale zertifizierte Ingenieure', p: 'Vietnamesischsprachige Steuerungs-, Robotik- und Bildverarbeitungsingenieure, die unseren praxisnahen KI-Test bestanden haben und für Inbetriebnahme und Support auf Ihrer Linie verfügbar sind.' },
        { h: 'Grenzüberschreitendes Hybridmodell', p: 'Kombinieren Sie einen lokalen Ingenieur mit einem Remote- oder Vor-Ort-Spezialisten — Design und Programmierung remote, Inbetriebnahme vor Ort, in einem gemeinsamen Projektraum.' },
        { h: 'Projektraum in neun Sprachen', p: 'Jede Nachricht im Projekt-WarRoom wird in Echtzeit in neun Sprachen übersetzt, sodass eine chinesische oder koreanische Zentrale, ein vietnamesischer Techniker und eine englischsprachige Projektleitung an einem gemeinsamen Thread arbeiten.' },
        { h: 'Meilenstein-Treuhand', p: 'Gelder werden treuhänderisch verwahrt und stufenweise freigegeben, sobald die Arbeit abgenommen ist — das schützt Käufer und Ingenieur über die Grenze hinweg.' },
      ],
      projects: ['Inbetriebnahme neuer Linien', 'Automatisierung der Elektronikmontage', 'Integration von Roboterzellen', 'Einsatz von Bildverarbeitungsprüfung'],
      ratesNote:
        'Lokale Sätze für Südostasien liegen bei $30–55/Std. Die folgende Tabelle vergleicht Regionen, damit Sie einen lokal-plus-grenzüberschreitenden Mix ehrlich bepreisen können. Die Treuhandgebühr der Plattform beträgt 15% (5% für Gründungskunden).',
    },
    ja: {
      title: 'ベトナムに工場を建設中ですか？自動化人材の課題を解決します。',
      sub: '現地の認定エンジニアに加え、国境を越えたリモート・出張サポート——エスクローで保護され、9言語で連携。',
      status1:
        'ベトナムは中国から移転する電子機器・軽工業製造の主要な移転先となっていますが、その自動化エンジニアリングの人材プールはまだ若い段階です。経験豊富なPLC、ロボティクス、ビジョンエンジニアは、新しいラインが立ち上がる速さに比べて不足しており、特にバクニン、ハイフォン、南部の工業団地周辺で顕著です。',
      status2:
        '中国や韓国の親会社からエンジニアを連れてくることは、試運転の一時的な急増には有効ですが、日当、渡航費、ローテーションコストが積み重なり、時差と言語のギャップが現地技術者との日々のやり取りを遅らせます。持続可能な答えは、国境を越えて支援される現地の中核チームです。',
      solutions: [
        { h: '現地認定エンジニア', p: '当社の実践的なAIスクリーニングに合格したベトナム語話者の制御・ロボティクス・ビジョンエンジニアが、試運転とサポートのために現場に赴くことができます。' },
        { h: '国境をまたぐハイブリッド', p: '現地エンジニアをリモートまたは出張の専門家と組み合わせます——設計とプログラミングはリモートで、試運転は現場で、すべて一つのプロジェクトルームで。' },
        { h: '9言語プロジェクトルーム', p: 'プロジェクトのWarRoom内のすべてのメッセージがリアルタイムで9言語に翻訳され、中国または韓国本社、ベトナム人技術者、英語のリードが一つのスレッドで作業できます。' },
        { h: 'マイルストーンエスクロー', p: '資金はエスクローに保管され、作業が承認されるたびに段階的に解放され、国境を越えて買い手とエンジニアの双方を保護します。' },
      ],
      projects: ['新規ラインの試運転', '電子機器組立の自動化', 'ロボットセルの統合', 'ビジョン検査の導入'],
      ratesNote:
        '東南アジアの現地レートは$30–55/hr程度。以下の表で地域を比較し、現地+国境を越えたミックスを正直に価格設定できます。プラットフォームのエスクロー手数料は15%です（ファウンディングクライアントは5%）。',
    },
    ko: {
      title: '베트남에 공장을 짓고 계신가요? 자동화 인력 문제를 해결하세요.',
      sub: '현지 인증 엔지니어에 더해 국경을 넘나드는 원격 및 출장 지원 — 에스크로로 보호되며, 9개 언어로 조율됩니다.',
      status1:
        '베트남은 중국을 떠나는 전자·경공업 제조 역량의 주요 목적지가 되었지만, 자동화 엔지니어링 인력 풀은 아직 젊습니다. 경험 많은 PLC, 로보틱스, 비전 엔지니어는 신규 라인이 구축되는 속도에 비해 부족하며, 특히 박닌, 하이퐁, 남부 산업단지 주변에서 두드러집니다.',
      status2:
        '중국이나 한국 모회사에서 엔지니어를 데려오는 것은 단기간의 시운전 급증에는 효과적이지만, 일당, 출장비, 순환 근무 비용이 쌓이고, 시차와 언어 격차가 현지 기술자와의 일상적인 소통을 늦춥니다. 지속 가능한 해답은 국경을 넘어 지원받는 현지 핵심 팀입니다.',
      solutions: [
        { h: '현지 인증 엔지니어', p: '당사의 실무형 AI 심사를 통과한 베트남어 구사 제어, 로보틱스, 비전 엔지니어가 시운전과 지원을 위해 귀사의 라인에 상주할 수 있습니다.' },
        { h: '국경 간 하이브리드', p: '현지 엔지니어와 원격 또는 출장 전문가를 짝지으세요 — 설계와 프로그래밍은 원격으로, 시운전은 현장에서, 모두 하나의 프로젝트 룸에서 진행됩니다.' },
        { h: '9개 언어 프로젝트 룸', p: '프로젝트 WarRoom의 모든 메시지가 9개 언어로 실시간 번역되어, 중국 또는 한국 본사, 베트남 기술자, 영어권 리더가 하나의 스레드에서 함께 작업합니다.' },
        { h: '마일스톤 에스크로', p: '자금은 에스크로에 보관되며 작업이 승인될 때마다 단계별로 지급되어, 국경을 넘어 구매자와 엔지니어 모두를 보호합니다.' },
      ],
      projects: ['신규 라인 시운전', '전자 조립 자동화', '로봇 셀 통합', '비전 검사 배포'],
      ratesNote:
        '동남아시아 현지 요율은 시간당 $30–55 수준입니다. 아래 표는 지역별로 비교하여 현지+국경 간 혼합 인력의 가격을 정직하게 책정할 수 있게 해줍니다. 플랫폼 에스크로 수수료는 15%입니다(파운딩 고객은 5%).',
    },
    vi: {
      title: 'Xây nhà máy tại Việt Nam? Giải quyết nhân sự tự động hóa của bạn.',
      sub: 'Kỹ sư địa phương có chứng chỉ cùng hỗ trợ từ xa và có mặt tại chỗ xuyên biên giới — được bảo vệ bằng ký quỹ, phối hợp qua chín ngôn ngữ.',
      status1:
        'Việt Nam đã trở thành điểm đến chính cho năng lực điện tử và sản xuất nhẹ dịch chuyển khỏi Trung Quốc, nhưng đội ngũ kỹ thuật tự động hóa còn non trẻ. Kỹ sư PLC, robot và thị giác giàu kinh nghiệm khan hiếm so với tốc độ dựng dây chuyền mới, nhất là quanh Bắc Ninh, Hải Phòng và các khu công nghiệp phía nam.',
      status2:
        'Điều kỹ sư từ công ty mẹ Trung Quốc hay Hàn Quốc sang có thể lo được một đợt chạy thử, nhưng chi phí công tác phí, đi lại và luân chuyển sẽ dồn lại, còn chênh lệch múi giờ và ngôn ngữ làm chậm việc trao đổi hằng ngày với kỹ thuật viên địa phương. Câu trả lời bền vững là một đội nòng cốt địa phương được hỗ trợ xuyên biên giới.',
      solutions: [
        { h: 'Kỹ sư địa phương có chứng chỉ', p: 'Kỹ sư điều khiển, robot và thị giác nói tiếng Việt, đã vượt qua bài đánh giá thực hành bằng AI của chúng tôi và có thể có mặt tại dây chuyền để chạy thử và hỗ trợ.' },
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
    langs: ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'],
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
    es: {
      title: '¿Construye una fábrica en Tailandia? Resuelva su personal de automatización.',
      sub: 'Ingenieros locales certificados más apoyo remoto y presencial transfronterizo — protegido con depósito en garantía, con la comunicación del proyecto traducida en nueve idiomas.',
      status1:
        'El Corredor Económico Oriental de Tailandia ha concentrado inversión automotriz, electrónica y de vehículos eléctricos, y la demanda de ingenieros de automatización allí ha superado la oferta local. Los especialistas experimentados en control, robótica y visión artificial son difíciles de contratar y lentos de reemplazar.',
      status2:
        'Rotar ingenieros desde una matriz cubre un impulso de puesta en marcha, pero es costoso de sostener, y la coordinación diaria cruza líneas de idioma y huso horario. Un núcleo local certificado, respaldado por apoyo remoto y presencial transfronterizo, es el modelo duradero.',
      solutions: [
        { h: 'Ingenieros locales certificados', p: 'Ingenieros de control, robótica y visión que hablan tailandés, han superado nuestra evaluación práctica con IA y pueden estar en su línea para la puesta en marcha y el soporte.' },
        { h: 'Híbrido transfronterizo', p: 'Combine un ingeniero local con un especialista remoto o desplazado — diseño y programación en remoto, puesta en marcha en sitio, en una sola sala de proyecto.' },
        { h: 'Sala de proyecto en nueve idiomas', p: 'Cada mensaje de la sala del proyecto (WarRoom) se traduce en tiempo real a nueve idiomas, para que una matriz en el extranjero, un técnico tailandés y un líder en inglés trabajen en un mismo hilo.' },
        { h: 'Depósito en garantía por hitos', p: 'Los fondos quedan en depósito en garantía y se liberan por etapas conforme se acepta el trabajo, protegiendo a comprador e ingeniero a través de la frontera.' },
      ],
      projects: ['Puesta en marcha de líneas de VE y automotrices', 'Automatización de ensamble electrónico', 'Integración de celda robótica', 'Despliegue de inspección por visión'],
      ratesNote:
        'Las tarifas locales del Sudeste Asiático rondan los $30–55/hr. La tabla siguiente compara regiones para que usted fije un precio honesto de una mezcla local más transfronteriza. La comisión de depósito en garantía de la plataforma es del 15% (5% para clientes fundadores).',
      thaiNote:
        'El tailandés todavía no es uno de nuestros nueve idiomas de interfaz en la plataforma, pero la sala de proyecto (WarRoom) traduce la comunicación en tiempo real a nueve idiomas, y los ingenieros locales que hablan tailandés conectan con la planta.',
    },
    vi: {
      title: 'Xây nhà máy tại Thái Lan? Giải quyết nhân sự tự động hóa của bạn.',
      sub: 'Kỹ sư địa phương có chứng chỉ cùng hỗ trợ từ xa và có mặt tại chỗ xuyên biên giới — được bảo vệ bằng ký quỹ, với giao tiếp dự án được dịch qua chín ngôn ngữ.',
      status1:
        'Hành lang Kinh tế phía Đông của Thái Lan đã tập trung đầu tư ô tô, điện tử và xe điện, và nhu cầu kỹ sư tự động hóa ở đó đã vượt qua nguồn cung địa phương. Chuyên gia điều khiển, robot và thị giác máy giàu kinh nghiệm khó tuyển và chậm thay thế.',
      status2:
        'Luân chuyển kỹ sư từ công ty mẹ có thể đáp ứng một đợt chạy thử, nhưng chi phí duy trì cao, và việc phối hợp hằng ngày phải vượt qua ranh giới ngôn ngữ và múi giờ. Một đội nòng cốt địa phương có chứng chỉ, được hỗ trợ bởi lực lượng từ xa và có mặt tại chỗ xuyên biên giới, là mô hình bền vững.',
      solutions: [
        { h: 'Kỹ sư địa phương có chứng chỉ', p: 'Kỹ sư điều khiển, robot và thị giác nói tiếng Thái, đã vượt qua bài đánh giá thực hành bằng AI của chúng tôi và có thể có mặt tại dây chuyền để chạy thử và hỗ trợ.' },
        { h: 'Kết hợp xuyên biên giới', p: 'Ghép một kỹ sư địa phương với một chuyên gia từ xa hoặc được cử đến — thiết kế và lập trình từ xa, chạy thử tại chỗ, trong cùng một phòng dự án.' },
        { h: 'Phòng dự án chín ngôn ngữ', p: 'Mọi tin nhắn trong phòng dự án (WarRoom) được dịch theo thời gian thực qua chín ngôn ngữ, để trụ sở nước ngoài, kỹ thuật viên Thái Lan và trưởng dự án nói tiếng Anh cùng làm việc trên một luồng.' },
        { h: 'Ký quỹ theo cột mốc', p: 'Tiền được giữ trong ký quỹ và giải ngân theo từng giai đoạn khi công việc được nghiệm thu, bảo vệ cả bên mua lẫn kỹ sư qua biên giới.' },
      ],
      projects: ['Chạy thử dây chuyền xe điện và ô tô', 'Tự động hóa lắp ráp điện tử', 'Tích hợp cell robot', 'Triển khai kiểm tra bằng thị giác'],
      ratesNote:
        'Mức giá địa phương của Đông Nam Á vào khoảng $30–55/hr. Bảng dưới đây so sánh các khu vực để bạn định giá trung thực cho phương án kết hợp địa phương và xuyên biên giới. Phí ký quỹ nền tảng là 15% (5% cho khách hàng sáng lập).',
      thaiNote:
        'Tiếng Thái chưa phải là một trong chín ngôn ngữ giao diện của nền tảng chúng tôi, nhưng phòng dự án (WarRoom) dịch giao tiếp qua chín ngôn ngữ theo thời gian thực, và các kỹ sư địa phương nói tiếng Thái kết nối với hiện trường.',
    },
    hi: {
      title: 'थाईलैंड में फैक्ट्री बना रहे हैं? अपनी ऑटोमेशन स्टाफिंग सुलझाएं।',
      sub: 'स्थानीय प्रमाणित इंजीनियर प्लस क्रॉस-बॉर्डर रिमोट और फ्लाई-इन सपोर्ट — एस्क्रो-सुरक्षित, प्रोजेक्ट कम्युनिकेशन नौ भाषाओं में अनुवादित।',
      status1:
        'थाईलैंड के ईस्टर्न इकोनॉमिक कॉरिडोर ने ऑटोमोटिव, इलेक्ट्रॉनिक्स और EV निवेश को केंद्रित किया है, और वहां ऑटोमेशन इंजीनियरों की मांग स्थानीय आपूर्ति से आगे निकल गई है। अनुभवी कंट्रोल्स, रोबोटिक्स और मशीन-विज़न स्पेशलिस्ट्स को हायर करना मुश्किल है और बदलना धीमा।',
      status2:
        'पैरेंट कंपनी से इंजीनियरों को घुमा-फिराकर लाना कमीशनिंग के एक धक्के को कवर करता है, लेकिन बनाए रखना महंगा है, और रोज़ाना समन्वय भाषा व टाइम-ज़ोन की रेखाएं पार करता है। एक स्थानीय प्रमाणित कोर, जिसे क्रॉस-बॉर्डर रिमोट और फ्लाई-इन सपोर्ट का बैकअप हो, टिकाऊ मॉडल है।',
      solutions: [
        { h: 'स्थानीय प्रमाणित इंजीनियर', p: 'थाई-भाषी कंट्रोल्स, रोबोटिक्स और विज़न इंजीनियर, जिन्होंने हमारी प्रैक्टिकल AI स्क्रीन पास की है और कमीशनिंग व सपोर्ट के लिए आपकी लाइन पर मौजूद हो सकते हैं।' },
        { h: 'क्रॉस-बॉर्डर हाइब्रिड', p: 'एक स्थानीय इंजीनियर को रिमोट या फ्लाई-इन स्पेशलिस्ट के साथ जोड़ें — डिज़ाइन और प्रोग्रामिंग रिमोट से, कमीशनिंग साइट पर, सब एक ही प्रोजेक्ट रूम में।' },
        { h: 'नौ-भाषा प्रोजेक्ट रूम', p: 'प्रोजेक्ट WarRoom में हर मैसेज नौ भाषाओं में रियल टाइम में ट्रांसलेट होता है, ताकि विदेशी मुख्यालय, थाई टेक्नीशियन और अंग्रेज़ी लीड एक ही थ्रेड से काम कर सकें।' },
        { h: 'माइलस्टोन एस्क्रो', p: 'फंड्स एस्क्रो में रखे जाते हैं और काम स्वीकृत होते ही चरणबद्ध तरीके से रिलीज़ होते हैं, जो सीमा पार खरीदार और इंजीनियर दोनों की रक्षा करता है।' },
      ],
      projects: ['EV और ऑटोमोटिव लाइन कमीशनिंग', 'इलेक्ट्रॉनिक्स असेंबली ऑटोमेशन', 'रोबोट सेल इंटीग्रेशन', 'विज़न इंस्पेक्शन डिप्लॉयमेंट'],
      ratesNote:
        'स्थानीय दक्षिण-पूर्व एशिया दरें $30–55/hr के आसपास हैं। नीचे दी गई टेबल क्षेत्रों की तुलना करती है ताकि आप "स्थानीय + क्रॉस-बॉर्डर" मिश्रण की ईमानदारी से कीमत तय कर सकें। प्लेटफ़ॉर्म एस्क्रो शुल्क 15% है (संस्थापक ग्राहकों के लिए 5%)।',
      thaiNote:
        'थाई अभी हमारी नौ इन-प्लेटफ़ॉर्म इंटरफ़ेस भाषाओं में से एक नहीं है, लेकिन प्रोजेक्ट WarRoom कम्युनिकेशन को नौ भाषाओं में रियल टाइम में ट्रांसलेट करता है, और स्थानीय थाई-भाषी इंजीनियर फ्लोर के साथ पुल का काम करते हैं।',
    },
    fr: {
      title: 'Vous construisez une usine en Thaïlande ? Résolvez votre problème de recrutement en automatisation.',
      sub: 'Ingénieurs locaux certifiés plus support transfrontalier à distance et sur site — le tout protégé par séquestre, avec la communication du projet traduite en neuf langues.',
      status1:
        'Le Corridor économique de l’Est de la Thaïlande a concentré les investissements automobiles, électroniques et de véhicules électriques, et la demande d’ingénieurs en automatisation y a dépassé l’offre locale. Les spécialistes expérimentés en contrôle-commande, robotique et vision industrielle sont difficiles à recruter et lents à remplacer.',
      status2:
        'Faire tourner des ingénieurs venus d’une maison mère absorbe un pic de mise en service, mais coûte cher à maintenir dans la durée, et la coordination quotidienne se heurte à la barrière de la langue et au décalage horaire. Un noyau local certifié, appuyé par un support transfrontalier à distance et sur site, est le modèle durable.',
      solutions: [
        { h: 'Ingénieurs locaux certifiés', p: 'Ingénieurs en contrôle-commande, robotique et vision parlant thaï, ayant réussi notre évaluation pratique par IA, disponibles sur votre ligne pour la mise en service et le support.' },
        { h: 'Hybride transfrontalier', p: 'Associez un ingénieur local à un spécialiste à distance ou en déplacement — conception et programmation à distance, mise en service sur site, dans une seule salle de projet.' },
        { h: 'Salle de projet en neuf langues', p: 'Chaque message dans le WarRoom du projet est traduit en temps réel dans neuf langues, pour qu’un siège à l’étranger, un technicien thaïlandais et un chef de projet anglophone travaillent dans un même fil de discussion.' },
        { h: 'Séquestre par jalons', p: 'Les fonds sont conservés sous séquestre et libérés étape par étape à mesure que le travail est accepté, protégeant l’acheteur et l’ingénieur de part et d’autre de la frontière.' },
      ],
      projects: ['Mise en service de lignes automobiles et de VE', 'Automatisation de l’assemblage électronique', 'Intégration de cellule robotique', 'Déploiement d’inspection par vision'],
      ratesNote:
        'Les tarifs locaux d’Asie du Sud-Est se situent autour de $30–55/h. Le tableau ci-dessous compare les régions pour vous aider à tarifer honnêtement une combinaison de ressources locales et transfrontalières. Les frais de séquestre de la plateforme sont de 15% (5% pour les clients fondateurs).',
      thaiNote:
        'Le thaï ne fait pas encore partie de nos neuf langues d’interface sur la plateforme, mais le WarRoom du projet traduit la communication en temps réel dans neuf langues, et des ingénieurs locaux parlant thaï font le lien avec le terrain.',
    },
    de: {
      title: 'Bauen Sie eine Fabrik in Thailand? Lösen Sie Ihre Automatisierungs-Personalfrage.',
      sub: 'Lokale zertifizierte Ingenieure plus grenzüberschreitende Remote- und Vor-Ort-Unterstützung — durch Treuhand geschützt, mit Projektkommunikation in neun Sprachen übersetzt.',
      status1:
        'Thailands Eastern Economic Corridor hat Automobil-, Elektronik- und E-Fahrzeug-Investitionen gebündelt, und die Nachfrage nach Automatisierungsingenieuren dort hat das lokale Angebot überholt. Erfahrene Steuerungs-, Robotik- und Bildverarbeitungsspezialisten sind schwer einzustellen und langsam zu ersetzen.',
      status2:
        'Ingenieure von einer Muttergesellschaft rotieren zu lassen deckt einen Inbetriebnahme-Schub ab, ist aber teuer auf Dauer, und die tägliche Koordination überquert Sprach- und Zeitzonengrenzen. Ein lokaler zertifizierter Kern, unterstützt durch grenzüberschreitende Remote- und Vor-Ort-Hilfe, ist das dauerhafte Modell.',
      solutions: [
        { h: 'Lokale zertifizierte Ingenieure', p: 'Thailändischsprachige Steuerungs-, Robotik- und Bildverarbeitungsingenieure, die unseren praxisnahen KI-Test bestanden haben und für Inbetriebnahme und Support auf Ihrer Linie verfügbar sind.' },
        { h: 'Grenzüberschreitendes Hybridmodell', p: 'Kombinieren Sie einen lokalen Ingenieur mit einem Remote- oder Vor-Ort-Spezialisten — Design und Programmierung remote, Inbetriebnahme vor Ort, in einem gemeinsamen Projektraum.' },
        { h: 'Projektraum in neun Sprachen', p: 'Jede Nachricht im Projekt-WarRoom wird in Echtzeit in neun Sprachen übersetzt, sodass eine Zentrale im Ausland, ein thailändischer Techniker und eine englischsprachige Projektleitung an einem gemeinsamen Thread arbeiten.' },
        { h: 'Meilenstein-Treuhand', p: 'Gelder werden treuhänderisch verwahrt und stufenweise freigegeben, sobald die Arbeit abgenommen ist — das schützt Käufer und Ingenieur über die Grenze hinweg.' },
      ],
      projects: ['Inbetriebnahme von E-Fahrzeug- und Automobillinien', 'Automatisierung der Elektronikmontage', 'Integration von Roboterzellen', 'Einsatz von Bildverarbeitungsprüfung'],
      ratesNote:
        'Lokale Sätze für Südostasien liegen bei $30–55/Std. Die folgende Tabelle vergleicht Regionen, damit Sie einen lokal-plus-grenzüberschreitenden Mix ehrlich bepreisen können. Die Treuhandgebühr der Plattform beträgt 15% (5% für Gründungskunden).',
      thaiNote:
        'Thailändisch gehört noch nicht zu unseren neun Plattform-Oberflächensprachen, aber der Projekt-WarRoom übersetzt die Kommunikation in Echtzeit in neun Sprachen, und lokale thailändischsprachige Ingenieure schlagen die Brücke zur Halle.',
    },
    ja: {
      title: 'タイに工場を建設中ですか？自動化人材の課題を解決します。',
      sub: '現地の認定エンジニアに加え、国境を越えたリモート・出張サポート——エスクローで保護され、プロジェクトのやり取りは9言語に翻訳されます。',
      status1:
        'タイの東部経済回廊は自動車、電子機器、EV投資を集中させており、同地域での自動化エンジニアの需要は現地の供給を上回っています。経験豊富な制御、ロボティクス、マシンビジョンの専門家は採用が難しく、交代にも時間がかかります。',
      status2:
        '親会社からエンジニアをローテーションで送ることは試運転の一時的な急増をカバーしますが、維持コストが高く、日々の連携は言語と時差の壁を越える必要があります。国境を越えたリモート・出張サポートに支えられた現地の認定コアチームこそ、持続可能なモデルです。',
      solutions: [
        { h: '現地認定エンジニア', p: '当社の実践的なAIスクリーニングに合格したタイ語話者の制御・ロボティクス・ビジョンエンジニアが、試運転とサポートのために現場に赴くことができます。' },
        { h: '国境をまたぐハイブリッド', p: '現地エンジニアをリモートまたは出張の専門家と組み合わせます——設計とプログラミングはリモートで、試運転は現場で、すべて一つのプロジェクトルームで。' },
        { h: '9言語プロジェクトルーム', p: 'プロジェクトのWarRoom内のすべてのメッセージがリアルタイムで9言語に翻訳され、海外本社、タイ人技術者、英語のリードが一つのスレッドで作業できます。' },
        { h: 'マイルストーンエスクロー', p: '資金はエスクローに保管され、作業が承認されるたびに段階的に解放され、国境を越えて買い手とエンジニアの双方を保護します。' },
      ],
      projects: ['EV・自動車ラインの試運転', '電子機器組立の自動化', 'ロボットセルの統合', 'ビジョン検査の導入'],
      ratesNote:
        '東南アジアの現地レートは$30–55/hr程度。以下の表で地域を比較し、現地+国境を越えたミックスを正直に価格設定できます。プラットフォームのエスクロー手数料は15%です（ファウンディングクライアントは5%）。',
      thaiNote:
        'タイ語はまだ当社の9つのプラットフォーム内表示言語には含まれていませんが、プロジェクトのWarRoomはコミュニケーションをリアルタイムで9言語に翻訳し、現地のタイ語話者エンジニアが現場との橋渡しを行います。',
    },
    ko: {
      title: '태국에 공장을 짓고 계신가요? 자동화 인력 문제를 해결하세요.',
      sub: '현지 인증 엔지니어에 더해 국경을 넘나드는 원격 및 출장 지원 — 에스크로로 보호되며, 프로젝트 커뮤니케이션은 9개 언어로 번역됩니다.',
      status1:
        '태국의 동부경제회랑(EEC)은 자동차, 전자, 전기차 투자를 집중시켰고, 그곳의 자동화 엔지니어 수요는 현지 공급을 앞질렀습니다. 경험 많은 제어, 로보틱스, 머신 비전 전문가는 채용하기 어렵고 교체도 느립니다.',
      status2:
        '모회사에서 엔지니어를 순환 배치하는 것은 시운전 급증을 감당할 수 있지만 유지 비용이 크고, 일상적인 조율은 언어와 시차의 경계를 넘나들어야 합니다. 국경을 넘나드는 원격 및 출장 지원으로 뒷받침되는 현지 인증 핵심 팀이 지속 가능한 모델입니다.',
      solutions: [
        { h: '현지 인증 엔지니어', p: '당사의 실무형 AI 심사를 통과한 태국어 구사 제어, 로보틱스, 비전 엔지니어가 시운전과 지원을 위해 귀사의 라인에 상주할 수 있습니다.' },
        { h: '국경 간 하이브리드', p: '현지 엔지니어와 원격 또는 출장 전문가를 짝지으세요 — 설계와 프로그래밍은 원격으로, 시운전은 현장에서, 모두 하나의 프로젝트 룸에서 진행됩니다.' },
        { h: '9개 언어 프로젝트 룸', p: '프로젝트 WarRoom의 모든 메시지가 9개 언어로 실시간 번역되어, 해외 본사, 태국인 기술자, 영어권 리더가 하나의 스레드에서 함께 작업합니다.' },
        { h: '마일스톤 에스크로', p: '자금은 에스크로에 보관되며 작업이 승인될 때마다 단계별로 지급되어, 국경을 넘어 구매자와 엔지니어 모두를 보호합니다.' },
      ],
      projects: ['전기차 및 자동차 라인 시운전', '전자 조립 자동화', '로봇 셀 통합', '비전 검사 배포'],
      ratesNote:
        '동남아시아 현지 요율은 시간당 $30–55 수준입니다. 아래 표는 지역별로 비교하여 현지+국경 간 혼합 인력의 가격을 정직하게 책정할 수 있게 해줍니다. 플랫폼 에스크로 수수료는 15%입니다(파운딩 고객은 5%).',
      thaiNote:
        '태국어는 아직 당사의 9개 플랫폼 내 인터페이스 언어에 포함되어 있지 않지만, 프로젝트 WarRoom은 커뮤니케이션을 9개 언어로 실시간 번역하며, 현지 태국어 구사 엔지니어가 현장과의 가교 역할을 합니다.',
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
      hi: g.hi || null,
      fr: g.fr || null,
      de: g.de || null,
      ja: g.ja || null,
      ko: g.ko || null,
    },
  };
}
