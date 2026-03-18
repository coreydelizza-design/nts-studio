import React from 'react';
import type { ThemeTokens } from '../../../theme/tokens';
import { CAT_COLORS } from '../../../theme/tokens';
import { PALETTE_CATS, TEMPLATES } from '../../../data/seed';
import type { PaletteItem } from '../../../types';
import { Mono } from '../../shared/Primitives';
import { UC_REF } from './constants';

interface PalettePanelProps {
  t: ThemeTokens;
  palSearch: string;
  setPalSearch: (v: string) => void;
  palCat: string;
  setPalCat: (v: string) => void;
  filteredPal: PaletteItem[];
  addNode: (type: string) => void;
  showTemplates: boolean;
  setShowTemplates: (v: boolean) => void;
  doLoadTmpl: (key: string) => void;
  ucExpanded: string | null;
  setUcExpanded: (v: string | null) => void;
  setRightTab: (v: 'inspector' | 'notes' | 'dashboard' | 'ucref') => void;
}

const PalettePanel: React.FC<PalettePanelProps> = ({
  t, palSearch, setPalSearch, palCat, setPalCat, filteredPal, addNode,
  showTemplates, setShowTemplates, doLoadTmpl, ucExpanded, setUcExpanded, setRightTab,
}) => (
  <div style={{ width: 210, background: t.bgPanel, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
    {/* Header */}
    <div style={{ padding: '14px 12px 10px', borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${t.emerald}, #059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fontD, fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: 0.3 }}>GTT</div>
        <div>
          <div style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 800, color: t.text }}>Architecture</div>
          <Mono color={t.emerald} size={7}>ENVIRONMENT STUDIO</Mono>
        </div>
      </div>
      <input value={palSearch} onChange={e => setPalSearch(e.target.value)} placeholder="Search components..." style={{ width: '100%', background: t.bgInput, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontFamily: t.fontB, fontSize: 11, padding: '6px 10px' }} />
    </div>

    {/* Category filter */}
    <div style={{ padding: '6px 8px 2px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {['All', ...PALETTE_CATS].map(c => (
        <button key={c} onClick={() => setPalCat(c)} style={{ padding: '3px 7px', borderRadius: 4, fontFamily: t.fontM, fontSize: 8, background: palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c] || t.accent) + '20' : 'transparent', border: `1px solid ${palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c] || t.accent) + '40' : 'transparent'}`, color: palCat === c ? (c === 'All' ? t.accent : CAT_COLORS[c]) : t.textDim }}>{c === 'Edge / Compute' ? 'Edge' : c}</button>
      ))}
    </div>

    {/* Palette items */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
      {(palCat === 'All' ? PALETTE_CATS : [palCat]).map(cat => {
        const items = filteredPal.filter(p => p.cat === cat);
        if (!items.length) return null;
        return (<div key={cat} style={{ marginBottom: 8 }}><Mono color={CAT_COLORS[cat]} size={8}>{cat}</Mono>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
            {items.map(p => (<div key={p.type} onClick={() => addNode(p.type)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 5, cursor: 'pointer', background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
              <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{p.icon}</span>
              <span style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, flex: 1 }}>{p.label}</span>
              <span style={{ fontFamily: t.fontM, fontSize: 8, color: t.textDim }}>+</span>
            </div>))}
          </div>
        </div>);
      })}
    </div>

    {/* Templates */}
    <div style={{ padding: '6px 8px', borderTop: `1px solid ${t.border}` }}>
      <button onClick={() => setShowTemplates(!showTemplates)} style={{ width: '100%', padding: '7px', borderRadius: 6, border: `1px solid ${t.border}`, background: showTemplates ? t.accent + '12' : t.bgInput, color: showTemplates ? t.accent : t.textMuted, fontFamily: t.fontD, fontSize: 11, fontWeight: 600 }}>{showTemplates ? '▾ Load Template' : '▸ Load Template'}</button>
      {showTemplates && <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {Object.entries(TEMPLATES).map(([k, tmpl]) => (<button key={k} onClick={() => doLoadTmpl(k)} style={{ padding: '6px 8px', borderRadius: 5, border: `1px solid ${t.borderSubtle}`, background: t.bgGlass, color: t.text, textAlign: 'left', fontFamily: t.fontB, fontSize: 10 }}><div style={{ fontWeight: 600 }}>{tmpl.label}</div><div style={{ fontSize: 9, color: t.textDim }}>{tmpl.desc}</div></button>))}
      </div>}
    </div>

    {/* UC Reference */}
    <div style={{ padding: '6px 8px 8px', borderTop: `1px solid ${t.border}`, maxHeight: 200, overflowY: 'auto' }}>
      <Mono size={8}>USE CASE REFERENCE</Mono>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
        {UC_REF.map(uc => (
          <button key={uc.id} onClick={() => { setUcExpanded(ucExpanded === uc.id ? null : uc.id); setRightTab('ucref'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 5, textAlign: 'left', width: '100%',
              border: `1px solid ${ucExpanded === uc.id ? uc.color + '50' : t.borderSubtle}`,
              background: ucExpanded === uc.id ? uc.color + '10' : 'transparent',
              color: ucExpanded === uc.id ? uc.color : t.textMuted, fontFamily: t.fontD, fontSize: 10, fontWeight: 600 }}>
            <span style={{ fontSize: 13 }}>{uc.icon}</span>{uc.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default PalettePanel;
