import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import { enqueue } from '../lib/offline/outbox';
import styles from './onboarding.module.css';

const LS_USER_KEY = 'tal_user';

const SKILL_OPTIONS = ['PLC Programming', 'Siemens TIA Portal', 'Rockwell Studio 5000', 'SCADA/HMI', 'Fanuc Robotics', 'KUKA Robotics', 'ABB Robotics', 'Electrical Panel Design', 'Process Control', 'VFD/Drives', 'Pneumatics', 'Hydraulics', 'Commissioning', 'Troubleshooting', 'AutoCAD Electrical', 'EPLAN', 'Allen-Bradley', 'Omron', 'Mitsubishi PLC', 'Safety Systems (SIL/PLe)'];

// i18n：与全站一致的页内 DICT 模式（en/zh 先行，其它语言回退英文）。
// 2026-07-17 改版：本页从"每次从头走一遍向导"改为"我的档案（My Profile）"——
// 进来即拉取本人已存档案回填，单页编辑、一键保存。
const DICT = {
  en: {
    pageTitle: 'My Profile | Talengineer',
    loading: 'Loading your profile…',
    myProfileTitle: 'My Profile',
    subEdit: 'Update your details and save. This is what employers see on your public profile.',
    subNew: 'Complete your profile so employers can find you. It takes about 2 minutes.',
    saveChanges: 'Save Changes ✓', saving: 'Saving…',
    profileTitle: 'Basics', profileDesc: 'Tell employers who you are and what you do.',
    lblRegion: 'Location / Region', phRegion: 'e.g. Texas, USA · Ontario, Canada',
    lblRate: 'Hourly Rate (USD)', lblPricing: 'Pricing Model',
    optHourly: 'Hourly', optProject: 'Project-based', optDaily: 'Daily rate',
    lblBio: 'Professional Bio',
    phBio: 'e.g. 8+ years commissioning Siemens S7 lines for automotive and food & beverage. Fluent in Mandarin. Available for travel within North America.',
    skillsTitle: 'Skills & Expertise', skillsDesc: 'Select all that apply. Employers filter by skills.',
    phCustomSkill: 'Add a custom skill…', btnAdd: '+ Add',
    availStepTitle: 'Availability', availStepDesc: 'Let employers know when you can take on projects.',
    availNow: 'Available Now', availNowDesc: 'Ready to start immediately',
    availBusy: 'Busy — Available Soon', availBusyDesc: 'Currently on a project, available in a few weeks',
    availNo: 'Not Available', availNoDesc: 'Not taking new projects right now',
    lblAvailFrom: 'Available from (optional)',
    portfolioTitle: 'Portfolio',
    portfolioDesc: 'Add photos of your past work — installations, panels, wiring diagrams. Employers trust engineers with proof.',
    phImageUrl: 'Image URL (e.g. https://i.imgur.com/abc.jpg)',
    phCaption: 'Caption (e.g. Siemens S7 panel commissioning, Monterrey 2024)',
    addItem: '+ Add Item',
    viewPublic: 'View public profile →', browseProjects: 'Browse Projects →',
    toastSaved: 'Profile saved!', toastSaveFailed: 'Failed to save profile.',
    toastPortfolioFailed: 'Profile saved, but portfolio failed to save.', toastNetwork: 'Network error.',
    toastOfflineQueued: 'Saved offline — will sync automatically when you reconnect.',
    // Avatar / uploads
    avatarLabel: 'Profile Photo', uploadImage: '📷 Upload Image', uploading: 'Uploading…',
    toastUploaded: 'Uploaded!', toastUploadFailed: 'Upload failed.',
    toastPortfolioMax: 'You can add up to 12 portfolio items.',
    uploadPhoto: '📷 Upload Photo',
    // Insurance & compliance
    insuranceTitle: 'Insurance & Compliance',
    insuranceDesc: 'Upload your Certificate of Insurance (COI). Our team verifies it before you can be assigned to on-site work.',
    uploadCoi: '📄 Upload COI (PDF or image)',
    toastCoiSubmitted: 'Submitted. Awaiting platform verification.',
    toastCoiFailed: 'Failed to submit insurance certificate.',
    noInsurance: 'No insurance certificate on file yet.',
    // Tax documents
    taxTitle: 'Tax Documents',
    taxDesc: 'Upload your completed IRS Form W-9 (PDF). This is required before any payout can be processed.',
    uploadW9: '📄 Upload W-9 (PDF)',
    w9FormLink: 'Get the official IRS W-9 form ↗',
    toastW9Submitted: 'W-9 submitted. Awaiting confirmation.',
    toastW9Failed: 'Failed to submit W-9.',
    noTax: 'No tax document submitted yet.',
    // Status badges (tax: submitted|received|rejected · cert: pending|verified|rejected)
    stSubmitted: 'Pending confirmation', stReceived: 'Received', stReturned: 'Returned',
    stPending: 'Pending verification', stVerified: 'Verified', stRejected: 'Rejected',
  },
  zh: {
    pageTitle: '我的档案 | Talengineer',
    loading: '正在加载你的档案…',
    myProfileTitle: '我的档案',
    subEdit: '更新你的信息并保存。雇主会在你的公开档案上看到这些内容。',
    subNew: '完善你的档案，让雇主更快找到你，大约 2 分钟。',
    saveChanges: '保存修改 ✓', saving: '保存中…',
    profileTitle: '基本信息', profileDesc: '告诉雇主你是谁、擅长做什么。',
    lblRegion: '所在地 / 区域', phRegion: '例如 Texas, USA · Ontario, Canada',
    lblRate: '时薪（美元）', lblPricing: '计价方式',
    optHourly: '按小时', optProject: '按项目', optDaily: '按天',
    lblBio: '职业简介',
    phBio: '例如：8 年以上西门子 S7 产线调试经验，服务汽车与食品饮料行业，中文流利，可在北美出差。',
    skillsTitle: '技能与专长', skillsDesc: '选中所有符合项——雇主会按技能筛选。',
    phCustomSkill: '添加自定义技能…', btnAdd: '+ 添加',
    availStepTitle: '接单状态', availStepDesc: '让雇主知道你什么时候能接项目。',
    availNow: '可接单', availNowDesc: '可以立即开始',
    availBusy: '忙碌——即将有空', availBusyDesc: '正在项目中，几周后可接新单',
    availNo: '不可接单', availNoDesc: '目前不接新项目',
    lblAvailFrom: '可开始日期（可选）',
    portfolioTitle: '作品集',
    portfolioDesc: '上传过往工作照片——安装现场、电柜、接线图。有实证的工程师更受雇主信任。',
    phImageUrl: '图片 URL（例如 https://i.imgur.com/abc.jpg）',
    phCaption: '说明（例如：西门子 S7 电柜调试，蒙特雷 2024）',
    addItem: '+ 添加一项',
    viewPublic: '查看公开档案 →', browseProjects: '浏览项目 →',
    toastSaved: '档案已保存！', toastSaveFailed: '档案保存失败。',
    toastPortfolioFailed: '档案已保存，但作品集保存失败。', toastNetwork: '网络错误，请重试。',
    toastOfflineQueued: '已离线保存，回网后自动同步。',
    // 头像 / 上传
    avatarLabel: '头像', uploadImage: '📷 上传图片', uploading: '上传中…',
    toastUploaded: '上传成功！', toastUploadFailed: '上传失败。',
    toastPortfolioMax: '作品集最多添加 12 项。',
    uploadPhoto: '📷 上传照片',
    // 保险与合规
    insuranceTitle: '保险与合规',
    insuranceDesc: '上传你的保险凭证（COI）。平台核验通过后，方可被指派到现场作业。',
    uploadCoi: '📄 上传 COI（PDF 或图片）',
    toastCoiSubmitted: '已提交，等待平台核验。',
    toastCoiFailed: '保险证书提交失败。',
    noInsurance: '暂无保险证书记录。',
    // 税务文件
    taxTitle: '税务文件',
    taxDesc: '上传填好的 IRS W-9 表（PDF）。在处理任何收款之前需先完成此步。',
    uploadW9: '📄 上传 W-9（PDF）',
    w9FormLink: '获取官方 IRS W-9 表格 ↗',
    toastW9Submitted: 'W-9 已提交，等待确认。',
    toastW9Failed: 'W-9 提交失败。',
    noTax: '暂无税务文件。',
    // 状态徽标（税务：submitted|received|rejected · 证书：pending|verified|rejected）
    stSubmitted: '待确认', stReceived: '已收讫', stReturned: '被退回',
    stPending: '待核验', stVerified: '已核验', stRejected: '被退回',
  },
  es: {
    pageTitle: 'Mi Perfil | Talengineer',
    loading: 'Cargando tu perfil…',
    myProfileTitle: 'Mi Perfil',
    subEdit: 'Actualiza tus datos y guarda. Esto es lo que los empleadores ven en tu perfil público.',
    subNew: 'Completa tu perfil para que los empleadores te encuentren. Toma unos 2 minutos.',
    saveChanges: 'Guardar Cambios ✓', saving: 'Guardando…',
    profileTitle: 'Datos Básicos', profileDesc: 'Cuéntales a los empleadores quién eres y qué haces.',
    lblRegion: 'Ubicación / Región', phRegion: 'p. ej. Texas, USA · Ontario, Canadá',
    lblRate: 'Tarifa por Hora (USD)', lblPricing: 'Modelo de Precios',
    optHourly: 'Por hora', optProject: 'Por proyecto', optDaily: 'Tarifa diaria',
    lblBio: 'Biografía Profesional',
    phBio: 'p. ej. Más de 8 años poniendo en marcha líneas Siemens S7 para automoción y alimentación. Mandarín fluido. Disponible para viajar por Norteamérica.',
    skillsTitle: 'Habilidades y Especialidades', skillsDesc: 'Selecciona todas las que apliquen. Los empleadores filtran por habilidades.',
    phCustomSkill: 'Añadir habilidad personalizada…', btnAdd: '+ Añadir',
    availStepTitle: 'Disponibilidad', availStepDesc: 'Informa a los empleadores cuándo puedes tomar proyectos.',
    availNow: 'Disponible Ahora', availNowDesc: 'Listo para empezar de inmediato',
    availBusy: 'Ocupado — Disponible Pronto', availBusyDesc: 'En un proyecto, disponible en unas semanas',
    availNo: 'No Disponible', availNoDesc: 'No acepto nuevos proyectos por ahora',
    lblAvailFrom: 'Disponible desde (opcional)',
    portfolioTitle: 'Portafolio',
    portfolioDesc: 'Añade fotos de trabajos anteriores — instalaciones, tableros, diagramas de cableado. Los empleadores confían en ingenieros con evidencia.',
    phImageUrl: 'URL de imagen (p. ej. https://i.imgur.com/abc.jpg)',
    phCaption: 'Descripción (p. ej. Puesta en marcha de tablero Siemens S7, Monterrey 2024)',
    addItem: '+ Añadir Elemento',
    viewPublic: 'Ver perfil público →', browseProjects: 'Ver Proyectos →',
    toastSaved: '¡Perfil guardado!', toastSaveFailed: 'Error al guardar el perfil.',
    toastPortfolioFailed: 'Perfil guardado, pero el portafolio no se guardó.', toastNetwork: 'Error de red.',
    toastOfflineQueued: 'Guardado sin conexión — se sincronizará automáticamente al reconectar.',
    avatarLabel: 'Foto de Perfil', uploadImage: '📷 Subir Imagen', uploading: 'Subiendo…',
    toastUploaded: '¡Subido!', toastUploadFailed: 'Error al subir.',
    toastPortfolioMax: 'Puedes añadir hasta 12 elementos al portafolio.',
    uploadPhoto: '📷 Subir Foto',
    insuranceTitle: 'Seguro y Cumplimiento',
    insuranceDesc: 'Sube tu Certificado de Seguro (COI). Nuestro equipo lo verifica antes de que puedas ser asignado a trabajo en sitio.',
    uploadCoi: '📄 Subir COI (PDF o imagen)',
    toastCoiSubmitted: 'Enviado. Esperando verificación de la plataforma.',
    toastCoiFailed: 'Error al enviar el certificado de seguro.',
    noInsurance: 'Aún no hay certificado de seguro registrado.',
    taxTitle: 'Documentos Fiscales',
    taxDesc: 'Sube tu Formulario W-9 del IRS completado (PDF). Es obligatorio antes de procesar cualquier pago.',
    uploadW9: '📄 Subir W-9 (PDF)',
    w9FormLink: 'Obtener el formulario oficial W-9 del IRS ↗',
    toastW9Submitted: 'W-9 enviado. Esperando confirmación.',
    toastW9Failed: 'Error al enviar el W-9.',
    noTax: 'Aún no hay documento fiscal enviado.',
    stSubmitted: 'Pendiente de confirmación', stReceived: 'Recibido', stReturned: 'Devuelto',
    stPending: 'Pendiente de verificación', stVerified: 'Verificado', stRejected: 'Rechazado',
  },
  vi: {
    pageTitle: 'Hồ sơ của tôi | Talengineer',
    loading: 'Đang tải hồ sơ của bạn…',
    myProfileTitle: 'Hồ sơ của tôi',
    subEdit: 'Cập nhật thông tin và lưu. Đây là những gì nhà tuyển dụng thấy trên hồ sơ công khai của bạn.',
    subNew: 'Hoàn thiện hồ sơ để nhà tuyển dụng tìm thấy bạn. Chỉ mất khoảng 2 phút.',
    saveChanges: 'Lưu Thay đổi ✓', saving: 'Đang lưu…',
    profileTitle: 'Thông tin Cơ bản', profileDesc: 'Cho nhà tuyển dụng biết bạn là ai và bạn làm gì.',
    lblRegion: 'Vị trí / Khu vực', phRegion: 'VD: Texas, USA · Ontario, Canada',
    lblRate: 'Đơn giá theo giờ (USD)', lblPricing: 'Mô hình Tính giá',
    optHourly: 'Theo giờ', optProject: 'Theo dự án', optDaily: 'Theo ngày',
    lblBio: 'Giới thiệu Nghề nghiệp',
    phBio: 'VD: Hơn 8 năm chạy thử dây chuyền Siemens S7 cho ngành ô tô và thực phẩm. Thông thạo tiếng Trung. Sẵn sàng công tác trong Bắc Mỹ.',
    skillsTitle: 'Kỹ năng & Chuyên môn', skillsDesc: 'Chọn tất cả mục phù hợp. Nhà tuyển dụng lọc theo kỹ năng.',
    phCustomSkill: 'Thêm kỹ năng tùy chỉnh…', btnAdd: '+ Thêm',
    availStepTitle: 'Tình trạng Nhận việc', availStepDesc: 'Cho nhà tuyển dụng biết khi nào bạn có thể nhận dự án.',
    availNow: 'Sẵn sàng Nhận việc', availNowDesc: 'Có thể bắt đầu ngay',
    availBusy: 'Bận — Sắp rảnh', availBusyDesc: 'Đang trong dự án, vài tuần nữa có thể nhận việc mới',
    availNo: 'Không Nhận việc', availNoDesc: 'Hiện không nhận dự án mới',
    lblAvailFrom: 'Có thể bắt đầu từ (tùy chọn)',
    portfolioTitle: 'Hồ sơ Năng lực',
    portfolioDesc: 'Thêm ảnh công việc đã làm — lắp đặt, tủ điện, sơ đồ đấu nối. Nhà tuyển dụng tin tưởng kỹ sư có bằng chứng.',
    phImageUrl: 'URL hình ảnh (VD: https://i.imgur.com/abc.jpg)',
    phCaption: 'Chú thích (VD: Chạy thử tủ Siemens S7, Monterrey 2024)',
    addItem: '+ Thêm mục',
    viewPublic: 'Xem hồ sơ công khai →', browseProjects: 'Xem Dự án →',
    toastSaved: 'Đã lưu hồ sơ!', toastSaveFailed: 'Lưu hồ sơ thất bại.',
    toastPortfolioFailed: 'Đã lưu hồ sơ, nhưng lưu hồ sơ năng lực thất bại.', toastNetwork: 'Lỗi mạng.',
    toastOfflineQueued: 'Đã lưu ngoại tuyến — sẽ tự động đồng bộ khi có mạng.',
    avatarLabel: 'Ảnh Đại diện', uploadImage: '📷 Tải ảnh lên', uploading: 'Đang tải lên…',
    toastUploaded: 'Đã tải lên!', toastUploadFailed: 'Tải lên thất bại.',
    toastPortfolioMax: 'Chỉ có thể thêm tối đa 12 mục.',
    uploadPhoto: '📷 Tải ảnh lên',
    insuranceTitle: 'Bảo hiểm & Tuân thủ',
    insuranceDesc: 'Tải lên Chứng nhận Bảo hiểm (COI). Đội ngũ của chúng tôi xác minh trước khi bạn được phân công làm việc tại hiện trường.',
    uploadCoi: '📄 Tải lên COI (PDF hoặc ảnh)',
    toastCoiSubmitted: 'Đã gửi. Chờ nền tảng xác minh.',
    toastCoiFailed: 'Gửi chứng nhận bảo hiểm thất bại.',
    noInsurance: 'Chưa có chứng nhận bảo hiểm.',
    taxTitle: 'Hồ sơ Thuế',
    taxDesc: 'Tải lên Mẫu W-9 IRS đã điền (PDF). Bắt buộc trước khi xử lý bất kỳ khoản thanh toán nào.',
    uploadW9: '📄 Tải lên W-9 (PDF)',
    w9FormLink: 'Lấy mẫu W-9 chính thức của IRS ↗',
    toastW9Submitted: 'Đã gửi W-9. Chờ xác nhận.',
    toastW9Failed: 'Gửi W-9 thất bại.',
    noTax: 'Chưa nộp hồ sơ thuế.',
    stSubmitted: 'Chờ xác nhận', stReceived: 'Đã nhận', stReturned: 'Bị trả lại',
    stPending: 'Chờ xác minh', stVerified: 'Đã xác minh', stRejected: 'Bị từ chối',
  },
  hi: {
    pageTitle: 'मेरी प्रोफ़ाइल | Talengineer',
    loading: 'आपकी प्रोफ़ाइल लोड हो रही है…',
    myProfileTitle: 'मेरी प्रोफ़ाइल',
    subEdit: 'अपना विवरण अपडेट करें और सहेजें। नियोक्ता आपकी सार्वजनिक प्रोफ़ाइल पर यही देखते हैं।',
    subNew: 'अपनी प्रोफ़ाइल पूरी करें ताकि नियोक्ता आपको खोज सकें। लगभग 2 मिनट लगते हैं।',
    saveChanges: 'परिवर्तन सहेजें ✓', saving: 'सहेजा जा रहा है…',
    profileTitle: 'मूल जानकारी', profileDesc: 'नियोक्ताओं को बताएं कि आप कौन हैं और क्या करते हैं।',
    lblRegion: 'स्थान / क्षेत्र', phRegion: 'जैसे Texas, USA · Ontario, Canada',
    lblRate: 'प्रति घंटा दर (USD)', lblPricing: 'मूल्य मॉडल',
    optHourly: 'प्रति घंटा', optProject: 'प्रोजेक्ट-आधारित', optDaily: 'दैनिक दर',
    lblBio: 'पेशेवर परिचय',
    phBio: 'जैसे: ऑटोमोटिव और खाद्य-पेय उद्योग के लिए Siemens S7 लाइनों की 8+ वर्षों की कमीशनिंग। मंदारिन में धाराप्रवाह। उत्तरी अमेरिका में यात्रा के लिए उपलब्ध।',
    skillsTitle: 'कौशल और विशेषज्ञता', skillsDesc: 'सभी लागू विकल्प चुनें। नियोक्ता कौशल के आधार पर फ़िल्टर करते हैं।',
    phCustomSkill: 'कस्टम कौशल जोड़ें…', btnAdd: '+ जोड़ें',
    availStepTitle: 'उपलब्धता', availStepDesc: 'नियोक्ताओं को बताएं कि आप कब प्रोजेक्ट ले सकते हैं।',
    availNow: 'अभी उपलब्ध', availNowDesc: 'तुरंत शुरू करने के लिए तैयार',
    availBusy: 'व्यस्त — जल्द उपलब्ध', availBusyDesc: 'अभी एक प्रोजेक्ट में हूँ, कुछ हफ़्तों में उपलब्ध',
    availNo: 'उपलब्ध नहीं', availNoDesc: 'अभी नए प्रोजेक्ट नहीं ले रहा',
    lblAvailFrom: 'उपलब्धता की तारीख़ (वैकल्पिक)',
    portfolioTitle: 'पोर्टफोलियो',
    portfolioDesc: 'अपने पिछले काम की तस्वीरें जोड़ें — इंस्टॉलेशन, पैनल, वायरिंग आरेख। प्रमाण वाले इंजीनियरों पर नियोक्ता भरोसा करते हैं।',
    phImageUrl: 'इमेज URL (जैसे https://i.imgur.com/abc.jpg)',
    phCaption: 'विवरण (जैसे: Siemens S7 पैनल कमीशनिंग, Monterrey 2024)',
    addItem: '+ आइटम जोड़ें',
    viewPublic: 'सार्वजनिक प्रोफ़ाइल देखें →', browseProjects: 'प्रोजेक्ट देखें →',
    toastSaved: 'प्रोफ़ाइल सहेजी गई!', toastSaveFailed: 'प्रोफ़ाइल सहेजने में विफल।',
    toastPortfolioFailed: 'प्रोफ़ाइल सहेजी गई, लेकिन पोर्टफोलियो सहेजने में विफल।', toastNetwork: 'नेटवर्क त्रुटि।',
    toastOfflineQueued: 'ऑफ़लाइन सहेजा गया — कनेक्ट होने पर अपने आप सिंक होगा।',
    avatarLabel: 'प्रोफ़ाइल फ़ोटो', uploadImage: '📷 इमेज अपलोड करें', uploading: 'अपलोड हो रहा है…',
    toastUploaded: 'अपलोड हो गया!', toastUploadFailed: 'अपलोड विफल।',
    toastPortfolioMax: 'पोर्टफोलियो में अधिकतम 12 आइटम जोड़ सकते हैं।',
    uploadPhoto: '📷 फ़ोटो अपलोड करें',
    insuranceTitle: 'बीमा और अनुपालन',
    insuranceDesc: 'अपना बीमा प्रमाणपत्र (COI) अपलोड करें। ऑन-साइट कार्य असाइन होने से पहले हमारी टीम इसे सत्यापित करती है।',
    uploadCoi: '📄 COI अपलोड करें (PDF या इमेज)',
    toastCoiSubmitted: 'जमा हो गया। प्लेटफ़ॉर्म सत्यापन की प्रतीक्षा।',
    toastCoiFailed: 'बीमा प्रमाणपत्र जमा करने में विफल।',
    noInsurance: 'अभी कोई बीमा प्रमाणपत्र दर्ज नहीं।',
    taxTitle: 'कर दस्तावेज़',
    taxDesc: 'भरा हुआ IRS फॉर्म W-9 (PDF) अपलोड करें। किसी भी भुगतान से पहले यह आवश्यक है।',
    uploadW9: '📄 W-9 अपलोड करें (PDF)',
    w9FormLink: 'आधिकारिक IRS W-9 फॉर्म प्राप्त करें ↗',
    toastW9Submitted: 'W-9 जमा हो गया। पुष्टि की प्रतीक्षा।',
    toastW9Failed: 'W-9 जमा करने में विफल।',
    noTax: 'अभी कोई कर दस्तावेज़ जमा नहीं।',
    stSubmitted: 'पुष्टि लंबित', stReceived: 'प्राप्त', stReturned: 'वापस किया गया',
    stPending: 'सत्यापन लंबित', stVerified: 'सत्यापित', stRejected: 'अस्वीकृत',
  },
  fr: {
    pageTitle: 'Mon Profil | Talengineer',
    loading: 'Chargement de votre profil…',
    myProfileTitle: 'Mon Profil',
    subEdit: 'Mettez à jour vos informations et enregistrez. Voici ce que les employeurs voient sur votre profil public.',
    subNew: 'Complétez votre profil pour que les employeurs vous trouvent. Environ 2 minutes.',
    saveChanges: 'Enregistrer ✓', saving: 'Enregistrement…',
    profileTitle: 'Informations de Base', profileDesc: 'Dites aux employeurs qui vous êtes et ce que vous faites.',
    lblRegion: 'Localisation / Région', phRegion: 'ex. Texas, USA · Ontario, Canada',
    lblRate: 'Taux Horaire (USD)', lblPricing: 'Modèle de Tarification',
    optHourly: "À l'heure", optProject: 'Au projet', optDaily: 'Tarif journalier',
    lblBio: 'Bio Professionnelle',
    phBio: "ex. Plus de 8 ans de mise en service de lignes Siemens S7 pour l'automobile et l'agroalimentaire. Mandarin courant. Disponible pour déplacements en Amérique du Nord.",
    skillsTitle: 'Compétences et Expertise', skillsDesc: "Sélectionnez tout ce qui s'applique. Les employeurs filtrent par compétences.",
    phCustomSkill: 'Ajouter une compétence…', btnAdd: '+ Ajouter',
    availStepTitle: 'Disponibilité', availStepDesc: 'Indiquez aux employeurs quand vous pouvez prendre des projets.',
    availNow: 'Disponible Maintenant', availNowDesc: 'Prêt à commencer immédiatement',
    availBusy: 'Occupé — Bientôt Disponible', availBusyDesc: 'Sur un projet, disponible dans quelques semaines',
    availNo: 'Non Disponible', availNoDesc: 'Ne prend pas de nouveaux projets actuellement',
    lblAvailFrom: 'Disponible à partir de (optionnel)',
    portfolioTitle: 'Portfolio',
    portfolioDesc: 'Ajoutez des photos de vos travaux — installations, armoires, schémas de câblage. Les employeurs font confiance aux ingénieurs avec des preuves.',
    phImageUrl: "URL de l'image (ex. https://i.imgur.com/abc.jpg)",
    phCaption: 'Légende (ex. Mise en service armoire Siemens S7, Monterrey 2024)',
    addItem: '+ Ajouter un Élément',
    viewPublic: 'Voir le profil public →', browseProjects: 'Voir les Projets →',
    toastSaved: 'Profil enregistré !', toastSaveFailed: "Échec de l'enregistrement du profil.",
    toastPortfolioFailed: 'Profil enregistré, mais échec du portfolio.', toastNetwork: 'Erreur réseau.',
    toastOfflineQueued: 'Enregistré hors ligne — synchronisation automatique à la reconnexion.',
    avatarLabel: 'Photo de Profil', uploadImage: '📷 Téléverser une Image', uploading: 'Téléversement…',
    toastUploaded: 'Téléversé !', toastUploadFailed: 'Échec du téléversement.',
    toastPortfolioMax: "Vous pouvez ajouter jusqu'à 12 éléments.",
    uploadPhoto: '📷 Téléverser une Photo',
    insuranceTitle: 'Assurance et Conformité',
    insuranceDesc: "Téléversez votre Certificat d'Assurance (COI). Notre équipe le vérifie avant toute affectation sur site.",
    uploadCoi: '📄 Téléverser le COI (PDF ou image)',
    toastCoiSubmitted: 'Envoyé. En attente de vérification.',
    toastCoiFailed: "Échec de l'envoi du certificat d'assurance.",
    noInsurance: "Aucun certificat d'assurance enregistré.",
    taxTitle: 'Documents Fiscaux',
    taxDesc: 'Téléversez votre formulaire IRS W-9 rempli (PDF). Requis avant tout traitement de paiement.',
    uploadW9: '📄 Téléverser le W-9 (PDF)',
    w9FormLink: 'Obtenir le formulaire officiel IRS W-9 ↗',
    toastW9Submitted: 'W-9 envoyé. En attente de confirmation.',
    toastW9Failed: "Échec de l'envoi du W-9.",
    noTax: 'Aucun document fiscal envoyé.',
    stSubmitted: 'Confirmation en attente', stReceived: 'Reçu', stReturned: 'Retourné',
    stPending: 'Vérification en attente', stVerified: 'Vérifié', stRejected: 'Rejeté',
  },
  de: {
    pageTitle: 'Mein Profil | Talengineer',
    loading: 'Dein Profil wird geladen…',
    myProfileTitle: 'Mein Profil',
    subEdit: 'Aktualisiere deine Angaben und speichere. Das sehen Arbeitgeber auf deinem öffentlichen Profil.',
    subNew: 'Vervollständige dein Profil, damit Arbeitgeber dich finden. Dauert etwa 2 Minuten.',
    saveChanges: 'Änderungen Speichern ✓', saving: 'Wird gespeichert…',
    profileTitle: 'Grunddaten', profileDesc: 'Sag Arbeitgebern, wer du bist und was du machst.',
    lblRegion: 'Standort / Region', phRegion: 'z. B. Texas, USA · Ontario, Kanada',
    lblRate: 'Stundensatz (USD)', lblPricing: 'Preismodell',
    optHourly: 'Stündlich', optProject: 'Projektbasiert', optDaily: 'Tagessatz',
    lblBio: 'Berufsprofil',
    phBio: 'z. B. 8+ Jahre Inbetriebnahme von Siemens-S7-Linien für Automotive und Lebensmittel. Fließend Mandarin. Reisebereit in Nordamerika.',
    skillsTitle: 'Fähigkeiten & Expertise', skillsDesc: 'Wähle alles Zutreffende. Arbeitgeber filtern nach Fähigkeiten.',
    phCustomSkill: 'Eigene Fähigkeit hinzufügen…', btnAdd: '+ Hinzufügen',
    availStepTitle: 'Verfügbarkeit', availStepDesc: 'Lass Arbeitgeber wissen, wann du Projekte übernehmen kannst.',
    availNow: 'Jetzt Verfügbar', availNowDesc: 'Sofort startbereit',
    availBusy: 'Beschäftigt — Bald Verfügbar', availBusyDesc: 'Aktuell im Projekt, in einigen Wochen verfügbar',
    availNo: 'Nicht Verfügbar', availNoDesc: 'Nehme derzeit keine neuen Projekte an',
    lblAvailFrom: 'Verfügbar ab (optional)',
    portfolioTitle: 'Portfolio',
    portfolioDesc: 'Füge Fotos deiner Arbeit hinzu — Installationen, Schaltschränke, Schaltpläne. Arbeitgeber vertrauen Ingenieuren mit Nachweisen.',
    phImageUrl: 'Bild-URL (z. B. https://i.imgur.com/abc.jpg)',
    phCaption: 'Beschreibung (z. B. Siemens-S7-Schrank-Inbetriebnahme, Monterrey 2024)',
    addItem: '+ Eintrag Hinzufügen',
    viewPublic: 'Öffentliches Profil ansehen →', browseProjects: 'Projekte Ansehen →',
    toastSaved: 'Profil gespeichert!', toastSaveFailed: 'Profil konnte nicht gespeichert werden.',
    toastPortfolioFailed: 'Profil gespeichert, aber Portfolio fehlgeschlagen.', toastNetwork: 'Netzwerkfehler.',
    toastOfflineQueued: 'Offline gespeichert — wird bei Verbindung automatisch synchronisiert.',
    avatarLabel: 'Profilfoto', uploadImage: '📷 Bild Hochladen', uploading: 'Wird hochgeladen…',
    toastUploaded: 'Hochgeladen!', toastUploadFailed: 'Upload fehlgeschlagen.',
    toastPortfolioMax: 'Maximal 12 Portfolio-Einträge möglich.',
    uploadPhoto: '📷 Foto Hochladen',
    insuranceTitle: 'Versicherung & Compliance',
    insuranceDesc: 'Lade dein Versicherungszertifikat (COI) hoch. Unser Team prüft es, bevor du vor Ort eingesetzt werden kannst.',
    uploadCoi: '📄 COI Hochladen (PDF oder Bild)',
    toastCoiSubmitted: 'Eingereicht. Warte auf Plattform-Prüfung.',
    toastCoiFailed: 'Versicherungszertifikat konnte nicht eingereicht werden.',
    noInsurance: 'Noch kein Versicherungszertifikat hinterlegt.',
    taxTitle: 'Steuerdokumente',
    taxDesc: 'Lade dein ausgefülltes IRS-Formular W-9 (PDF) hoch. Erforderlich vor jeder Auszahlung.',
    uploadW9: '📄 W-9 Hochladen (PDF)',
    w9FormLink: 'Offizielles IRS-W-9-Formular abrufen ↗',
    toastW9Submitted: 'W-9 eingereicht. Warte auf Bestätigung.',
    toastW9Failed: 'W-9 konnte nicht eingereicht werden.',
    noTax: 'Noch kein Steuerdokument eingereicht.',
    stSubmitted: 'Bestätigung ausstehend', stReceived: 'Erhalten', stReturned: 'Zurückgegeben',
    stPending: 'Prüfung ausstehend', stVerified: 'Verifiziert', stRejected: 'Abgelehnt',
  },
  ja: {
    pageTitle: 'マイプロフィール | Talengineer',
    loading: 'プロフィールを読み込み中…',
    myProfileTitle: 'マイプロフィール',
    subEdit: '情報を更新して保存。発注者が公開プロフィールで見る内容です。',
    subNew: 'プロフィールを完成させて発注者に見つけてもらいましょう。約 2 分で完了。',
    saveChanges: '変更を保存 ✓', saving: '保存中…',
    profileTitle: '基本情報', profileDesc: 'あなたが誰で何が得意かを発注者に伝えましょう。',
    lblRegion: '所在地 / 地域', phRegion: '例：Texas, USA · Ontario, Canada',
    lblRate: '時給（米ドル）', lblPricing: '料金モデル',
    optHourly: '時間制', optProject: 'プロジェクト制', optDaily: '日給制',
    lblBio: '職務経歴',
    phBio: '例：自動車・食品業界向け Siemens S7 ラインの試運転 8 年以上。中国語堪能。北米内の出張可。',
    skillsTitle: 'スキル・専門分野', skillsDesc: '該当するものをすべて選択。発注者はスキルで絞り込みます。',
    phCustomSkill: 'カスタムスキルを追加…', btnAdd: '+ 追加',
    availStepTitle: '受注状況', availStepDesc: 'いつプロジェクトを受けられるか発注者に知らせましょう。',
    availNow: '受注可能', availNowDesc: 'すぐに開始できます',
    availBusy: '多忙 — まもなく対応可', availBusyDesc: '現在プロジェクト中、数週間後に対応可能',
    availNo: '受注不可', availNoDesc: '現在新規プロジェクトは受けていません',
    lblAvailFrom: '対応開始日（任意）',
    portfolioTitle: 'ポートフォリオ',
    portfolioDesc: '過去の実績写真を追加 — 据付、制御盤、配線図など。実証のあるエンジニアは信頼されます。',
    phImageUrl: '画像 URL（例：https://i.imgur.com/abc.jpg）',
    phCaption: '説明（例：Siemens S7 制御盤試運転、モンテレイ 2024）',
    addItem: '+ 項目を追加',
    viewPublic: '公開プロフィールを見る →', browseProjects: 'プロジェクトを見る →',
    toastSaved: 'プロフィールを保存しました！', toastSaveFailed: 'プロフィールの保存に失敗しました。',
    toastPortfolioFailed: 'プロフィールは保存されましたが、ポートフォリオの保存に失敗しました。', toastNetwork: 'ネットワークエラー。',
    toastOfflineQueued: 'オフラインで保存しました — 再接続時に自動同期されます。',
    avatarLabel: 'プロフィール写真', uploadImage: '📷 画像をアップロード', uploading: 'アップロード中…',
    toastUploaded: 'アップロード完了！', toastUploadFailed: 'アップロードに失敗しました。',
    toastPortfolioMax: 'ポートフォリオは最大 12 件まで。',
    uploadPhoto: '📷 写真をアップロード',
    insuranceTitle: '保険・コンプライアンス',
    insuranceDesc: '保険証明書（COI）をアップロード。現場作業のアサイン前に運営チームが確認します。',
    uploadCoi: '📄 COI をアップロード（PDF または画像）',
    toastCoiSubmitted: '提出しました。プラットフォームの確認待ちです。',
    toastCoiFailed: '保険証明書の提出に失敗しました。',
    noInsurance: '保険証明書はまだ登録されていません。',
    taxTitle: '税務書類',
    taxDesc: '記入済みの IRS W-9 フォーム（PDF）をアップロード。支払い処理の前に必須です。',
    uploadW9: '📄 W-9 をアップロード（PDF）',
    w9FormLink: '公式 IRS W-9 フォームを入手 ↗',
    toastW9Submitted: 'W-9 を提出しました。確認待ちです。',
    toastW9Failed: 'W-9 の提出に失敗しました。',
    noTax: '税務書類はまだ提出されていません。',
    stSubmitted: '確認待ち', stReceived: '受領済み', stReturned: '差し戻し',
    stPending: '確認待ち', stVerified: '確認済み', stRejected: '却下',
  },
  ko: {
    pageTitle: '내 프로필 | Talengineer',
    loading: '프로필을 불러오는 중…',
    myProfileTitle: '내 프로필',
    subEdit: '정보를 업데이트하고 저장하세요. 고용주가 공개 프로필에서 보는 내용입니다.',
    subNew: '프로필을 완성하면 고용주가 당신을 찾을 수 있습니다. 약 2분 소요.',
    saveChanges: '변경 사항 저장 ✓', saving: '저장 중…',
    profileTitle: '기본 정보', profileDesc: '고용주에게 당신이 누구이며 무엇을 하는지 알려주세요.',
    lblRegion: '위치 / 지역', phRegion: '예: Texas, USA · Ontario, Canada',
    lblRate: '시급 (USD)', lblPricing: '요금 모델',
    optHourly: '시간제', optProject: '프로젝트제', optDaily: '일당제',
    lblBio: '경력 소개',
    phBio: '예: 자동차·식음료 업계 Siemens S7 라인 시운전 8년 이상. 중국어 능통. 북미 출장 가능.',
    skillsTitle: '기술 및 전문 분야', skillsDesc: '해당하는 항목을 모두 선택하세요. 고용주는 기술로 필터링합니다.',
    phCustomSkill: '사용자 지정 기술 추가…', btnAdd: '+ 추가',
    availStepTitle: '수주 가능 여부', availStepDesc: '언제 프로젝트를 맡을 수 있는지 고용주에게 알리세요.',
    availNow: '즉시 가능', availNowDesc: '바로 시작할 수 있습니다',
    availBusy: '바쁨 — 곧 가능', availBusyDesc: '현재 프로젝트 진행 중, 몇 주 후 가능',
    availNo: '수주 불가', availNoDesc: '현재 새 프로젝트를 받지 않습니다',
    lblAvailFrom: '시작 가능일 (선택)',
    portfolioTitle: '포트폴리오',
    portfolioDesc: '과거 작업 사진을 추가하세요 — 설치, 패널, 배선도. 증거가 있는 엔지니어가 신뢰받습니다.',
    phImageUrl: '이미지 URL (예: https://i.imgur.com/abc.jpg)',
    phCaption: '설명 (예: Siemens S7 패널 시운전, 몬테레이 2024)',
    addItem: '+ 항목 추가',
    viewPublic: '공개 프로필 보기 →', browseProjects: '프로젝트 보기 →',
    toastSaved: '프로필이 저장되었습니다!', toastSaveFailed: '프로필 저장에 실패했습니다.',
    toastPortfolioFailed: '프로필은 저장되었지만 포트폴리오 저장에 실패했습니다.', toastNetwork: '네트워크 오류.',
    toastOfflineQueued: '오프라인으로 저장됨 — 재연결 시 자동 동기화됩니다.',
    avatarLabel: '프로필 사진', uploadImage: '📷 이미지 업로드', uploading: '업로드 중…',
    toastUploaded: '업로드 완료!', toastUploadFailed: '업로드 실패.',
    toastPortfolioMax: '포트폴리오는 최대 12개까지 추가할 수 있습니다.',
    uploadPhoto: '📷 사진 업로드',
    insuranceTitle: '보험 및 컴플라이언스',
    insuranceDesc: '보험 증명서(COI)를 업로드하세요. 현장 작업 배정 전에 팀에서 검증합니다.',
    uploadCoi: '📄 COI 업로드 (PDF 또는 이미지)',
    toastCoiSubmitted: '제출 완료. 플랫폼 검증 대기 중.',
    toastCoiFailed: '보험 증명서 제출에 실패했습니다.',
    noInsurance: '등록된 보험 증명서가 아직 없습니다.',
    taxTitle: '세무 서류',
    taxDesc: '작성 완료된 IRS W-9 양식(PDF)을 업로드하세요. 지급 처리 전 필수입니다.',
    uploadW9: '📄 W-9 업로드 (PDF)',
    w9FormLink: '공식 IRS W-9 양식 받기 ↗',
    toastW9Submitted: 'W-9 제출 완료. 확인 대기 중.',
    toastW9Failed: 'W-9 제출에 실패했습니다.',
    noTax: '제출된 세무 서류가 아직 없습니다.',
    stSubmitted: '확인 대기', stReceived: '수령 완료', stReturned: '반송됨',
    stPending: '검증 대기', stVerified: '검증 완료', stRejected: '반려됨',
  },
};

// 从存储的费率文本里取出数字（"$95/hr" → "95"，"Open" → ""）
function parseRate(raw) {
  const m = String(raw || '').match(/\d+(\.\d+)?/);
  return m ? m[0] : '';
}

export default function MyProfile() {
  const router = useRouter();
  const toast = useToast();
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en; // 语言词条：跟随全站切换，缺失语言回退英文

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);   // 拉取本人档案中
  const [hasProfile, setHasProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [talentId, setTalentId] = useState(null);  // 用于"查看公开档案"链接

  // Form state
  const [bio, setBio]           = useState('');
  const [region, setRegion]     = useState('');
  const [rate, setRate]         = useState('');
  const [pricingModel, setPricingModel] = useState('hourly');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availability, setAvailability] = useState('available');
  const [availableFrom, setAvailableFrom] = useState('');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioUrl, setPortfolioUrl]     = useState('');
  const [portfolioCaption, setPortfolioCaption] = useState('');

  // 头像 + 上传相关状态（新增）
  const [avatarUrl, setAvatarUrl]           = useState('');
  const [avatarUploading, setAvatarUploading]       = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [coiUploading, setCoiUploading]     = useState(false);
  const [w9Uploading, setW9Uploading]       = useState(false);
  const [insuranceCerts, setInsuranceCerts] = useState([]);  // 已提交的保险证书
  const [taxDocs, setTaxDocs]               = useState([]);   // 已提交的税务文件

  // 隐藏 file input 的引用：点按钮触发对应的选择文件对话框
  const avatarInputRef    = useRef(null);
  const portfolioInputRef = useRef(null);
  const coiInputRef       = useRef(null);
  const w9InputRef        = useRef(null);

  // 挂载：校验登录 → 拉取本人档案回填（关键修复：以前从不加载，导致每次都空表单从头填）
  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) { router.push('/finance'); return; }
    let user;
    try { user = JSON.parse(stored); } catch { router.push('/finance'); return; }
    // engineer 与 admin 均可进入：超级账户需要能访问所有页面（admin 无档案时保存会自愈创建 talent 行）。
    // 此前非 engineer 一律静默弹回 /finance，导致 admin 从控制台点"Profile Editor"看似链接错误。
    if (!user || (user.role !== 'engineer' && user.role !== 'admin')) { router.push('/finance'); return; }
    setCurrentUser(user);

    (async () => {
      try {
        const res = await fetch('/api/talent/me', { headers: { Authorization: `Bearer ${user.token}` } });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            setHasProfile(true);
            setTalentId(data.id || null);
            setRegion(data.region || '');
            setRate(parseRate(data.rate));
            setPricingModel(data.pricing_model || 'hourly');
            setBio(data.bio || '');
            setSelectedSkills((data.skills || '').split(',').map(s => s.trim()).filter(Boolean));
            setAvailability(data.availability || 'available');
            setAvailableFrom(data.available_from ? String(data.available_from).slice(0, 10) : '');
            setPortfolioItems(Array.isArray(data.portfolio_images) ? data.portfolio_images : []);
            setAvatarUrl(data.avatar_url || '');
            // 有档案才拉保险证书（certifications 按 talent_id 查，且 GET 无需鉴权）
            if (data.id) loadInsurance(data.id);
          }
        }
      } catch { /* 网络异常时显示空表单，用户仍可填写保存 */ }
      // 税务文件按登录用户查，不依赖是否已有档案
      loadTax(user.token);
      setLoading(false);
    })();
  }, []);

  // 拉取本人已提交的保险证书（只保留保险类，用于展示核验状态）
  async function loadInsurance(tid = talentId) {
    if (!tid) return;
    try {
      const res = await fetch(`/api/certifications/${tid}`);
      if (res.ok) {
        const { data } = await res.json();
        setInsuranceCerts((data || []).filter(
          c => c.cert_type === 'insurance' || c.cert_name === 'General Liability Insurance (COI)'
        ));
      }
    } catch { /* 拉取失败静默：不阻塞主表单 */ }
  }

  // 拉取本人已提交的税务文件（W-9 等）
  async function loadTax(token = currentUser?.token) {
    if (!token) return;
    try {
      const res = await fetch('/api/tax/my', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const { data } = await res.json(); setTaxDocs(data || []); }
    } catch { /* 拉取失败静默 */ }
  }

  // 通用上传：把文件 POST 到 /api/uploads，bucket='public' 回 {url,path}，bucket='tax' 回 {path}
  // 注意：FormData 不要手动设 Content-Type，浏览器会自动带上正确的 multipart 边界
  async function uploadFile(file, bucket = 'public') {
    const form = new FormData();
    form.append('file', file);
    const endpoint = bucket === 'tax' ? '/api/uploads?bucket=tax' : '/api/uploads';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentUser.token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || d.toastUploadFailed);
    return data;
  }

  // 头像上传：成功后回填 avatar_url 字段并预览（保存档案时随 payload 一起提交）
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { url } = await uploadFile(file, 'public');
      setAvatarUrl(url);
      toast.success(d.toastUploaded);
    } catch (err) { toast.error(err.message || d.toastUploadFailed); }
    setAvatarUploading(false);
    e.target.value = ''; // 重置，允许再次选择同一文件
  }

  // 作品集上传：成功后把返回 url 追加进 portfolioItems（上限 12）
  async function handlePortfolioUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (portfolioItems.length >= 12) { toast.warn(d.toastPortfolioMax); e.target.value = ''; return; }
    setPortfolioUploading(true);
    try {
      const { url } = await uploadFile(file, 'public');
      setPortfolioItems(prev => [...prev, { url, caption: '' }]);
      toast.success(d.toastUploaded);
    } catch (err) { toast.error(err.message || d.toastUploadFailed); }
    setPortfolioUploading(false);
    e.target.value = '';
  }

  // COI 保险凭证上传：上传到公开桶 → 以证书形式提交（复用 /api/certifications）→ 刷新状态
  async function handleCoiUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoiUploading(true);
    try {
      const { url } = await uploadFile(file, 'public');
      const res = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({
          cert_name: 'General Liability Insurance (COI)',
          cert_type: 'insurance',
          file_url: url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || d.toastCoiFailed);
      toast.success(d.toastCoiSubmitted);
      loadInsurance();
    } catch (err) { toast.error(err.message || d.toastCoiFailed); }
    setCoiUploading(false);
    e.target.value = '';
  }

  // W-9 上传：上传到私有桶 tax-docs（只回 path）→ 登记到 /api/tax/w9 → 刷新状态徽标
  async function handleW9Upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setW9Uploading(true);
    try {
      const { path } = await uploadFile(file, 'tax');
      const res = await fetch('/api/tax/w9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ storage_path: path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || d.toastW9Failed);
      toast.success(d.toastW9Submitted);
      loadTax();
    } catch (err) { toast.error(err.message || d.toastW9Failed); }
    setW9Uploading(false);
    e.target.value = '';
  }

  // 税务文件状态 → 徽标文案 + 颜色
  function taxStatusBadge(status) {
    const map = {
      submitted: { label: d.stSubmitted, color: '#f59e0b' },
      received:  { label: d.stReceived,  color: '#16a34a' },
      rejected:  { label: d.stReturned,  color: '#dc2626' },
    };
    return map[status] || { label: status, color: '#6b7280' };
  }

  // 证书状态 → 徽标文案 + 颜色（certifications 用 pending|verified|rejected）
  function certStatusBadge(status) {
    const map = {
      pending:  { label: d.stPending,  color: '#f59e0b' },
      verified: { label: d.stVerified, color: '#16a34a' },
      rejected: { label: d.stRejected, color: '#dc2626' },
    };
    return map[status] || { label: status, color: '#6b7280' };
  }

  function toggleSkill(skill) {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }

  function addCustomSkill() {
    const s = customSkill.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s]);
      setCustomSkill('');
    }
  }

  function addPortfolioItem() {
    const url = portfolioUrl.trim();
    if (!url) return;
    setPortfolioItems(prev => [...prev, { url, caption: portfolioCaption.trim() }]);
    setPortfolioUrl('');
    setPortfolioCaption('');
  }

  // 一键保存：先存档案（首次会自动建行），再存作品集
  async function saveAll() {
    if (!currentUser?.token) return;

    // 档案提交 payload（离线入队与在线提交共用同一份，避免重复构造）
    const payload = {
      bio,
      region,
      rate: rate ? `$${rate}/hr` : undefined,
      pricing_model: pricingModel,
      skills: selectedSkills.join(', '),
      availability,
      available_from: availableFrom || null,
      avatar_url: avatarUrl || undefined,
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    // 离线：把「档案保存」的两步写请求原样入队（都 type:'profile-edit'），回网后 outbox
    // 按 createdAt 升序重放——先 profile（首次会自动建 talents 行）、后 portfolio 覆盖，
    // 依赖顺序天然满足，避免只同步档案却静默丢作品集的「误导性半保存」。
    // 与在线 saveAll 一致：portfolio 无条件 PUT（现有代码本就无脏检查，这里不新造脏检查）。
    // 头像/COI/W9 等上传中间步骤不动（都需实时存储往返）。request.body 传对象（不 stringify）：
    // outbox 重放时会自行 stringify 并刷新为当下 token。
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      await enqueue({
        type: 'profile-edit',
        request: {
          url: '/api/talent/profile',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: payload,
        },
      });
      await enqueue({
        type: 'profile-edit',
        request: {
          url: '/api/talent/portfolio',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: { portfolio_images: portfolioItems },
        },
      });
      toast.success(d.toastOfflineQueued);
      return; // 在线行为完全不变；离线到此为止，不触发真实网络请求
    }

    setSaving(true);
    try {
      const res = await fetch('/api/talent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || d.toastSaveFailed);
        setSaving(false);
        return;
      }
      // 档案存好后，talents 行必定存在，再存作品集（PUT 覆盖，允许清空/增删）
      setHasProfile(true);
      if (data.data?.id) setTalentId(data.data.id);
      try {
        const pRes = await fetch('/api/talent/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
          body: JSON.stringify({ portfolio_images: portfolioItems }),
        });
        if (!pRes.ok) { toast.error(d.toastPortfolioFailed); setSaving(false); return; }
      } catch { toast.error(d.toastPortfolioFailed); setSaving(false); return; }

      toast.success(d.toastSaved);
    } catch { toast.error(d.toastNetwork); }
    setSaving(false);
  }

  if (!currentUser) return null;

  // 分节标题：单页排版下，除第一节外都带上分隔线
  const sectionHeadStyle = { marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--border)' };

  return (
    <>
      <Head>
        <title>{d.pageTitle}</title>
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.layout} style={{ alignItems: 'flex-start' }}>
        <div className={styles.card} style={{ maxWidth: 640 }}>
          <div className={styles.stepContent}>
            {loading ? (
              <p className={styles.stepDesc} style={{ margin: '24px 0' }}>{d.loading}</p>
            ) : (
              <>
                <h1>{d.myProfileTitle}</h1>
                <p className={styles.stepDesc}>{hasProfile ? d.subEdit : d.subNew}</p>

                {/* ── Basics ── */}
                <h2>{d.profileTitle}</h2>

                {/* 头像：URL 输入 + 上传按钮（隐藏 file input），有值则预览 */}
                <div className={styles.formGroup}>
                  <label>{d.avatarLabel}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', background: 'var(--surface-2)', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                      : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0 }} />}
                    <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder={d.phImageUrl} className={styles.input} style={{ flex: 1 }} />
                    <button type="button" className={styles.btnAdd} disabled={avatarUploading} onClick={() => avatarInputRef.current?.click()}>
                      {avatarUploading ? d.uploading : d.uploadImage}
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{d.lblRegion}</label>
                  <input value={region} onChange={e => setRegion(e.target.value)} placeholder={d.phRegion} className={styles.input} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{d.lblRate}</label>
                    <div className={styles.rateInput}>
                      <span>$</span>
                      <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="95" min="20" max="500" className={styles.input} />
                      <span>/hr</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{d.lblPricing}</label>
                    <select value={pricingModel} onChange={e => setPricingModel(e.target.value)} className={styles.select}>
                      <option value="hourly">{d.optHourly}</option>
                      <option value="project">{d.optProject}</option>
                      <option value="daily">{d.optDaily}</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>{d.lblBio}</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={d.phBio} className={styles.textarea} rows={4} maxLength={500} />
                  <div className={styles.charCount}>{bio.length}/500</div>
                </div>

                {/* ── Skills ── */}
                <h2 style={sectionHeadStyle}>{d.skillsTitle}</h2>
                <p className={styles.stepDesc}>{d.skillsDesc}</p>
                <div className={styles.skillGrid}>
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`${styles.skillBtn} ${selectedSkills.includes(skill) ? styles.skillBtnActive : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {selectedSkills.includes(skill) && '✓ '}{skill}
                    </button>
                  ))}
                </div>
                <div className={styles.customSkillRow}>
                  <input
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    placeholder={d.phCustomSkill}
                    className={styles.input}
                  />
                  <button type="button" onClick={addCustomSkill} className={styles.btnAdd}>{d.btnAdd}</button>
                </div>
                {selectedSkills.length > 0 && (
                  <div className={styles.selectedSkills}>
                    {selectedSkills.map(s => (
                      <span key={s} className={styles.selectedChip}>
                        {s} <button onClick={() => toggleSkill(s)}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Availability ── */}
                <h2 style={sectionHeadStyle}>{d.availStepTitle}</h2>
                <p className={styles.stepDesc}>{d.availStepDesc}</p>
                <div className={styles.availOptions}>
                  {[
                    ['available',   '🟢', d.availNow,  d.availNowDesc],
                    ['busy',        '🟡', d.availBusy, d.availBusyDesc],
                    ['unavailable', '🔴', d.availNo,   d.availNoDesc],
                  ].map(([val, icon, title, desc]) => (
                    <div
                      key={val}
                      className={`${styles.availCard} ${availability === val ? styles.availCardActive : ''}`}
                      onClick={() => setAvailability(val)}
                    >
                      <div style={{ fontSize: 24 }}>{icon}</div>
                      <div>
                        <div className={styles.availTitle}>{title}</div>
                        <div className={styles.availDesc}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {availability === 'busy' && (
                  <div className={styles.formGroup} style={{ marginTop: 16 }}>
                    <label>{d.lblAvailFrom}</label>
                    <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className={styles.input} />
                  </div>
                )}

                {/* ── Portfolio ── */}
                <h2 style={sectionHeadStyle}>{d.portfolioTitle}</h2>
                <p className={styles.stepDesc}>{d.portfolioDesc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <input className={styles.input} value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder={d.phImageUrl} />
                  <input className={styles.input} value={portfolioCaption} onChange={e => setPortfolioCaption(e.target.value)} placeholder={d.phCaption} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className={styles.btnAdd} style={{ flex: 1 }} onClick={addPortfolioItem}>{d.addItem}</button>
                    <button type="button" className={styles.btnAdd} style={{ flex: 1 }} disabled={portfolioUploading} onClick={() => portfolioInputRef.current?.click()}>
                      {portfolioUploading ? d.uploading : d.uploadImage}
                    </button>
                    <input ref={portfolioInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePortfolioUpload} />
                  </div>
                </div>
                {portfolioItems.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 8 }}>
                    {portfolioItems.map((item, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)', aspectRatio: '1' }}>
                        <img src={item.url} alt={item.caption || `Portfolio ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                        {item.caption && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 10, padding: '3px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption}</div>}
                        <button
                          onClick={() => setPortfolioItems(prev => prev.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Insurance & Compliance (COI) ── */}
                <h2 style={sectionHeadStyle}>{d.insuranceTitle}</h2>
                <p className={styles.stepDesc}>{d.insuranceDesc}</p>
                <button type="button" className={styles.btnAdd} disabled={coiUploading} onClick={() => coiInputRef.current?.click()}>
                  {coiUploading ? d.uploading : d.uploadCoi}
                </button>
                <input ref={coiInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleCoiUpload} />
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {insuranceCerts.length === 0
                    ? <p className={styles.stepDesc} style={{ margin: 0 }}>{d.noInsurance}</p>
                    : insuranceCerts.map(c => {
                        const b = certStatusBadge(c.status);
                        return (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8 }}>
                            <span style={{ flex: 1, fontSize: 14 }}>{c.cert_name}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: b.color, padding: '2px 8px', borderRadius: 999 }}>{b.label}</span>
                            {c.status === 'rejected' && c.admin_notes && <span style={{ fontSize: 12, color: 'var(--text-muted, #6b7280)' }}>{c.admin_notes}</span>}
                          </div>
                        );
                      })}
                </div>

                {/* ── Tax Documents (W-9) ── */}
                <h2 style={sectionHeadStyle}>{d.taxTitle}</h2>
                <p className={styles.stepDesc}>{d.taxDesc}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className={styles.btnAdd} disabled={w9Uploading} onClick={() => w9InputRef.current?.click()}>
                    {w9Uploading ? d.uploading : d.uploadW9}
                  </button>
                  <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary} style={{ fontSize: 13 }}>
                    {d.w9FormLink}
                  </a>
                  <input ref={w9InputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleW9Upload} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {taxDocs.length === 0
                    ? <p className={styles.stepDesc} style={{ margin: 0 }}>{d.noTax}</p>
                    : taxDocs.map(t => {
                        const b = taxStatusBadge(t.status);
                        return (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8 }}>
                            <span style={{ flex: 1, fontSize: 14 }}>{(t.doc_type || 'w9').toUpperCase()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: b.color, padding: '2px 8px', borderRadius: 999 }}>{b.label}</span>
                            {t.status === 'rejected' && t.note && <span style={{ fontSize: 12, color: 'var(--text-muted, #6b7280)' }}>{t.note}</span>}
                          </div>
                        );
                      })}
                </div>

                {/* ── Save ── */}
                <div className={styles.btnRow}>
                  <button className={styles.btnNext} onClick={saveAll} disabled={saving}>
                    {saving ? d.saving : d.saveChanges}
                  </button>
                </div>
                <div className={styles.doneActions} style={{ marginTop: 12 }}>
                  {talentId && <a href={`/engineer/${talentId}`} className={styles.btnSecondary}>{d.viewPublic}</a>}
                  <a href="/talent" className={styles.btnSecondary}>{d.browseProjects}</a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
