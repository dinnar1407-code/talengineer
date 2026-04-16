import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { useToast } from '../components/Toast';
import { useLang } from '../hooks/useLang';
import styles from './talent.module.css';

const PAGE_SIZE = 12;

const DICT = {
  en: {
    hubTitle: 'Global Industrial Automation Hub',
    hubSub: 'AI-driven marketplace connecting equipment manufacturers worldwide with AI-verified local engineers across North America, Vietnam, India, Europe, and beyond.',
    tabProjects: 'Browse Projects (For Engineers)', tabTalent: 'Browse Engineers (For Employers)',
    formTitleProjects: 'Post a Project',
    lblDescribe: 'Describe your project (any language)',
    parseBtn: '✨ AI: Parse & Standardize',
    formTitleTalent: 'Create Engineer Profile',
    submitJobBtn: 'Confirm & Post Project', submitProfileBtn: 'Publish Profile',
  },
  zh: {
    hubTitle: '全球工业自动化服务大厅',
    hubSub: 'AI 驱动的全球撮合平台，连接出海设备企业与北美、越南、印度、欧洲等地经 AI 认证的本地工程师。',
    tabProjects: '浏览项目 (我是工程师)', tabTalent: '寻找工程师 (我是发包方)',
    formTitleProjects: '发布项目',
    lblDescribe: '用任意语言描述您的项目需求',
    parseBtn: '✨ AI 魔法：自动解析并生成标书',
    formTitleTalent: '创建工程师档案',
    submitJobBtn: '确认发布项目', submitProfileBtn: '发布档案 (接受 AI 审核)',
  },
  es: {
    hubTitle: 'Centro Global de Automatización Industrial',
    hubSub: 'Mercado impulsado por IA que conecta fabricantes de equipos con ingenieros locales verificados en todo el mundo.',
    tabProjects: 'Ver Proyectos (Para Ingenieros)', tabTalent: 'Ver Ingenieros (Para Empleadores)',
    formTitleProjects: 'Publicar un Proyecto',
    lblDescribe: 'Describe tu proyecto (cualquier idioma)',
    parseBtn: '✨ IA: Analizar y Estandarizar',
    formTitleTalent: 'Crear Perfil de Ingeniero',
    submitJobBtn: 'Confirmar y Publicar', submitProfileBtn: 'Publicar Perfil',
  },
  vi: {
    hubTitle: 'Trung tâm Tự động hóa Công nghiệp Toàn cầu',
    hubSub: 'Thị trường AI kết nối nhà sản xuất thiết bị với kỹ sư địa phương được xác minh tại Việt Nam, Ấn Độ, Bắc Mỹ và toàn cầu.',
    tabProjects: 'Xem Dự Án (Cho Kỹ Sư)', tabTalent: 'Tìm Kỹ Sư (Cho Nhà Tuyển Dụng)',
    formTitleProjects: 'Đăng Dự Án',
    lblDescribe: 'Mô tả dự án của bạn (bất kỳ ngôn ngữ nào)',
    parseBtn: '✨ AI: Phân tích & Chuẩn hóa',
    formTitleTalent: 'Tạo Hồ Sơ Kỹ Sư',
    submitJobBtn: 'Xác nhận & Đăng', submitProfileBtn: 'Xuất bản Hồ Sơ',
  },
  hi: {
    hubTitle: 'वैश्विक औद्योगिक स्वचालन केंद्र',
    hubSub: 'AI-संचालित बाज़ार जो उपकरण निर्माताओं को भारत, वियतनाम, उत्तरी अमेरिका और दुनिया भर के AI-सत्यापित इंजीनियरों से जोड़ता है।',
    tabProjects: 'प्रोजेक्ट देखें (इंजीनियरों के लिए)', tabTalent: 'इंजीनियर खोजें (नियोक्ताओं के लिए)',
    formTitleProjects: 'प्रोजेक्ट पोस्ट करें',
    lblDescribe: 'अपने प्रोजेक्ट का वर्णन करें (किसी भी भाषा में)',
    parseBtn: '✨ AI: विश्लेषण और मानकीकरण',
    formTitleTalent: 'इंजीनियर प्रोफ़ाइल बनाएं',
    submitJobBtn: 'पुष्टि करें और पोस्ट करें', submitProfileBtn: 'प्रोफ़ाइल प्रकाशित करें',
  },
  fr: {
    hubTitle: 'Hub Mondial d\'Automatisation Industrielle',
    hubSub: 'Marketplace IA reliant fabricants d\'équipements et ingénieurs locaux vérifiés partout dans le monde — Amérique du Nord, Vietnam, Inde, Europe.',
    tabProjects: 'Voir les Projets (Ingénieurs)', tabTalent: 'Trouver des Ingénieurs (Employeurs)',
    formTitleProjects: 'Publier un Projet',
    lblDescribe: 'Décrivez votre projet (n\'importe quelle langue)',
    parseBtn: '✨ IA : Analyser & Standardiser',
    formTitleTalent: 'Créer un Profil Ingénieur',
    submitJobBtn: 'Confirmer et Publier', submitProfileBtn: 'Publier le Profil',
  },
  de: {
    hubTitle: 'Globaler Marktplatz für Industrieautomation',
    hubSub: 'KI-gestützter Marktplatz verbindet Anlagenhersteller weltweit mit verifizierten lokalen Ingenieuren in Nordamerika, Vietnam, Indien und Europa.',
    tabProjects: 'Projekte ansehen (Ingenieure)', tabTalent: 'Ingenieure finden (Arbeitgeber)',
    formTitleProjects: 'Projekt veröffentlichen',
    lblDescribe: 'Beschreiben Sie Ihr Projekt (beliebige Sprache)',
    parseBtn: '✨ KI: Analysieren & Standardisieren',
    formTitleTalent: 'Ingenieurprofil erstellen',
    submitJobBtn: 'Bestätigen & Veröffentlichen', submitProfileBtn: 'Profil veröffentlichen',
  },
  ja: {
    hubTitle: 'グローバル産業オートメーション・プラットフォーム',
    hubSub: 'AIが世界中の設備メーカーと、北米・ベトナム・インド・欧州のAI検証済みエンジニアをつなぐマーケットプレイス。',
    tabProjects: 'プロジェクト一覧（エンジニア向け）', tabTalent: 'エンジニアを探す（発注者向け）',
    formTitleProjects: 'プロジェクトを投稿',
    lblDescribe: 'プロジェクトの概要を説明してください（任意の言語可）',
    parseBtn: '✨ AI：解析・標準化',
    formTitleTalent: 'エンジニアプロフィール作成',
    submitJobBtn: '確認して投稿', submitProfileBtn: 'プロフィールを公開',
  },
  ko: {
    hubTitle: '글로벌 산업 자동화 허브',
    hubSub: 'AI 기반 마켓플레이스로 전 세계 설비 제조사와 북미, 베트남, 인도, 유럽의 AI 인증 엔지니어를 연결합니다.',
    tabProjects: '프로젝트 탐색 (엔지니어용)', tabTalent: '엔지니어 찾기 (고용주용)',
    formTitleProjects: '프로젝트 게시',
    lblDescribe: '프로젝트를 설명해주세요 (어떤 언어든 가능)',
    parseBtn: '✨ AI: 분석 및 표준화',
    formTitleTalent: '엔지니어 프로필 생성',
    submitJobBtn: '확인 및 게시', submitProfileBtn: '프로필 공개',
  },
};

export default function Talent() {
  const toast = useToast();
  const [lang, setLang]        = useLang();
  const [activeTab, setActiveTab] = useState('projects');
  const [demands, setDemands]  = useState(null); // null = loading
  const [talents, setTalents]  = useState(null); // null = loading

  // Current user (for Apply button)
  const [currentUser, setCurrentUser] = useState(null);

  // Talent filters
  const [filterRegion,       setFilterRegion]       = useState('all');
  const [filterSkills,       setFilterSkills]       = useState('');
  const [filterScore,        setFilterScore]        = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterSort,         setFilterSort]         = useState('score');

  // Pagination
  const [talentPage, setTalentPage]  = useState(0);
  const [talentTotal, setTalentTotal] = useState(0);

  // Apply modal
  const [applyDemand, setApplyDemand] = useState(null); // demand object
  const [applyMsg, setApplyMsg]       = useState('');
  const [applying, setApplying]       = useState(false);
  const [applyQuotedRate, setApplyQuotedRate]   = useState('');
  const [applyQuotedDays, setApplyQuotedDays]   = useState('');
  const [applyQuoteAmount, setApplyQuoteAmount] = useState('');

  // Post project form
  const [rawText, setRawText]   = useState('');
  const [parsed, setParsed]     = useState(null);
  const [parsedMilestones, setParsedMilestones] = useState([]);
  const [projectForm, setProjectForm] = useState({ title: '', type: 'Cross-Border Equipment Deployment', role: '', region: 'United States (US)', pref: 'No Preference', location: '', budget: '', contact: '', description: '' });
  const [postingJob, setPostingJob] = useState(false);
  const [parsing, setParsing]   = useState(false);

  // Engineer profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', skills: '', region: 'Mexico (MX)', rate: '', level: 'Mid-Level (3-7 yrs)', bio: '' });
  const [postingProfile, setPostingProfile] = useState(false);

  useEffect(() => {
    loadDemands();
    const stored = localStorage.getItem('tal_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        // Pre-fill contact email and auto-switch to employer tab
        if (user.email) {
          setProjectForm(f => ({ ...f, contact: f.contact || user.email }));
        }
        if (user.role === 'employer') {
          setActiveTab('projects'); // employers land on Browse Projects (post/manage side)
        }
      } catch {}
    }
  }, []);

  async function loadDemands() {
    try {
      const res = await fetch('/api/talent/demands');
      const data = await res.json();
      setDemands(data.data || []);
    } catch { setDemands([]); }
  }

  async function loadTalent(region = filterRegion, skills = filterSkills, score = filterScore, page = 0, avail = filterAvailability, verified = filterVerifiedOnly, sort = filterSort) {
    setTalents(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort });
      if (region && region !== 'all') params.set('region', region);
      if (skills.trim()) params.set('skills', skills.trim());
      if (score) params.set('min_score', score);
      if (avail && avail !== 'all') params.set('availability', avail);
      if (verified) params.set('verified_only', 'true');
      const res  = await fetch('/api/talent/list?' + params.toString());
      const data = await res.json();
      setTalents(data.data || []);
      setTalentTotal(data.total || 0);
      setTalentPage(page);
    } catch { setTalents([]); toast.error('Failed to load engineers.'); }
  }

  async function submitApply(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error('Please sign in on the Dashboard first.'); return; }
    setApplying(true);
    try {
      const res  = await fetch('/api/demand/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ demand_id: applyDemand.id, message: applyMsg, quoted_rate: applyQuotedRate || undefined, quoted_days: applyQuotedDays ? parseInt(applyQuotedDays) : undefined, quote_amount: applyQuoteAmount ? parseFloat(applyQuoteAmount) : undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Application submitted! The employer will be notified.');
        setApplyDemand(null);
        setApplyMsg('');
        setApplyQuotedRate('');
        setApplyQuotedDays('');
        setApplyQuoteAmount('');
      } else toast.error(data.error);
    } catch { toast.error('Network error.'); }
    setApplying(false);
  }

  function applyFilters(e) {
    e.preventDefault();
    loadTalent(filterRegion, filterSkills, filterScore, 0, filterAvailability, filterVerifiedOnly, filterSort);
  }

  function switchTab(tab) {
    setActiveTab(tab);
    if (tab === 'projects' && demands === null) loadDemands();
    if (tab === 'talent' && talents === null) loadTalent();
  }

  async function parseDemand(e) {
    e.preventDefault();
    if (!rawText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch('/api/demand/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText }),
      });
      const result = await res.json();
      if (result.status === 'ok') {
        const d = result.data;
        setParsed(d);
        setParsedMilestones(d.milestones || []);
        setProjectForm(f => ({ ...f, title: d.title || '', role: d.role_required || '', description: d.standardized_description || '' }));
        toast.success('AI parsed your project! Please review and confirm.');
      } else {
        toast.error('Failed to parse: ' + (result.error || 'Unknown error'));
      }
    } catch { toast.error('Network error. Please try again.'); }
    setParsing(false);
  }

  async function submitProject(e) {
    e.preventDefault();
    if (!currentUser?.token) { toast.error('Please sign in on the Dashboard first.'); return; }
    setPostingJob(true);
    try {
      const res = await fetch('/api/demand/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({
          title: projectForm.title, role_required: projectForm.role,
          region: projectForm.region, project_type: projectForm.type,
          location: projectForm.location, budget: projectForm.budget,
          contact: projectForm.contact, description: projectForm.description,
          milestones: parsedMilestones,
        }),
      });
      if (res.ok) {
        toast.success('Project posted! The AI Matchmaker is scanning for engineers.');
        setParsed(null); setRawText('');
        setProjectForm({ title: '', type: 'Cross-Border Equipment Deployment', role: '', region: 'United States (US)', pref: 'No Preference', location: '', budget: '', contact: '', description: '' });
        loadDemands();
      } else {
        const err = await res.json();
        toast.error('Error: ' + err.error);
      }
    } catch { toast.error('Network error. Please try again.'); }
    setPostingJob(false);
  }

  async function submitProfile(e) {
    e.preventDefault();
    setPostingProfile(true);
    try {
      // Step 1: AI tech screen question
      const qRes = await fetch('/api/talent/screen_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: profileForm.skills, level: profileForm.level, lang }),
      });
      const qData = await qRes.json();
      if (qData.status !== 'ok') {
        toast.error('AI Technical Screen could not be initialized. Verification is required.');
        setPostingProfile(false); return;
      }

      const answer = prompt(`🤖 Nexus AI Technical Screen (Required):\n\n${qData.question}\n\nYour Answer:`);
      if (!answer) {
        toast.warn('Submission cancelled. Tech screen is mandatory.');
        setPostingProfile(false); return;
      }

      const vRes  = await fetch('/api/talent/screen_verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: qData.question, answer, lang }) });
      const vData = await vRes.json();
      if (vData.score < 60) {
        toast.error(`Tech Screen Failed (Score: ${vData.score}). ${vData.feedback}`);
        setPostingProfile(false); return;
      }
      toast.success(`Tech Screen Passed! Score: ${vData.score} — ${vData.feedback}`);

      const res    = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...profileForm, role: 'engineer', verified_score: vData.score, engName: profileForm.name, engSkills: profileForm.skills, engRegion: profileForm.region, engRate: profileForm.rate, engLevel: profileForm.level, engBio: profileForm.bio }) });
      const result = await res.json();
      if (res.ok) {
        toast.success('Profile published! Nexus Verified score added.');
        setProfileForm({ name: '', email: '', password: '', skills: '', region: 'Mexico (MX)', rate: '', level: 'Mid-Level (3-7 yrs)', bio: '' });
        loadTalent();
      } else {
        toast.error('Error: ' + result.error);
      }
    } catch { toast.error('Network error. Please try again.'); }
    setPostingProfile(false);
  }

  const d = DICT[lang];

  return (
    <>
      <Head><title>Talent & Projects | Talengineer</title></Head>
      <ChatBot lang={lang} />

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.container}>
        <div className={styles.headerBlock}>
          <h1>{d.hubTitle}</h1>
          <p>{d.hubSub}</p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'projects' ? styles.active : ''}`} onClick={() => switchTab('projects')}>{d.tabProjects}</button>
          <button className={`${styles.tab} ${activeTab === 'talent' ? styles.active : ''}`} onClick={() => switchTab('talent')}>{d.tabTalent}</button>
        </div>

        {/* Browse Projects */}
        {activeTab === 'projects' && (
          <div className={styles.splitLayout}>
            <div className={styles.mainCol}>
              {demands === null
                ? [0,1,2].map(i => <div key={i} className={styles.cardSkeleton} />)
                : demands.length === 0
                  ? <p className={styles.loading}>No projects available yet.</p>
                  : demands.map(item => (
                    <div key={item.id} className={styles.card}>
                      <div className={styles.cardTitle}>
                        <Link href={`/project/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</Link>
                        <span style={{ fontSize: 14, color: 'var(--success)' }}>{item.budget}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.badge}>📍 {item.location || 'N/A'}</span>
                        <span className={styles.badge}>⚙️ {item.role_required}</span>
                        <span className={styles.badge}>📋 Escrow Milestone</span>
                      </div>
                      <div className={styles.cardDesc}>{item.description}</div>
                      <div className={styles.cardFooter}>
                        <span className={styles.dateLabel}>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link href={`/project/${item.id}`} className={styles.btnAction} style={{ background: '#6b7280' }}>Details</Link>
                          {currentUser?.role === 'engineer'
                            ? <button className={styles.btnAction} onClick={() => { setApplyDemand(item); setApplyMsg(''); }}>Apply</button>
                            : <a href={`mailto:${item.contact}?subject=TalEngineer Inquiry: ${encodeURIComponent(item.title)}`} className={styles.btnAction}>Apply Now</a>
                          }
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
            <div className={styles.sideCol}>
              <form className={styles.postForm} onSubmit={parsed ? submitProject : parseDemand}>
                <h3>{d.formTitleProjects}</h3>
                {!parsed ? (
                  <div>
                    <div className={styles.formGroup}>
                      <label>{d.lblDescribe}</label>
                      <textarea rows={4} value={rawText} onChange={e => setRawText(e.target.value)} placeholder="e.g. 我们有一批设备发到了墨西哥蒙特雷，需要一个懂西门子S7的工程师去现场帮忙接线和调试，大概需要3天，预算$1500。" required />
                    </div>
                    <button type="submit" className={styles.btnAI} disabled={parsing}>{parsing ? '🧠 AI Analyzing...' : d.parseBtn}</button>
                  </div>
                ) : (
                  <div>
                    <div className={styles.parsedNote}>✅ AI parsed your request. Review & confirm below.</div>
                    <FormGroup label="Project Title"><input value={projectForm.title} onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))} required /></FormGroup>
                    <FormGroup label="Project Type">
                      <select value={projectForm.type} onChange={e => setProjectForm(f => ({ ...f, type: e.target.value }))}>
                        <option>Cross-Border Equipment Deployment</option>
                        <option>Local System Integration</option>
                        <option>Emergency Troubleshooting</option>
                        <option>Routine Maintenance</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Required Skills"><input value={projectForm.role} onChange={e => setProjectForm(f => ({ ...f, role: e.target.value }))} required /></FormGroup>
                    <FormGroup label="Country / Execution Site">
                      <select value={projectForm.region} onChange={e => setProjectForm(f => ({ ...f, region: e.target.value }))}>
                        <option>United States (US)</option>
                        <option>Canada (CA)</option>
                        <option>Mexico (MX)</option>
                        <option>Vietnam (VN)</option>
                        <option>India (IN)</option>
                        <option>Germany (DE)</option>
                        <option>France (FR)</option>
                        <option>Japan (JP)</option>
                        <option>South Korea (KR)</option>
                        <option>Brazil (BR)</option>
                        <option>Australia (AU)</option>
                        <option>United Kingdom (GB)</option>
                        <option>Remote / Anywhere</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Specific Location"><input value={projectForm.location} onChange={e => setProjectForm(f => ({ ...f, location: e.target.value }))} required /></FormGroup>
                    <FormGroup label="Budget Range"><input value={projectForm.budget} onChange={e => setProjectForm(f => ({ ...f, budget: e.target.value }))} required /></FormGroup>
                    <FormGroup label="Contact Email"><input type="email" value={projectForm.contact} onChange={e => setProjectForm(f => ({ ...f, contact: e.target.value }))} required /></FormGroup>
                    <FormGroup label="Standardized SoW"><textarea rows={5} value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))} required /></FormGroup>
                    {parsedMilestones.length > 0 && (
                      <div className={styles.milestonesBox}>
                        <label>Proposed Escrow Milestones</label>
                        <ul>{parsedMilestones.map((m, i) => <li key={i}>{m.phase_name}: {(m.percentage * 100).toFixed(0)}%</li>)}</ul>
                      </div>
                    )}
                    <button type="submit" className={styles.btnSuccess} disabled={postingJob}>{postingJob ? 'Posting...' : d.submitJobBtn}</button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Browse Talent */}
        {activeTab === 'talent' && (
          <div className={styles.splitLayout}>
            <div className={styles.mainCol}>
              {/* ── Filter bar ── */}
              <form className={styles.filterBar} onSubmit={applyFilters}>
                <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className={styles.filterSelect}>
                  <option value="all">All Regions</option>
                  <option value="US">United States (US)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="MX">Mexico (MX)</option>
                  <option value="VN">Vietnam (VN)</option>
                  <option value="IN">India (IN)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="FR">France (FR)</option>
                  <option value="JP">Japan (JP)</option>
                  <option value="KR">South Korea (KR)</option>
                  <option value="BR">Brazil (BR)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="Remote">Remote / Anywhere</option>
                </select>
                <input className={styles.filterInput} value={filterSkills} onChange={e => setFilterSkills(e.target.value)} placeholder="Search skills (e.g. Siemens, Rockwell)" />
                <select value={filterScore} onChange={e => setFilterScore(e.target.value)} className={styles.filterSelect}>
                  <option value="">Any Score</option>
                  <option value="80">Verified ≥ 80</option>
                  <option value="60">Score ≥ 60</option>
                </select>
                <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)} className={styles.filterSelect}>
                  <option value="all">Any Availability</option>
                  <option value="available">🟢 Available Now</option>
                  <option value="busy">🟡 Available Soon</option>
                </select>
                <select value={filterSort} onChange={e => setFilterSort(e.target.value)} className={styles.filterSelect}>
                  <option value="score">Sort: Top Verified</option>
                  <option value="available">Sort: Available First</option>
                  <option value="newest">Sort: Newest</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  <input type="checkbox" checked={filterVerifiedOnly} onChange={e => setFilterVerifiedOnly(e.target.checked)} />
                  Verified only
                </label>
                <button type="submit" className={styles.btnAction}>Search</button>
                <button type="button" className={styles.btnClear} onClick={() => { setFilterRegion('all'); setFilterSkills(''); setFilterScore(''); setFilterAvailability('all'); setFilterVerifiedOnly(false); setFilterSort('score'); loadTalent('all', '', '', 0, 'all', false, 'score'); }}>Clear</button>
              </form>

              {/* Pagination info */}
              {talentTotal > PAGE_SIZE && talents !== null && (
                <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>
                  Showing {talentPage * PAGE_SIZE + 1}–{Math.min((talentPage + 1) * PAGE_SIZE, talentTotal)} of {talentTotal} engineers
                </div>
              )}

              {talents === null
                ? [0,1,2].map(i => <div key={i} className={styles.cardSkeleton} />)
                : talents.length === 0
                  ? <p className={styles.loading}>No engineers match your search.</p>
                  : talents.map(t => (
                    <div key={t.id} className={styles.card}>
                      <div className={styles.cardTitle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Link href={`/engineer/${t.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{t.name}</Link>
                          {t.verified_score >= 80 && (
                            <span className={styles.verifiedBadge}>🛡️ Nexus Verified ({t.verified_score})</span>
                          )}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--primary)' }}>{t.rate}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.badge}>📍 {t.region}</span>
                        <span className={styles.badge}>🔧 {t.skills}</span>
                        <span className={styles.badge}>⭐ {t.level}</span>
                      </div>
                      <div className={styles.cardDesc}>{t.bio}</div>
                      <div className={styles.cardFooter}>
                        <span className={styles.dateLabel}>Joined: {new Date(t.created_at).toLocaleDateString()}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link href={`/engineer/${t.id}`} className={styles.btnAction} style={{ background: '#6b7280' }}>Profile</Link>
                          <a href={`mailto:${t.contact}?subject=TalEngineer Inquiry for ${encodeURIComponent(t.name)}`} className={styles.btnAction}>Invite</a>
                        </div>
                      </div>
                    </div>
                  ))
              }

              {/* Pagination controls */}
              {talentTotal > PAGE_SIZE && talents !== null && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                  <button className={styles.btnClear} disabled={talentPage === 0} onClick={() => loadTalent(filterRegion, filterSkills, filterScore, talentPage - 1)}>← Prev</button>
                  <span style={{ lineHeight: '36px', fontSize: 13, color: 'var(--muted)' }}>Page {talentPage + 1} / {Math.ceil(talentTotal / PAGE_SIZE)}</span>
                  <button className={styles.btnClear} disabled={(talentPage + 1) * PAGE_SIZE >= talentTotal} onClick={() => loadTalent(filterRegion, filterSkills, filterScore, talentPage + 1)}>Next →</button>
                </div>
              )}
            </div>{/* end mainCol */}
            <div className={styles.sideCol}>
              <form className={styles.postForm} onSubmit={submitProfile}>
                <h3>{d.formTitleTalent}</h3>
                <FormGroup label="Full Name"><input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Juan Perez" required /></FormGroup>
                <FormGroup label="Contact Email"><input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} required /></FormGroup>
                <FormGroup label="Password"><input type="password" value={profileForm.password} onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))} required /></FormGroup>
                <FormGroup label="Primary Skills & PLCs"><input value={profileForm.skills} onChange={e => setProfileForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Siemens S7, Rockwell, TIA Portal" required /></FormGroup>
                <FormGroup label="Service Region">
                  <select value={profileForm.region} onChange={e => setProfileForm(f => ({ ...f, region: e.target.value }))}>
                    <option>United States (US)</option>
                    <option>Canada (CA)</option>
                    <option>Mexico (MX)</option>
                    <option>Vietnam (VN)</option>
                    <option>India (IN)</option>
                    <option>Germany (DE)</option>
                    <option>France (FR)</option>
                    <option>Japan (JP)</option>
                    <option>South Korea (KR)</option>
                    <option>Brazil (BR)</option>
                    <option>Australia (AU)</option>
                    <option>United Kingdom (GB)</option>
                    <option>Remote / Anywhere</option>
                  </select>
                </FormGroup>
                <FormGroup label="Expected Rate (USD)"><input value={profileForm.rate} onChange={e => setProfileForm(f => ({ ...f, rate: e.target.value }))} placeholder="e.g. $60/hr or $500/day" required /></FormGroup>
                <FormGroup label="Experience Level">
                  <select value={profileForm.level} onChange={e => setProfileForm(f => ({ ...f, level: e.target.value }))}>
                    <option>Junior (1-3 yrs)</option><option>Mid-Level (3-7 yrs)</option><option>Senior (7+ yrs)</option>
                  </select>
                </FormGroup>
                <FormGroup label="Short Bio"><textarea rows={4} value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="Briefly describe your experience and availability..." required /></FormGroup>
                <button type="submit" className={styles.btnSubmit} disabled={postingProfile}>{postingProfile ? '🤖 AI Tech Interviewing...' : d.submitProfileBtn}</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyDemand && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setApplyDemand(null)}>
          <form style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} onSubmit={submitApply}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Apply to Project</h3>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{applyDemand.title}</div>
              </div>
              <span style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }} onClick={() => setApplyDemand(null)}>×</span>
            </div>
            <textarea
              rows={4}
              value={applyMsg}
              onChange={e => setApplyMsg(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this project…"
              style={{ width: '100%', padding: 12, border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Your Rate (e.g. $85/hr)</label>
                <input value={applyQuotedRate} onChange={e => setApplyQuotedRate(e.target.value)} placeholder="$85/hr" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Est. Days</label>
                <input type="number" min={1} value={applyQuotedDays} onChange={e => setApplyQuotedDays(e.target.value)} placeholder="14" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4 }}>Total Quote (USD)</label>
                <input type="number" min={0} step="0.01" value={applyQuoteAmount} onChange={e => setApplyQuoteAmount(e.target.value)} placeholder="2000" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)' }} onClick={() => setApplyDemand(null)}>Cancel</button>
              <button type="submit" className={styles.btnAction} style={{ flex: 2, padding: 10 }} disabled={applying}>
                {applying ? 'Submitting…' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
