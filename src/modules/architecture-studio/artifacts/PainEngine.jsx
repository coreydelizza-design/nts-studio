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
    { key: "securityFragmentation", label: "Security Tool Fragmentation", desc: "Overlapping, siloed security platforms", initial: 0 },
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
  "Security": ["securityFragmentation", "visibilityGaps"],
  "Agility": ["siteDeployVelocity", "maIntegration"],
  "Cloud": ["cloudAppPerformance"],
  "Compliance": ["securityFragmentation"],
  "Contractual": ["carrierSprawl"],
  "Operational": ["manualOps", "ticketVolume"],
  "Vendor": ["vendorSLA"],
  "Governance": []
};

var DOMAIN_CATEGORIES = {
  "Reliability": ["Performance", "Complexity"],
  "Performance": ["Performance", "Cloud"],
  "Security": ["Security", "Compliance"],
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

  function addItem(type, domainGroup) {
    var nid = "pp" + Date.now();
    var defaultCats = DOMAIN_CATEGORIES[domainGroup] || [];
    var cat = type === "constraint"
      ? (defaultCats.indexOf("Contractual") !== -1 ? "Contractual" : defaultCats.indexOf("Compliance") !== -1 ? "Compliance" : defaultCats.indexOf("Operational") !== -1 ? "Operational" : defaultCats.indexOf("Vendor") !== -1 ? "Vendor" : defaultCats.indexOf("Governance") !== -1 ? "Governance" : "Contractual")
      : (defaultCats[0] || "Cost");
    setItems(function (p) { return p.concat([{
      id: nid, itemType: type, category: cat, severity: "medium",
      description: "", sites: "", impact: "", owner: "", status: "open",
      resolution: "", targetDate: "", linkedPattern: "", traceability: "",
      linkedMetrics: CATEGORY_METRICS[cat] || [],
      manualImpact: null, manualLikelihood: null, manualEffort: 5, manualUrgency: null,
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
      <div onClick={function () { setExpandedId(isExpanded ? null : item.id); }}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 5, cursor: "pointer", opacity: isOff ? 0.35 : 1,
          border: "1px solid " + (isExpanded ? th.accent + "50" : ac + "18"),
          background: isExpanded ? th.accent + "06" : ac + "04" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ac, flexShrink: 0 }} />
        <Tag color={ac} style={{ flexShrink: 0 }}>{isPain ? "PAIN" : "CNST"}</Tag>
        <Tag color={sevC[item.severity]} style={{ flexShrink: 0 }}>{item.severity}</Tag>
        <span style={{ fontSize: 11, color: th.t0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: isOff ? "line-through" : "none" }}>
          {item.description || "(click to describe)"}
        </span>
        {item.linkedPattern && <Tag color={th.accent}>{item.linkedPattern}</Tag>}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {[{ l: "IMP", v: sc.impact, s: sc.impactSrc }, { l: "URG", v: sc.urgency, s: sc.urgencySrc }].map(function (d) {
            var c2 = d.v >= 7 ? th.err : d.v >= 4 ? th.warn : th.ok;
            return <div key={d.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>{d.l}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c2, fontFamily: "monospace" }}>{d.v}</div>
            </div>;
          })}
          <div style={{ width: 30, height: 24, borderRadius: 4, background: priC + "18", border: "1px solid " + priC + "35", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: priC, fontFamily: "monospace" }}>{pri}</span>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {isExpanded && <div style={{ padding: 12, borderRadius: "0 0 5px 5px", background: th.inset, border: "1px solid " + th.accent + "30", borderTop: "none" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>SCORING ENGINE</div>
          <div style={{ fontSize: 8, color: th.t3, marginBottom: 6, lineHeight: 1.4 }}>Scores cascade from the assessment sliders above. Click any slider to override. RESET returns to auto.</div>
          {item.linkedMetrics && item.linkedMetrics.length > 0 && <div style={{ padding: "5px 6px", borderRadius: 3, background: th.cyan + "08", border: "1px solid " + th.cyan + "18", marginBottom: 8 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: th.cyan, fontFamily: "monospace", marginBottom: 3 }}>LINKED ASSESSMENT METRICS \u2191</div>
            {item.linkedMetrics.map(function (k) {
              var isMetOff = !!disabledMetrics[k];
              return <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0", opacity: isMetOff ? 0.35 : 1 }}>
              <span style={{ fontSize: 9, color: isMetOff ? th.t4 : th.t2, textDecoration: isMetOff ? "line-through" : "none" }}>{METRIC_NAMES[k] || k}{isMetOff ? " (excluded)" : ""}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isMetOff ? th.t4 : ((assessment[k] || 0) >= 7 ? th.err : (assessment[k] || 0) >= 4 ? th.warn : (assessment[k] || 0) > 0 ? th.ok : th.t4), fontFamily: "monospace" }}>{isMetOff ? "\u2014" : (assessment[k] || 0) + "/10"}</span>
            </div>; })}
          </div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div>{scoreSlider("BUSINESS IMPACT", "impact", "manualImpact", sc.impact, sc.impactSrc)}</div>
            <div>{scoreSlider("LIKELIHOOD", "likelihood", "manualLikelihood", sc.likelihood, sc.likelihoodSrc)}</div>
            <div>{scoreSlider("URGENCY", "urgency", "manualUrgency", sc.urgency, sc.urgencySrc)}</div>
            <div>{scoreSlider("EFFORT TO RESOLVE", "effort", "manualEffort", sc.effort, sc.effortSrc)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0", borderTop: "1px solid " + th.brd }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>PRIORITY</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: priC, fontFamily: "monospace" }}>{pri}</span>
          </div>
          <div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace", marginTop: 2 }}>(imp\u00D7.35 + lik\u00D7.25 + urg\u00D7.25 + ease\u00D7.15) \u00D7 10</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <EditField label="Type" value={item.itemType || "pain"} onChange={function(v){updateItem(item.id,"itemType",v)}} th={th} type="select" options={["pain","constraint"]} />
          <EditField label="Category" value={item.category} onChange={function(v){updateItemCategory(item.id, v)}} th={th} type="select" options={["Cost","Performance","Complexity","Security","Agility","Cloud","Compliance","Contractual","Operational","Vendor","Governance"]} />
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
        </div>
        <div style={{ marginTop: 6 }}><ToggleSwitch enabled={item.enabled !== false} onClick={function(){toggleItem(item.id)}} th={th} /></div>
      </div>}
    </div>;
  }

  var VIEWS = [
    { id: "assess", label: "Assess & Capture" },
    { id: "dashboard", label: "Dashboard" },
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
                    </div>;
                  })}
                </div>

                {/* Items section */}
                <div style={{ padding: "0 14px 10px", borderTop: "1px solid " + th.brd }}>
                  {domainItems.length > 0 && <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", padding: "8px 0 4px", letterSpacing: 0.5 }}>
                    {domainPains.length > 0 ? domainPains.length + " PAIN" + (domainPains.length > 1 ? "S" : "") : ""}
                    {domainPains.length > 0 && domainConstraints.length > 0 ? " \u00B7 " : ""}
                    {domainConstraints.length > 0 ? domainConstraints.length + " CONSTRAINT" + (domainConstraints.length > 1 ? "S" : "") : ""}
                  </div>}
                  {domainItems.map(function (item) { return renderInlineItem(item); })}
                  <button onClick={function () { addItem("pain", group.group); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", padding: "6px 12px", borderRadius: 4, border: "1px dashed " + th.accent + "40", background: th.accent + "04", color: th.accent, cursor: "pointer", fontSize: 10, fontWeight: 500, marginTop: 6 }}>
                    <span style={{ fontSize: 14, lineHeight: "14px" }}>+</span> Add issue
                  </button>
                </div>
              </div>}
              </div>;
            })}
          </div>}

          {/* DASHBOARD — placeholder for Part 2 */}
          {view === "dashboard" && <div style={{ padding: 20, textAlign: "center", color: th.t3 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", marginBottom: 8 }}>DASHBOARD</div>
            <div style={{ fontSize: 11 }}>Part 2 will add the full dashboard view here.</div>
          </div>}

          {/* AI ANALYSIS — placeholder for Part 2 */}
          {view === "ai" && <div style={{ padding: 20, textAlign: "center", color: th.t3 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", marginBottom: 8 }}>AI ANALYSIS</div>
            <div style={{ fontSize: 11 }}>Part 2 will add traceability + resolution plan here.</div>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
