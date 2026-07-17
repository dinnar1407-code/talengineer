import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
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
          }
        }
      } catch { /* 网络异常时显示空表单，用户仍可填写保存 */ }
      setLoading(false);
    })();
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
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

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
                  <button type="button" className={styles.btnAdd} onClick={addPortfolioItem}>{d.addItem}</button>
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
