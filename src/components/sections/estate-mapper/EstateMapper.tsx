import React, { useState } from 'react';
import { useTheme } from '../../../theme/useTheme';
import { GlassCard, SectionHeader, Chip, MetricBlock, BarMeter, PageHeader, Mono } from '../../shared/Primitives';

/* ═══════════════════════════════════════════════════
   GTT SERVICE CATALOG — what GTT offers
   Used to map which services the customer already has
   ═══════════════════════════════════════════════════ */
interface GttService {
  id: string;
  product: string;
  family: 'Connectivity' | 'Security' | 'Cloud' | 'Edge' | 'Managed' | 'Voice';
  icon: string;
  color: string;
  inPlace: boolean;
  status: 'active' | 'pending' | 'trial' | 'not-deployed';
  sites: number | null;    // null = N/A or not site-based
  coverage: string;
  contractEnd: string;     // empty = no contract
  notes: string;
  expandable: boolean;     // opportunity to expand
}

const INITIAL_GTT_SERVICES: GttService[] = [
  // Connectivity
  { id: 'gtt-ip-transit', product: 'GTT IP Transit', family: 'Connectivity', icon: '🌐', color: '#3b82f6', inPlace: true, status: 'active', sites: null, coverage: 'NYC, London, Frankfurt', contractEnd: 'Dec 2026', notes: 'AS3257 peering — 10G aggregate', expandable: true },
  { id: 'gtt-dia', product: 'GTT Dedicated Internet', family: 'Connectivity', icon: '📡', color: '#3b82f6', inPlace: true, status: 'active', sites: 12, coverage: 'NA HQ + major branches', contractEnd: 'Mar 2027', notes: '1G DIA at 12 sites — underutilized', expandable: true },
  { id: 'gtt-sdwan', product: 'GTT SD-WAN', family: 'Connectivity', icon: '📡', color: '#3b82f6', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'Evaluated Q4 2025 — no decision', expandable: true },
  { id: 'gtt-mpls', product: 'GTT MPLS / IP VPN', family: 'Connectivity', icon: '🔗', color: '#6366f1', inPlace: true, status: 'active', sites: 34, coverage: 'NA: 22, EMEA: 12', contractEnd: 'Sep 2026', notes: 'Legacy MPLS — migration candidate', expandable: false },
  { id: 'gtt-wavelength', product: 'GTT Optical / Wavelength', family: 'Connectivity', icon: '💡', color: '#6366f1', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: '', expandable: false },

  // Security
  { id: 'gtt-sase', product: 'GTT Secure Connect (SASE)', family: 'Security', icon: '🔒', color: '#ef4444', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'RFP planned Q2 2026 — high priority', expandable: true },
  { id: 'gtt-ddos', product: 'GTT DDoS Mitigation', family: 'Security', icon: '🛡', color: '#ef4444', inPlace: true, status: 'active', sites: null, coverage: 'All GTT IP Transit links', contractEnd: 'Dec 2026', notes: 'Bundled with IP Transit', expandable: false },
  { id: 'gtt-mdr', product: 'GTT Managed Detection & Response', family: 'Security', icon: '🚨', color: '#ef4444', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'Using CrowdStrike direct — consider GTT MDR', expandable: true },

  // Cloud
  { id: 'gtt-cloud-connect', product: 'GTT Cloud Connect', family: 'Cloud', icon: '☁', color: '#22d3ee', inPlace: true, status: 'active', sites: null, coverage: 'AWS us-east-1 (Direct Connect)', contractEnd: 'Jun 2027', notes: '10G — single region only', expandable: true },
  { id: 'gtt-vdc', product: 'GTT Virtual Data Center (VDC)', family: 'Cloud', icon: '🏢', color: '#22d3ee', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'Strategic — sovereignty + hybrid cloud candidate', expandable: true },

  // Edge
  { id: 'gtt-envision-edge', product: 'GTT EnvisionEDGE', family: 'Edge', icon: '⚡', color: '#34d399', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'Replaces branch CPE stack — uCPE candidate', expandable: true },

  // Managed Services
  { id: 'gtt-managed-noc', product: 'GTT Managed NOC', family: 'Managed', icon: '👁', color: '#fbbf24', inPlace: true, status: 'active', sites: null, coverage: '24/7 for DIA + MPLS circuits', contractEnd: 'Mar 2027', notes: 'Monitoring only — no proactive remediation', expandable: true },
  { id: 'gtt-envision-platform', product: 'GTT Envision Platform', family: 'Managed', icon: '📊', color: '#fbbf24', inPlace: true, status: 'active', sites: null, coverage: 'Portal access — basic dashboards', contractEnd: 'Mar 2027', notes: 'Underutilized — no DEM/NPM', expandable: true },
  { id: 'gtt-pro-services', product: 'GTT Professional Services', family: 'Managed', icon: '🔧', color: '#fbbf24', inPlace: false, status: 'not-deployed', sites: null, coverage: '—', contractEnd: '', notes: 'Used for initial MPLS deployment 2022', expandable: false },

  // Voice
  { id: 'gtt-sip', product: 'GTT SIP Trunking', family: 'Voice', icon: '📞', color: '#a78bfa', inPlace: true, status: 'active', sites: 4, coverage: 'NYC, London, 2 contact centers', contractEnd: 'Dec 2026', notes: '200 concurrent channels', expandable: false },
];

const FAMILY_ORDER: GttService['family'][] = ['Connectivity', 'Security', 'Cloud', 'Edge', 'Managed', 'Voice'];
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#34d399' },
  pending: { label: 'Pending', color: '#fbbf24' },
  trial: { label: 'Trial', color: '#22d3ee' },
  'not-deployed': { label: 'Not Deployed', color: '#64748b' },
};

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
const EstateMapper: React.FC = () => {
  const { t, isDark } = useTheme();
  const [gttServices, setGttServices] = useState(INITIAL_GTT_SERVICES);
  const [gttFilter, setGttFilter] = useState<string>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleInPlace = (id: string) => {
    setGttServices(prev => prev.map(s => s.id === id ? { ...s, inPlace: !s.inPlace, status: !s.inPlace ? 'active' : 'not-deployed' } : s));
  };
  const updateServiceNotes = (id: string, notes: string) => {
    setGttServices(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
  };

  const activeGttCount = gttServices.filter(s => s.inPlace).length;
  const expandableCount = gttServices.filter(s => s.expandable && !s.inPlace).length;
  const filteredServices = gttFilter === 'all' ? gttServices : gttFilter === 'active' ? gttServices.filter(s => s.inPlace) : gttFilter === 'opportunity' ? gttServices.filter(s => s.expandable && !s.inPlace) : gttServices.filter(s => s.family === gttFilter);

  // Existing estate data
  const sites = [
    { type: 'Headquarters', count: 2, icon: '🏛', sub: 'NYC, London' },
    { type: 'Branch Offices', count: 87, icon: '🏢', sub: 'NA: 52 · EMEA: 24 · APAC: 11' },
    { type: 'Retail Locations', count: 42, icon: '🏪', sub: 'Customer-facing advisory' },
    { type: 'Operations Centers', count: 4, icon: '📞', sub: 'Contact centers' },
    { type: 'Data Centers', count: 3, icon: '🖥', sub: 'East, West, London' },
    { type: 'Cloud Regions', count: 4, icon: '☁', sub: 'AWS ×2, Azure ×2' },
    { type: 'Colo Facilities', count: 5, icon: '🔌', sub: 'Equinix, CyrusOne' },
    { type: 'Acquired Sites', count: 45, icon: '🏗', sub: 'Pending integration' },
  ];
  const carriers = [
    { name: 'AT&T Business', circuits: 78, pct: 35 }, { name: 'Lumen Technologies', circuits: 52, pct: 23 },
    { name: 'Verizon Business', circuits: 41, pct: 18 }, { name: 'Comcast Enterprise', circuits: 28, pct: 13 },
    { name: 'Regional ISPs', circuits: 24, pct: 11 },
  ];
  const cc = [t.blue, t.violet, t.cyan, t.amber, t.slate];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Current-State Estate Mapper" subtitle="Map sites, carriers, security tools, cloud connectivity, and existing GTT services." phase="2" accent={t.blue} />

      {/* ── METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { l: 'Total Sites', v: '187', s: '14 countries', c: t.accent },
          { l: 'Carriers', v: '5+', s: '223 circuits', c: t.amber },
          { l: 'GTT Services', v: String(activeGttCount), s: `of ${gttServices.length} products`, c: t.emerald },
          { l: 'Expansion Opps', v: String(expandableCount), s: 'GTT whitespace', c: t.cyan },
        ].map((m, i) => (
          <GlassCard key={i} accent={m.c} className={`animate-fade-up delay-${i + 1}`} style={{ padding: 18 }}><MetricBlock label={m.l} value={m.v} sub={m.s} color={m.c} /></GlassCard>
        ))}
      </div>

      {/* ── SITE ESTATE ── */}
      <GlassCard className="animate-fade-up delay-2">
        <SectionHeader tag="FOOTPRINT" sub="Inventory by site type">Site Estate Inventory</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {sites.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: t.r.md, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: t.fontD, fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 600, color: t.textSoft, marginTop: 2 }}>{s.type}</div>
                <div style={{ fontFamily: t.fontM, fontSize: 10, color: t.textDim, marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── CARRIERS + SECURITY (side by side) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard className="animate-fade-up delay-3" accent={t.amber}>
          <SectionHeader tag="CARRIERS" sub="Provider distribution">Carrier & Circuit Analysis</SectionHeader>
          {carriers.map((c, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.text }}>{c.name}</span>
                <span style={{ fontFamily: t.fontM, fontSize: 11, color: t.textMuted }}>{c.circuits} circuits</span>
              </div>
              <BarMeter value={c.pct} color={cc[i]} />
            </div>
          ))}
        </GlassCard>
        <GlassCard className="animate-fade-up delay-4" accent={t.rose}>
          <SectionHeader tag="SECURITY" sub="Current security inventory">Security Stack</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { tech: 'Palo Alto NGFW', scope: '62 sites', st: 'Active', c: t.emerald },
              { tech: 'Cisco ASA (Legacy)', scope: '45 sites — EoS risk', st: 'EOL Risk', c: t.rose },
              { tech: 'Zscaler ZIA', scope: '34 sites — partial', st: 'Active', c: t.emerald },
              { tech: 'Fortinet FortiGate', scope: '28 sites — acquired', st: 'Review', c: t.amber },
              { tech: 'Check Point NGFW', scope: '18 sites — sunset', st: 'Sunset', c: t.orange },
              { tech: 'CrowdStrike XDR', scope: 'All endpoints', st: 'Active', c: t.emerald },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: t.r.md, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
                <div><div style={{ fontFamily: t.fontD, fontSize: 13, fontWeight: 600, color: t.text }}>{item.tech}</div><div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim }}>{item.scope}</div></div>
                <Chip color={item.c}>{item.st}</Chip>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ══════════════════════════════════════════════════
         GTT SERVICES — NEW SECTION
         ══════════════════════════════════════════════════ */}
      <GlassCard className="animate-fade-up delay-5" accent={t.emerald}>
        <SectionHeader tag="GTT" sub="Current GTT product footprint and expansion opportunities">Existing GTT Services</SectionHeader>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Products', color: t.accent },
            { key: 'active', label: `Active (${activeGttCount})`, color: t.emerald },
            { key: 'opportunity', label: `Opportunities (${expandableCount})`, color: t.cyan },
            ...FAMILY_ORDER.map(f => ({ key: f, label: f, color: gttServices.find(s => s.family === f)?.color || t.accent })),
          ].map(f => (
            <button key={f.key} onClick={() => setGttFilter(f.key)} style={{
              padding: '5px 12px', borderRadius: 20, fontFamily: t.fontD, fontSize: 11, fontWeight: 600,
              background: gttFilter === f.key ? f.color + '20' : 'transparent',
              border: `1px solid ${gttFilter === f.key ? f.color + '50' : t.borderSubtle}`,
              color: gttFilter === f.key ? f.color : t.textDim,
            }}>{f.label}</button>
          ))}
        </div>

        {/* Service cards by family */}
        {FAMILY_ORDER.map(family => {
          const familyItems = filteredServices.filter(s => s.family === family);
          if (!familyItems.length) return null;
          return (
            <div key={family} style={{ marginBottom: 18 }}>
              <Mono size={9} color={familyItems[0].color}>{family.toUpperCase()}</Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {familyItems.map(svc => {
                  const sc = STATUS_CONFIG[svc.status];
                  const expanded = expandedService === svc.id;
                  return (
                    <div key={svc.id}
                      style={{
                        borderRadius: t.r.md, overflow: 'hidden', transition: 'all 0.2s',
                        background: svc.inPlace ? `${svc.color}06` : t.bgGlass,
                        border: `1px solid ${svc.inPlace ? svc.color + '25' : t.borderSubtle}`,
                        borderLeft: `3px solid ${svc.inPlace ? svc.color : t.borderSubtle}`,
                      }}>
                      {/* Main row */}
                      <div onClick={() => setExpandedService(expanded ? null : svc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{svc.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: t.fontD, fontSize: 14, fontWeight: 700, color: svc.inPlace ? t.text : t.textMuted }}>{svc.product}</span>
                            <Chip color={sc.color} small>{sc.label}</Chip>
                            {svc.expandable && !svc.inPlace && <Chip color={t.cyan} small>Opportunity</Chip>}
                            {svc.expandable && svc.inPlace && <Chip color={t.emerald} small>Expand</Chip>}
                          </div>
                          <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textDim, marginTop: 3 }}>
                            {svc.coverage}{svc.sites !== null && ` · ${svc.sites} sites`}{svc.contractEnd && ` · Contract: ${svc.contractEnd}`}
                          </div>
                        </div>
                        {/* In-place toggle */}
                        <div onClick={e => { e.stopPropagation(); toggleInPlace(svc.id); }}
                          style={{
                            width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                            background: svc.inPlace ? t.emerald + '30' : t.bgHover,
                            border: `1px solid ${svc.inPlace ? t.emerald + '50' : t.border}`,
                            position: 'relative', transition: 'all 0.2s',
                          }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', position: 'absolute', top: 2,
                            left: svc.inPlace ? 21 : 3, transition: 'left 0.2s',
                            background: svc.inPlace ? t.emerald : t.textDim,
                          }} />
                        </div>
                        <span style={{ fontFamily: t.fontM, fontSize: 10, color: t.textDim, flexShrink: 0, width: 16, textAlign: 'center' }}>{expanded ? '▾' : '▸'}</span>
                      </div>

                      {/* Expanded detail */}
                      {expanded && (
                        <div style={{ padding: '0 16px 14px 52px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {/* Info grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {svc.sites !== null && (
                              <div style={{ padding: '8px 10px', borderRadius: t.r.sm, background: t.bgGlass, border: `1px solid ${t.borderSubtle}`, textAlign: 'center' }}>
                                <div style={{ fontFamily: t.fontD, fontSize: 18, fontWeight: 800, color: svc.color }}>{svc.sites}</div>
                                <Mono size={7}>SITES</Mono>
                              </div>
                            )}
                            {svc.contractEnd && (
                              <div style={{ padding: '8px 10px', borderRadius: t.r.sm, background: t.bgGlass, border: `1px solid ${t.borderSubtle}`, textAlign: 'center' }}>
                                <div style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 700, color: t.text }}>{svc.contractEnd}</div>
                                <Mono size={7}>CONTRACT END</Mono>
                              </div>
                            )}
                            <div style={{ padding: '8px 10px', borderRadius: t.r.sm, background: t.bgGlass, border: `1px solid ${t.borderSubtle}`, textAlign: 'center' }}>
                              <div style={{ fontFamily: t.fontD, fontSize: 12, fontWeight: 700, color: sc.color }}>{sc.label}</div>
                              <Mono size={7}>STATUS</Mono>
                            </div>
                          </div>
                          {/* Notes */}
                          <div>
                            <Mono size={8}>NOTES</Mono>
                            <textarea
                              value={svc.notes}
                              onChange={e => updateServiceNotes(svc.id, e.target.value)}
                              rows={2}
                              placeholder="Add observations about this GTT service..."
                              style={{
                                width: '100%', marginTop: 4, background: t.bgInput, border: `1px solid ${t.border}`,
                                borderRadius: t.r.sm, color: t.text, fontFamily: t.fontB, fontSize: 12,
                                padding: '8px 10px', resize: 'vertical', lineHeight: 1.5,
                              }}
                            />
                          </div>
                          {/* Recommendation hint */}
                          {svc.expandable && !svc.inPlace && (
                            <div style={{ padding: '10px 12px', borderRadius: t.r.sm, background: t.cyan + '06', border: `1px solid ${t.cyan}15` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontFamily: t.fontD, fontSize: 11, fontWeight: 700, color: t.cyan }}>💡 Expansion Opportunity</span>
                              </div>
                              <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, lineHeight: 1.5, marginTop: 4 }}>
                                {svc.id === 'gtt-sdwan' && 'Customer evaluated SD-WAN but has no deployment. 34 sites already on partial Viptela — GTT Managed SD-WAN could replace legacy MPLS and consolidate underlay.'}
                                {svc.id === 'gtt-sase' && 'Security fragmentation is the #1 pain point (score: 9). GTT Secure Connect replaces 5 overlapping security vendors with unified SASE.'}
                                {svc.id === 'gtt-mdr' && 'CrowdStrike XDR is deployed on endpoints. GTT MDR adds 24/7 SOC + network-layer detection to close the gap.'}
                                {svc.id === 'gtt-cloud-connect' && 'Only one AWS region connected. Expand to Azure + multi-region AWS for the multi-cloud strategy.'}
                                {svc.id === 'gtt-vdc' && 'VDC addresses data sovereignty needs for EMEA and provides a private cloud landing zone for regulated workloads.'}
                                {svc.id === 'gtt-envision-edge' && 'EnvisionEDGE consolidates branch CPE (SD-WAN + routing + firewall + compute) into a single managed platform. Eliminates 3 appliance types per site.'}
                                {svc.id === 'gtt-managed-noc' && 'Current NOC is monitoring-only. Upgrade to proactive managed operations with automated remediation.'}
                                {svc.id === 'gtt-envision-platform' && 'Envision portal is underutilized. Enable full DEM + NPM + AIOps for end-to-end visibility.'}
                                {!['gtt-sdwan', 'gtt-sase', 'gtt-mdr', 'gtt-cloud-connect', 'gtt-vdc', 'gtt-envision-edge', 'gtt-managed-noc', 'gtt-envision-platform'].includes(svc.id) && 'This service represents an expansion opportunity for the customer.'}
                              </div>
                            </div>
                          )}
                          {svc.expandable && svc.inPlace && (
                            <div style={{ padding: '10px 12px', borderRadius: t.r.sm, background: t.emerald + '06', border: `1px solid ${t.emerald}15` }}>
                              <div style={{ fontFamily: t.fontD, fontSize: 11, fontWeight: 700, color: t.emerald }}>⬆ Expansion Available</div>
                              <div style={{ fontFamily: t.fontB, fontSize: 11, color: t.textSoft, lineHeight: 1.5, marginTop: 4 }}>
                                {svc.id === 'gtt-ip-transit' && 'Expand IP Transit to additional regions (APAC, LATAM) for global coverage consistency.'}
                                {svc.id === 'gtt-dia' && 'Extend DIA to all 87 branch sites as SD-WAN underlay — replace legacy carrier broadband.'}
                                {svc.id === 'gtt-managed-noc' && 'Upgrade from monitoring-only to proactive managed operations with automated remediation and SLA management.'}
                                {svc.id === 'gtt-envision-platform' && 'Enable full-stack DEM, NPM, and AIOps modules for end-to-end digital experience visibility.'}
                                {svc.id === 'gtt-cloud-connect' && 'Add Azure ExpressRoute and expand to eu-west-1 for multi-cloud + multi-region.'}
                                {!['gtt-ip-transit', 'gtt-dia', 'gtt-managed-noc', 'gtt-envision-platform', 'gtt-cloud-connect'].includes(svc.id) && 'Additional coverage or features available for this service.'}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Summary bar */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, padding: '14px 16px', borderRadius: t.r.md, background: t.bgGlass, border: `1px solid ${t.borderSubtle}` }}>
          <div style={{ flex: 1 }}>
            <Mono size={8}>GTT REVENUE FOOTPRINT</Mono>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {FAMILY_ORDER.map(family => {
                const count = gttServices.filter(s => s.family === family && s.inPlace).length;
                const total = gttServices.filter(s => s.family === family).length;
                return (
                  <div key={family} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: count > 0 ? gttServices.find(s => s.family === family)?.color || t.accent : t.textDim + '30' }} />
                    <span style={{ fontFamily: t.fontB, fontSize: 10, color: count > 0 ? t.textSoft : t.textDim }}>{family} {count}/{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: `1px solid ${t.borderSubtle}` }}>
            <div style={{ fontFamily: t.fontD, fontSize: 22, fontWeight: 800, color: t.emerald }}>{activeGttCount}</div>
            <Mono size={7}>ACTIVE</Mono>
          </div>
          <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: `1px solid ${t.borderSubtle}` }}>
            <div style={{ fontFamily: t.fontD, fontSize: 22, fontWeight: 800, color: t.cyan }}>{expandableCount}</div>
            <Mono size={7}>WHITESPACE</Mono>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default EstateMapper;
