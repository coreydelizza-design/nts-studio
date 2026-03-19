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

function NextStep({ label, onClick, th, color }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", marginTop: 8 }}>
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 4, border: "1px solid " + (color || th.accent) + "30", background: (color || th.accent) + "06", color: color || th.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>
      {label} <span style={{ fontSize: 14 }}>→</span>
    </button>
  </div>;
}

// ═══════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════
function createEngine(assessment) {
  function derive(item, dim) {
    if (dim === "impact" && item.manualImpact != null) return item.manualImpact;
    if (dim === "likelihood" && item.manualLikelihood != null) return item.manualLikelihood;
    if (dim === "urgency" && item.manualUrgency != null) return item.manualUrgency;
    if (dim === "effort" && item.manualEffort != null) return item.manualEffort;
    var linked = item.linkedMetrics || [];
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

  var engine = useMemo(function () { return createEngine(assessment); }, [assessment]);

  var sevC = { high: th.err, medium: th.warn, low: th.t3 };
  var statusC = { open: th.err, mitigated: th.warn, resolved: th.ok, accepted: th.purple };

  var active = items.filter(function (i) { return i.enabled !== false; });
  var pains = items.filter(function (i) { return (i.itemType || "pain") === "pain"; });
  var constraints = items.filter(function (i) { return i.itemType === "constraint"; });
  var activePains = pains.filter(function (i) { return i.enabled !== false; });
  var activeConstraints = constraints.filter(function (i) { return i.enabled !== false; });

  var allMetricVals = Object.values(assessment);
  var overallPain = allMetricVals.length > 0 ? Math.round(allMetricVals.reduce(function (a, v) { return a + v; }, 0) / allMetricVals.length * 10) : 0;
  var groupAvgs = METRIC_GROUPS.map(function (g) {
    var vals = g.metrics.map(function (m) { return assessment[m.key] || 0; });
    return { group: g.group, icon: g.icon, avg: vals.length > 0 ? Math.round(vals.reduce(function (a, v) { return a + v; }, 0) / vals.length * 10) : 0 };
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
            {item.linkedMetrics.map(function (k) { return <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}>
              <span style={{ fontSize: 9, color: th.t2 }}>{METRIC_NAMES[k] || k}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: (assessment[k] || 0) >= 7 ? th.err : (assessment[k] || 0) >= 4 ? th.warn : (assessment[k] || 0) > 0 ? th.ok : th.t4, fontFamily: "monospace" }}>{assessment[k] || 0}/10</span>
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
                    return <div key={g.group} style={{ flex: "1 1 80px", padding: "8px 10px", borderRadius: 4, background: (g.avg > 0 ? (g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok) : th.t4) + "08", textAlign: "center" }}>
                      <div style={{ fontSize: 14 }}>{g.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: g.avg > 0 ? (g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok) : th.t4, fontFamily: "monospace" }}>{g.avg}</div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: th.t2 }}>{g.group}</div>
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
              var domainItems = getItemsForDomain(group.group);
              var domainPains = domainItems.filter(function (i) { return (i.itemType || "pain") === "pain"; });
              var domainConstraints = domainItems.filter(function (i) { return i.itemType === "constraint"; });
              var domainAvg = groupAvgs.find(function (g) { return g.group === group.group; });
              var avgScore = domainAvg ? domainAvg.avg : 0;
              var avgC = avgScore > 0 ? (avgScore >= 70 ? th.err : avgScore >= 40 ? th.warn : th.ok) : th.t4;

              return <div key={group.group} style={{ borderRadius: 6, background: th.card, border: "1px solid " + th.brd, overflow: "hidden" }}>
                {/* Domain header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
                  <span style={{ fontSize: 16 }}>{group.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: th.t0, flex: 1 }}>{group.group}</span>
                  {domainItems.length > 0 && <span style={{ fontSize: 10, color: th.t3, fontFamily: "monospace" }}>{domainItems.length} item{domainItems.length !== 1 ? "s" : ""}</span>}
                  <span style={{ fontSize: 18, fontWeight: 900, color: avgC, fontFamily: "monospace" }}>{avgScore}</span>
                </div>

                {/* Sliders */}
                <div style={{ padding: "0 14px 10px" }}>
                  {group.metrics.map(function (m) {
                    var val = assessment[m.key] || 0;
                    return <div key={m.key} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <div><div style={{ fontSize: 11, fontWeight: 600, color: th.t0 }}>{m.label}</div><div style={{ fontSize: 9, color: th.t3 }}>{m.desc}</div></div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: val > 0 ? (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok) : th.t4, fontFamily: "monospace" }}>{val}</span>
                      </div>
                      <Slider value={val} onChange={function (v) { updateAssessment(m.key, v); }} th={th} color={val > 0 ? (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok) : th.t4} />
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
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button onClick={function () { addItem("pain", group.group); }} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, padding: "5px 10px", borderRadius: 4, border: "1px dashed " + th.err + "40", background: th.err + "04", color: th.err, cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                      <span style={{ fontSize: 13, lineHeight: "13px" }}>+</span> Pain point
                    </button>
                    <button onClick={function () { addItem("constraint", group.group); }} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, padding: "5px 10px", borderRadius: 4, border: "1px dashed " + th.warn + "40", background: th.warn + "04", color: th.warn, cursor: "pointer", fontSize: 10, fontWeight: 500 }}>
                      <span style={{ fontSize: 13, lineHeight: "13px" }}>+</span> Constraint
                    </button>
                  </div>
                </div>
              </div>;
            })}
            <NextStep label="NEXT: VIEW DASHBOARD" onClick={function () { setView("dashboard"); setExpandedId(null); }} th={th} />
          </div>}

          {/* DASHBOARD */}
          {view === "dashboard" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 && overallPain === 0 && <div style={{ padding: 20, borderRadius: 6, background: th.accent + "05", border: "1px solid " + th.accent + "18", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 6 }}>DASHBOARD — WAITING FOR DATA</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>Complete the assessment and capture items on the Assess & Capture tab first.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 300, margin: "0 auto", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (overallPain > 0 ? th.ok : th.t4), background: overallPain > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: overallPain > 0 ? th.ok : th.t4, flexShrink: 0 }}>{overallPain > 0 ? "✓" : "1"}</div>
                  <span style={{ fontSize: 11, color: overallPain > 0 ? th.ok : th.t1 }}>Set assessment sliders</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (activePains.length > 0 ? th.ok : th.t4), background: activePains.length > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: activePains.length > 0 ? th.ok : th.t4, flexShrink: 0 }}>{activePains.length > 0 ? "✓" : "2"}</div>
                  <span style={{ fontSize: 11, color: activePains.length > 0 ? th.ok : th.t1 }}>Capture pain points</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (activeConstraints.length > 0 ? th.ok : th.t4), background: activeConstraints.length > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: activeConstraints.length > 0 ? th.ok : th.t4, flexShrink: 0 }}>{activeConstraints.length > 0 ? "✓" : "3"}</div>
                  <span style={{ fontSize: 11, color: activeConstraints.length > 0 ? th.ok : th.t1 }}>Capture constraints</span>
                </div>
              </div>
            </div>}
            {(active.length > 0 || overallPain > 0) && <><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { l: "Pain Intensity", v: overallPain, c: overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok },
                { l: "Pain Points", v: activePains.length, c: th.err },
                { l: "Constraints", v: activeConstraints.length, c: th.warn },
                { l: "Critical (80+)", v: active.filter(function (i) { return engine.priority(i) >= 80; }).length, c: th.err },
                { l: "Open", v: active.filter(function (i) { return i.status === "open"; }).length, c: th.err },
              ].map(function (s) { return <div key={s.l} style={{ padding: "6px 12px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd, minWidth: 90, textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: "monospace" }}>{s.v}</div><div style={{ fontSize: 7, color: th.t3, fontFamily: "monospace", letterSpacing: 0.5 }}>{s.l.toUpperCase()}</div></div>; })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ padding: 12, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>DOMAINS BY SEVERITY</div>
                {groupAvgs.map(function (g) { return <div key={g.group} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><span style={{ fontSize: 12 }}>{g.icon}</span><span style={{ width: 70, fontSize: 10, color: th.t2 }}>{g.group}</span><div style={{ flex: 1 }}><BarFill value={g.avg} color={g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : g.avg > 0 ? th.ok : th.t4} th={th} height={6} /></div><span style={{ fontSize: 11, fontWeight: 700, color: g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : g.avg > 0 ? th.ok : th.t4, fontFamily: "monospace", width: 20, textAlign: "right" }}>{g.avg}</span></div>; })}
              </div>
              <div style={{ padding: 12, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>PRIORITY BANDS</div>
                {[{ l: "CRITICAL", mn: 80, c: th.err }, { l: "HIGH", mn: 60, c: th.warn }, { l: "MEDIUM", mn: 40, c: th.accent }, { l: "LOW", mn: 0, c: th.ok }].map(function (b) {
                  var cnt = active.filter(function (i) { var p = engine.priority(i); return b.mn === 0 ? p < 40 : b.mn === 40 ? p >= 40 && p < 60 : b.mn === 60 ? p >= 60 && p < 80 : p >= 80; }).length;
                  return <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}><Tag color={b.c}>{b.l}</Tag><div style={{ flex: 1 }}><BarFill value={active.length > 0 ? (cnt / active.length) * 100 : 0} color={b.c} th={th} height={6} /></div><span style={{ fontSize: 13, fontWeight: 700, color: b.c, fontFamily: "monospace", width: 16, textAlign: "right" }}>{cnt}</span></div>;
                })}
              </div>
            </div>
            {active.length > 0 && <div style={{ padding: 12, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>ALL ITEMS BY PRIORITY</div>
              {active.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(function (item) {
                var isPain = (item.itemType || "pain") === "pain";
                var ac = isPain ? th.err : th.warn;
                var pri = engine.priority(item);
                var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                var sc = engine.scores(item);
                return <div key={item.id} onClick={function () { setView("assess"); setExpandedId(item.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 4, cursor: "pointer", borderBottom: "1px solid " + th.brd + "80" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: ac, flexShrink: 0 }} />
                  <Tag color={ac} style={{ flexShrink: 0 }}>{isPain ? "PAIN" : "CNST"}</Tag>
                  <span style={{ fontSize: 11, color: th.t0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.description || "(untitled)"}
                  </span>
                  <span style={{ fontSize: 9, color: th.t3, fontFamily: "monospace", flexShrink: 0 }}>{item.domain || item.category}</span>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>IMP</div><div style={{ fontSize: 10, fontWeight: 700, color: sc.impact >= 7 ? th.err : sc.impact >= 4 ? th.warn : th.ok, fontFamily: "monospace" }}>{sc.impact}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>URG</div><div style={{ fontSize: 10, fontWeight: 700, color: sc.urgency >= 7 ? th.err : sc.urgency >= 4 ? th.warn : th.ok, fontFamily: "monospace" }}>{sc.urgency}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>EFF</div><div style={{ fontSize: 10, fontWeight: 700, color: sc.effort >= 7 ? th.ok : sc.effort >= 4 ? th.warn : th.err, fontFamily: "monospace" }}>{sc.effort}</div></div>
                  </div>
                  <div style={{ width: 30, height: 24, borderRadius: 4, background: priC + "18", border: "1px solid " + priC + "35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: priC, fontFamily: "monospace" }}>{pri}</span>
                  </div>
                </div>;
              })}
              <div style={{ fontSize: 9, color: th.t4, textAlign: "center", padding: "8px 0 2px", fontFamily: "monospace" }}>Click any row to navigate to its domain and edit</div>
            </div>}</>}
            <NextStep label="NEXT: AI ANALYSIS" onClick={function () { setView("ai"); setExpandedId(null); }} th={th} color={th.purple} />
          </div>}

          {/* AI ANALYSIS */}
          {view === "ai" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>READINESS:</span>
              <Tag color={overallPain > 0 ? th.ok : th.t4}>{overallPain > 0 ? "✓" : "—"} ASSESSMENT</Tag>
              <Tag color={activePains.length > 0 ? th.ok : th.t4}>{activePains.length > 0 ? "✓" : "—"} {activePains.length} PAINS</Tag>
              <Tag color={activeConstraints.length > 0 ? th.ok : th.t4}>{activeConstraints.length > 0 ? "✓" : "—"} {activeConstraints.length} CONSTRAINTS</Tag>
              <Tag color={active.length > 0 && overallPain > 0 ? th.ok : th.t4}>{active.length > 0 && overallPain > 0 ? "READY" : "NOT READY"}</Tag>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={function () { setAiSubTab("trace"); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (aiSubTab === "trace" ? th.purple : th.brd), background: aiSubTab === "trace" ? th.purple + "10" : "transparent", color: aiSubTab === "trace" ? th.purple : th.t2, cursor: "pointer", fontSize: 11, fontWeight: aiSubTab === "trace" ? 600 : 400 }}>Traceability Matrix</button>
              <button onClick={function () { setAiSubTab("resolve"); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (aiSubTab === "resolve" ? th.cyan : th.brd), background: aiSubTab === "resolve" ? th.cyan + "10" : "transparent", color: aiSubTab === "resolve" ? th.cyan : th.t2, cursor: "pointer", fontSize: 11, fontWeight: aiSubTab === "resolve" ? 600 : 400 }}>Resolution Plan</button>
            </div>
            {(active.length === 0 || overallPain === 0) && <div style={{ padding: 20, borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.purple, fontFamily: "monospace", marginBottom: 6 }}>COMPLETE ASSESSMENT FIRST</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto" }}>The AI needs assessment scores and at least one pain point or constraint to generate analysis. Go to the Assess & Capture tab to add data.</div>
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
