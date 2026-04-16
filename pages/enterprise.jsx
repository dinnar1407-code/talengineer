import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { useLang } from '../hooks/useLang';
import styles from './enterprise.module.css';

const DICT = {
  en: { heroBadge: 'Enterprise', heroTitle: 'Talengineer API', heroSub: 'Integrate industrial automation talent sourcing directly into your ERP or procurement system. Bulk post projects, query rate benchmarks, and manage engineers programmatically.', keysTitle: 'API Keys', keysDesc: 'Keys allow your systems to authenticate to the Talengineer API. Maximum 5 active keys per account.', keyNamePlaceholder: 'Key name (e.g. ERP Integration)', createBtn: '+ Create Key', creating: 'Creating…', noKeys: 'No API keys yet. Create one above.', alertTitle: '⚠️ Save your API key — it will not be shown again', copyBtn: 'Copy Key', copied: '✓ Copied!', dismissBtn: "I've saved it, dismiss", signInTitle: 'Sign in to manage API keys', signInDesc: 'You need an employer account to access the Enterprise API.', signInBtn: 'Sign In to Dashboard', apiRefTitle: 'API Reference', planTitle: 'Plan Limits', useCaseTitle: 'Use Cases', helpTitle: 'Need help?', helpDesc: 'Contact our enterprise team for custom integrations, volume pricing, or SLA agreements.', contactBtn: 'Contact Enterprise Team' },
  zh: { heroBadge: '企业版', heroTitle: 'Talengineer API', heroSub: '将工业自动化人才采购直接集成到您的 ERP 或采购系统中。批量发布项目、查询费率基准、以编程方式管理工程师。', keysTitle: 'API 密钥', keysDesc: '密钥允许您的系统向 Talengineer API 进行身份验证。每个账户最多 5 个有效密钥。', keyNamePlaceholder: '密钥名称（如：ERP 集成）', createBtn: '+ 创建密钥', creating: '创建中…', noKeys: '暂无 API 密钥，请在上方创建。', alertTitle: '⚠️ 保存您的 API 密钥 — 此后不再显示', copyBtn: '复制密钥', copied: '✓ 已复制！', dismissBtn: '已保存，关闭', signInTitle: '登录以管理 API 密钥', signInDesc: '您需要雇主账户才能访问企业 API。', signInBtn: '登录控制台', apiRefTitle: 'API 参考文档', planTitle: '套餐限制', useCaseTitle: '使用场景', helpTitle: '需要帮助？', helpDesc: '联系我们的企业团队，获取定制集成、批量定价或 SLA 协议支持。', contactBtn: '联系企业团队' },
  es: { heroBadge: 'Empresarial', heroTitle: 'API de Talengineer', heroSub: 'Integre la búsqueda de talento de automatización industrial directamente en su ERP o sistema de compras.', keysTitle: 'Claves API', keysDesc: 'Las claves permiten a sus sistemas autenticarse con la API de Talengineer. Máximo 5 claves activas.', keyNamePlaceholder: 'Nombre de clave (ej. Integración ERP)', createBtn: '+ Crear Clave', creating: 'Creando…', noKeys: 'Sin claves API. Cree una arriba.', alertTitle: '⚠️ Guarde su clave API — no se mostrará de nuevo', copyBtn: 'Copiar Clave', copied: '✓ ¡Copiado!', dismissBtn: 'Lo guardé, cerrar', signInTitle: 'Inicie sesión para gestionar claves API', signInDesc: 'Necesita una cuenta de empleador para acceder a la API Empresarial.', signInBtn: 'Iniciar sesión', apiRefTitle: 'Referencia de API', planTitle: 'Límites del Plan', useCaseTitle: 'Casos de Uso', helpTitle: '¿Necesita ayuda?', helpDesc: 'Contacte a nuestro equipo empresarial para integraciones personalizadas.', contactBtn: 'Contactar Equipo Empresarial' },
  vi: { heroBadge: 'Doanh nghiệp', heroTitle: 'Talengineer API', heroSub: 'Tích hợp tuyển dụng kỹ sư tự động hóa trực tiếp vào hệ thống ERP hoặc mua sắm của bạn.', keysTitle: 'Khóa API', keysDesc: 'Khóa cho phép hệ thống của bạn xác thực với Talengineer API. Tối đa 5 khóa hoạt động.', keyNamePlaceholder: 'Tên khóa (vd: Tích hợp ERP)', createBtn: '+ Tạo Khóa', creating: 'Đang tạo…', noKeys: 'Chưa có khóa API. Tạo một khóa ở trên.', alertTitle: '⚠️ Lưu khóa API của bạn — sẽ không hiển thị lại', copyBtn: 'Sao chép Khóa', copied: '✓ Đã sao chép!', dismissBtn: 'Đã lưu, đóng', signInTitle: 'Đăng nhập để quản lý khóa API', signInDesc: 'Bạn cần tài khoản nhà tuyển dụng để truy cập API Doanh nghiệp.', signInBtn: 'Đăng nhập', apiRefTitle: 'Tài liệu API', planTitle: 'Giới hạn Gói', useCaseTitle: 'Trường hợp Sử dụng', helpTitle: 'Cần hỗ trợ?', helpDesc: 'Liên hệ nhóm doanh nghiệp để tích hợp tùy chỉnh, báo giá số lượng lớn hoặc thỏa thuận SLA.', contactBtn: 'Liên hệ Nhóm Doanh nghiệp' },
  hi: { heroBadge: 'एंटरप्राइज़', heroTitle: 'Talengineer API', heroSub: 'औद्योगिक ऑटोमेशन प्रतिभा सोर्सिंग को सीधे अपने ERP या खरीद प्रणाली में एकीकृत करें।', keysTitle: 'API कुंजियाँ', keysDesc: 'कुंजियाँ आपके सिस्टम को Talengineer API से प्रमाणित करती हैं। अधिकतम 5 सक्रिय कुंजियाँ।', keyNamePlaceholder: 'कुंजी का नाम (जैसे: ERP एकीकरण)', createBtn: '+ कुंजी बनाएं', creating: 'बना रहे हैं…', noKeys: 'अभी कोई API कुंजी नहीं। ऊपर बनाएं।', alertTitle: '⚠️ अपनी API कुंजी सहेजें — यह दोबारा नहीं दिखेगी', copyBtn: 'कुंजी कॉपी करें', copied: '✓ कॉपी हो गई!', dismissBtn: 'मैंने सहेज लिया, बंद करें', signInTitle: 'API कुंजियाँ प्रबंधित करने के लिए साइन इन करें', signInDesc: 'एंटरप्राइज़ API तक पहुंचने के लिए आपको एक नियोक्ता खाते की आवश्यकता है।', signInBtn: 'डैशबोर्ड में साइन इन करें', apiRefTitle: 'API संदर्भ', planTitle: 'प्लान सीमाएं', useCaseTitle: 'उपयोग के मामले', helpTitle: 'सहायता चाहिए?', helpDesc: 'कस्टम एकीकरण, वॉल्यूम मूल्य निर्धारण या SLA समझौतों के लिए हमारी टीम से संपर्क करें।', contactBtn: 'एंटरप्राइज़ टीम से संपर्क करें' },
  fr: { heroBadge: 'Entreprise', heroTitle: 'API Talengineer', heroSub: 'Intégrez le sourcing de talents en automatisation industrielle directement dans votre ERP ou système d\'achat.', keysTitle: 'Clés API', keysDesc: 'Les clés permettent à vos systèmes de s\'authentifier auprès de l\'API Talengineer. Maximum 5 clés actives.', keyNamePlaceholder: 'Nom de la clé (ex. Intégration ERP)', createBtn: '+ Créer une Clé', creating: 'Création…', noKeys: 'Aucune clé API. Créez-en une ci-dessus.', alertTitle: '⚠️ Sauvegardez votre clé API — elle ne sera plus affichée', copyBtn: 'Copier la clé', copied: '✓ Copié !', dismissBtn: 'Sauvegardé, fermer', signInTitle: 'Connectez-vous pour gérer les clés API', signInDesc: 'Vous avez besoin d\'un compte employeur pour accéder à l\'API Entreprise.', signInBtn: 'Se connecter', apiRefTitle: 'Référence API', planTitle: 'Limites du plan', useCaseTitle: 'Cas d\'usage', helpTitle: 'Besoin d\'aide ?', helpDesc: 'Contactez notre équipe entreprise pour les intégrations personnalisées, la tarification en volume ou les accords SLA.', contactBtn: 'Contacter l\'équipe' },
  de: { heroBadge: 'Enterprise', heroTitle: 'Talengineer API', heroSub: 'Integrieren Sie die Beschaffung von Automatisierungstalenten direkt in Ihr ERP oder Beschaffungssystem.', keysTitle: 'API-Schlüssel', keysDesc: 'Schlüssel ermöglichen Ihren Systemen die Authentifizierung bei der Talengineer-API. Maximal 5 aktive Schlüssel.', keyNamePlaceholder: 'Schlüsselname (z.B. ERP-Integration)', createBtn: '+ Schlüssel erstellen', creating: 'Wird erstellt…', noKeys: 'Noch keine API-Schlüssel. Erstellen Sie oben einen.', alertTitle: '⚠️ Speichern Sie Ihren API-Schlüssel — er wird nicht erneut angezeigt', copyBtn: 'Schlüssel kopieren', copied: '✓ Kopiert!', dismissBtn: 'Gespeichert, schließen', signInTitle: 'Anmelden um API-Schlüssel zu verwalten', signInDesc: 'Sie benötigen ein Arbeitgeberkonto für den Zugriff auf die Enterprise-API.', signInBtn: 'Am Dashboard anmelden', apiRefTitle: 'API-Referenz', planTitle: 'Plan-Limits', useCaseTitle: 'Anwendungsfälle', helpTitle: 'Hilfe benötigt?', helpDesc: 'Kontaktieren Sie unser Enterprise-Team für individuelle Integrationen, Volumenpreise oder SLA-Vereinbarungen.', contactBtn: 'Enterprise-Team kontaktieren' },
  ja: { heroBadge: 'エンタープライズ', heroTitle: 'Talengineer API', heroSub: '産業オートメーション人材調達をERP・調達システムに直接統合。プロジェクトの一括登録やレートベンチマーク取得がプログラムで可能。', keysTitle: 'APIキー', keysDesc: 'キーはあなたのシステムがTalengineer APIに認証するためのものです。最大5つのアクティブなキー。', keyNamePlaceholder: 'キー名（例：ERP連携）', createBtn: '+ キーを作成', creating: '作成中…', noKeys: 'APIキーがありません。上で作成してください。', alertTitle: '⚠️ APIキーを保存してください — 再表示されません', copyBtn: 'キーをコピー', copied: '✓ コピーしました！', dismissBtn: '保存しました、閉じる', signInTitle: 'APIキーを管理するにはサインイン', signInDesc: 'エンタープライズAPIにアクセスするには雇用者アカウントが必要です。', signInBtn: 'ダッシュボードにサインイン', apiRefTitle: 'APIリファレンス', planTitle: 'プラン制限', useCaseTitle: 'ユースケース', helpTitle: 'お困りですか？', helpDesc: 'カスタム統合、ボリューム価格、またはSLA契約についてはエンタープライズチームにお問い合わせください。', contactBtn: 'エンタープライズチームに問い合わせ' },
  ko: { heroBadge: '엔터프라이즈', heroTitle: 'Talengineer API', heroSub: '산업 자동화 인재 소싱을 ERP 또는 조달 시스템에 직접 통합하세요.', keysTitle: 'API 키', keysDesc: '키는 시스템이 Talengineer API에 인증할 수 있게 합니다. 계정당 최대 5개의 활성 키.', keyNamePlaceholder: '키 이름 (예: ERP 통합)', createBtn: '+ 키 생성', creating: '생성 중…', noKeys: 'API 키가 없습니다. 위에서 생성하세요.', alertTitle: '⚠️ API 키를 저장하세요 — 다시 표시되지 않습니다', copyBtn: '키 복사', copied: '✓ 복사됨!', dismissBtn: '저장했습니다, 닫기', signInTitle: 'API 키를 관리하려면 로그인하세요', signInDesc: 'Enterprise API에 접근하려면 고용주 계정이 필요합니다.', signInBtn: '대시보드 로그인', apiRefTitle: 'API 참조', planTitle: '플랜 제한', useCaseTitle: '사용 사례', helpTitle: '도움이 필요하세요?', helpDesc: '커스텀 통합, 볼륨 가격 또는 SLA 계약은 엔터프라이즈 팀에 문의하세요.', contactBtn: '엔터프라이즈 팀 연락' },
};

const LS_USER_KEY = 'tal_user';

export default function Enterprise() {
  const toast = useToast();
  const [lang, setLang] = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  const [keys, setKeys] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState(null); // shown once after generation
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        loadKeys(user.token);
      } catch { localStorage.removeItem(LS_USER_KEY); }
    }
  }, []);

  async function loadKeys(token) {
    try {
      const res  = await fetch('/api/apikeys', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setKeys(data.data || []);
    } catch { setKeys([]); }
  }

  async function createKey(e) {
    e.preventDefault();
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const res  = await fetch('/api/apikeys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to create key'); return; }
      setNewKey(data.key);
      setKeyName('');
      loadKeys(currentUser.token);
      toast.success('API key created. Save it now — it will not be shown again.');
    } catch { toast.error('Network error.'); }
    setCreating(false);
  }

  async function revokeKey(id) {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      await fetch(`/api/apikeys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${currentUser.token}` } });
      toast.success('API key revoked.');
      loadKeys(currentUser.token);
    } catch { toast.error('Network error.'); }
  }

  function copyKey() {
    navigator.clipboard.writeText(newKey).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const d = DICT[lang] || DICT.en;

  return (
    <>
      <Head>
        <title>Enterprise API | Talengineer</title>
        <meta name="description" content="Talengineer Enterprise API — bulk post projects, access rate benchmarks, and manage engineers programmatically." />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.main}>
            {/* Key warning banner */}
            {newKey && (
              <div className={styles.keyAlert}>
                <div className={styles.keyAlertTitle}>{d.alertTitle}</div>
                <div className={styles.keyCode}>{newKey}</div>
                <button className={styles.btnCopy} onClick={copyKey}>{copied ? d.copied : d.copyBtn}</button>
                <button className={styles.btnDismiss} onClick={() => setNewKey(null)}>{d.dismissBtn}</button>
              </div>
            )}

            {/* Key management */}
            {currentUser ? (
              <div className={styles.section}>
                <h2>{d.keysTitle}</h2>
                <p className={styles.sectionDesc}>{d.keysDesc}</p>

                <form onSubmit={createKey} className={styles.createForm}>
                  <input
                    type="text"
                    placeholder={d.keyNamePlaceholder}
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    className={styles.input}
                    maxLength={100}
                    required
                  />
                  <button type="submit" className={styles.btnCreate} disabled={creating}>
                    {creating ? d.creating : d.createBtn}
                  </button>
                </form>

                {keys === null ? (
                  <div className={styles.keysSkeleton}>
                    {[0,1].map(i => <div key={i} className={styles.keySkeleton} />)}
                  </div>
                ) : keys.length === 0 ? (
                  <div className={styles.empty}>{d.noKeys}</div>
                ) : (
                  <div className={styles.keysList}>
                    {keys.map(k => (
                      <div key={k.id} className={`${styles.keyRow} ${!k.active ? styles.keyRevoked : ''}`}>
                        <div className={styles.keyInfo}>
                          <div className={styles.keyName}>{k.name}</div>
                          <div className={styles.keyMeta}>{k.key_prefix} · Created {new Date(k.created_at).toLocaleDateString()} {k.last_used ? `· Last used ${new Date(k.last_used).toLocaleDateString()}` : '· Never used'}</div>
                        </div>
                        <div className={styles.keyStatus}>
                          {k.active
                            ? <><span className={styles.badgeActive}>Active</span><button className={styles.btnRevoke} onClick={() => revokeKey(k.id)}>Revoke</button></>
                            : <span className={styles.badgeRevoked}>Revoked</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.signInPrompt}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                <h3>{d.signInTitle}</h3>
                <p>{d.signInDesc}</p>
                <Link href="/finance" className={styles.btnSignIn}>{d.signInBtn}</Link>
              </div>
            )}

            {/* API Docs */}
            <div className={styles.section} style={{ marginTop: 40 }}>
              <h2>{d.apiRefTitle}</h2>
              <p className={styles.sectionDesc}>Base URL: <code className={styles.code}>https://talengineer.us/api/enterprise</code></p>
              <p className={styles.sectionDesc}>Authentication: <code className={styles.code}>Authorization: Bearer TE_your_key_here</code></p>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>POST</div>
                <div className={styles.endpointPath}>/enterprise/demands/bulk</div>
                <div className={styles.endpointDesc}>Bulk create up to 50 project demands in one request. Each demand can include optional milestones.</div>
                <div className={styles.codeBlock}>{`// Request body
{
  "demands": [
    {
      "title": "PLC Programming - Siemens S7-1500",
      "description": "Configure and commission 3-line packaging system",
      "budget": "$12,000",
      "region": "Texas, USA",
      "skills": ["PLC", "Siemens TIA Portal", "HMI"],
      "milestones": [
        { "phase_name": "Kickoff & Review", "amount": 3000, "percentage": 0.25 },
        { "phase_name": "Programming", "amount": 6000, "percentage": 0.50 },
        { "phase_name": "Commissioning", "amount": 3000, "percentage": 0.25 }
      ]
    }
  ]
}`}</div>
              </div>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>GET</div>
                <div className={styles.endpointPath}>/enterprise/demands?page=0&limit=20</div>
                <div className={styles.endpointDesc}>List your posted demands with pagination. Returns <code className={styles.code}>total</code> count for paging.</div>
              </div>

              <div className={styles.endpoint}>
                <div className={styles.endpointMethod}>GET</div>
                <div className={styles.endpointPath}>/enterprise/benchmarks</div>
                <div className={styles.endpointDesc}>Rate benchmarks by region. Returns min/avg/median/max rates and engineer count per region.</div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h3>{d.planTitle}</h3>
              <ul className={styles.limitList}>
                <li><span className={styles.limitCheck}>✓</span> 5 active API keys</li>
                <li><span className={styles.limitCheck}>✓</span> 50 demands per bulk request</li>
                <li><span className={styles.limitCheck}>✓</span> 100 req/15 min rate limit</li>
                <li><span className={styles.limitCheck}>✓</span> Real-time rate benchmarks</li>
                <li><span className={styles.limitCheck}>✓</span> Milestone escrow via API</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>{d.useCaseTitle}</h3>
              <ul className={styles.useCaseList}>
                <li>ERP/SAP integration for field service orders</li>
                <li>Automated project creation from equipment orders</li>
                <li>Budget planning with live rate benchmarks</li>
                <li>Multi-site rollout coordination</li>
              </ul>
            </div>

            <div className={styles.sideCard}>
              <h3>{d.helpTitle}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{d.helpDesc}</p>
              <a href="mailto:enterprise@talengineer.us" className={styles.btnContact}>{d.contactBtn}</a>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> · <Link href="/rates">Rate Benchmarks</Link> · <Link href="/enterprise">Enterprise API</Link></p>
      </footer>
    </>
  );
}
