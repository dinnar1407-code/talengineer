import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot';
import styles from './talent.module.css';

const DICT = {
  en: {
    navTalent: 'Find Engineers', navLogin: 'Sign In / Dashboard',
    hubTitle: 'Industrial Automation Service Hub',
    hubSub: 'AI-driven cross-border marketplace connecting Chinese equipment suppliers with elite local engineers in North America & Mexico.',
    tabProjects: 'Browse Projects (For Engineers)', tabTalent: 'Browse Engineers (For Foremen)',
    formTitleProjects: 'Post a Project (Supplier/Foreman)',
    lblDescribe: 'Describe your project (You can type in Chinese)',
    parseBtn: '✨ AI Magic: Parse & Standardize',
    formTitleTalent: 'Create Profile (Engineer)',
    submitJobBtn: 'Confirm & Post Project', submitProfileBtn: 'Publish Profile',
  },
  zh: {
    navTalent: '寻找工程师', navLogin: '登录 / 控制台',
    hubTitle: '工业自动化服务大厅',
    hubSub: 'AI 驱动的跨境撮合平台，连接中国出海设备供应商与北美/墨西哥顶尖本土工程师。',
    tabProjects: '浏览项目 (我是工程师)', tabTalent: '寻找工程师 (我是发包方)',
    formTitleProjects: '发布项目 (发包方入口)',
    lblDescribe: '用大白话描述您的项目需求',
    parseBtn: '✨ AI 魔法：自动解析并生成英文标书',
    formTitleTalent: '创建工程师档案',
    submitJobBtn: '确认发布项目', submitProfileBtn: '发布档案 (接受 AI 审核)',
  },
  es: {
    navTalent: 'Buscar Ingenieros', navLogin: 'Iniciar sesión',
    hubTitle: 'Centro de Servicios de Automatización',
    hubSub: 'Mercado transfronterizo impulsado por IA que conecta proveedores chinos con ingenieros locales en Norteamérica y México.',
    tabProjects: 'Ver Proyectos (Para Ingenieros)', tabTalent: 'Ver Ingenieros (Para Gerentes)',
    formTitleProjects: 'Publicar un Proyecto',
    lblDescribe: 'Describe tu proyecto',
    parseBtn: '✨ Magia IA: Analizar y Estandarizar',
    formTitleTalent: 'Crear Perfil (Ingeniero)',
    submitJobBtn: 'Confirmar y Publicar', submitProfileBtn: 'Publicar Perfil',
  },
};

export default function Talent() {
  const [lang, setLangState]   = useState('en');
  const [activeTab, setActiveTab] = useState('projects');
  const [demands, setDemands]  = useState(null);
  const [talents, setTalents]  = useState(null);

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
    const saved = localStorage.getItem('tal_lang') || 'en';
    setLangState(saved);
    loadDemands();
  }, []);

  function setLang(l) {
    setLangState(l);
    localStorage.setItem('tal_lang', l);
  }

  async function loadDemands() {
    try {
      const res = await fetch('/api/talent/demands');
      const data = await res.json();
      setDemands(data.data || []);
    } catch { setDemands([]); }
  }

  async function loadTalent() {
    try {
      const res = await fetch('/api/talent/list');
      const data = await res.json();
      setTalents(data.data || []);
    } catch { setTalents([]); }
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
      } else {
        alert('Failed to parse: ' + (result.error || 'Unknown error'));
      }
    } catch { alert('Network error.'); }
    setParsing(false);
  }

  async function submitProject(e) {
    e.preventDefault();
    setPostingJob(true);
    try {
      const res = await fetch('/api/demand/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectForm.title, role_required: projectForm.role,
          region: projectForm.region, project_type: projectForm.type,
          location: projectForm.location, budget: projectForm.budget,
          contact: projectForm.contact, description: projectForm.description,
          milestones: parsedMilestones,
        }),
      });
      if (res.ok) {
        alert('Project posted! The AI Matchmaker is scanning for engineers.');
        setParsed(null); setRawText('');
        setProjectForm({ title: '', type: 'Cross-Border Equipment Deployment', role: '', region: 'United States (US)', pref: 'No Preference', location: '', budget: '', contact: '', description: '' });
        loadDemands();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch { alert('Network error.'); }
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
        alert('AI Technical Screen could not be initialized. Verification is required.');
        setPostingProfile(false); return;
      }

      // Step 2: Prompt for answer (browser native — keeps the original UX)
      const answer = prompt(`🤖 Nexus AI Technical Screen (Required):\n\n${qData.question}\n\nYour Answer:`);
      if (!answer) {
        alert('Submission cancelled. Tech screen is mandatory.');
        setPostingProfile(false); return;
      }

      // Step 3: Grade the answer
      const vRes = await fetch('/api/talent/screen_verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qData.question, answer, lang }),
      });
      const vData = await vRes.json();
      if (vData.score < 60) {
        alert(`❌ Tech Screen Failed (Score: ${vData.score}).\nFeedback: ${vData.feedback}`);
        setPostingProfile(false); return;
      }
      alert(`✅ Tech Screen Passed! (Score: ${vData.score})\nFeedback: ${vData.feedback}`);

      // Step 4: Register
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileForm, role: 'engineer', verified_score: vData.score, engName: profileForm.name, engSkills: profileForm.skills, engRegion: profileForm.region, engRate: profileForm.rate, engLevel: profileForm.level, engBio: profileForm.bio }),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Profile published successfully! (Nexus Verified score added)');
        setProfileForm({ name: '', email: '', password: '', skills: '', region: 'Mexico (MX)', rate: '', level: 'Mid-Level (3-7 yrs)', bio: '' });
        loadTalent();
      } else {
        alert('Error: ' + result.error);
      }
    } catch { alert('Network error.'); }
    setPostingProfile(false);
  }

  const d = DICT[lang];

  return (
    <>
      <Head><title>Talent & Projects | Talengineer</title></Head>
      <ChatBot />

      <header className={styles.header}>
        <Link href="/" className={styles.logo}><span>⚙️</span> Talengineer</Link>
        <nav className={styles.navLinks}>
          <Link href="/talent">{d.navTalent}</Link>
          <Link href="/finance" className={styles.btnLogin}>{d.navLogin}</Link>
          <div className={styles.divider} />
          {['en', 'zh', 'es'].map(l => (
            <button key={l} className={`${styles.langBtn} ${lang === l ? styles.active : ''}`} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
          ))}
        </nav>
      </header>

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
                ? <p className={styles.loading}>Loading open projects...</p>
                : demands.length === 0
                  ? <p className={styles.loading}>No projects available yet.</p>
                  : demands.map(item => (
                    <div key={item.id} className={styles.card}>
                      <div className={styles.cardTitle}>
                        <span>{item.title}</span>
                        <span style={{ fontSize: 14, color: 'var(--success)' }}>{item.budget}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.badge}>📍 {item.location || 'N/A'}</span>
                        <span className={styles.badge}>⚙️ {item.role_required}</span>
                        <span className={styles.badge}>📋 Escrow Milestone Supported</span>
                      </div>
                      <div className={styles.cardDesc}>{item.description}</div>
                      <div className={styles.cardFooter}>
                        <span className={styles.dateLabel}>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                        <a href={`mailto:${item.contact}?subject=Nexus Inquiry: ${encodeURIComponent(item.title)}`} className={styles.btnAction}>Apply Now</a>
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
              {talents === null
                ? <p className={styles.loading}>Loading engineer profiles...</p>
                : talents.length === 0
                  ? <p className={styles.loading}>No engineers available at the moment.</p>
                  : talents.map(t => (
                    <div key={t.id} className={styles.card}>
                      <div className={styles.cardTitle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {t.name}
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
                        <a href={`mailto:${t.contact}?subject=Talengineer Match: Project Inquiry for ${encodeURIComponent(t.name)}`} className={styles.btnAction}>Invite to Project</a>
                      </div>
                    </div>
                  ))
              }
            </div>
            <div className={styles.sideCol}>
              <form className={styles.postForm} onSubmit={submitProfile}>
                <h3>{d.formTitleTalent}</h3>
                <FormGroup label="Full Name"><input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Juan Perez" required /></FormGroup>
                <FormGroup label="Contact Email"><input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} required /></FormGroup>
                <FormGroup label="Password"><input type="password" value={profileForm.password} onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))} required /></FormGroup>
                <FormGroup label="Primary Skills & PLCs"><input value={profileForm.skills} onChange={e => setProfileForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. Siemens S7, Rockwell, TIA Portal" required /></FormGroup>
                <FormGroup label="Service Region">
                  <select value={profileForm.region} onChange={e => setProfileForm(f => ({ ...f, region: e.target.value }))}>
                    <option>Mexico (MX)</option><option>United States (US)</option><option>Canada (CA)</option>
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
