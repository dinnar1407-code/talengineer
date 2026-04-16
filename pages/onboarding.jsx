import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import styles from './onboarding.module.css';

const LS_USER_KEY = 'tal_user';

const SKILL_OPTIONS = ['PLC Programming', 'Siemens TIA Portal', 'Rockwell Studio 5000', 'SCADA/HMI', 'Fanuc Robotics', 'KUKA Robotics', 'ABB Robotics', 'Electrical Panel Design', 'Process Control', 'VFD/Drives', 'Pneumatics', 'Hydraulics', 'Commissioning', 'Troubleshooting', 'AutoCAD Electrical', 'EPLAN', 'Allen-Bradley', 'Omron', 'Mitsubishi PLC', 'Safety Systems (SIL/PLe)'];

const STEPS = ['Welcome', 'Profile', 'Skills', 'Availability', 'Done'];

export default function Onboarding() {
  const router = useRouter();
  const toast = useToast();
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
        toast.success('Profile saved!');
        setStep(4); // Done
      } else {
        toast.error(data.error || 'Failed to save profile.');
      }
    } catch { toast.error('Network error.'); }
    setSaving(false);
  }

  if (!currentUser) return null;

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <>
      <Head>
        <title>Complete Your Profile | Talengineer</title>
      </Head>

      <div className={styles.layout}>
        <div className={styles.card}>
          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.stepLabel}>{STEPS[step]} · Step {step + 1} of {STEPS.length}</div>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <div className={styles.emoji}>👋</div>
              <h1>Welcome, {currentUser.name}!</h1>
              <p>Let's set up your engineer profile. It takes about 2 minutes and helps employers find you faster.</p>
              <div className={styles.featureList}>
                <div className={styles.feature}><span>✓</span> Appear in search results</div>
                <div className={styles.feature}><span>✓</span> Show your verified skills</div>
                <div className={styles.feature}><span>✓</span> Set your rate and availability</div>
              </div>
              <button className={styles.btnNext} onClick={() => setStep(1)}>Get Started →</button>
            </div>
          )}

          {/* Step 1: Profile basics */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2>Your Profile</h2>
              <p className={styles.stepDesc}>Tell employers who you are and what you do.</p>

              <div className={styles.formGroup}>
                <label>Location / Region</label>
                <input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. Texas, USA · Ontario, Canada" className={styles.input} />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Hourly Rate (USD)</label>
                  <div className={styles.rateInput}>
                    <span>$</span>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="95" min="20" max="500" className={styles.input} />
                    <span>/hr</span>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Pricing Model</label>
                  <select value={pricingModel} onChange={e => setPricingModel(e.target.value)} className={styles.select}>
                    <option value="hourly">Hourly</option>
                    <option value="project">Project-based</option>
                    <option value="daily">Daily rate</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Professional Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. 8+ years commissioning Siemens S7 lines for automotive and food & beverage. Fluent in Mandarin. Available for travel within North America."
                  className={styles.textarea}
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.charCount}>{bio.length}/500</div>
              </div>

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(0)}>← Back</button>
                <button className={styles.btnNext} onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2>Skills & Expertise</h2>
              <p className={styles.stepDesc}>Select all that apply. Employers filter by skills.</p>

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
                  placeholder="Add a custom skill…"
                  className={styles.input}
                />
                <button type="button" onClick={addCustomSkill} className={styles.btnAdd}>+ Add</button>
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
                <button className={styles.btnBack} onClick={() => setStep(1)}>← Back</button>
                <button className={styles.btnNext} onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2>Availability</h2>
              <p className={styles.stepDesc}>Let employers know when you can take on projects.</p>

              <div className={styles.availOptions}>
                {[
                  ['available',   '🟢', 'Available Now',         'Ready to start immediately'],
                  ['busy',        '🟡', 'Busy — Available Soon', 'Currently on a project, available in a few weeks'],
                  ['unavailable', '🔴', 'Not Available',         'Not taking new projects right now'],
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
                  <label>Available from (optional)</label>
                  <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className={styles.input} />
                </div>
              )}

              <div className={styles.btnRow}>
                <button className={styles.btnBack} onClick={() => setStep(2)}>← Back</button>
                <button className={styles.btnNext} onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Complete Profile ✓'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className={styles.stepContent} style={{ textAlign: 'center' }}>
              <div className={styles.emoji}>🎉</div>
              <h1>Profile Complete!</h1>
              <p>Your profile is live. Employers can now discover and invite you to projects.</p>
              <div className={styles.doneActions}>
                <a href="/talent" className={styles.btnNext}>Browse Projects →</a>
                <a href="/finance" className={styles.btnSecondary}>Go to Dashboard</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
