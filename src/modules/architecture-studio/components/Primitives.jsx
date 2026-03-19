// architecture-studio/src/components/Primitives.jsx
// Shared UI components used across all modules

export function Tag({ children, color, style }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: 3,
      fontSize: 9, fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.4,
      background: color + "18", color: color, border: "1px solid " + color + "30",
      textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: "16px",
      ...(style || {})
    }}>
      {children}
    </span>
  );
}

export function Bar({ value, color, theme, height }) {
  return (
    <div style={{ width: "100%", height: height || 3, borderRadius: 2, background: theme.brd, overflow: "hidden" }}>
      <div style={{ width: Math.min(value, 100) + "%", height: "100%", borderRadius: 2, background: color || theme.accent, transition: "width 0.4s" }} />
    </div>
  );
}

export function MiniBar({ value, max, color, theme }) {
  var pct = ((value || 0) / (max || 10)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 55 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: theme.brd, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 2, background: color || theme.accent }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color: color || theme.accent, fontFamily: "monospace", width: 14, textAlign: "right" }}>{value || 0}</span>
    </div>
  );
}

export function Slider({ label, value, onChange, theme, color, showTicks }) {
  var val = value || 0;
  var pct = (val / 10) * 100;
  var c = color || (val >= 7 ? theme.err : val >= 4 ? theme.warn : theme.ok);
  function handleClick(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    var nv = Math.max(0, Math.min(10, Math.round(((e.clientX - rect.left) / rect.width) * 10)));
    onChange(nv);
  }
  return (
    <div style={{ marginBottom: showTicks !== false ? 10 : 4 }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 8, fontWeight: 600, color: theme.t3, fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: "monospace" }}>{val}/10</span>
      </div>}
      <div onClick={handleClick} style={{ width: "100%", height: 20, cursor: "pointer", position: "relative", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, background: theme.brd }} />
        <div style={{ position: "absolute", left: 0, width: pct + "%", height: 6, borderRadius: 3, background: c, transition: "width 0.15s", boxShadow: "0 0 6px " + c + "40" }} />
        <div style={{ position: "absolute", left: "calc(" + pct + "% - 8px)", width: 16, height: 16, borderRadius: 8, background: c, border: "2px solid " + theme.bg, boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left 0.15s" }} />
      </div>
      {showTicks !== false && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        {[0, 2, 4, 6, 8, 10].map(function (t) { return <span key={t} style={{ fontSize: 7, color: theme.t4, fontFamily: "monospace" }}>{t}</span>; })}
      </div>}
    </div>
  );
}

export function PriorityBadge({ score, theme }) {
  var c = score >= 80 ? theme.err : score >= 60 ? theme.warn : score >= 40 ? theme.accent : theme.ok;
  var l = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 26, height: 22, borderRadius: 4, background: c + "18", border: "1px solid " + c + "35", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: c, fontFamily: "monospace" }}>{score}</span>
      </div>
      <Tag color={c}>{l}</Tag>
    </div>
  );
}

export function EditField({ label, value, onChange, theme, type, options, placeholder }) {
  var s = { width: "100%", padding: "4px 8px", borderRadius: 3, border: "1px solid " + theme.brd, background: theme.input, color: theme.t0, fontSize: 11, outline: "none", fontFamily: "inherit" };
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: theme.t3, fontFamily: "monospace", marginBottom: 2 }}>{label}</div>
      {type === "select" ? <select value={value || ""} onChange={function (e) { onChange(e.target.value); }} style={{ ...s, cursor: "pointer" }}>{(options || []).map(function (o) { return <option key={o} value={o}>{o}</option>; })}</select>
      : type === "textarea" ? <textarea value={value || ""} onChange={function (e) { onChange(e.target.value); }} placeholder={placeholder} style={{ ...s, minHeight: 40, resize: "vertical" }} />
      : type === "number" ? <input type="number" value={value || 0} onChange={function (e) { onChange(Number(e.target.value)); }} style={{ ...s, fontFamily: "monospace" }} />
      : <input type="text" value={value || ""} onChange={function (e) { onChange(e.target.value); }} placeholder={placeholder} style={s} />}
    </div>
  );
}

export function ToggleSwitch({ enabled, onClick, theme }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 4, width: "100%",
      border: "1px solid " + (enabled ? theme.ok + "50" : theme.err + "50"),
      background: enabled ? theme.ok + "10" : theme.err + "10",
      color: enabled ? theme.ok : theme.err, cursor: "pointer", fontSize: 10, fontWeight: 600, fontFamily: "monospace",
    }}>
      <div style={{ width: 32, height: 16, borderRadius: 8, padding: 2, background: enabled ? theme.ok : theme.t4 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#fff", transition: "transform 0.2s", transform: enabled ? "translateX(16px)" : "translateX(0px)" }} />
      </div>
      {enabled ? "ENABLED — IN SCOPE" : "DISABLED — OUT OF SCOPE"}
    </button>
  );
}

export function AddButton({ label, onClick, theme }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 4,
      border: "1px dashed " + theme.accent + "50", background: theme.accent + "06",
      color: theme.accent, cursor: "pointer", fontSize: 10, fontWeight: 600, width: "100%",
    }}>
      <span style={{ fontSize: 14, lineHeight: "14px" }}>+</span> {label}
    </button>
  );
}

export function StarInput({ value, onChange, theme }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(function (s) {
        return <button key={s} onClick={function () { onChange(s); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, color: s <= value ? "#eda050" : theme.t4 }}>★</button>;
      })}
    </div>
  );
}
