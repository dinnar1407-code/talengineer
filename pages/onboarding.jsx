import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './onboarding.module.css';

const LS_USER_KEY = 'tal_user';

const SKILL_OPTIONS = ['PLC Programming', 'Siemens TIA Portal', 'Rockwell Studio 5000', 'SCADA/HMI', 'Fanuc Robotics', 'KUKA Robotics', 'ABB Robotics', 'Electrical Panel Design', 'Process Control', 'VFD/Drives', 'Pneumatics', 'Hydraulics', 'Commissioning', 'Troubleshooting', 'AutoCAD Electrical', 'EPLAN', 'Allen-Bradley', 'Omron', 'Mitsubishi PLC', 'Safety Systems (SIL/PLe)'];

const STEPS = ['Welcome', 'Profile', 'Skills', 'Availability', 'Portfolio', 'Done'];

// i18n（2026-07-16 用户反馈：本页此前全是硬编码英文，不跟随全站语言切换）。
// 与全站一致的页内 DICT 模式：en/zh 先行，其它语言回退英文。
const DICT = {
  en: {
    pageTitle: 'Complete Your Profile | Talengineer',
    stepNames: ['Welcome', 'Profile', 'Skills', 'Availability', 'Portfolio', 'Done'],
    stepOf: (n, total) => `Step ${n} of ${total}`,
    welcomeTitle: (name) => `Welcome, ${name}!`,
    welcomeDesc: "Let's set up your engineer profile. It takes about 2 minutes and helps employers find you faster.",
    feat1: 'Appear in search results', feat2: 'Show your verified skills', feat3: 'Set your rate and availability',
    getStarted: 'Get Started →', back: '← Back', next: 'Next →',
    profileTitle: 'Your Profile', profileDesc: 'Tell employers who you are and what you do.',
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
    saving: 'Saving…', completeProfile: 'Complete Profile ✓',
    portfolioTitle: 'Portfolio',
    portfolioDesc: 'Add photos of your past work — installations, panels, wiring diagrams. Employers trust engineers with proof.',
    phImageUrl: 'Image URL (e.g. https://i.imgur.com/abc.jpg)',
    phCaption: 'Caption (e.g. Siemens S7 panel commissioning, Monterrey 2024)',
    addItem: '+ Add Item', saveFinish: 'Save & Finish ✓', skip: 'Skip →',
    doneTitle: 'Profile Complete!',
    doneDesc: 'Your profile is live. Employers can now discover and invite you to projects.',
    browseProjects: 'Browse Projects →', goDashboard: 'Go to Dashboard',
    toastProfileSaved: 'Profile saved!', toastPortfolioSaved: 'Portfolio saved!',
    toastSaveFailed: 'Failed to save profile.', toastPortfolioFailed: 'Failed to save portfolio.', toastNetwork: 'Network error.',
  },
  zh: {
    pageTitle: '完善你的档案 | Talengineer',
    stepNames: ['欢迎', '基本档案', '技能', '接单状态', '作品集', '完成'],
    stepOf: (n, total) => `第 ${n} 步 / 共 ${total} 步`,
    welcomeTitle: (name) => `欢迎，${name}！`,
    welcomeDesc: '来完善你的工程师档案吧，大约 2 分钟——雇主会更快找到你。',
    feat1: '出现在搜索结果中', feat2: '展示你的认证技能', feat3: '设置费率与接单状态',
    getStarted: '开始 →', back: '← 上一步', next: '下一步 →',
    profileTitle: '基本档案', profileDesc: '告诉雇主你是谁、擅长做什么。',
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
    saving: '保存中…', completeProfile: '完成档案 ✓',
    portfolioTitle: '作品集',
    portfolioDesc: '上传过往工作照片——安装现场、电柜、接线图。有实证的工程师更受雇主信任。',
    phImageUrl: '图片 URL（例如 https://i.imgur.com/abc.jpg）',
    phCaption: '说明（例如：西门子 S7 电柜调试，蒙特雷 2024）',
    addItem: '+ 添加一项', saveFinish: '保存并完成 ✓', skip: '跳过 →',
    doneTitle: '档案完成！',
    doneDesc: '你的档案已上线，雇主现在可以发现你并邀请你参与项目。',
    browseProjects: '浏览项目 →', goDashboard: '前往控制台',
    toastProfileSaved: '档案已保存！', toastPortfolioSaved: '作品集已保存！',
    toastSaveFailed: '档案保存失败。', toastPortfolioFailed: '作品集保存失败。', toastNetwork: '网络错误，请重试。',
  },
};

export default function Onboarding() {
  const router = useRouter();
  const toast = useToast();
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en; // 语言词条：跟随全站切换，缺失语言回退英文
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [bio, setBio]           = useState('');
  const [region, setRegion]     = useState('');
  const [rate, setRate]         = useState('');
  const [pricingModel, setPricingModel] = useState('hourly');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availability, setAvailability] = useState('available');
  const [availableFrom, setAvailableFrom] = useState('');
  // Portfolio
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioUrl, setPortfolioUrl]     = useState('');
  const [portfolioCaption, setPortfolioCaption] = useState('');
  const [savingPortfolio, setSavingPortfolio] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) { router.push('/finance'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.role !== 'engineer') { router.push('/finance'); return; }
      setCurrentUser(user);
    } catch { router.push('/finance'); }
  }, []);

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

  async function saveProfile() {
    if (!currentUser?.token) return;
    setSaving(true);
    try {
      const payload = {
        bio,
        region,
        rate: rate ? `$${rate}/hr` : undefined,
        pricing_model: pricingModel,
        skills: selectedSkills.join(', '),
        availability,
        available_from: availableFrom || null,
      };
      // Remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const res = await fetch('/api/talent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(d.toastProfileSaved);
        setStep(4); // Portfolio
      } else {
        toast.error(data.error || d.toastSaveFailed);
      }
    } catch { toast.error(d.toastNetwork); }
    setSaving(false);
  }

  if (!currentUser) return null;

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <>
      <Head>
        <title>{d.pageTitle}</title>
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.layout}>
        <div className={styles.card}>
          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.stepLabel}>{d.stepNames[step]} · {d.stepOf(step + 1, STEPS.length)}</div>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <div className={styles.emoji}>👋</div>
              <h1>{d.welcomeTitle(currentUser.name)}</h1>
              <p>{d.welcomeDesc}</p>
              <div className={styles.featureList}>
                <div className={styles.feature}><span>✓</span> {d.feat1}</div>
                <div className={styles.feature}><span>✓</span> {d.feat2}</div>
                <div className={styles.feature}><span>✓</span> {d.feat3}</div>
              </div>
              <button className={styles.btnNext} onClick={() => setStep(1)}>{d.getStarted}</button>
            </div>
          )}

          {/* Step 1: Profile basics */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2>{d.profileTitle}</h2>
              <p className={styles.stepDesc}>{d.profileDesc}</p>

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
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder={d.phBio}
                  className={styles.textarea}
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.charCount}>{bio.length}/500</div>
              </div>

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(0)}>{d.back}</button>
                <button className={styles.btnNext} onClick={() => setStep(2)}>{d.next}</button>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2>{d.skillsTitle}</h2>
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

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(1)}>{d.back}</button>
                <button className={styles.btnNext} onClick={() => setStep(3)}>{d.next}</button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2>{d.availStepTitle}</h2>
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

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(2)}>{d.back}</button>
                <button className={styles.btnNext} onClick={saveProfile} disabled={saving}>
                  {saving ? d.saving : d.completeProfile}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Portfolio */}
          {step === 4 && (
            <div className={styles.stepContent}>
              <h2>{d.portfolioTitle}</h2>
              <p className={styles.stepDesc}>{d.portfolioDesc}</p>

              {/* Add item */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <input
                  className={styles.input}
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  placeholder={d.phImageUrl}
                />
                <input
                  className={styles.input}
                  value={portfolioCaption}
                  onChange={e => setPortfolioCaption(e.target.value)}
                  placeholder={d.phCaption}
                />
                <button
                  type="button"
                  className={styles.btnAdd}
                  onClick={() => {
                    const url = portfolioUrl.trim();
                    if (!url) return;
                    setPortfolioItems(prev => [...prev, { url, caption: portfolioCaption.trim() }]);
                    setPortfolioUrl('');
                    setPortfolioCaption('');
                  }}
                >
                  {d.addItem}
                </button>
              </div>

              {/* Preview grid */}
              {portfolioItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
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

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(3)}>{d.back}</button>
                <button
                  className={styles.btnNext}
                  disabled={savingPortfolio}
                  onClick={async () => {
                    if (portfolioItems.length === 0) { setStep(5); return; }
                    setSavingPortfolio(true);
                    try {
                      const res = await fetch('/api/talent/portfolio', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
                        body: JSON.stringify({ portfolio_images: portfolioItems }),
                      });
                      if (res.ok) { toast.success(d.toastPortfolioSaved); }
                      else { const resp = await res.json(); toast.error(resp.error || d.toastPortfolioFailed); }
                    } catch { toast.error(d.toastNetwork); }
                    setSavingPortfolio(false);
                    setStep(5);
                  }}
                >
                  {savingPortfolio ? d.saving : portfolioItems.length > 0 ? d.saveFinish : d.skip}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {step === 5 && (
            <div className={styles.stepContent} style={{ textAlign: 'center' }}>
              <div className={styles.emoji}>🎉</div>
              <h1>{d.doneTitle}</h1>
              <p>{d.doneDesc}</p>
              <div className={styles.doneActions}>
                <a href="/talent" className={styles.btnNext}>{d.browseProjects}</a>
                <a href="/finance" className={styles.btnSecondary}>{d.goDashboard}</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
