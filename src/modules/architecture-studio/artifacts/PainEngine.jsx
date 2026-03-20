import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════
var DARK = {
  bg: "#060a11", panel: "#0c1222", card: "#111c30", input: "#0b1120", inset: "#080d18",
  brd: "#182238", brdA: "#2a4570", brdS: "#14202f",
  t0: "#e8edf5", t1: "#bcc8da", t2: "#8494ad", t3: "#5a6d88", t4: "#3a4d66",
  accent: "#4a9eff", accentBg: "rgba(74,158,255,0.08)",
  ok: "#34d4a4", warn: "#eda050", err: "#ef5060",
  purple: "#a07cf0", cyan: "#20d0e8", orange: "#f09040",
};
var LIGHT = {
  bg: "#edf0f5", panel: "#ffffff", card: "#ffffff", input: "#f0f3f7", inset: "#e8ecf2",
  brd: "#d6dde6", brdA: "#7090b0", brdS: "#e2e8ef",
  t0: "#0f172a", t1: "#1e293b", t2: "#475569", t3: "#94a3b8", t4: "#cbd5e1",
  accent: "#2563eb", accentBg: "rgba(37,99,235,0.06)",
  ok: "#059669", warn: "#d97706", err: "#dc2626",
  purple: "#7c3aed", cyan: "#0891b2", orange: "#ea580c",
};

// ═══════════════════════════════════════════════════════
// ASSESSMENT METRICS DEFINITION
// ═══════════════════════════════════════════════════════
var METRIC_GROUPS = [
  { group: "Reliability", icon: "⚡", metrics: [
    { key: "outageFrequency", label: "Outage Frequency", desc: "Unplanned downtime events per quarter", initial: 0 },
    { key: "mttr", label: "Mean Time to Resolve", desc: "Hours to restore service after incident", initial: 0 },
  ]},
  { group: "Performance", icon: "☁", metrics: [
    { key: "cloudAppPerformance", label: "Cloud Application Performance", desc: "Latency and throughput to SaaS/IaaS", initial: 0 },
  ]},
  { group: "Security", icon: "🛡", metrics: [
    { key: "securityStackComplexity", label: "Security Stack Complexity", desc: "Overlapping, siloed security platforms and tools", initial: 0 },
    { key: "threatSurfaceExposure", label: "Threat Surface Exposure", desc: "Attack vectors growing with cloud, branches, remote workers", initial: 0 },
    { key: "securityPolicyInconsistency", label: "Security Policy Inconsistency", desc: "Different enforcement rules at HQ vs branches vs cloud vs remote", initial: 0 },
    { key: "zeroTrustReadiness", label: "Zero Trust Readiness", desc: "Distance from least-privilege, continuous verification model", initial: 0 },
    { key: "threatDetectionGaps", label: "Threat Detection & Response Gaps", desc: "Time to detect, investigate, and contain incidents", initial: 0 },
    { key: "secureAccessSprawl", label: "Secure Access Sprawl", desc: "VPN overload, multiple remote access tools, no unified approach", initial: 0 },
    { key: "dataProtectionBurden", label: "Data Protection & Compliance Burden", desc: "Encryption gaps, DLP coverage, regulatory overhead", initial: 0 },
  ]},
  { group: "Operations", icon: "🔧", metrics: [
    { key: "carrierSprawl", label: "Carrier & Circuit Sprawl", desc: "Multi-vendor complexity and cost leakage", initial: 0 },
    { key: "visibilityGaps", label: "Network Visibility Gaps", desc: "Blind spots in traffic and performance", initial: 0 },
    { key: "ticketVolume", label: "Ticket Volume & Escalations", desc: "Operational overhead from manual processes", initial: 0 },
    { key: "manualOps", label: "Manual Operations Burden", desc: "CLI-driven changes, no automation pipeline", initial: 0 },
  ]},
  { group: "Agility", icon: "🚀", metrics: [
    { key: "siteDeployVelocity", label: "Site Deployment Velocity", desc: "Weeks/months to provision new locations", initial: 0 },
  ]},
  { group: "Strategic", icon: "🏢", metrics: [
    { key: "maIntegration", label: "M&A Integration Friction", desc: "Time and complexity to integrate acquisitions", initial: 0 },
  ]},
  { group: "Vendor", icon: "📉", metrics: [
    { key: "vendorSLA", label: "Vendor SLA Performance", desc: "Missed SLAs and accountability gaps", initial: 0 },
  ]},
];

var METRIC_NAMES = {};
METRIC_GROUPS.forEach(function (g) { g.metrics.forEach(function (m) { METRIC_NAMES[m.key] = m.label; }); });

var DEFAULT_ASSESSMENT = {};
METRIC_GROUPS.forEach(function (g) { g.metrics.forEach(function (m) { DEFAULT_ASSESSMENT[m.key] = m.initial; }); });

// ═══════════════════════════════════════════════════════
// ITEMS + MAPPINGS
// ═══════════════════════════════════════════════════════
var INITIAL_ITEMS = [];

var CATEGORY_METRICS = {
  "Cost": ["carrierSprawl", "vendorSLA"],
  "Performance": ["cloudAppPerformance", "outageFrequency"],
  "Complexity": ["carrierSprawl", "manualOps", "ticketVolume"],
  "Security": ["securityStackComplexity", "threatSurfaceExposure", "securityPolicyInconsistency", "zeroTrustReadiness"],
  "Agility": ["siteDeployVelocity", "maIntegration"],
  "Cloud": ["cloudAppPerformance"],
  "Compliance": ["dataProtectionBurden", "securityPolicyInconsistency"],
  "Access": ["secureAccessSprawl", "zeroTrustReadiness"],
  "Threat": ["threatSurfaceExposure", "threatDetectionGaps"],
  "Contractual": ["carrierSprawl"],
  "Operational": ["manualOps", "ticketVolume"],
  "Vendor": ["vendorSLA"],
  "Governance": []
};

var DOMAIN_CATEGORIES = {
  "Reliability": ["Performance", "Complexity"],
  "Performance": ["Performance", "Cloud"],
  "Security": ["Security", "Compliance", "Access", "Threat"],
  "Operations": ["Complexity", "Cost", "Operational"],
  "Agility": ["Agility"],
  "Strategic": ["Agility", "Governance"],
  "Vendor": ["Vendor", "Contractual", "Cost"]
};

// ═══════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════
function Tag({ children, color, style }) {
  return <span style={{
    display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: 3,
    fontSize: 9, fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.4,
    background: color + "18", color: color, border: "1px solid " + color + "30",
    textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: "16px",
    ...(style || {})
  }}>
    {children}
  </span>;
}

function BarFill({ value, color, th, height }) {
  return <div style={{ width: "100%", height: height || 3, borderRadius: 2, background: th.brd, overflow: "hidden" }}>
    <div style={{ width: Math.min(value, 100) + "%", height: "100%", borderRadius: 2, background: color || th.accent, transition: "width 0.4s" }} />
  </div>;
}

function MiniBar({ value, max, color, th }) {
  var pct = ((value || 0) / (max || 10)) * 100;
  return <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 55 }}>
    <div style={{ flex: 1, height: 4, borderRadius: 2, background: th.brd, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: 2, background: color || th.accent }} />
    </div>
    <span style={{ fontSize: 9, fontWeight: 700, color: color || th.accent, fontFamily: "monospace", width: 14, textAlign: "right" }}>{value || 0}</span>
  </div>;
}

function Slider({ label, value, onChange, th, color, showTicks }) {
  var val = value || 0;
  var pct = (val / 10) * 100;
  var c = color || (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok);
  function handleClick(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var nv = Math.max(0, Math.min(10, Math.round((x / rect.width) * 10)));
    onChange(nv);
  }
  return <div style={{ marginBottom: showTicks !== false ? 10 : 4 }}>
    {label && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
      <span style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: "monospace" }}>{val}/10</span>
    </div>}
    <div onClick={handleClick} style={{ width: "100%", height: 20, cursor: "pointer", position: "relative", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: th.brd }} />
      <div style={{ position: "absolute", left: 0, width: pct + "%", height: 6, borderRadius: 3, background: c, transition: "width 0.15s", boxShadow: "0 0 6px " + c + "40" }} />
      <div style={{ position: "absolute", left: "calc(" + pct + "% - 8px)", width: 16, height: 16, borderRadius: 8, background: c, border: "2px solid " + th.bg, boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left 0.15s" }} />
    </div>
    {showTicks !== false && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, pointerEvents: "none" }}>
      {[0, 2, 4, 6, 8, 10].map(function (t) { return <span key={t} style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>{t}</span>; })}
    </div>}
  </div>;
}

function PriorityBadge({ score, th }) {
  var c = score >= 80 ? th.err : score >= 60 ? th.warn : score >= 40 ? th.accent : th.ok;
  var l = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  return <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <div style={{ width: 26, height: 22, borderRadius: 4, background: c + "18", border: "1px solid " + c + "35", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 900, color: c, fontFamily: "monospace" }}>{score}</span>
    </div>
    <Tag color={c}>{l}</Tag>
  </div>;
}

function EditField({ label, value, onChange, th, type, options, placeholder }) {
  var s = { width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, outline: "none", fontFamily: "inherit" };
  return <div style={{ marginBottom: 6 }}>
    <div style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>{label}</div>
    {type === "select" ? <select value={value || ""} onChange={function (e) { onChange(e.target.value); }} style={{ ...s, cursor: "pointer" }}>{(options || []).map(function (o) { return <option key={o} value={o}>{o}</option>; })}</select>
    : type === "textarea" ? <textarea value={value || ""} onChange={function (e) { onChange(e.target.value); }} placeholder={placeholder || ""} style={{ ...s, minHeight: 40, resize: "vertical" }} />
    : type === "number" ? <input type="number" value={value || 0} onChange={function (e) { onChange(Number(e.target.value)); }} style={{ ...s, fontFamily: "monospace" }} />
    : <input type="text" value={value || ""} onChange={function (e) { onChange(e.target.value); }} placeholder={placeholder || ""} style={s} />}
  </div>;
}

function ToggleSwitch({ enabled, onClick, th }) {
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 4, width: "100%", border: "1px solid " + (enabled ? th.ok + "50" : th.err + "50"), background: enabled ? th.ok + "10" : th.err + "10", color: enabled ? th.ok : th.err, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>
    <div style={{ width: 32, height: 16, borderRadius: 8, padding: 2, background: enabled ? th.ok : th.t4 }}>
      <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fff", transition: "transform 0.2s", transform: enabled ? "translateX(16px)" : "translateX(0px)" }} />
    </div>
    {enabled ? "ENABLED — IN SCOPE" : "DISABLED — OUT OF SCOPE"}
  </button>;
}

function NextStep({ label, onClick, th, color }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", marginTop: 8 }}>
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px solid " + (color || th.accent) + "30", background: (color || th.accent) + "06", color: color || th.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>
      {label} <span style={{ fontSize: 14 }}>→</span>
    </button>
  </div>;
}

function AddBtn({ label, onClick, th }) {
  return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 4, border: "1px dashed " + th.accent + "50", background: th.accent + "06", color: th.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, width: "100%" }}>
    <span style={{ fontSize: 14, lineHeight: "14px" }}>+</span> {label}
  </button>;
}

// ═══════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════
function createEngine(assessment, disabledMetrics) {
  var dm = disabledMetrics || {};
  function derive(item, dim) {
    if (dim === "impact" && item.manualImpact != null) return item.manualImpact;
    if (dim === "likelihood" && item.manualLikelihood != null) return item.manualLikelihood;
    if (dim === "urgency" && item.manualUrgency != null) return item.manualUrgency;
    if (dim === "effort" && item.manualEffort != null) return item.manualEffort;
    var linked = (item.linkedMetrics || []).filter(function (k) { return !dm[k]; });
    if (linked.length === 0) return 5;
    var avg = linked.reduce(function (a, k) { return a + (assessment[k] || 0); }, 0) / linked.length;
    if (dim === "impact") return Math.round(avg);
    if (dim === "likelihood") return Math.min(10, Math.round(avg * 0.9 + 1));
    if (dim === "urgency") return Math.max(1, Math.min(10, Math.round(avg + (item.severity === "high" ? 2 : item.severity === "medium" ? 0 : -2))));
    return 5;
  }
  function scores(item) {
    return {
      impact: derive(item, "impact"), likelihood: derive(item, "likelihood"),
      urgency: derive(item, "urgency"), effort: derive(item, "effort"),
      impactSrc: item.manualImpact != null ? "manual" : "derived",
      likelihoodSrc: item.manualLikelihood != null ? "manual" : "derived",
      urgencySrc: item.manualUrgency != null ? "manual" : "derived",
      effortSrc: item.manualEffort != null ? "manual" : "derived",
    };
  }
  function priority(item) {
    var s = scores(item);
    return Math.round((s.impact * 0.35 + s.likelihood * 0.25 + s.urgency * 0.25 + (10 - s.effort) * 0.15) * 10);
  }
  return { derive: derive, scores: scores, priority: priority };
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function PainEngine() {
  var [dark, setDark] = useState(true);
  var th = dark ? DARK : LIGHT;

  var [items, setItems] = useState(INITIAL_ITEMS);
  var [assessment, setAssessment] = useState(DEFAULT_ASSESSMENT);
  var [view, setView] = useState("assess");
  var [expandedId, setExpandedId] = useState(null);
  var [aiSubTab, setAiSubTab] = useState("trace");
  var [strategySubTab, setStrategySubTab] = useState("triage");
  var [aiTrace, setAiTrace] = useState(null);
  var [aiResolution, setAiResolution] = useState(null);
  var [aiLoading, setAiLoading] = useState(false);
  var [disabledDomains, setDisabledDomains] = useState({});
  var [disabledMetrics, setDisabledMetrics] = useState({});

  var engine = useMemo(function () { return createEngine(assessment, disabledMetrics); }, [assessment, disabledMetrics]);

  var sevC = { high: th.err, medium: th.warn, low: th.t3 };
  var statusC = { open: th.err, mitigated: th.warn, resolved: th.ok, accepted: th.purple };

  var active = items.filter(function (i) {
    if (i.enabled === false) return false;
    if (i.domain && disabledDomains[i.domain]) return false;
    return true;
  });
  var pains = items.filter(function (i) { return (i.itemType || "pain") === "pain"; });
  var constraints = items.filter(function (i) { return i.itemType === "constraint"; });
  var activePains = pains.filter(function (i) { return i.enabled !== false; });
  var activeConstraints = constraints.filter(function (i) { return i.enabled !== false; });

  var enabledMetricVals = [];
  METRIC_GROUPS.forEach(function (g) {
    if (disabledDomains[g.group]) return;
    g.metrics.forEach(function (m) {
      if (disabledMetrics[m.key]) return;
      enabledMetricVals.push(assessment[m.key] || 0);
    });
  });
  var overallPain = enabledMetricVals.length > 0 ? Math.round(enabledMetricVals.reduce(function (a, v) { return a + v; }, 0) / enabledMetricVals.length * 10) : 0;
  var groupAvgs = METRIC_GROUPS.map(function (g) {
    var isDomainOff = !!disabledDomains[g.group];
    var vals = g.metrics.filter(function (m) { return !disabledMetrics[m.key]; }).map(function (m) { return assessment[m.key] || 0; });
    return {
      group: g.group, icon: g.icon, disabled: isDomainOff,
      avg: isDomainOff ? 0 : (vals.length > 0 ? Math.round(vals.reduce(function (a, v) { return a + v; }, 0) / vals.length * 10) : 0)
    };
  }).sort(function (a, b) { return b.avg - a.avg; });

  function getItemsForDomain(groupName) {
    var cats = DOMAIN_CATEGORIES[groupName] || [];
    return active.filter(function (item) {
      if (item.domain === groupName) return true;
      return cats.indexOf(item.category) !== -1;
    }).sort(function (a, b) { return engine.priority(b) - engine.priority(a); });
  }

  function updateAssessment(key, val) { setAssessment(function (p) { var n = Object.assign({}, p); n[key] = val; return n; }); }
  function updateItem(id, field, val) { setItems(function (p) { return p.map(function (i) { return i.id === id ? Object.assign({}, i, { [field]: val }) : i; }); }); }
  function updateItemCategory(id, newCat) {
    setItems(function (p) { return p.map(function (i) {
      if (i.id !== id) return i;
      return Object.assign({}, i, { category: newCat, linkedMetrics: CATEGORY_METRICS[newCat] || [] });
    }); });
  }
  function toggleDomain(groupName) {
    setDisabledDomains(function (p) {
      var nn = Object.assign({}, p);
      if (nn[groupName]) { delete nn[groupName]; } else { nn[groupName] = true; }
      return nn;
    });
  }

  function toggleMetric(metricKey) {
    setDisabledMetrics(function (p) {
      var nn = Object.assign({}, p);
      if (nn[metricKey]) { delete nn[metricKey]; } else { nn[metricKey] = true; }
      return nn;
    });
  }

  function toggleItem(id) { var it = items.find(function (i) { return i.id === id; }); if (it) updateItem(id, "enabled", it.enabled === false); }
  function deleteItem(id) {
    setItems(function (p) { return p.filter(function (i) { return i.id !== id; }); });
    if (expandedId === id) setExpandedId(null);
  }

  function addItem(type, domainGroup, metricKey) {
    var nid = "pp" + Date.now();
    var defaultCats = DOMAIN_CATEGORIES[domainGroup] || [];
    var cat = type === "constraint"
      ? (defaultCats.indexOf("Contractual") !== -1 ? "Contractual" : defaultCats.indexOf("Compliance") !== -1 ? "Compliance" : defaultCats.indexOf("Operational") !== -1 ? "Operational" : defaultCats.indexOf("Vendor") !== -1 ? "Vendor" : defaultCats.indexOf("Governance") !== -1 ? "Governance" : "Contractual")
      : (defaultCats[0] || "Cost");
    var linked = metricKey ? [metricKey] : (CATEGORY_METRICS[cat] || []);
    setItems(function (p) { return p.concat([{
      id: nid, itemType: type, category: cat, severity: "medium",
      description: "", sites: "", impact: "", owner: "", status: "open",
      resolution: "", targetDate: "", linkedPattern: "", traceability: "",
      linkedMetrics: linked,
      manualImpact: null, manualLikelihood: null, manualEffort: null, manualUrgency: null,
      domain: domainGroup
    }]); });
    setExpandedId(nid);
  }

  // AI functions (unchanged)
  function runAiTrace() {
    setAiLoading(true); setAiTrace(null);
    var aSum = METRIC_GROUPS.map(function (g) { return g.group + ": " + g.metrics.map(function (m) { return m.label + "=" + assessment[m.key] + "/10"; }).join(", "); }).join("; ");
    var pSum = activePains.map(function (p) { return "[" + p.severity + "] " + p.description; }).join("; ");
    var cSum = activeConstraints.map(function (c) { return "[" + c.severity + "] " + c.description; }).join("; ");
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: "You are a network transformation architect. Given this customer pain assessment, generate a traceability matrix.\n\nASSESSMENT: " + aSum + "\nPAINS: " + pSum + "\nCONSTRAINTS: " + cSum + "\n\nRespond ONLY with valid JSON array: [{painSummary, gttPattern (SD-WAN|SASE|Multi-Cloud|Hybrid Backbone|VDC|EnvisionEDGE|Managed Services), resolution, priority (critical|high|medium|low), phase (1|2|3)}]. No markdown." }] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      try { var t = d.content.map(function (c) { return c.text || ""; }).join(""); setAiTrace(JSON.parse(t.replace(/```json|```/g, "").trim())); }
      catch (e) { setAiTrace([{ painSummary: "Parse error", gttPattern: "\u2014", resolution: String(e), priority: "medium", phase: 1 }]); }
      setAiLoading(false);
    }).catch(function () { setAiTrace([{ painSummary: "API error", gttPattern: "\u2014", resolution: "Could not reach API", priority: "low", phase: 1 }]); setAiLoading(false); });
  }

  function runAiResolve() {
    setAiLoading(true); setAiResolution(null);
    var aSum = METRIC_GROUPS.map(function (g) { return g.group + ": " + g.metrics.map(function (m) { return m.label + "=" + assessment[m.key] + "/10"; }).join(", "); }).join("; ");
    var iSum = active.map(function (i) { return "[" + (i.itemType || "pain") + "|" + i.severity + "|" + i.category + "] " + i.description; }).join("; ");
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: "You are a GTT strategist. Build a phased resolution plan.\n\nASSESSMENT: " + aSum + "\nPain Intensity: " + overallPain + "/100\nISSUES: " + iSum + "\n\nRespond ONLY with valid JSON: {phases:[{phase:1,title:string,duration:string,actions:[{action:string,gttProduct:string,painAddressed:string,expectedImpact:string}]}],quickWins:[string],risks:[string]}. No markdown." }] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      try { var t = d.content.map(function (c) { return c.text || ""; }).join(""); setAiResolution(JSON.parse(t.replace(/```json|```/g, "").trim())); }
      catch (e) { setAiResolution({ phases: [{ phase: 1, title: "Parse error", duration: "\u2014", actions: [{ action: String(e), gttProduct: "\u2014", painAddressed: "\u2014", expectedImpact: "\u2014" }] }], quickWins: [], risks: [] }); }
      setAiLoading(false);
    }).catch(function () { setAiResolution({ phases: [], quickWins: ["API unreachable"], risks: [] }); setAiLoading(false); });
  }

  // Inline item renderer
  function renderInlineItem(item) {
    var isPain = (item.itemType || "pain") === "pain";
    var isOff = item.enabled === false;
    var isExpanded = expandedId === item.id;
    var ac = isPain ? th.err : th.warn;
    var sc = engine.scores(item);
    var pri = engine.priority(item);
    var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;

    function scoreSlider(label, dim, manualField, val, src) {
      var isM = src === "manual";
      var c = dim === "effort" ? (val >= 7 ? th.ok : val >= 4 ? th.warn : th.err) : (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok);
      return <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>{label}</span>
            <span style={{ fontSize: 7, padding: "0 4px", borderRadius: 2, fontFamily: "monospace", fontWeight: 600, background: isM ? th.warn + "20" : th.cyan + "20", color: isM ? th.warn : th.cyan }}>{isM ? "OVERRIDE" : "FROM ASSESSMENT"}</span>
          </div>
          {isM && <button onClick={function (e) { e.stopPropagation(); updateItem(item.id, manualField, null); }} style={{ fontSize: 7, padding: "1px 5px", borderRadius: 2, border: "1px solid " + th.cyan + "40", background: th.cyan + "10", color: th.cyan, cursor: "pointer", fontFamily: "monospace", fontWeight: 600 }}>RESET</button>}
        </div>
        <Slider value={val} onChange={function (v) { updateItem(item.id, manualField, v); }} th={th} color={c} showTicks={false} />
      </div>;
    }

    return <div key={item.id} style={{ marginTop: 6 }}>
      {/* Collapsed row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: isExpanded ? "5px 5px 0 0" : 5, opacity: isOff ? 0.35 : 1,
        border: "1px solid " + (isExpanded ? th.accent + "50" : ac + "18"),
        background: isExpanded ? th.accent + "06" : ac + "04" }}>
        <button onClick={function (e) { e.stopPropagation(); toggleItem(item.id); }}
          style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid " + (isOff ? th.t4 : th.ok + "60"), background: isOff ? th.t4 + "20" : th.ok + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}
          title={isOff ? "Enable — bring into scope" : "Disable — remove from scope"}>
          <span style={{ fontSize: 10, color: isOff ? th.t4 : th.ok }}>{isOff ? "○" : "●"}</span>
        </button>
        <div onClick={function () { setExpandedId(isExpanded ? null : item.id); }}
          style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, cursor: "pointer", minWidth: 0 }}>
        <Tag color={ac} style={{ flexShrink: 0 }}>{isPain ? "PAIN" : "CNST"}</Tag>
        <Tag color={sevC[item.severity]} style={{ flexShrink: 0 }}>{item.severity}</Tag>
        <span style={{ fontSize: 11, color: th.t0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: isOff ? "line-through" : "none" }}>
          {item.description || "(click to describe)"}
        </span>
        {item.linkedPattern && <Tag color={th.accent}>{item.linkedPattern}</Tag>}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {[{ l: "IMP", v: sc.impact }, { l: "URG", v: sc.urgency }].map(function (d) {
            var c2 = d.v >= 7 ? th.err : d.v >= 4 ? th.warn : th.ok;
            return <div key={d.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>{d.l}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c2, fontFamily: "monospace" }}>{d.v}</div>
            </div>;
          })}
          <div style={{ textAlign: "center" }} onClick={function (e) { e.stopPropagation(); }}>
            <div style={{ fontSize: 7, color: th.warn, fontFamily: "monospace", fontWeight: 600 }}>EFF</div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button onClick={function (e) { e.stopPropagation(); updateItem(item.id, "manualEffort", Math.max(1, (sc.effort || 5) - 1)); }}
                style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 10, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>−</button>
              <span style={{ fontSize: 11, fontWeight: 700, color: sc.effort >= 7 ? th.err : sc.effort >= 4 ? th.warn : th.ok, fontFamily: "monospace", minWidth: 14, textAlign: "center" }}>{sc.effort}</span>
              <button onClick={function (e) { e.stopPropagation(); updateItem(item.id, "manualEffort", Math.min(10, (sc.effort || 5) + 1)); }}
                style={{ width: 14, height: 14, borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 10, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
            </div>
          </div>
          <div style={{ width: 30, height: 24, borderRadius: 4, background: priC + "18", border: "1px solid " + priC + "35", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: priC, fontFamily: "monospace" }}>{pri}</span>
          </div>
        </div></div>
        <button onClick={function (e) { e.stopPropagation(); deleteItem(item.id); }}
          style={{ width: 20, height: 20, borderRadius: 4, border: "none", background: "transparent", color: th.t4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, fontSize: 11 }}
          title="Delete issue">
          ✕
        </button>
      </div>

      {/* Expanded panel */}
      {isExpanded && <div style={{ padding: 12, borderRadius: "0 0 5px 5px", background: th.inset, border: "1px solid " + th.accent + "30", borderTop: "none" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>SCORING ENGINE</div>
          <div style={{ fontSize: 8, color: th.t3, marginBottom: 6, lineHeight: 1.4 }}>Scores cascade from the assessment sliders above. Click any slider to override. RESET returns to auto.</div>
          {item.linkedMetrics && item.linkedMetrics.length > 0 && <div style={{ padding: "6px 8px", borderRadius: 4, background: th.cyan + "06", border: "1px solid " + th.cyan + "18", marginBottom: 8 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: th.cyan, fontFamily: "monospace", marginBottom: 6 }}>LINKED ASSESSMENT METRICS — adjust to rescore</div>
            {item.linkedMetrics.map(function (k) {
              var isMetOff = !!disabledMetrics[k];
              var val = assessment[k] || 0;
              var mc = isMetOff ? th.t4 : (val >= 7 ? th.err : val >= 4 ? th.warn : val > 0 ? th.ok : th.t4);
              return <div key={k} style={{ marginBottom: 6, opacity: isMetOff ? 0.35 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: isMetOff ? th.t4 : th.t2, textDecoration: isMetOff ? "line-through" : "none" }}>{METRIC_NAMES[k] || k}{isMetOff ? " (excluded)" : ""}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: mc, fontFamily: "monospace" }}>{isMetOff ? "—" : val + "/10"}</span>
                </div>
                {!isMetOff && <Slider value={val} onChange={function (v) { updateAssessment(k, v); }} th={th} color={mc} showTicks={false} />}
              </div>;
            })}
          </div>}
          <div style={{ padding: 8, borderRadius: 4, background: th.warn + "06", border: "1px solid " + th.warn + "15", marginBottom: 6 }}>
            <div style={{ fontSize: 8, color: th.t3, marginBottom: 4 }}>Set effort based on implementation complexity — this determines triage positioning</div>
            {(item.manualEffort === null || item.manualEffort === undefined) && <div style={{ padding: "6px 8px", borderRadius: 4, background: th.warn + "08", border: "1px solid " + th.warn + "18", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 9, color: th.warn, fontFamily: "monospace", fontWeight: 600 }}>SET EFFORT — ask: "How hard is this to fix?"</span></div>}
            {scoreSlider("EFFORT TO RESOLVE", "effort", "manualEffort", sc.effort, sc.effortSrc)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div>{scoreSlider("BUSINESS IMPACT", "impact", "manualImpact", sc.impact, sc.impactSrc)}</div>
            <div>{scoreSlider("LIKELIHOOD", "likelihood", "manualLikelihood", sc.likelihood, sc.likelihoodSrc)}</div>
            <div>{scoreSlider("URGENCY", "urgency", "manualUrgency", sc.urgency, sc.urgencySrc)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0", borderTop: "1px solid " + th.brd }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>PRIORITY</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: priC, fontFamily: "monospace" }}>{pri}</span>
          </div>
          <div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace", marginTop: 2 }}>(imp\u00D7.35 + lik\u00D7.25 + urg\u00D7.25 + ease\u00D7.15) \u00D7 10</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <EditField label="Type" value={item.itemType || "pain"} onChange={function(v){updateItem(item.id,"itemType",v)}} th={th} type="select" options={["pain","constraint"]} />
          <EditField label="Category" value={item.category} onChange={function(v){updateItemCategory(item.id, v)}} th={th} type="select" options={["Cost","Performance","Complexity","Security","Access","Threat","Agility","Cloud","Compliance","Contractual","Operational","Vendor","Governance"]} />
          <EditField label="Severity" value={item.severity} onChange={function(v){updateItem(item.id,"severity",v)}} th={th} type="select" options={["high","medium","low"]} />
          <EditField label="Status" value={item.status} onChange={function(v){updateItem(item.id,"status",v)}} th={th} type="select" options={["open","mitigated","resolved","accepted"]} />
        </div>
        <EditField label="Description" value={item.description} onChange={function(v){updateItem(item.id,"description",v)}} th={th} type="textarea" placeholder="Describe the issue..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <EditField label="Business Impact" value={item.impact} onChange={function(v){updateItem(item.id,"impact",v)}} th={th} type="textarea" placeholder="Financial, operational, risk..." />
          <EditField label="Affected Sites" value={item.sites} onChange={function(v){updateItem(item.id,"sites",v)}} th={th} placeholder="e.g. All MPLS sites" />
          <EditField label="Owner" value={item.owner} onChange={function(v){updateItem(item.id,"owner",v)}} th={th} placeholder="Team or person" />
          <EditField label="Linked Pattern" value={item.linkedPattern} onChange={function(v){updateItem(item.id,"linkedPattern",v)}} th={th} type="select" options={["","SD-WAN","SASE","Multi-Cloud","Hybrid Backbone","On-Demand","VDC Service Zone","Edge Compute"]} />
        </div>
        <EditField label="Traceability" value={item.traceability} onChange={function(v){updateItem(item.id,"traceability",v)}} th={th} type="textarea" placeholder="Business \u2192 Technical link" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <EditField label="Resolution" value={item.resolution} onChange={function(v){updateItem(item.id,"resolution",v)}} th={th} type="textarea" placeholder="How resolved..." />
          <EditField label="Target Date" value={item.targetDate} onChange={function(v){updateItem(item.id,"targetDate",v)}} th={th} placeholder="YYYY-MM-DD" />
          <EditField label="Annual Cost ($)" value={item.annualCost} onChange={function(v){updateItem(item.id,"annualCost",v)}} th={th} type="number" />
        </div>
      </div>}
    </div>;
  }

  var VIEWS = [
    { id: "assess", label: "Assess & Capture" },
    { id: "strategy", label: "Strategy & Action" },
    { id: "ai", label: "AI Analysis" },
  ];

  return <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: th.bg, color: th.t0, fontFamily: "Outfit, system-ui, sans-serif" }}>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

    {/* HEADER */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", borderBottom: "1px solid " + th.brd, background: th.panel, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: "linear-gradient(135deg, " + th.err + ", " + th.warn + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 900, fontFamily: "monospace" }}>P</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: th.t0 }}>Pain & Constraint Assessment Engine</div>
          <div style={{ fontSize: 8, color: th.t3, fontFamily: "monospace", letterSpacing: 0.5 }}>ARCHITECTURE STUDIO MODULE</div>
        </div>
        <div style={{ width: 1, height: 20, background: th.brd }} />
        <Tag color={overallPain > 0 ? (overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok) : th.t4}>PAIN: {overallPain}/100</Tag>
        <Tag color={th.accent}>{active.length} ACTIVE</Tag>
      </div>
      <button onClick={function () { setDark(!dark); }} style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 12 }}>{dark ? "\u2600" : "\u263E"}</button>
    </div>

    {/* BODY */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, padding: "8px 14px", borderBottom: "1px solid " + th.brd, background: th.panel, flexWrap: "wrap" }}>
          {VIEWS.map(function (v) {
            return <button key={v.id} onClick={function () { setView(v.id); setExpandedId(null); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (view === v.id ? th.accent : th.brd), background: view === v.id ? th.accentBg : "transparent", color: view === v.id ? th.accent : th.t2, cursor: "pointer", fontSize: 11, fontWeight: view === v.id ? 600 : 400 }}>{v.label}</button>;
          })}
        </div>

        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
          {/* ASSESS & CAPTURE */}
          {view === "assess" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Pain Intensity + Heat Map */}
            <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
              <div style={{ width: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>PAIN INTENSITY</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: overallPain > 0 ? (overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok) : th.t4, fontFamily: "monospace", lineHeight: 1 }}>{overallPain}</div>
                <div style={{ fontSize: 9, color: th.t3, fontFamily: "monospace" }}>/100</div>
              </div>
              <div style={{ flex: 1, padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>DOMAIN HEAT MAP</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {groupAvgs.map(function (g) {
                    var isOff = g.disabled;
                    var tileC = isOff ? th.t4 : (g.avg > 0 ? (g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok) : th.t4);
                    return <div key={g.group} onClick={function () { toggleDomain(g.group); }}
                      style={{ flex: "1 1 80px", padding: "8px 10px", borderRadius: 4, background: tileC + "08", textAlign: "center", opacity: isOff ? 0.35 : 1, cursor: "pointer", position: "relative" }}
                      title={isOff ? "Enable " + g.group : "Disable " + g.group}>
                      <div style={{ fontSize: 14 }}>{g.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: tileC, fontFamily: "monospace", textDecoration: isOff ? "line-through" : "none" }}>{isOff ? "\u2014" : g.avg}</div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: isOff ? th.t4 : th.t2 }}>{g.group}</div>
                      <div style={{ position: "absolute", top: 4, right: 4, width: 10, height: 10, borderRadius: "50%", border: "1px solid " + (isOff ? th.t4 : th.ok + "60"), background: isOff ? "transparent" : th.ok + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isOff && <div style={{ width: 4, height: 4, borderRadius: "50%", background: th.ok }} />}
                      </div>
                    </div>;
                  })}
                </div>
              </div>
            </div>

            {/* Guided banner */}
            {active.length === 0 && overallPain === 0 && <div style={{ padding: 14, borderRadius: 6, background: th.accent + "06", border: "1px solid " + th.accent + "20" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 6, letterSpacing: 0.5 }}>WORKSHOP \u2014 ASSESS THE CUSTOMER'S NETWORK</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, marginBottom: 10 }}>Walk through each domain with the customer. Move sliders based on what they tell you. As pain points and constraints emerge from the conversation, add them directly inside the relevant domain card. Scores cascade automatically.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>ASK</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>"Where does your network hurt the most right now?"</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>SCORE</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Move sliders collaboratively \u2014 let the customer see and validate</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>CAPTURE</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Add pain points and constraints inside each domain as they emerge</div>
                </div>
              </div>
            </div>}

            {/* Domain cards */}
            {METRIC_GROUPS.map(function (group) {
              var isDomainOff = !!disabledDomains[group.group];
              var domainItems = getItemsForDomain(group.group);
              var domainPains = domainItems.filter(function (i) { return (i.itemType || "pain") === "pain"; });
              var domainConstraints = domainItems.filter(function (i) { return i.itemType === "constraint"; });
              var domainAvg = groupAvgs.find(function (g) { return g.group === group.group; });
              var avgScore = domainAvg ? domainAvg.avg : 0;
              var avgC = isDomainOff ? th.t4 : (avgScore > 0 ? (avgScore >= 70 ? th.err : avgScore >= 40 ? th.warn : th.ok) : th.t4);

              return <div key={group.group} style={{ borderRadius: 6, background: th.card, border: "1px solid " + th.brd, overflow: "hidden", opacity: isDomainOff ? 0.5 : 1 }}>
                {/* Domain header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
                  <button onClick={function (e) { e.stopPropagation(); toggleDomain(group.group); }}
                    style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (isDomainOff ? th.t4 : th.ok + "60"), background: isDomainOff ? th.t4 + "20" : th.ok + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}
                    title={isDomainOff ? "Enable " + group.group : "Disable " + group.group}>
                    <span style={{ fontSize: 11, color: isDomainOff ? th.t4 : th.ok }}>{isDomainOff ? "\u25CB" : "\u25CF"}</span>
                  </button>
                  <span style={{ fontSize: 16 }}>{group.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isDomainOff ? th.t4 : th.t0, flex: 1, textDecoration: isDomainOff ? "line-through" : "none" }}>{group.group}</span>
                  {!isDomainOff && domainItems.length > 0 && <span style={{ fontSize: 10, color: th.t3, fontFamily: "monospace" }}>{domainItems.length} item{domainItems.length !== 1 ? "s" : ""}</span>}
                  <span style={{ fontSize: 18, fontWeight: 900, color: avgC, fontFamily: "monospace" }}>{isDomainOff ? "\u2014" : avgScore}</span>
                </div>

                {isDomainOff && <div style={{ padding: "8px 14px 10px", borderTop: "1px solid " + th.brd }}>
                  <span style={{ fontSize: 10, color: th.t4, fontFamily: "monospace" }}>DOMAIN EXCLUDED \u2014 click \u25CF to re-enable</span>
                </div>}

                {!isDomainOff && <div>
                {/* Sliders */}
                <div style={{ padding: "0 14px 10px" }}>
                  {group.metrics.map(function (m) {
                    var val = assessment[m.key] || 0;
                    var isMetricOff = !!disabledMetrics[m.key];
                    var sliderC = isMetricOff ? th.t4 : (val > 0 ? (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok) : th.t4);
                    return <div key={m.key} style={{ marginBottom: 8, opacity: isMetricOff ? 0.35 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
                          <button onClick={function (e) { e.stopPropagation(); toggleMetric(m.key); }}
                            style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid " + (isMetricOff ? th.t4 : th.ok + "60"), background: isMetricOff ? th.t4 + "20" : th.ok + "15", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, marginTop: 2 }}
                            title={isMetricOff ? "Enable " + m.label : "Disable " + m.label}>
                            <span style={{ fontSize: 9, color: isMetricOff ? th.t4 : th.ok }}>{isMetricOff ? "\u25CB" : "\u25CF"}</span>
                          </button>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: isMetricOff ? th.t4 : th.t0, textDecoration: isMetricOff ? "line-through" : "none" }}>{m.label}</div>
                            <div style={{ fontSize: 9, color: th.t3 }}>{m.desc}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: sliderC, fontFamily: "monospace" }}>{isMetricOff ? "\u2014" : val}</span>
                      </div>
                      {!isMetricOff && <Slider value={val} onChange={function (v) { updateAssessment(m.key, v); }} th={th} color={sliderC} />}
                      {isMetricOff && <div style={{ height: 20, display: "flex", alignItems: "center" }}><span style={{ fontSize: 9, color: th.t4, fontFamily: "monospace" }}>EXCLUDED FROM SCORING</span></div>}
                      {!isMetricOff && (function () {
                        var metricItems = active.filter(function (it) { return it.linkedMetrics && it.linkedMetrics.indexOf(m.key) !== -1; });
                        return <div style={{ marginTop: 4 }}>
                          {metricItems.map(function (it) { return renderInlineItem(it); })}
                          <button onClick={function (e) { e.stopPropagation(); addItem("pain", group.group, m.key); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, width: "100%", padding: "4px 10px", borderRadius: 4, border: "1px dashed " + th.accent + "30", background: "transparent", color: th.accent, cursor: "pointer", fontSize: 9, fontWeight: 500, marginTop: 4 }}>
                            <span style={{ fontSize: 12, lineHeight: "12px" }}>+</span> Add issue for {m.label}
                          </button>
                        </div>;
                      })()}
                    </div>;
                  })}
                </div>

              </div>}
              </div>;
            })}
          </div>}

          {/* STRATEGY & ACTION */}
          {view === "strategy" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 && <div style={{ padding: 20, borderRadius: 6, background: th.purple + "05", border: "1px solid " + th.purple + "18", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.purple, fontFamily: "monospace", marginBottom: 6 }}>STRATEGY & ACTION — WAITING FOR DATA</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>Capture issues on the Assess & Capture tab first. This view will auto-populate from your scoring data.</div>
              <button onClick={function () { setView("assess"); }} style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid " + th.accent + "30", background: th.accent + "06", color: th.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>Go to Assess & Capture →</button>
            </div>}
            {active.length > 0 && <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {[
                  { id: "triage", label: "Triage Matrix", color: th.accent },
                  { id: "clusters", label: "Solution Clusters", color: th.purple },
                  { id: "bizcase", label: "Business Case", color: th.ok }
                ].map(function (st) {
                  var isOn = strategySubTab === st.id;
                  return <button key={st.id} onClick={function () { setStrategySubTab(st.id); }}
                    style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (isOn ? st.color : th.brd), background: isOn ? st.color + "10" : "transparent", color: isOn ? st.color : th.t2, cursor: "pointer", fontSize: 11, fontWeight: isOn ? 600 : 400 }}>{st.label}</button>;
                })}
              </div>
              {strategySubTab === "triage" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>IMPACT VS EFFORT TRIAGE</div>
                  <div style={{ fontSize: 10, color: th.t3, marginBottom: 10 }}>Issues plotted from your scoring engine — higher = more important, right = harder</div>
                  <div style={{ position: "relative", width: "100%", paddingBottom: "60%", background: th.inset, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "25%", left: "25%", transform: "translate(-50%,-50%)", fontSize: 10, color: th.t4, fontFamily: "monospace", textAlign: "center" }}>MONITOR</div>
                    <div style={{ position: "absolute", top: "25%", right: "25%", transform: "translate(50%,-50%)", fontSize: 10, color: th.t4, fontFamily: "monospace", textAlign: "center" }}>DEPRIORITIZE</div>
                    <div style={{ position: "absolute", bottom: "25%", left: "25%", transform: "translate(-50%,50%)", fontSize: 10, color: th.ok, fontFamily: "monospace", fontWeight: 700, textAlign: "center" }}>QUICK WINS</div>
                    <div style={{ position: "absolute", bottom: "25%", right: "25%", transform: "translate(50%,50%)", fontSize: 10, color: th.warn, fontFamily: "monospace", fontWeight: 700, textAlign: "center" }}>STRATEGIC BETS</div>
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: th.brd }} />
                    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: th.brd }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "50%", height: "50%", background: th.ok + "06" }} />
                    <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: th.t4, fontFamily: "monospace" }}>EFFORT →</div>
                    <div style={{ position: "absolute", left: 4, top: "50%", transform: "rotate(-90deg) translateX(-50%)", transformOrigin: "0 0", fontSize: 8, color: th.t4, fontFamily: "monospace" }}>← IMPACT</div>
                    {active.map(function (item) {
                      var sc = engine.scores(item);
                      var pri = engine.priority(item);
                      var isPain = (item.itemType || "pain") === "pain";
                      var dotC = isPain ? th.err : th.warn;
                      var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                      var x = (sc.effort / 10) * 92 + 4;
                      var y = (1 - sc.impact / 10) * 92 + 4;
                      return <div key={item.id} onClick={function () { setView("assess"); setExpandedId(item.id); }}
                        style={{ position: "absolute", left: x + "%", top: y + "%", transform: "translate(-50%,-50%)", width: 28, height: 28, borderRadius: "50%", background: dotC + "20", border: "2px solid " + dotC, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
                        title={item.description + " (Impact: " + sc.impact + ", Effort: " + sc.effort + ", Priority: " + pri + ")"}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: priC, fontFamily: "monospace" }}>{pri}</span>
                      </div>;
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {active.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                      var isPain = (item.itemType || "pain") === "pain";
                      var dotC = isPain ? th.err : th.warn;
                      var pri = engine.priority(item);
                      var sc = engine.scores(item);
                      var quadrant = sc.impact >= 5 ? (sc.effort < 5 ? "QUICK WIN" : "STRATEGIC") : (sc.effort < 5 ? "MONITOR" : "DEPRIORITIZE");
                      var qC = quadrant === "QUICK WIN" ? th.ok : quadrant === "STRATEGIC" ? th.warn : th.t4;
                      return <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: th.t2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotC, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: qC, fontFamily: "monospace" }}>{pri}</span>
                        <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description || "(untitled)"}</span>
                        <Tag color={qC} style={{ fontSize: 7 }}>{quadrant}</Tag>
                      </div>;
                    })}
                  </div>
                </div>
                {(function () {
                  var qw = active.filter(function (i) { var sc = engine.scores(i); return sc.impact >= 5 && sc.effort < 5; });
                  if (qw.length === 0) return null;
                  return <div style={{ padding: 12, borderRadius: 5, background: th.ok + "06", border: "1px solid " + th.ok + "20" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: th.ok, fontFamily: "monospace", marginBottom: 6 }}>QUICK WINS — START HERE</div>
                    {qw.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                      var pri = engine.priority(item);
                      var sc = engine.scores(item);
                      return <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: th.ok, fontFamily: "monospace", width: 24 }}>{pri}</span>
                        <span style={{ fontSize: 11, color: th.t0, flex: 1 }}>{item.description || "(untitled)"}</span>
                        <span style={{ fontSize: 9, color: th.t3, fontFamily: "monospace" }}>Impact {sc.impact} / Effort {sc.effort}</span>
                      </div>;
                    })}
                  </div>;
                })()}
              </div>}
              <div style={{ padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.warn, fontFamily: "monospace", marginBottom: 4 }}>ADJUST EFFORT — REPOSITION ON MATRIX</div>
                <div style={{ fontSize: 10, color: th.t3, marginBottom: 8 }}>Change effort to move items left (easier) or right (harder) on the triage matrix above.</div>
                {active.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                  var sc = engine.scores(item);
                  var pri = engine.priority(item);
                  var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                  var isPain = (item.itemType || "pain") === "pain";
                  var ac = isPain ? th.err : th.warn;
                  var effC = sc.effort >= 7 ? th.err : sc.effort >= 4 ? th.warn : th.ok;
                  var quadrant = sc.impact >= 5 ? (sc.effort < 5 ? "QUICK WIN" : "STRATEGIC") : (sc.effort < 5 ? "MONITOR" : "DEPRIORITIZE");
                  var qC = quadrant === "QUICK WIN" ? th.ok : quadrant === "STRATEGIC" ? th.warn : th.t4;
                  return <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid " + th.brd }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ac, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: th.t0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description || "(untitled)"}</span>
                    <Tag color={qC} style={{ fontSize: 7 }}>{quadrant}</Tag>
                    <span style={{ fontSize: 9, color: th.t3, fontFamily: "monospace" }}>IMP {sc.impact}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 8, color: th.warn, fontFamily: "monospace" }}>EFF</span>
                      <button onClick={function () { updateItem(item.id, "manualEffort", Math.max(1, sc.effort - 1)); }}
                        style={{ width: 18, height: 18, borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 11, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 800, color: effC, fontFamily: "monospace", minWidth: 16, textAlign: "center" }}>{sc.effort}</span>
                      <button onClick={function () { updateItem(item.id, "manualEffort", Math.min(10, sc.effort + 1)); }}
                        style={{ width: 18, height: 18, borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 11, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: priC, fontFamily: "monospace", width: 20, textAlign: "right" }}>{pri}</span>
                  </div>;
                })}
              </div>
              {strategySubTab === "clusters" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace" }}>SOLUTION PATTERN CLUSTERS</div>
                <div style={{ fontSize: 10, color: th.t3, marginBottom: 4 }}>Issues grouped by GTT solution — separate problems, shared solutions</div>
                {(function () {
                  var patterns = {};
                  active.forEach(function (item) {
                    var p = item.linkedPattern || "Unassigned";
                    if (!patterns[p]) patterns[p] = { items: [], totalCost: 0 };
                    patterns[p].items.push(item);
                    patterns[p].totalCost += (item.annualCost || 0);
                  });
                  var patternColors = { "SD-WAN": th.accent, "SASE": th.ok, "Multi-Cloud": th.orange, "Hybrid Backbone": th.cyan, "On-Demand": th.purple, "VDC Service Zone": th.warn, "Edge Compute": th.err, "Unassigned": th.t3 };
                  return Object.keys(patterns).sort(function (a, b) { return patterns[b].items.length - patterns[a].items.length; }).map(function (pName) {
                    var cluster = patterns[pName];
                    var pc = patternColors[pName] || th.t3;
                    return <div key={pName} style={{ padding: 12, borderRadius: 5, background: pc + "05", border: "1px solid " + pc + "20" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <Tag color={pc}>{pName}</Tag>
                        <span style={{ fontSize: 10, color: th.t3 }}>{cluster.items.length} issue{cluster.items.length !== 1 ? "s" : ""} resolved by one solution</span>
                        {cluster.totalCost > 0 && <span style={{ fontSize: 10, color: th.t3, fontFamily: "monospace", marginLeft: "auto" }}>{"$" + cluster.totalCost.toLocaleString() + "/yr cost"}</span>}
                      </div>
                      {cluster.items.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                        var isPain = (item.itemType || "pain") === "pain";
                        var ic = isPain ? th.err : th.warn;
                        var pri = engine.priority(item);
                        var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                        return <div key={item.id} onClick={function () { setView("assess"); setExpandedId(item.id); }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderTop: "1px solid " + pc + "10", cursor: "pointer" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ic, flexShrink: 0 }} />
                          <Tag color={ic} style={{ flexShrink: 0 }}>{isPain ? "PAIN" : "CNST"}</Tag>
                          <span style={{ fontSize: 11, color: th.t0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description || "(untitled)"}</span>
                          {(item.annualCost || 0) > 0 && <span style={{ fontSize: 9, color: th.t3, fontFamily: "monospace" }}>{"$" + (item.annualCost || 0).toLocaleString()}</span>}
                          <span style={{ fontSize: 11, fontWeight: 800, color: priC, fontFamily: "monospace" }}>{pri}</span>
                        </div>;
                      })}
                    </div>;
                  });
                })()}
                {active.filter(function (i) { return !i.linkedPattern; }).length > 0 && <div style={{ padding: 10, borderRadius: 4, background: th.warn + "06", border: "1px solid " + th.warn + "18" }}>
                  <div style={{ fontSize: 9, color: th.warn, fontFamily: "monospace" }}>TIP: Assign solution patterns to unassigned issues on the Assess & Capture tab (expand issue → Linked Pattern dropdown)</div>
                </div>}
              </div>}
              {strategySubTab === "bizcase" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>BUSINESS CASE — COST OF INACTION</div>
                  <div style={{ fontSize: 10, color: th.t3, marginBottom: 10 }}>Enter the annual cost of each issue — downtime losses, FTE overhead, contract waste, risk exposure.</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 90px", gap: 6, padding: "6px 0", borderBottom: "1px solid " + th.brd }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace" }}>ISSUE</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", textAlign: "right" }}>ANNUAL COST</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", textAlign: "right" }}>PRIORITY</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", textAlign: "right" }}>EST. SAVINGS</span>
                  </div>
                  {active.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                    var pri = engine.priority(item);
                    var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                    var cost = item.annualCost || 0;
                    var savings = Math.round(cost * 0.7);
                    return <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 90px", gap: 6, padding: "8px 0", borderBottom: "1px solid " + th.brd, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: th.t0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description || "(untitled)"}</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                        <span style={{ fontSize: 10, color: th.t3 }}>$</span>
                        <input type="number" value={cost} onChange={function (e) { updateItem(item.id, "annualCost", Number(e.target.value) || 0); }}
                          style={{ width: 70, padding: "3px 6px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.err, fontSize: 11, fontWeight: 700, fontFamily: "monospace", textAlign: "right", outline: "none" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: priC, fontFamily: "monospace", textAlign: "right" }}>{pri}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cost > 0 ? th.ok : th.t4, fontFamily: "monospace", textAlign: "right" }}>{cost > 0 ? "$" + savings.toLocaleString() : "\u2014"}</span>
                    </div>;
                  })}
                  {(function () {
                    var totalCost = active.reduce(function (a, i) { return a + (i.annualCost || 0); }, 0);
                    var totalSavings = Math.round(totalCost * 0.7);
                    return <div style={{ marginTop: 12, padding: 12, borderRadius: 5, background: th.inset, border: "1px solid " + th.brd }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: th.t2 }}>Total annual cost of pain</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: totalCost > 0 ? th.err : th.t4, fontFamily: "monospace" }}>{totalCost > 0 ? "$" + totalCost.toLocaleString() : "$0"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: th.t2 }}>Estimated annual savings (70%)</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color: totalSavings > 0 ? th.ok : th.t4, fontFamily: "monospace" }}>{totalSavings > 0 ? "$" + totalSavings.toLocaleString() : "$0"}</span>
                      </div>
                      {totalCost > 0 && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: "1px solid " + th.brd, marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: th.t2 }}>Payback period (est.)</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: th.accent, fontFamily: "monospace" }}>{totalSavings > 0 ? Math.max(1, Math.round(totalCost / totalSavings * 12)) + " months" : "\u2014"}</span>
                      </div>}
                    </div>;
                  })()}
                  <div style={{ fontSize: 9, color: th.t4, marginTop: 6 }}>Annual cost is editable per issue. Savings estimate assumes 70% reduction.</div>
                </div>
                {(function () {
                  var patterns = {};
                  active.forEach(function (item) {
                    if (!item.linkedPattern) return;
                    if (!patterns[item.linkedPattern]) patterns[item.linkedPattern] = 0;
                    patterns[item.linkedPattern] += (item.annualCost || 0);
                  });
                  var keys = Object.keys(patterns).filter(function (k) { return patterns[k] > 0; });
                  if (keys.length === 0) return null;
                  var patternColors = { "SD-WAN": th.accent, "SASE": th.ok, "Multi-Cloud": th.orange, "Hybrid Backbone": th.cyan, "On-Demand": th.purple, "VDC Service Zone": th.warn, "Edge Compute": th.err };
                  return <div style={{ padding: 12, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>COST BY SOLUTION PATTERN</div>
                    {keys.sort(function (a, b) { return patterns[b] - patterns[a]; }).map(function (p) {
                      var pc = patternColors[p] || th.t3;
                      return <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                        <Tag color={pc}>{p}</Tag>
                        <div style={{ flex: 1 }}><BarFill value={patterns[p] / Math.max.apply(null, keys.map(function (k) { return patterns[k]; })) * 100} color={pc} th={th} height={6} /></div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pc, fontFamily: "monospace" }}>{"$" + patterns[p].toLocaleString()}</span>
                      </div>;
                    })}
                  </div>;
                })()}
              </div>}
            </div>}
            {active.length > 0 && <NextStep label="NEXT: AI ANALYSIS" onClick={function () { setView("ai"); setExpandedId(null); }} th={th} color={th.cyan} />}
          </div>}

          {/* AI ANALYSIS */}
          {view === "ai" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>READINESS:</span>
              <Tag color={overallPain > 0 ? th.ok : th.t4}>{overallPain > 0 ? "\u2713" : "\u2014"} ASSESSMENT</Tag>
              <Tag color={activePains.length > 0 ? th.ok : th.t4}>{activePains.length > 0 ? "\u2713" : "\u2014"} {activePains.length} PAINS</Tag>
              <Tag color={activeConstraints.length > 0 ? th.ok : th.t4}>{activeConstraints.length > 0 ? "\u2713" : "\u2014"} {activeConstraints.length} CONSTRAINTS</Tag>
              <Tag color={active.length > 0 && overallPain > 0 ? th.ok : th.t4}>{active.length > 0 && overallPain > 0 ? "READY" : "NOT READY"}</Tag>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={function () { setAiSubTab("trace"); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (aiSubTab === "trace" ? th.purple : th.brd), background: aiSubTab === "trace" ? th.purple + "10" : "transparent", color: aiSubTab === "trace" ? th.purple : th.t2, cursor: "pointer", fontSize: 11, fontWeight: aiSubTab === "trace" ? 600 : 400 }}>Traceability Matrix</button>
              <button onClick={function () { setAiSubTab("resolve"); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (aiSubTab === "resolve" ? th.cyan : th.brd), background: aiSubTab === "resolve" ? th.cyan + "10" : "transparent", color: aiSubTab === "resolve" ? th.cyan : th.t2, cursor: "pointer", fontSize: 11, fontWeight: aiSubTab === "resolve" ? 600 : 400 }}>Resolution Plan</button>
            </div>
            {(active.length === 0 || overallPain === 0) && <div style={{ padding: 20, borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.purple, fontFamily: "monospace", marginBottom: 6 }}>COMPLETE ASSESSMENT FIRST</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto" }}>The AI needs assessment scores and at least one issue to generate analysis.</div>
              <div style={{ marginTop: 10 }}>
                <button onClick={function () { setView("assess"); }} style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid " + th.accent + "30", background: th.accent + "06", color: th.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>Go to Assess & Capture →</button>
              </div>
            </div>}
            {aiSubTab === "trace" && active.length > 0 && overallPain > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: th.purple, fontFamily: "monospace" }}>AI-DRIVEN TRACEABILITY MATRIX</span>
                <button onClick={runAiTrace} disabled={aiLoading} style={{ padding: "5px 14px", borderRadius: 4, border: "1px solid " + th.purple + "50", background: th.purple + "12", color: th.purple, cursor: aiLoading ? "wait" : "pointer", fontSize: 10, fontWeight: 600 }}>{aiLoading ? "ANALYZING..." : "GENERATE TRACEABILITY"}</button>
              </div>
              <div style={{ padding: 10, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 10, color: th.t2, marginBottom: 8 }}>Sends assessment ({overallPain}/100), {activePains.length} pains, {activeConstraints.length} constraints to AI for GTT solution mapping.</div>
                {!aiTrace && !aiLoading && <div style={{ padding: 20, textAlign: "center", color: th.t3, fontSize: 11 }}>Ready — click "Generate Traceability" to map {active.length} items to GTT solutions</div>}
                {aiLoading && <div style={{ padding: 20, textAlign: "center", color: th.accent, fontSize: 11 }}>Analyzing and mapping to GTT solutions...</div>}
                {aiTrace && <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 60px 40px", gap: 2, padding: "4px 0", borderBottom: "1px solid " + th.brd, marginBottom: 4 }}>{["ISSUE", "GTT PATTERN", "RESOLUTION", "PRIORITY", "PH"].map(function (h) { return <span key={h} style={{ fontSize: 7, fontWeight: 700, color: th.t3, fontFamily: "monospace" }}>{h}</span>; })}</div>
                  {aiTrace.map(function (r, i) { var pc = { critical: th.err, high: th.warn, medium: th.accent, low: th.ok }; return <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 60px 40px", gap: 2, padding: "6px 0", borderBottom: "1px solid " + th.brd, alignItems: "start" }}><span style={{ fontSize: 10, color: th.t0 }}>{r.painSummary}</span><Tag color={th.accent}>{r.gttPattern}</Tag><span style={{ fontSize: 10, color: th.t2 }}>{r.resolution}</span><Tag color={pc[r.priority] || th.t3}>{r.priority}</Tag><Tag color={th.t3}>P{r.phase}</Tag></div>; })}
                </div>}
              </div>
            </div>}
            {aiSubTab === "resolve" && active.length > 0 && overallPain > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: th.cyan, fontFamily: "monospace" }}>AI-DRIVEN RESOLUTION PLAN</span>
                <button onClick={runAiResolve} disabled={aiLoading} style={{ padding: "5px 14px", borderRadius: 4, border: "1px solid " + th.cyan + "50", background: th.cyan + "12", color: th.cyan, cursor: aiLoading ? "wait" : "pointer", fontSize: 10, fontWeight: 600 }}>{aiLoading ? "GENERATING..." : "GENERATE RESOLUTION PLAN"}</button>
              </div>
              <div style={{ padding: 10, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 10, color: th.t2, marginBottom: 8 }}>Generates phased plan with GTT products addressing pain intensity of {overallPain}/100 across {active.length} issues.</div>
                {!aiResolution && !aiLoading && <div style={{ padding: 20, textAlign: "center", color: th.t3, fontSize: 11 }}>Ready — click "Generate Resolution Plan" to create phased roadmap for {active.length} issues</div>}
                {aiLoading && <div style={{ padding: 20, textAlign: "center", color: th.cyan, fontSize: 11 }}>Building phased resolution plan...</div>}
                {aiResolution && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiResolution.quickWins && aiResolution.quickWins.length > 0 && <div style={{ padding: 10, borderRadius: 4, background: th.ok + "08", border: "1px solid " + th.ok + "22" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: th.ok, fontFamily: "monospace", marginBottom: 4 }}>QUICK WINS</div>
                    {aiResolution.quickWins.map(function (q, i) { return <div key={i} style={{ fontSize: 10, color: th.t0, padding: "2px 0" }}>✓ {q}</div>; })}
                  </div>}
                  {(aiResolution.phases || []).map(function (ph) { var pc = [th.accent, th.purple, th.ok]; return <div key={ph.phase} style={{ padding: 12, borderRadius: 5, background: (pc[ph.phase - 1] || th.t3) + "05", border: "1px solid " + (pc[ph.phase - 1] || th.t3) + "20" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Tag color={pc[ph.phase - 1] || th.t3}>PHASE {ph.phase}</Tag><span style={{ fontSize: 12, fontWeight: 700, color: th.t0 }}>{ph.title}</span><span style={{ fontSize: 10, color: th.t3, fontFamily: "monospace" }}>{ph.duration}</span></div>
                    {(ph.actions || []).map(function (a, ai) { return <div key={ai} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 1fr", gap: 6, padding: "6px 0", borderTop: ai > 0 ? "1px solid " + th.brd : "none" }}><span style={{ fontSize: 10, color: th.t0 }}>{a.action}</span><Tag color={th.accent}>{a.gttProduct}</Tag><span style={{ fontSize: 9, color: th.t2 }}>{a.painAddressed}</span><span style={{ fontSize: 9, color: th.ok }}>{a.expectedImpact}</span></div>; })}
                  </div>; })}
                  {aiResolution.risks && aiResolution.risks.length > 0 && <div style={{ padding: 10, borderRadius: 4, background: th.err + "06", border: "1px solid " + th.err + "20" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: th.err, fontFamily: "monospace", marginBottom: 4 }}>RISKS</div>
                    {aiResolution.risks.map(function (r, i) { return <div key={i} style={{ fontSize: 10, color: th.t1, padding: "2px 0" }}>⚠ {r}</div>; })}
                  </div>}
                </div>}
              </div>
            </div>}
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
