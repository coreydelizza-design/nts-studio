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
// INITIAL ITEMS
// ═══════════════════════════════════════════════════════
var INITIAL_ITEMS = [];

// ═══════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════
function Tag({ children, color, style }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.4, background: color + "18", color: color, border: "1px solid " + color + "30", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: "16px", ...(style || {}) }}>{children}</span>;
}

function BarFill({ value, color, th, height }) {
  return <div style={{ width: "100%", height: height || 4, borderRadius: 2, background: th.brd, overflow: "hidden" }}>
    <div style={{ width: Math.min(value, 100) + "%", height: "100%", borderRadius: 2, background: color || th.accent, transition: "width 0.3s" }} />
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

function NextStep({ label, targetView, setView, setInspData, setEditingId, setInspDomain, th, color }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", marginTop: 8 }}>
    <button onClick={function () { setView(targetView); setInspData(null); setEditingId(null); setInspDomain(null); }}
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
  var [view, setView] = useState("assessment");
  var [editingId, setEditingId] = useState(null);
  var [inspData, setInspData] = useState(null);
  var [filterSev, setFilterSev] = useState("all");
  var [filterCat, setFilterCat] = useState("all");
  var [aiTrace, setAiTrace] = useState(null);
  var [aiResolution, setAiResolution] = useState(null);
  var [aiLoading, setAiLoading] = useState(false);
  var [showAssessmentBanner, setShowAssessmentBanner] = useState(true);
  var [domainNotes, setDomainNotes] = useState({});
  var [domainOverrides, setDomainOverrides] = useState({});
  var [inspDomain, setInspDomain] = useState(null);
  var [customDomains, setCustomDomains] = useState([]);
  var [showAddDomain, setShowAddDomain] = useState(false);
  var [newDomainName, setNewDomainName] = useState("");
  var [newDomainIcon, setNewDomainIcon] = useState("📋");
  var [newDomainMetricLabel, setNewDomainMetricLabel] = useState("");
  var [newDomainMetricDesc, setNewDomainMetricDesc] = useState("");

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

  var allGroups = METRIC_GROUPS.concat(customDomains);
  var allGroupAvgs = allGroups.map(function (g) {
    var vals = g.metrics.map(function (m) { return assessment[m.key] || 0; });
    return { group: g.group, icon: g.icon, avg: vals.length > 0 ? Math.round(vals.reduce(function (a, v) { return a + v; }, 0) / vals.length * 10) : 0 };
  }).sort(function (a, b) { return b.avg - a.avg; });

  function updateDomainNote(domain, text) {
    setDomainNotes(function (p) { var n = Object.assign({}, p); n[domain] = text; return n; });
  }
  function updateDomainOverride(domain, field, val) {
    setDomainOverrides(function (p) {
      var n = Object.assign({}, p);
      n[domain] = Object.assign({}, n[domain] || {}, { [field]: val });
      return n;
    });
  }
  function openDomainInspector(groupName) {
    setInspDomain(groupName);
    setInspData(null);
    setEditingId(null);
  }
  function addCustomDomain() {
    if (!newDomainName.trim() || !newDomainMetricLabel.trim()) return;
    var metricKey = "custom_" + Date.now();
    var newGroup = {
      group: newDomainName.trim(),
      icon: newDomainIcon || "📋",
      metrics: [{ key: metricKey, label: newDomainMetricLabel.trim(), desc: newDomainMetricDesc.trim() || "Custom metric", initial: 5 }]
    };
    setCustomDomains(function (p) { return p.concat([newGroup]); });
    setAssessment(function (p) { var n = Object.assign({}, p); n[metricKey] = 5; return n; });
    setNewDomainName("");
    setNewDomainIcon("📋");
    setNewDomainMetricLabel("");
    setNewDomainMetricDesc("");
    setShowAddDomain(false);
  }

  var allCats = {};
  active.forEach(function (i) { allCats[i.category] = (allCats[i.category] || 0) + 1; });
  var catKeys = Object.keys(allCats).sort(function (a, b) { return allCats[b] - allCats[a]; });

  function updateAssessment(key, val) { setAssessment(function (p) { var n = Object.assign({}, p); n[key] = val; return n; }); }
  function updateItem(id, field, val) { setItems(function (p) { return p.map(function (i) { return i.id === id ? Object.assign({}, i, { [field]: val }) : i; }); }); }
  function toggleItem(id) { var it = items.find(function (i) { return i.id === id; }); if (it) updateItem(id, "enabled", it.enabled === false); }

  var DEFAULT_LINKED_METRICS = {
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

  function addItem(type) {
    var nid = "pp" + Date.now();
    var cat = type === "constraint" ? "Contractual" : "Cost";
    setItems(function (p) { return p.concat([{
      id: nid, itemType: type, category: cat, severity: "medium",
      description: "", sites: "", impact: "", owner: "", status: "open",
      resolution: "", targetDate: "", linkedPattern: "", traceability: "",
      linkedMetrics: DEFAULT_LINKED_METRICS[cat] || [],
      manualImpact: null, manualLikelihood: null, manualEffort: 5, manualUrgency: null
    }]); });
    openEdit(nid);
  }

  function openEdit(id) {
    setEditingId(id);
    setInspData({ id: id });
    setInspDomain(null);
  }

  function filterList(list) {
    return list.filter(function (i) { if (filterSev !== "all" && i.severity !== filterSev) return false; if (filterCat !== "all" && i.category !== filterCat) return false; return true; });
  }

  // AI calls
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
      catch (e) { setAiTrace([{ painSummary: "Parse error", gttPattern: "—", resolution: String(e), priority: "medium", phase: 1 }]); }
      setAiLoading(false);
    }).catch(function () { setAiTrace([{ painSummary: "API error", gttPattern: "—", resolution: "Could not reach API", priority: "low", phase: 1 }]); setAiLoading(false); });
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
      catch (e) { setAiResolution({ phases: [{ phase: 1, title: "Parse error", duration: "—", actions: [{ action: String(e), gttProduct: "—", painAddressed: "—", expectedImpact: "—" }] }], quickWins: [], risks: [] }); }
      setAiLoading(false);
    }).catch(function () { setAiResolution({ phases: [], quickWins: ["API unreachable"], risks: [] }); setAiLoading(false); });
  }

  // Card renderer
  function renderCard(item) {
    var isPain = (item.itemType || "pain") === "pain";
    var isEd = editingId === item.id;
    var isOff = item.enabled === false;
    var ac = isPain ? th.err : th.warn;
    var sc = engine.scores(item);
    var pri = engine.priority(item);
    return <div key={item.id} onClick={function () { openEdit(item.id); }}
      style={{ padding: "10px 14px", borderRadius: 5, background: isEd ? th.accent + "08" : isOff ? th.inset : ac + "05", border: "1px solid " + (isEd ? th.accent + "40" : isOff ? th.brdS : ac + "22"), cursor: "pointer", opacity: isOff ? 0.35 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, flexWrap: "wrap", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {isOff && <Tag color={th.t3}>OFF</Tag>}
          <Tag color={ac}>{isPain ? "PAIN" : "CONSTRAINT"}</Tag>
          <Tag color={sevC[item.severity]}>{item.severity}</Tag>
          <Tag color={th.t3}>{item.category}</Tag>
          <Tag color={statusC[item.status] || th.t3}>{item.status}</Tag>
          {item.linkedPattern && <Tag color={th.accent}>{item.linkedPattern}</Tag>}
        </div>
        <PriorityBadge score={pri} th={th} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: th.t0, textDecoration: isOff ? "line-through" : "none", marginBottom: 5 }}>{item.description || "(click to edit)"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
        {[{ l: "IMPACT", v: sc.impact, s: sc.impactSrc }, { l: "LIKELY", v: sc.likelihood, s: sc.likelihoodSrc }, { l: "EFFORT", v: sc.effort, s: sc.effortSrc }, { l: "URGENT", v: sc.urgency, s: sc.urgencySrc }].map(function (d) {
          var c2 = d.l === "EFFORT" ? (d.v >= 7 ? th.ok : d.v >= 4 ? th.warn : th.err) : (d.v >= 7 ? th.err : d.v >= 4 ? th.warn : th.ok);
          return <div key={d.l}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 7, color: th.t3, fontFamily: "monospace" }}>{d.l}</span><span style={{ fontSize: 6, color: d.s === "derived" ? th.cyan : th.warn, fontFamily: "monospace" }}>{d.s === "derived" ? "AUTO" : "SET"}</span></div>
            <MiniBar value={d.v} color={c2} th={th} />
          </div>;
        })}
      </div>
      {item.linkedMetrics && item.linkedMetrics.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
        <span style={{ fontSize: 7, color: th.t4, fontFamily: "monospace" }}>DRIVEN BY:</span>
        {item.linkedMetrics.map(function (k) { return <span key={k} style={{ fontSize: 7, color: th.cyan, fontFamily: "monospace" }}>{METRIC_NAMES[k] || k}</span>; })}
      </div>}
      {item.owner && <div style={{ marginTop: 3 }}><span style={{ fontSize: 9, color: th.t2 }}><span style={{ color: th.t3, fontFamily: "monospace", fontWeight: 600 }}>OWNER </span>{item.owner}</span></div>}
    </div>;
  }

  // Inspector
  function renderInspector() {
    // DOMAIN INSPECTOR
    if (inspDomain) {
      var dg = allGroups.find(function (g) { return g.group === inspDomain; });
      if (!dg) return null;
      var dOverrides = domainOverrides[inspDomain] || {};
      var dNote = domainNotes[inspDomain] || "";
      var isCustom = customDomains.some(function (cd) { return cd.group === inspDomain; });
      return <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{dg.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: th.accent, fontFamily: "monospace" }}>{inspDomain.toUpperCase()}</span>
          </div>
          {isCustom && <Tag color={th.purple}>CUSTOM</Tag>}
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd, marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>DOMAIN METRICS</div>
          {dg.metrics.map(function (m) {
            var val = assessment[m.key] || 0;
            var ov = dOverrides[m.key];
            var displayVal = ov != null ? ov : val;
            var isOverridden = ov != null;
            return <div key={m.key} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: th.t2 }}>{m.label}</span>
                  <span style={{ fontSize: 7, padding: "0 4px", borderRadius: 2, fontFamily: "monospace", fontWeight: 600, background: isOverridden ? th.warn + "20" : th.cyan + "20", color: isOverridden ? th.warn : th.cyan }}>{isOverridden ? "OVERRIDE" : "ASSESSMENT"}</span>
                </div>
                {isOverridden && <button onClick={function () { updateDomainOverride(inspDomain, m.key, null); updateAssessment(m.key, val); }} style={{ fontSize: 7, padding: "1px 5px", borderRadius: 2, border: "1px solid " + th.cyan + "40", background: th.cyan + "10", color: th.cyan, cursor: "pointer", fontFamily: "monospace", fontWeight: 600 }}>RESET</button>}
              </div>
              <Slider value={isOverridden ? ov : val} onChange={function (v) { updateDomainOverride(inspDomain, m.key, v); updateAssessment(m.key, v); }} th={th} color={displayVal >= 7 ? th.err : displayVal >= 4 ? th.warn : th.ok} showTicks={false} />
            </div>;
          })}
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd, marginBottom: 4 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>DOMAIN NOTES</div>
          <textarea value={dNote} onChange={function (e) { updateDomainNote(inspDomain, e.target.value); }} placeholder={"Notes for " + inspDomain + " domain..."} style={{ width: "100%", minHeight: 60, padding: "6px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, fontFamily: "inherit", resize: "vertical", outline: "none" }} />
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>LINKED PAIN POINTS</div>
          {(function () {
            var linked = items.filter(function (i) { return i.enabled !== false && i.linkedMetrics && i.linkedMetrics.some(function (lm) { return dg.metrics.some(function (dm) { return dm.key === lm; }); }); });
            if (linked.length === 0) return <div style={{ fontSize: 9, color: th.t4, fontStyle: "italic" }}>No pain points linked to this domain</div>;
            return linked.map(function (i) {
              var pri = engine.priority(i);
              return <div key={i.id} onClick={function () { openEdit(i.id); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", borderRadius: 3, cursor: "pointer", marginBottom: 2, background: th.card, border: "1px solid " + th.brd }}>
                <span style={{ fontSize: 9, color: th.t1, flex: 1 }}>{i.description ? i.description.slice(0, 30) : i.id}</span>
                <PriorityBadge score={pri} th={th} />
              </div>;
            });
          })()}
        </div>
        {isCustom && <button onClick={function () {
          var keysToRemove = dg.metrics.map(function (m) { return m.key; });
          setCustomDomains(function (p) { return p.filter(function (cd) { return cd.group !== inspDomain; }); });
          setAssessment(function (p) { var n = Object.assign({}, p); keysToRemove.forEach(function (k) { delete n[k]; }); return n; });
          setDomainNotes(function (p) { var n = Object.assign({}, p); delete n[inspDomain]; return n; });
          setDomainOverrides(function (p) { var n = Object.assign({}, p); delete n[inspDomain]; return n; });
          setInspDomain(null);
        }} style={{ marginTop: 6, padding: "6px 10px", borderRadius: 4, border: "1px solid " + th.err + "40", background: th.err + "08", color: th.err, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace", width: "100%" }}>REMOVE CUSTOM DOMAIN</button>}
      </div>;
    }

    if (!inspData) {
      if (view === "assessment") return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5 }}>ASSESSMENT OVERVIEW</div>
        <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.4 }}>{active.length === 0 ? "Move the sliders on the left. Scores here will update as you add items and link them to metrics." : "Adjust sliders on the left. Click any affected item chip below a slider to inspect its cascading scores here."}</div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 6 }}>DOMAIN SUMMARY</div>
          {allGroupAvgs.map(function (g) {
            var c = g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok;
            return <div key={g.group} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0" }}>
              <span style={{ fontSize: 10, color: th.t2 }}>{g.icon} {g.group}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: "monospace" }}>{g.avg}</span>
            </div>;
          })}
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.accent + "06", border: "1px solid " + th.accent + "18" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace" }}>PAIN INTENSITY</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{overallPain}/100</span>
          </div>
        </div>
      </div>;
      if (view === "dashboard") return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5 }}>DASHBOARD OVERVIEW</div>
        <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.4 }}>Click any card on the left to inspect its scoring breakdown and edit fields.</div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 6 }}>PRIORITY SNAPSHOT</div>
          {[
            { l: "CRITICAL", mn: 80, c: th.err },
            { l: "HIGH", mn: 60, c: th.warn },
            { l: "MEDIUM", mn: 40, c: th.accent },
            { l: "LOW", mn: 0, c: th.ok }
          ].map(function (b) {
            var cnt = active.filter(function (i) { var p = engine.priority(i); return b.mn === 0 ? p < 40 : b.mn === 40 ? p >= 40 && p < 60 : b.mn === 60 ? p >= 60 && p < 80 : p >= 80; }).length;
            return <div key={b.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
              <Tag color={b.c}>{b.l}</Tag>
              <span style={{ fontSize: 13, fontWeight: 700, color: b.c, fontFamily: "monospace" }}>{cnt}</span>
            </div>;
          })}
        </div>
      </div>;
      if (view === "pains") return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6 }}>
        <span style={{ fontSize: 18, color: th.err, opacity: 0.3 }}>◈</span>
        <span style={{ fontSize: 10, color: th.t3, textAlign: "center" }}>Click a pain point to inspect</span>
        <span style={{ fontSize: 9, color: th.t4, textAlign: "center" }}>View scoring breakdown, edit fields, and toggle scope</span>
      </div>;
      if (view === "constraints") return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6 }}>
        <span style={{ fontSize: 18, color: th.warn, opacity: 0.3 }}>◈</span>
        <span style={{ fontSize: 10, color: th.t3, textAlign: "center" }}>Click a constraint to inspect</span>
        <span style={{ fontSize: 9, color: th.t4, textAlign: "center" }}>View scoring breakdown, edit fields, and toggle scope</span>
      </div>;
      if (view === "aiTrace") return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: th.purple, fontFamily: "monospace", letterSpacing: 0.5 }}>AI CONTEXT</div>
        <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.4 }}>The AI will analyze these inputs when you click "Generate Traceability":</div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Pain Intensity</span><span style={{ fontSize: 12, fontWeight: 800, color: overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{overallPain}/100</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Active Pains</span><span style={{ fontSize: 12, fontWeight: 700, color: th.err, fontFamily: "monospace" }}>{activePains.length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Active Constraints</span><span style={{ fontSize: 12, fontWeight: 700, color: th.warn, fontFamily: "monospace" }}>{activeConstraints.length}</span></div>
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.purple + "06", border: "1px solid " + th.purple + "18" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.purple, fontFamily: "monospace", marginBottom: 4 }}>TOP DOMAINS</div>
          {allGroupAvgs.slice(0, 3).map(function (g) { return <div key={g.group} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>{g.icon} {g.group}</span><span style={{ fontSize: 11, fontWeight: 700, color: g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{g.avg}</span></div>; })}
        </div>
      </div>;
      if (view === "aiResolve") return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: th.cyan, fontFamily: "monospace", letterSpacing: 0.5 }}>AI CONTEXT</div>
        <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.4 }}>The AI will build a phased plan from these inputs when you click "Generate Resolution Plan":</div>
        <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + th.brd }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Pain Intensity</span><span style={{ fontSize: 12, fontWeight: 800, color: overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{overallPain}/100</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Total Active Issues</span><span style={{ fontSize: 12, fontWeight: 700, color: th.accent, fontFamily: "monospace" }}>{active.length}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>Critical Priority</span><span style={{ fontSize: 12, fontWeight: 700, color: th.err, fontFamily: "monospace" }}>{active.filter(function (i) { return engine.priority(i) >= 80; }).length}</span></div>
        </div>
        <div style={{ padding: 8, borderRadius: 4, background: th.cyan + "06", border: "1px solid " + th.cyan + "18" }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: th.cyan, fontFamily: "monospace", marginBottom: 4 }}>TOP DOMAINS</div>
          {allGroupAvgs.slice(0, 3).map(function (g) { return <div key={g.group} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ fontSize: 10, color: th.t2 }}>{g.icon} {g.group}</span><span style={{ fontSize: 11, fontWeight: 700, color: g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{g.avg}</span></div>; })}
        </div>
      </div>;
      return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.3 }}>
        <span style={{ fontSize: 18, color: th.t4 }}>◈</span>
        <span style={{ fontSize: 10, color: th.t3, textAlign: "center", marginTop: 6 }}>Select item to inspect</span>
      </div>;
    }

    var pp = items.find(function (i) { return i.id === inspData.id; });
    if (!pp) return null;
    var isPain = (pp.itemType || "pain") === "pain";
    var sc = engine.scores(pp);
    var pri = engine.priority(pp);

    function scoreSlider(label, dim, manualField, val, src) {
      var isM = src === "manual";
      var c = dim === "effort" ? (val >= 7 ? th.ok : val >= 4 ? th.warn : th.err) : (val >= 7 ? th.err : val >= 4 ? th.warn : th.ok);
      return <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>{label}</span>
            <span style={{ fontSize: 7, padding: "0 4px", borderRadius: 2, fontFamily: "monospace", fontWeight: 600, background: isM ? th.warn + "20" : th.cyan + "20", color: isM ? th.warn : th.cyan }}>{isM ? "OVERRIDE" : "FROM ASSESSMENT"}</span>
          </div>
          {isM && <button onClick={function () { updateItem(pp.id, manualField, null); }} style={{ fontSize: 7, padding: "1px 5px", borderRadius: 2, border: "1px solid " + th.cyan + "40", background: th.cyan + "10", color: th.cyan, cursor: "pointer", fontFamily: "monospace", fontWeight: 600 }}>RESET</button>}
        </div>
        <Slider value={val} onChange={function (v) { updateItem(pp.id, manualField, v); }} th={th} color={c} showTicks={false} />
      </div>;
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: isPain ? th.err : th.warn, fontFamily: "monospace" }}>{isPain ? "PAIN POINT" : "CONSTRAINT"}</span>
        <PriorityBadge score={pri} th={th} />
      </div>
      <div style={{ padding: 8, borderRadius: 4, background: th.inset, border: "1px solid " + (view === "assessment" ? th.cyan + "40" : th.brd), marginBottom: 4 }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>SCORING ENGINE</div>
        <div style={{ fontSize: 8, color: th.t3, marginBottom: 6, lineHeight: 1.4 }}>Scores cascade from assessment metrics. Click slider to override. RESET returns to auto.</div>
        {pp.linkedMetrics && pp.linkedMetrics.length > 0 && <div style={{ padding: "5px 6px", borderRadius: 3, background: th.cyan + "08", border: "1px solid " + th.cyan + "18", marginBottom: 8 }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: th.cyan, fontFamily: "monospace", marginBottom: 3 }}>LINKED METRICS</div>
          {pp.linkedMetrics.map(function (k) { return <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}>
            <span style={{ fontSize: 9, color: th.t2 }}>{METRIC_NAMES[k] || k}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: (assessment[k] || 0) >= 7 ? th.err : (assessment[k] || 0) >= 4 ? th.warn : th.ok, fontFamily: "monospace" }}>{assessment[k] || 0}/10</span>
          </div>; })}
        </div>}
        {scoreSlider("BUSINESS IMPACT", "impact", "manualImpact", sc.impact, sc.impactSrc)}
        {scoreSlider("LIKELIHOOD", "likelihood", "manualLikelihood", sc.likelihood, sc.likelihoodSrc)}
        {scoreSlider("URGENCY", "urgency", "manualUrgency", sc.urgency, sc.urgencySrc)}
        {scoreSlider("EFFORT TO RESOLVE", "effort", "manualEffort", sc.effort, sc.effortSrc)}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0", borderTop: "1px solid " + th.brd }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: th.t3, fontFamily: "monospace" }}>PRIORITY</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok, fontFamily: "monospace" }}>{pri}</span>
        </div>
        <div style={{ fontSize: 7, color: th.t4, fontFamily: "monospace", marginTop: 2 }}>(imp×.35 + lik×.25 + urg×.25 + ease×.15) × 10</div>
      </div>
      <EditField label="Type" value={pp.itemType || "pain"} onChange={function(v){updateItem(pp.id,"itemType",v)}} th={th} type="select" options={["pain","constraint"]} />
      <EditField label="Category" value={pp.category} onChange={function(v){ updateItem(pp.id, "category", v); updateItem(pp.id, "linkedMetrics", DEFAULT_LINKED_METRICS[v] || []); }} th={th} type="select" options={["Cost","Performance","Complexity","Security","Agility","Cloud","Compliance","Contractual","Operational","Vendor","Governance"]} />
      <EditField label="Severity" value={pp.severity} onChange={function(v){updateItem(pp.id,"severity",v)}} th={th} type="select" options={["high","medium","low"]} />
      <EditField label="Status" value={pp.status} onChange={function(v){updateItem(pp.id,"status",v)}} th={th} type="select" options={["open","mitigated","resolved","accepted"]} />
      <EditField label="Description" value={pp.description} onChange={function(v){updateItem(pp.id,"description",v)}} th={th} type="textarea" placeholder="Describe the issue..." />
      <EditField label="Business Impact" value={pp.impact} onChange={function(v){updateItem(pp.id,"impact",v)}} th={th} type="textarea" placeholder="Financial, operational, risk..." />
      <EditField label="Affected Sites" value={pp.sites} onChange={function(v){updateItem(pp.id,"sites",v)}} th={th} placeholder="e.g. All MPLS sites" />
      <EditField label="Owner" value={pp.owner} onChange={function(v){updateItem(pp.id,"owner",v)}} th={th} placeholder="Team or person" />
      <EditField label="Linked Pattern" value={pp.linkedPattern} onChange={function(v){updateItem(pp.id,"linkedPattern",v)}} th={th} type="select" options={["","SD-WAN","SASE","Multi-Cloud","Hybrid Backbone","On-Demand","VDC Service Zone","Edge Compute"]} />
      <EditField label="Traceability" value={pp.traceability} onChange={function(v){updateItem(pp.id,"traceability",v)}} th={th} type="textarea" placeholder="Business → Technical link" />
      <EditField label="Resolution" value={pp.resolution} onChange={function(v){updateItem(pp.id,"resolution",v)}} th={th} type="textarea" placeholder="How resolved..." />
      <EditField label="Target Date" value={pp.targetDate} onChange={function(v){updateItem(pp.id,"targetDate",v)}} th={th} placeholder="YYYY-MM-DD" />
      <div style={{ marginTop: 6 }}><ToggleSwitch enabled={pp.enabled !== false} onClick={function(){toggleItem(pp.id)}} th={th} /></div>
    </div>;
  }

  var VIEWS = [
    { id: "assessment", label: "Assessment" },
    { id: "dashboard", label: "Dashboard" },
    { id: "pains", label: "Pains (" + activePains.length + ")" },
    { id: "constraints", label: "Constraints (" + activeConstraints.length + ")" },
    { id: "aiTrace", label: "AI Traceability" },
    { id: "aiResolve", label: "AI Resolution" },
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
        <Tag color={overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok}>PAIN: {overallPain}/100</Tag>
        <Tag color={th.accent}>{active.length} ACTIVE</Tag>
      </div>
      <button onClick={function () { setDark(!dark); }} style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid " + th.brd, background: th.input, color: th.t2, cursor: "pointer", fontSize: 12 }}>{dark ? "☀" : "☾"}</button>
    </div>

    {/* BODY */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* CENTER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* View tabs */}
        <div style={{ display: "flex", gap: 3, padding: "8px 14px", borderBottom: "1px solid " + th.brd, background: th.panel, flexWrap: "wrap" }}>
          {VIEWS.map(function (v) {
            return <button key={v.id} onClick={function () { setView(v.id); setInspData(null); setEditingId(null); setInspDomain(null); }} style={{ padding: "5px 12px", borderRadius: 4, border: "1px solid " + (view === v.id ? th.accent : th.brd), background: view === v.id ? th.accentBg : "transparent", color: view === v.id ? th.accent : th.t2, cursor: "pointer", fontSize: 11, fontWeight: view === v.id ? 600 : 400 }}>{v.label}</button>;
          })}
        </div>

        <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
          {/* ASSESSMENT */}
          {view === "assessment" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 && <div style={{ padding: 14, borderRadius: 6, background: th.accent + "06", border: "1px solid " + th.accent + "20" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 6, letterSpacing: 0.5 }}>STEP 1 — ASSESS THE CUSTOMER'S NETWORK</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, marginBottom: 10 }}>Walk through each domain with the customer. Move sliders based on what they tell you — 0 means "no issue" and 10 means "severe." Start with the domain they mention first. The Pain Intensity score will build as you go.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>ASK</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>"Where does your network hurt the most right now?"</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>SCORE</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Move sliders collaboratively — let the customer see and validate</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 3 }}>THEN</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Move to Pains tab to capture specific issues as they emerge</div>
                </div>
              </div>
            </div>}
            {showAssessmentBanner && <div style={{ position: "relative", padding: 14, borderRadius: 6, background: th.accent + "06", border: "1px solid " + th.accent + "20" }}>
              <button onClick={function () { setShowAssessmentBanner(false); }} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: th.t3, padding: 4 }}>✕</button>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5, marginBottom: 6 }}>NETWORK PAIN ASSESSMENT</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, marginBottom: 10 }}>Rate your customer's network environment across 7 domains using the sliders below. Each slider scores a specific pain dimension from 0 (no issue) to 10 (severe). These assessment values automatically cascade into every pain point and constraint — driving their Impact, Likelihood, and Urgency scores in real time. The overall Pain Intensity score (top left) is the average of all 11 metrics scaled to 100.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5, marginBottom: 3 }}>CASCADING</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Moving a slider instantly updates scores on every linked pain and constraint</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5, marginBottom: 3 }}>OVERRIDABLE</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>Any auto-derived score can be manually overridden in the Inspector panel</div>
                </div>
                <div style={{ flex: 1, padding: "8px 10px", borderRadius: 4, background: th.card, border: "1px solid " + th.brd }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: th.accent, fontFamily: "monospace", letterSpacing: 0.5, marginBottom: 3 }}>DOMAIN MAP</div>
                  <div style={{ fontSize: 10, color: th.t3, lineHeight: 1.3 }}>The heat map below highlights which domains need the most attention</div>
                </div>
              </div>
            </div>}
            <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
              <div style={{ width: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 4 }}>PAIN INTENSITY</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: overallPain >= 70 ? th.err : overallPain >= 40 ? th.warn : th.ok, fontFamily: "monospace", lineHeight: 1 }}>{overallPain}</div>
                <div style={{ fontSize: 9, color: th.t3, fontFamily: "monospace" }}>/100</div>
              </div>
              <div style={{ flex: 1, padding: 14, borderRadius: 6, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>DOMAIN HEAT MAP</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {allGroupAvgs.map(function (g) {
                    return <div key={g.group} onClick={function () { openDomainInspector(g.group); }} style={{ flex: "1 1 80px", padding: "8px 10px", borderRadius: 4, background: (g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok) + "08", textAlign: "center", cursor: "pointer", border: inspDomain === g.group ? "1px solid " + th.accent : "1px solid transparent", transition: "border 0.2s" }}>
                      <div style={{ fontSize: 14 }}>{g.icon}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok, fontFamily: "monospace" }}>{g.avg}</div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: th.t2 }}>{g.group}</div>
                      {domainNotes[g.group] && <div style={{ fontSize: 7, color: th.accent, fontFamily: "monospace", marginTop: 2 }}>HAS NOTES</div>}
                    </div>;
                  })}
                </div>
              </div>
            </div>
            {allGroups.map(function (group) {
              return <div key={group.group} style={{ padding: 14, borderRadius: 5, background: th.card, border: inspDomain === group.group ? "1px solid " + th.accent : "1px solid " + th.brd, transition: "border 0.2s" }}>
                <div onClick={function () { openDomainInspector(group.group); }} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 16 }}>{group.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: inspDomain === group.group ? th.accent : th.t0 }}>{group.group}</span>
                  <span style={{ fontSize: 8, color: th.t4, fontFamily: "monospace", marginLeft: "auto" }}>INSPECT ▸</span>
                </div>
                {group.metrics.map(function (m) {
                  var val = assessment[m.key] || 0;
                  var affected = active.filter(function (it) { return it.linkedMetrics && it.linkedMetrics.indexOf(m.key) !== -1; });
                  return <div key={m.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div><div style={{ fontSize: 11, fontWeight: 600, color: th.t0 }}>{m.label}</div><div style={{ fontSize: 9, color: th.t3 }}>{m.desc}</div></div>
                      <span style={{ fontSize: 20, fontWeight: 900, color: val >= 7 ? th.err : val >= 4 ? th.warn : th.ok, fontFamily: "monospace" }}>{val}</span>
                    </div>
                    <Slider value={val} onChange={function (v) { updateAssessment(m.key, v); }} th={th} color={val >= 7 ? th.err : val >= 4 ? th.warn : th.ok} />
                    {affected.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      <span style={{ fontSize: 7, color: th.t4, fontFamily: "monospace", alignSelf: "center" }}>DRIVES:</span>
                      {affected.map(function (it) {
                        var isPain = (it.itemType || "pain") === "pain";
                        var ac = isPain ? th.err : th.warn;
                        var pri = engine.priority(it);
                        var priC = pri >= 80 ? th.err : pri >= 60 ? th.warn : pri >= 40 ? th.accent : th.ok;
                        var isSelected = inspData && inspData.id === it.id;
                        return <button key={it.id} onClick={function (e) { e.stopPropagation(); openEdit(it.id); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 3, fontSize: 9, fontWeight: 500, cursor: "pointer", border: "1px solid " + (isSelected ? th.accent + "60" : ac + "25"), background: isSelected ? th.accent + "12" : ac + "06", color: th.t1, fontFamily: "inherit", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: ac, flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{it.description ? (it.description.length > 35 ? it.description.substring(0, 35) + "…" : it.description) : "(untitled)"}</span>
                          <span style={{ fontSize: 8, fontWeight: 800, color: priC, fontFamily: "monospace", flexShrink: 0 }}>{pri}</span>
                        </button>;
                      })}
                    </div>}
                  </div>;
                })}
              </div>;
            })}
            <div style={{ padding: 14, borderRadius: 5, background: th.card, border: "1px dashed " + th.accent + "40" }}>
              {!showAddDomain ? <button onClick={function () { setShowAddDomain(true); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 12px", borderRadius: 4, border: "1px dashed " + th.accent + "50", background: th.accent + "06", color: th.accent, cursor: "pointer", fontSize: 11, fontWeight: 600 }}><span style={{ fontSize: 16, lineHeight: "16px" }}>+</span> Add Custom Domain</button>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: th.accent, fontFamily: "monospace" }}>NEW CUSTOM DOMAIN</div>
                <div style={{ fontSize: 9, color: th.t3, lineHeight: 1.4 }}>Add a domain requested by the customer. This creates a new assessment category with its own metric slider.</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>DOMAIN NAME</div><input value={newDomainName} onChange={function (e) { setNewDomainName(e.target.value); }} placeholder="e.g. Compliance" style={{ width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, outline: "none" }} /></div>
                  <div style={{ width: 50 }}><div style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>ICON</div><input value={newDomainIcon} onChange={function (e) { setNewDomainIcon(e.target.value); }} style={{ width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, outline: "none", textAlign: "center" }} /></div>
                </div>
                <div><div style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>METRIC LABEL</div><input value={newDomainMetricLabel} onChange={function (e) { setNewDomainMetricLabel(e.target.value); }} placeholder="e.g. Regulatory Compliance Gap" style={{ width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, outline: "none" }} /></div>
                <div><div style={{ fontSize: 8, fontWeight: 600, color: th.t3, fontFamily: "monospace", marginBottom: 2 }}>METRIC DESCRIPTION</div><input value={newDomainMetricDesc} onChange={function (e) { setNewDomainMetricDesc(e.target.value); }} placeholder="e.g. Gap between current state and regulatory requirements" style={{ width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 11, outline: "none" }} /></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={function () { addCustomDomain(); }} style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid " + th.accent + "50", background: th.accent + "10", color: th.accent, cursor: "pointer", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }}>ADD DOMAIN</button>
                  <button onClick={function () { setShowAddDomain(false); setNewDomainName(""); setNewDomainIcon("📋"); setNewDomainMetricLabel(""); setNewDomainMetricDesc(""); }} style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid " + th.brd, background: "transparent", color: th.t3, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>CANCEL</button>
                </div>
              </div>}
            </div>
            <NextStep label="NEXT: CAPTURE PAIN POINTS" targetView="pains" setView={setView} setInspData={setInspData} setEditingId={setEditingId} setInspDomain={setInspDomain} th={th} color={th.err} />
          </div>}

          {/* DASHBOARD */}
          {view === "dashboard" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 && overallPain === 0 && <div style={{ padding: 20, borderRadius: 6, background: th.accent + "05", border: "1px solid " + th.accent + "18", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.accent, fontFamily: "monospace", marginBottom: 6 }}>DASHBOARD — WAITING FOR DATA</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>This view summarizes your assessment results. Complete these steps first:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 300, margin: "0 auto", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (overallPain > 0 ? th.ok : th.t4), background: overallPain > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: overallPain > 0 ? th.ok : th.t4, flexShrink: 0 }}>{overallPain > 0 ? "✓" : "1"}</div>
                  <span style={{ fontSize: 11, color: overallPain > 0 ? th.ok : th.t1 }}>Set assessment sliders (Assessment tab)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (activePains.length > 0 ? th.ok : th.t4), background: activePains.length > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: activePains.length > 0 ? th.ok : th.t4, flexShrink: 0 }}>{activePains.length > 0 ? "✓" : "2"}</div>
                  <span style={{ fontSize: 11, color: activePains.length > 0 ? th.ok : th.t1 }}>Add pain points (Pains tab)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid " + (activeConstraints.length > 0 ? th.ok : th.t4), background: activeConstraints.length > 0 ? th.ok + "15" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: activeConstraints.length > 0 ? th.ok : th.t4, flexShrink: 0 }}>{activeConstraints.length > 0 ? "✓" : "3"}</div>
                  <span style={{ fontSize: 11, color: activeConstraints.length > 0 ? th.ok : th.t1 }}>Add constraints (Constraints tab)</span>
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
                {allGroupAvgs.map(function (g) { return <div key={g.group} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><span style={{ fontSize: 12 }}>{g.icon}</span><span style={{ width: 70, fontSize: 10, color: th.t2 }}>{g.group}</span><div style={{ flex: 1 }}><BarFill value={g.avg} color={g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok} th={th} height={6} /></div><span style={{ fontSize: 11, fontWeight: 700, color: g.avg >= 70 ? th.err : g.avg >= 40 ? th.warn : th.ok, fontFamily: "monospace", width: 20, textAlign: "right" }}>{g.avg}</span></div>; })}
              </div>
              <div style={{ padding: 12, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: th.t3, fontFamily: "monospace", marginBottom: 8 }}>PRIORITY BANDS</div>
                {[{ l: "CRITICAL", mn: 80, c: th.err }, { l: "HIGH", mn: 60, c: th.warn }, { l: "MEDIUM", mn: 40, c: th.accent }, { l: "LOW", mn: 0, c: th.ok }].map(function (b) {
                  var cnt = active.filter(function (i) { var p = engine.priority(i); return b.mn === 0 ? p < 40 : b.mn === 40 ? p >= 40 && p < 60 : b.mn === 60 ? p >= 60 && p < 80 : p >= 80; }).length;
                  return <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}><Tag color={b.c}>{b.l}</Tag><div style={{ flex: 1 }}><BarFill value={active.length > 0 ? (cnt / active.length) * 100 : 0} color={b.c} th={th} height={6} /></div><span style={{ fontSize: 13, fontWeight: 700, color: b.c, fontFamily: "monospace", width: 16, textAlign: "right" }}>{cnt}</span></div>;
                })}
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 5, background: th.err + "05", border: "1px solid " + th.err + "20" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: th.err, fontFamily: "monospace", marginBottom: 6 }}>HIGHEST PRIORITY ITEMS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{active.sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).slice(0, 5).map(function (it) { return renderCard(it); })}</div>
            </div></>}
            <NextStep label="NEXT: DRILL INTO PAINS" targetView="pains" setView={setView} setInspData={setInspData} setEditingId={setEditingId} setInspDomain={setInspDomain} th={th} color={th.err} />
          </div>}

          {/* PAINS */}
          {view === "pains" && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {pains.length === 0 && <div style={{ padding: 20, borderRadius: 6, background: th.err + "05", border: "1px solid " + th.err + "18", textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.err, fontFamily: "monospace", marginBottom: 6 }}>STEP 2 — CAPTURE PAIN POINTS</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>As the customer describes their network problems, add each one here. The scoring engine will automatically prioritize them based on your assessment sliders.</div>
              <button onClick={function () { addItem("pain"); }} style={{ padding: "8px 20px", borderRadius: 4, border: "1px solid " + th.err + "50", background: th.err + "12", color: th.err, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>+ ADD FIRST PAIN POINT</button>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                {["Cost pressure", "Performance issues", "Security gaps", "Operational complexity"].map(function (ex) {
                  return <span key={ex} style={{ fontSize: 9, color: th.t3, padding: "3px 8px", borderRadius: 3, background: th.inset, border: "1px solid " + th.brd }}>{ex}</span>;
                })}
              </div>
              <div style={{ fontSize: 9, color: th.t4, marginTop: 6 }}>Common pain categories — items will auto-link to your assessment sliders</div>
            </div>}
            {pains.length > 0 && <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              <select value={filterSev} onChange={function (e) { setFilterSev(e.target.value); }} style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 10 }}><option value="all">All Severities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
              <select value={filterCat} onChange={function (e) { setFilterCat(e.target.value); }} style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 10 }}><option value="all">All Categories</option>{catKeys.map(function (c) { return <option key={c} value={c}>{c}</option>; })}</select>
            </div>}
            {filterList(pains).sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(renderCard)}
            {pains.length > 0 && <AddBtn label="Add pain point" onClick={function () { addItem("pain"); }} th={th} />}
            <NextStep label="NEXT: REVIEW CONSTRAINTS" targetView="constraints" setView={setView} setInspData={setInspData} setEditingId={setEditingId} setInspDomain={setInspDomain} th={th} color={th.warn} />
          </div>}

          {/* CONSTRAINTS */}
          {view === "constraints" && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {constraints.length === 0 && <div style={{ padding: 20, borderRadius: 6, background: th.warn + "05", border: "1px solid " + th.warn + "18", textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.warn, fontFamily: "monospace", marginBottom: 6 }}>STEP 3 — CAPTURE CONSTRAINTS</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto", marginBottom: 12 }}>Constraints are things the customer can't change — contracts, compliance rules, resource limits, governance policies. These shape what solutions are possible.</div>
              <button onClick={function () { addItem("constraint"); }} style={{ padding: "8px 20px", borderRadius: 4, border: "1px solid " + th.warn + "50", background: th.warn + "12", color: th.warn, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>+ ADD FIRST CONSTRAINT</button>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                {["Contract lock-in", "Compliance / GDPR", "Headcount freeze", "Vendor commitment"].map(function (ex) {
                  return <span key={ex} style={{ fontSize: 9, color: th.t3, padding: "3px 8px", borderRadius: 3, background: th.inset, border: "1px solid " + th.brd }}>{ex}</span>;
                })}
              </div>
              <div style={{ fontSize: 9, color: th.t4, marginTop: 6 }}>Common constraint types — "what can't we change?"</div>
            </div>}
            {constraints.length > 0 && <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              <select value={filterSev} onChange={function (e) { setFilterSev(e.target.value); }} style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 10 }}><option value="all">All Severities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
              <select value={filterCat} onChange={function (e) { setFilterCat(e.target.value); }} style={{ padding: "3px 8px", borderRadius: 3, border: "1px solid " + th.brd, background: th.input, color: th.t0, fontSize: 10 }}><option value="all">All Categories</option>{catKeys.map(function (c) { return <option key={c} value={c}>{c}</option>; })}</select>
            </div>}
            {filterList(constraints).sort(function (a, b) { return engine.priority(b) - engine.priority(a); }).map(renderCard)}
            {constraints.length > 0 && <AddBtn label="Add constraint" onClick={function () { addItem("constraint"); }} th={th} />}
            <NextStep label="NEXT: AI SOLUTION MAPPING" targetView="aiTrace" setView={setView} setInspData={setInspData} setEditingId={setEditingId} setInspDomain={setInspDomain} th={th} color={th.purple} />
          </div>}

          {/* AI TRACEABILITY */}
          {view === "aiTrace" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: th.purple, fontFamily: "monospace" }}>AI-DRIVEN TRACEABILITY MATRIX</span>
              <button onClick={runAiTrace} disabled={aiLoading || active.length === 0} style={{ padding: "5px 14px", borderRadius: 4, border: "1px solid " + th.purple + "50", background: th.purple + "12", color: th.purple, cursor: aiLoading ? "wait" : "pointer", fontSize: 10, fontWeight: 600 }}>{aiLoading ? "ANALYZING..." : "GENERATE TRACEABILITY"}</button>
            </div>
            <div style={{ padding: 10, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
              <div style={{ fontSize: 10, color: th.t2, marginBottom: 8 }}>Sends assessment ({overallPain}/100), {activePains.length} pains, {activeConstraints.length} constraints to AI for GTT solution mapping.</div>
              {!aiTrace && !aiLoading && active.length === 0 && <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.purple, fontFamily: "monospace", marginBottom: 6 }}>STEP 4 — AI SOLUTION MAPPING</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto" }}>The AI will map your pain points and constraints to GTT solution patterns. Complete these steps first:</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
                <Tag color={overallPain > 0 ? th.ok : th.t4}>{overallPain > 0 ? "✓" : "—"} ASSESSMENT</Tag>
                <Tag color={activePains.length > 0 ? th.ok : th.t4}>{activePains.length > 0 ? "✓" : "—"} PAINS</Tag>
                <Tag color={activeConstraints.length > 0 ? th.ok : th.t4}>{activeConstraints.length > 0 ? "✓" : "—"} CONSTRAINTS</Tag>
              </div>
            </div>}
            {!aiTrace && !aiLoading && active.length > 0 && <div style={{ padding: 20, textAlign: "center", color: th.t3, fontSize: 11 }}>Ready — click "Generate Traceability" to map {active.length} items to GTT solutions</div>}
              {aiLoading && <div style={{ padding: 20, textAlign: "center", color: th.accent, fontSize: 11 }}>Analyzing and mapping to GTT solutions...</div>}
              {aiTrace && <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 60px 40px", gap: 2, padding: "4px 0", borderBottom: "1px solid " + th.brd, marginBottom: 4 }}>{["ISSUE", "GTT PATTERN", "RESOLUTION", "PRIORITY", "PH"].map(function (h) { return <span key={h} style={{ fontSize: 7, fontWeight: 700, color: th.t3, fontFamily: "monospace" }}>{h}</span>; })}</div>
                {aiTrace.map(function (r, i) { var pc = { critical: th.err, high: th.warn, medium: th.accent, low: th.ok }; return <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr 60px 40px", gap: 2, padding: "6px 0", borderBottom: "1px solid " + th.brd, alignItems: "start" }}><span style={{ fontSize: 10, color: th.t0 }}>{r.painSummary}</span><Tag color={th.accent}>{r.gttPattern}</Tag><span style={{ fontSize: 10, color: th.t2 }}>{r.resolution}</span><Tag color={pc[r.priority] || th.t3}>{r.priority}</Tag><Tag color={th.t3}>P{r.phase}</Tag></div>; })}
              </div>}
            </div>
            <NextStep label="NEXT: RESOLUTION PLAN" targetView="aiResolve" setView={setView} setInspData={setInspData} setEditingId={setEditingId} setInspDomain={setInspDomain} th={th} color={th.cyan} />
          </div>}

          {/* AI RESOLUTION */}
          {view === "aiResolve" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: th.cyan, fontFamily: "monospace" }}>AI-DRIVEN RESOLUTION PLAN</span>
              <button onClick={runAiResolve} disabled={aiLoading || active.length === 0} style={{ padding: "5px 14px", borderRadius: 4, border: "1px solid " + th.cyan + "50", background: th.cyan + "12", color: th.cyan, cursor: aiLoading ? "wait" : "pointer", fontSize: 10, fontWeight: 600 }}>{aiLoading ? "GENERATING..." : "GENERATE RESOLUTION PLAN"}</button>
            </div>
            <div style={{ padding: 10, borderRadius: 5, background: th.card, border: "1px solid " + th.brd }}>
              <div style={{ fontSize: 10, color: th.t2, marginBottom: 8 }}>Generates phased plan with GTT products addressing pain intensity of {overallPain}/100 across {active.length} issues.</div>
              {!aiResolution && !aiLoading && active.length === 0 && <div style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: th.cyan, fontFamily: "monospace", marginBottom: 6 }}>STEP 5 — AI RESOLUTION PLAN</div>
              <div style={{ fontSize: 11, color: th.t2, lineHeight: 1.5, maxWidth: 400, margin: "0 auto" }}>The AI will build a phased implementation plan with GTT products. Complete the earlier steps first.</div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
                <Tag color={overallPain > 0 ? th.ok : th.t4}>{overallPain > 0 ? "✓" : "—"} ASSESSMENT</Tag>
                <Tag color={activePains.length > 0 ? th.ok : th.t4}>{activePains.length > 0 ? "✓" : "—"} PAINS</Tag>
                <Tag color={activeConstraints.length > 0 ? th.ok : th.t4}>{activeConstraints.length > 0 ? "✓" : "—"} CONSTRAINTS</Tag>
              </div>
            </div>}
            {!aiResolution && !aiLoading && active.length > 0 && <div style={{ padding: 20, textAlign: "center", color: th.t3, fontSize: 11 }}>Ready — click "Generate Resolution Plan" to create phased roadmap for {active.length} issues</div>}
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
        </div>
      </div>

      {/* RIGHT RAIL — INSPECTOR */}
      <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid " + th.brd, background: th.panel, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "6px 10px", borderBottom: "1px solid " + th.brd, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: th.t3, fontFamily: "monospace", letterSpacing: 1 }}>INSPECTOR</span>
          {(inspData || inspDomain) && <button onClick={function () { setInspData(null); setEditingId(null); setInspDomain(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: th.t3 }}>✕</button>}
        </div>
        <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>{renderInspector()}</div>
      </div>
    </div>
  </div>;
}
