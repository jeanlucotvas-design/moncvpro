import { useState, useEffect } from "react";

const STEP_LABELS = ["Vos informations", "Le poste visé", "Résultat"];

function Loader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px 0" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "4px solid #f0f0f0", borderTop: "4px solid #FF6B35", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#888", fontFamily: "'DM Sans', sans-serif", fontSize: "15px" }}>L'IA rédige votre document…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: "#444" }}>
        {label} {required && <span style={{ color: "#FF6B35" }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#222", background: "#fafafa", outline: "none", boxSizing: "border-box", width: "100%" }}
        onFocus={e => e.target.style.borderColor = "#FF6B35"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600", color: "#444" }}>
        {label} {required && <span style={{ color: "#FF6B35" }}>*</span>}
      </label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#222", background: "#fafafa", outline: "none", resize: "vertical", boxSizing: "border-box", width: "100%", lineHeight: "1.5" }}
        onFocus={e => e.target.style.borderColor = "#FF6B35"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
    </div>
  );
}

function ResultCard({ title, content, accent }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ borderRadius: "16px", border: `2px solid ${accent}33`, background: "#fff", overflow: "hidden", boxShadow: `0 4px 24px ${accent}18` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: accent + "0d", borderBottom: `1.5px solid ${accent}22` }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: "700", fontSize: "15px", color: accent }}>{title}</span>
        <button onClick={() => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ padding: "5px 14px", borderRadius: "20px", border: `1.5px solid ${accent}`, background: copied ? accent : "transparent", color: copied ? "#fff" : accent, fontSize: "12px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          {copied ? "✓ Copié !" : "Copier"}
        </button>
      </div>
      <div style={{ padding: "20px", whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "14px", color: "#333", fontFamily: "'DM Sans', sans-serif", maxHeight: "320px", overflowY: "auto" }}>{content}</div>
    </div>
  );
}

function TipCard({ tip }) {
  return (
    <div style={{ borderRadius: "14px", background: "linear-gradient(135deg, #FFF7ED, #FFF0E0)", border: "1.5px solid #FFD9B8", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "22px", flexShrink: 0 }}>💡</span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#7A4A1E", lineHeight: "1.6", margin: 0 }}>{tip}</p>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", tel: "", ville: "",
    poste_actuel: "", experience: "", competences: "", formation: "",
    poste_vise: "", entreprise: "", secteur: "", description_offre: ""
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const isStep1Valid = form.prenom && form.nom && form.poste_actuel && form.experience;
  const isStep2Valid = form.poste_vise && form.secteur;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const savedResult = localStorage.getItem("moncvpro_result");
      if (savedResult) {
        setResult(JSON.parse(savedResult));
        setUnlocked(true);
        setStep(2);
        localStorage.removeItem("moncvpro_result");
      }
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setStep(2);
    try {
      const prompt = `Tu es un expert RH et rédacteur professionnel francophone. Génère pour ${form.prenom} ${form.nom} :
1. Un CV professionnel structuré (sections : Profil, Expérience, Compétences, Formation)
2. Une lettre de motivation percutante (3 paragraphes)
3. 3 conseils personnalisés pour maximiser les chances d'obtenir ce poste
Informations candidat :
- Poste actuel : ${form.poste_actuel}
- Expérience : ${form.experience}
- Compétences : ${form.competences}
- Formation : ${form.formation}
- Ville : ${form.ville}
Poste visé : ${form.poste_vise}
Entreprise : ${form.entreprise || "non précisée"}
Secteur : ${form.secteur}
Description offre : ${form.description_offre || "non précisée"}
Réponds UNIQUEMENT en JSON valide avec ces clés : { "cv": "...", "lettre": "...", "conseils": ["...", "...", "..."] }`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.map(i => i.text || "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      localStorage.setItem("moncvpro_result", JSON.stringify(parsed));
    } catch (err) {
      setResult({ cv: "Une erreur est survenue. Veuillez réessayer.", lettre: "", conseils: [] });
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    setShowPayment(false);
    try {
      await new Promise((resolve) => {
        if (window.Stripe) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://js.stripe.com/v3/";
        s.onload = resolve;
        document.head.appendChild(s);
      });
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: import.meta.env.VITE_STRIPE_PRICE_ID, quantity: 1 }],
        mode: "payment",
        successUrl: window.location.origin + "?success=true",
        cancelUrl: window.location.origin + "?canceled=true",
      });
      if (error) { console.error(error); setUnlocked(true); }
    } catch (e) {
      console.error(e);
      setUnlocked(true);
    }
  };

  const resetApp = () => {
    setStep(0); setResult(null); setUnlocked(false);
    setForm({ prenom:"",nom:"",email:"",tel:"",ville:"",poste_actuel:"",experience:"",competences:"",formation:"",poste_vise:"",entreprise:"",secteur:"",description_offre:"" });
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #FFF8F3 0%, #F0F7FF 50%, #FFF3EE 100%)", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 40%, #FFB347 100%)", padding: "40px 24px 50px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 6vw, 38px)", fontWeight: "800", color: "#fff", margin: "12px 0 8px" }}>MonCVPro</h1>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "15px", margin: "0 0 20px" }}>CV + Lettre de motivation générés par IA en 30 secondes</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          {["✅ CV sur mesure", "✅ Lettre percutante", "✅ Conseils personnalisés"].map(t => (
            <span key={t} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: "20px", fontSize: "13px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "24px 24px 0", maxWidth: "520px", margin: "0 auto" }}>
        {STEP_LABELS.map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: i <= step ? "#FF6B35" : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", color: i <= step ? "#fff" : "#aaa", fontWeight: "700", fontSize: "13px" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "11px", marginTop: "4px", fontWeight: "600", color: i === step ? "#FF6B35" : "#aaa", textAlign: "center", whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < 2 && <div style={{ height: "2px", flex: 1, background: i < step ? "#FF6B35" : "#e0e0e0", margin: "0 4px", marginBottom: "18px" }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "520px", margin: "20px auto 0", background: "#fff", borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", padding: "28px 24px" }}>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Vos informations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input label="Prénom" value={form.prenom} onChange={set("prenom")} placeholder="Marie" required />
              <Input label="Nom" value={form.nom} onChange={set("nom")} placeholder="Dupont" required />
            </div>
            <Input label="Email" value={form.email} onChange={set("email")} placeholder="marie@email.com" type="email" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input label="Téléphone" value={form.tel} onChange={set("tel")} placeholder="06 12 34 56 78" />
              <Input label="Ville" value={form.ville} onChange={set("ville")} placeholder="Paris" />
            </div>
            <Input label="Poste actuel" value={form.poste_actuel} onChange={set("poste_actuel")} placeholder="Développeur web, Commercial..." required />
            <Textarea label="Expériences professionnelles" value={form.experience} onChange={set("experience")} placeholder="Ex : 3 ans chez X en tant que..." rows={3} required />
            <Textarea label="Compétences clés" value={form.competences} onChange={set("competences")} placeholder="Ex : Excel, gestion de projet..." rows={2} />
            <Textarea label="Formation" value={form.formation} onChange={set("formation")} placeholder="Ex : BTS Commerce, Licence..." rows={2} />
            <button onClick={() => setStep(1)} disabled={!isStep1Valid}
              style={{ padding: "14px", borderRadius: "12px", background: isStep1Valid ? "linear-gradient(135deg, #FF6B35, #FF8C42)" : "#e0e0e0", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: isStep1Valid ? "pointer" : "not-allowed" }}>
              Étape suivante →
            </button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Le poste visé</h2>
            <Input label="Poste recherché" value={form.poste_vise} onChange={set("poste_vise")} placeholder="Responsable marketing..." required />
            <Input label="Entreprise cible (optionnel)" value={form.entreprise} onChange={set("entreprise")} placeholder="Google, SNCF..." />
            <Input label="Secteur d'activité" value={form.secteur} onChange={set("secteur")} placeholder="Tech, Santé, Finance..." required />
            <Textarea label="Description de l'offre (optionnel)" value={form.description_offre} onChange={set("description_offre")} placeholder="Collez ici le texte de l'annonce..." rows={4} />
            <div style={{ background: "linear-gradient(135deg, #FFF3EE, #FFF8F3)", borderRadius: "12px", padding: "16px", border: "1.5px solid #FFD9B8" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#7A4A1E" }}>🔒 CV + lettre + conseils personnalisés pour <strong style={{ color: "#FF6B35" }}>2,99€</strong></p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(0)} style={{ padding: "13px 20px", borderRadius: "12px", border: "1.5px solid #e0e0e0", background: "#fff", color: "#666", fontSize: "14px", fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>← Retour</button>
              <button onClick={() => { setShowPayment(true); handleGenerate(); }} disabled={!isStep2Valid}
                style={{ flex: 1, padding: "14px", borderRadius: "12px", background: isStep2Valid ? "linear-gradient(135deg, #FF6B35, #FF8C42)" : "#e0e0e0", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: isStep2Valid ? "pointer" : "not-allowed" }}>
                Générer pour 2,99€ ✨
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading ? <Loader /> : result && (
              <>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>Vos documents sont prêts 🎉</h2>
                {!unlocked ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
                    <p style={{ color: "#555", fontSize: "15px", marginBottom: "20px" }}>Finalisez le paiement pour débloquer vos documents.</p>
                    <button onClick={() => setShowPayment(true)} style={{ padding: "14px 32px", borderRadius: "12px", background: "linear-gradient(135deg, #FF6B35, #FF8C42)", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                      Débloquer pour 2,99€ 🔓
                    </button>
                  </div>
                ) : (
                  <>
                    <ResultCard title="📄 Mon CV" content={result.cv} accent="#FF6B35" />
                    <ResultCard title="✉️ Ma Lettre de Motivation" content={result.lettre} accent="#3B82F6" />
                    {result.conseils?.length > 0 && (
                      <div>
                        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "12px" }}>💡 Conseils personnalisés</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {result.conseils.map((c, i) => <TipCard key={i} tip={c} />)}
                        </div>
                      </div>
                    )}
                    <button onClick={resetApp} style={{ padding: "13px", borderRadius: "12px", border: "1.5px solid #FF6B35", background: "transparent", color: "#FF6B35", fontSize: "14px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                      ↺ Nouvelle génération
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showPayment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px 28px", maxWidth: "360px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>💳</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 8px" }}>Paiement sécurisé</h3>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>CV + Lettre + 3 conseils personnalisés</p>
              <div style={{ display: "inline-block", marginTop: "12px", background: "linear-gradient(135deg, #FF6B35, #FF8C42)", color: "#fff", padding: "8px 24px", borderRadius: "20px", fontFamily: "'Syne', sans-serif", fontWeight: "800", fontSize: "24px" }}>2,99€</div>
            </div>
            <button onClick={handlePayment} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #FF6B35, #FF8C42)", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginBottom: "10px" }}>
              💳 Payer 2,99€ avec Stripe
            </button>
            <button onClick={() => setShowPayment(false)} style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "none", background: "transparent", color: "#aaa", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
            <p style={{ textAlign: "center", fontSize: "11px", color: "#bbb", marginTop: "12px", marginBottom: 0 }}>🔒 Paiement 100% sécurisé via Stripe</p>
          </div>
        </div>
      )}
    </div>
  );
}
