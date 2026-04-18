'use client'
// src/components/candidatos/CandidatoModal.tsx

import { useState } from 'react'
import type { Candidato, TipoAlerta, EtapaAlerta, UserRole } from '@/types'
import { CAMPANA_LABELS, ALERTA_TIPO_LABELS } from '@/types'
import { Avatar, EstadoBadge, RiesgoBadge, ProgressDots, ScoreBar } from '@/components/ui'

// ─── HELPERS ──────────────────────────────────────────────

const Stars = ({ value }: { value: number }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ fontSize: 16, color: value >= s ? 'var(--yellow)' : 'var(--border2)' }}>★</span>
    ))}
  </div>
)

const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
      {right}
    </div>
    {children}
  </div>
)

const AutorTag = ({ nombre, fecha }: { nombre: string; fecha: string }) => {
  if (!nombre) return null
  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--text3)' }}>✍ Cargado por</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>{nombre}</span>
      <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{fecha?.split('T')[0]}</span>
    </div>
  )
}

const NumberInput = ({ id, label, value }: { id: string; label: string; value?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
    <input
      id={id} type="number" min={1} max={5} defaultValue={value ?? 3}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: 7, fontSize: 13 }}
    />
  </div>
)

const SelectInput = ({ id, label, options, value }: { id: string; label: string; options: {v:string,l:string}[]; value?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
    <select
      id={id} defaultValue={value ?? options[0]?.v}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: 7, fontSize: 13 }}
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
)

// ─── MAIN COMPONENT ───────────────────────────────────────

interface Props {
  candidato: Candidato
  role: UserRole
  onClose: () => void
  onSaveEval: (id: string, stage: string, data: Record<string, unknown>) => Promise<void>
  onSaveAlert: (id: string, data: { etapa: EtapaAlerta; tipo: TipoAlerta; descripcion: string }) => Promise<void>
}

type Tab = 'eval' | 'timeline'
type SubView = 'profile' | 'eval_form' | 'alert_form'

export default function CandidatoModal({ candidato: initial, role, onClose, onSaveEval, onSaveAlert }: Props) {
  const [c, setC] = useState(initial)
  const [tab, setTab] = useState<Tab>('eval')
  const [subview, setSubview] = useState<SubView>('profile')
  const [saving, setSaving] = useState(false)

  // admin puede editar todo; otros solo su etapa
  const canEdit = ({ admin: ['ops','rrhh','cap'], operaciones: ['ops'], rrhh: ['rrhh'], capacitacion: ['cap'] } as Record<UserRole, string[]>)[role] ?? []
  const discrepancia = c.evalOps && c.evalCap && Math.abs(c.evalOps.score - c.evalCap.herramientas) >= 2
  const realAlerts = c.alertas.filter(a => !a.esDeEstado)

  // ── guardar evaluación ──
  async function handleSaveEval() {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value
    const n = (id: string, fb = 3) => Math.min(5, Math.max(1, parseInt(g(id) ?? '') || fb))

    const stageMap: Record<UserRole, string> = { admin: 'ops', operaciones: 'ops', rrhh: 'rrhh', capacitacion: 'cap' }
    const stage = stageMap[role]
    let data: Record<string, unknown> = {}

    if (stage === 'ops') data = { action: 'eval_ops', score: n('ev-score'), tecnica: n('ev-tecnica'), recomendado: g('ev-rec') === 'true', comentarios: g('ev-com') }
    else if (stage === 'rrhh') data = { action: 'eval_rrhh', blandas: n('ev-blandas'), comunicacion: n('ev-com2'), adaptabilidad: n('ev-adapt'), aptoC: g('ev-apto') === 'true', comentarios: g('ev-com') }
    else if (stage === 'cap') {
      const at = g('ev-alerta-tipo') || undefined
      data = { action: 'eval_cap', herramientas: n('ev-herr'), curva: n('ev-curva'), cumplimiento: n('ev-cumpl'), listo: g('ev-listo') === 'true', tieneAlerta: !!at, tipoAlerta: at || null, comentarios: g('ev-com') }
    }

    setSaving(true)
    await onSaveEval(c.id, stage, data)
    setSaving(false)
    setSubview('profile')
  }

  // ── guardar alerta ──
  async function handleSaveAlert() {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value
    const desc = g('al-desc')?.trim()
    if (!desc) { alert('Describí la alerta.'); return }
    setSaving(true)
    await onSaveAlert(c.id, { etapa: g('al-etapa') as EtapaAlerta, tipo: g('al-tipo') as TipoAlerta, descripcion: desc })
    setSaving(false)
    setSubview('profile')
  }

  const stageMap: Record<UserRole, string> = { admin: 'ops', operaciones: 'ops', rrhh: 'rrhh', capacitacion: 'cap' }
  const stageNames: Record<string, string> = { ops: 'Operaciones', rrhh: 'RRHH', cap: 'Capacitación' }
  const curStage = stageMap[role]
  const curEval = c[curStage === 'ops' ? 'evalOps' : curStage === 'rrhh' ? 'evalRRHH' : 'evalCap'] as Record<string, unknown> | null | undefined

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {subview === 'profile' ? 'Perfil del Colaborador' : subview === 'eval_form' ? `Evaluación — ${stageNames[curStage]}` : 'Nueva Alerta'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* ── PROFILE VIEW ── */}
        {subview === 'profile' && (
          <>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <Avatar nombre={c.nombre} size={52} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.nombre}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className="badge-gray">DNI: {c.dni}</span>
                    {c.legajo && <span className="badge-gray">Leg. {c.legajo}</span>}
                    <span className="badge-blue">{CAMPANA_LABELS[c.campana]}</span>
                    <EstadoBadge estado={c.estado} />
                    {c.riesgo !== 'BAJO' && <RiesgoBadge riesgo={c.riesgo} />}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>Etapas:</span>
                    <ProgressDots candidato={c} />
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>📅 {c.fechaPostulacion.split('T')[0]}</span>
                  </div>
                </div>
              </div>

              {discrepancia && (
                <div style={{ background: '#71350020', border: '1px solid #eab30830', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: 'var(--yellow)' }}>
                  ⚡ <b>Discrepancia:</b> Ops ({c.evalOps!.score}/5) vs Capacitación ({c.evalCap!.herramientas}/5). Revisar trayectoria.
                </div>
              )}
              {c.riesgo === 'ALTO' && (
                <div style={{ background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: 'var(--red)' }}>
                  🚨 <b>RIESGO ALTO:</b> Alertas en múltiples etapas del proceso.
                </div>
              )}

              <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
                {(['eval', 'timeline'] as Tab[]).map((t, i) => (
                  <div
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '8px 14px', fontSize: 12, cursor: 'pointer',
                      color: tab === t ? 'var(--accent)' : 'var(--text2)',
                      borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                      marginBottom: -1, borderRadius: '6px 6px 0 0', fontWeight: tab === t ? 500 : 400,
                    }}
                  >
                    {['Evaluaciones', `Historial (${c.alertas.length})`][i]}
                  </div>
                ))}
              </div>

              {tab === 'eval' && (
                <>
                  {c.evalOps ? (
                    <Section title="Operaciones" right={<span className={c.evalOps.recomendado ? 'badge-green' : 'badge-red'}>{c.evalOps.recomendado ? '✔ Recomendado' : '✗ No recomendado'}</span>}>
                      {[{l:'Score General',v:c.evalOps.score},{l:'Eval. Técnica',v:c.evalOps.tecnica}].map(f => (
                        <div key={f.l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                          <span style={{ fontSize:12,color:'var(--text2)',flex:1 }}>{f.l}</span>
                          <Stars value={f.v} /><span style={{ fontSize:11,color:'var(--text3)',minWidth:20 }}>{f.v}/5</span>
                        </div>
                      ))}
                      {c.evalOps.comentarios && <div style={{ background:'var(--bg)',borderRadius:6,padding:'8px 10px',fontSize:12,color:'var(--text2)',fontStyle:'italic',marginTop:8 }}>"{c.evalOps.comentarios}"</div>}
                      <AutorTag nombre={c.evalOps.autorNombre} fecha={c.evalOps.updatedAt} />
                    </Section>
                  ) : <Section title="Operaciones" right={<span className="badge-gray">Sin evaluar</span>}><div style={{ fontSize:12,color:'var(--text3)',fontStyle:'italic' }}>Pendiente.</div></Section>}

                  {c.evalRRHH ? (
                    <Section title="Recursos Humanos" right={<span className={c.evalRRHH.aptoC ? 'badge-green' : 'badge-red'}>{c.evalRRHH.aptoC ? '✔ Apto Cultural' : '✗ No Apto'}</span>}>
                      {[{l:'Habilidades Blandas',v:c.evalRRHH.blandas},{l:'Comunicación',v:c.evalRRHH.comunicacion},{l:'Adaptabilidad',v:c.evalRRHH.adaptabilidad}].map(f => (
                        <div key={f.l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                          <span style={{ fontSize:12,color:'var(--text2)',flex:1 }}>{f.l}</span>
                          <Stars value={f.v} /><span style={{ fontSize:11,color:'var(--text3)',minWidth:20 }}>{f.v}/5</span>
                        </div>
                      ))}
                      {c.evalRRHH.comentarios && <div style={{ background:'var(--bg)',borderRadius:6,padding:'8px 10px',fontSize:12,color:'var(--text2)',fontStyle:'italic',marginTop:8 }}>"{c.evalRRHH.comentarios}"</div>}
                      <AutorTag nombre={c.evalRRHH.autorNombre} fecha={c.evalRRHH.updatedAt} />
                    </Section>
                  ) : <Section title="Recursos Humanos" right={<span className="badge-gray">Sin evaluar</span>}><div style={{ fontSize:12,color:'var(--text3)',fontStyle:'italic' }}>Pendiente.</div></Section>}

                  {c.evalCap ? (
                    <Section title="Capacitación" right={<div style={{ display:'flex',gap:6 }}>{c.evalCap.tieneAlerta && <span className="alert-chip">⚠ Alerta</span>}<span className={c.evalCap.listo ? 'badge-green' : 'badge-red'}>{c.evalCap.listo ? '✔ Listo' : '✗ No listo'}</span></div>}>
                      {[{l:'Herramientas',v:c.evalCap.herramientas},{l:'Curva Aprendizaje',v:c.evalCap.curva},{l:'Cumplimiento',v:c.evalCap.cumplimiento}].map(f => (
                        <div key={f.l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                          <span style={{ fontSize:12,color:'var(--text2)',flex:1 }}>{f.l}</span>
                          <Stars value={f.v} /><span style={{ fontSize:11,color:'var(--text3)',minWidth:20 }}>{f.v}/5</span>
                        </div>
                      ))}
                      {c.evalCap.comentarios && <div style={{ background:'var(--bg)',borderRadius:6,padding:'8px 10px',fontSize:12,color:'var(--text2)',fontStyle:'italic',marginTop:8 }}>"{c.evalCap.comentarios}"</div>}
                      <AutorTag nombre={c.evalCap.autorNombre} fecha={c.evalCap.updatedAt} />
                    </Section>
                  ) : <Section title="Capacitación" right={<span className="badge-gray">Sin evaluar</span>}><div style={{ fontSize:12,color:'var(--text3)',fontStyle:'italic' }}>Pendiente.</div></Section>}
                </>
              )}

              {tab === 'timeline' && (
                <div style={{ position:'relative',paddingLeft:20 }}>
                  <div style={{ position:'absolute',left:7,top:0,bottom:0,width:1,background:'var(--border)' }} />
                  {c.alertas.length === 0
                    ? <div style={{ fontSize:12,color:'var(--text3)',fontStyle:'italic' }}>Sin historial registrado.</div>
                    : c.alertas.map(a => {
                        const color = a.esDeEstado ? 'var(--blue)' : a.tipo === 'CONDUCTUAL' ? 'var(--red)' : 'var(--yellow)'
                        return (
                          <div key={a.id} style={{ position:'relative',marginBottom:14 }}>
                            <div style={{ position:'absolute',left:-17,top:4,width:10,height:10,borderRadius:'50%',background:color,border:'2px solid var(--bg2)' }} />
                            <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px' }}>
                              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                                <span style={{ fontSize:11,fontWeight:600,color }}>{a.etapa} — {a.tipo}</span>
                                <span style={{ fontSize:10,color:'var(--text3)' }}>{a.createdAt?.split('T')[0]}</span>
                              </div>
                              <div style={{ fontSize:12,color:'var(--text2)',marginBottom:6 }}>{a.descripcion}</div>
                              {a.autorNombre && <div style={{ fontSize:10,color:'var(--text3)' }}>✍ {a.autorNombre}</div>}
                            </div>
                          </div>
                        )
                      })
                  }
                </div>
              )}
            </div>

            <div style={{ padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between' }}>
              <button className="btn-warning" onClick={() => setSubview('alert_form')}>⚠ Agregar Alerta</button>
              <div style={{ display:'flex',gap:8 }}>
                <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                {canEdit.length > 0 && <button className="btn-primary" onClick={() => setSubview('eval_form')}>Editar Evaluación</button>}
              </div>
            </div>
          </>
        )}

        {/* ── EVAL FORM ── */}
        {subview === 'eval_form' && (
          <>
            <div style={{ padding: '18px 20px' }}>
              {curEval && Object.keys(curEval).length > 0 && (
                <div style={{ background:'#71350020',border:'1px solid #eab30830',borderRadius:8,padding:'10px 12px',marginBottom:16,fontSize:12,color:'var(--yellow)' }}>
                  ⚠ Ya existe una evaluación para esta etapa. Si guardás, se sobreescribe.
                </div>
              )}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                {curStage === 'ops' && <>
                  <NumberInput id="ev-score" label="Score General (1-5)" value={c.evalOps?.score} />
                  <NumberInput id="ev-tecnica" label="Eval. Técnica (1-5)" value={c.evalOps?.tecnica} />
                  <SelectInput id="ev-rec" label="Recomendado" value={String(c.evalOps?.recomendado ?? true)} options={[{v:'true',l:'Sí'},{v:'false',l:'No'}]} />
                  <div style={{ gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:5 }}>
                    <label style={{ fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.5 }}>Comentarios</label>
                    <textarea id="ev-com" defaultValue={c.evalOps?.comentarios ?? ''} style={{ background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'8px 10px',borderRadius:7,fontSize:13,resize:'vertical',minHeight:70,fontFamily:'inherit' }} />
                  </div>
                </>}
                {curStage === 'rrhh' && <>
                  <NumberInput id="ev-blandas" label="Habilidades Blandas (1-5)" value={c.evalRRHH?.blandas} />
                  <NumberInput id="ev-com2" label="Comunicación (1-5)" value={c.evalRRHH?.comunicacion} />
                  <NumberInput id="ev-adapt" label="Adaptabilidad (1-5)" value={c.evalRRHH?.adaptabilidad} />
                  <SelectInput id="ev-apto" label="Apto Cultural" value={String(c.evalRRHH?.aptoC ?? true)} options={[{v:'true',l:'Sí'},{v:'false',l:'No'}]} />
                  <div style={{ gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:5 }}>
                    <label style={{ fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.5 }}>Comentarios</label>
                    <textarea id="ev-com" defaultValue={c.evalRRHH?.comentarios ?? ''} style={{ background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'8px 10px',borderRadius:7,fontSize:13,resize:'vertical',minHeight:70,fontFamily:'inherit' }} />
                  </div>
                </>}
                {curStage === 'cap' && <>
                  <NumberInput id="ev-herr" label="Herramientas (1-5)" value={c.evalCap?.herramientas} />
                  <NumberInput id="ev-curva" label="Curva Aprendizaje (1-5)" value={c.evalCap?.curva} />
                  <NumberInput id="ev-cumpl" label="Cumplimiento (1-5)" value={c.evalCap?.cumplimiento} />
                  <SelectInput id="ev-listo" label="Listo para piso" value={String(c.evalCap?.listo ?? false)} options={[{v:'true',l:'Sí'},{v:'false',l:'No'}]} />
                  <SelectInput id="ev-alerta-tipo" label="Agregar Alerta" value="" options={[{v:'',l:'Sin alerta'}, ...Object.entries(ALERTA_TIPO_LABELS).map(([v,l])=>({v,l}))]} />
                  <div style={{ gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:5 }}>
                    <label style={{ fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.5 }}>Comentarios</label>
                    <textarea id="ev-com" defaultValue={c.evalCap?.comentarios ?? ''} style={{ background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'8px 10px',borderRadius:7,fontSize:13,resize:'vertical',minHeight:70,fontFamily:'inherit' }} />
                  </div>
                </>}
              </div>
            </div>
            <div style={{ padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end',gap:8 }}>
              <button className="btn-secondary" onClick={() => setSubview('profile')}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveEval} disabled={saving}>{saving ? 'Guardando...' : 'Confirmar y Guardar'}</button>
            </div>
          </>
        )}

        {/* ── ALERT FORM ── */}
        {subview === 'alert_form' && (
          <>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ background:'#71350020',border:'1px solid #eab30830',borderRadius:8,padding:'10px 12px',marginBottom:16,fontSize:12,color:'var(--yellow)' }}>
                Esta alerta quedará registrada en el historial permanentemente.
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <SelectInput id="al-etapa" label="Etapa" options={[{v:'OPERACIONES',l:'Operaciones'},{v:'RRHH',l:'RRHH'},{v:'CAPACITACION',l:'Capacitación'},{v:'GENERAL',l:'General'}]} />
                <SelectInput id="al-tipo" label="Tipo" options={Object.entries(ALERTA_TIPO_LABELS).map(([v,l])=>({v,l}))} />
                <div style={{ gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:5 }}>
                  <label style={{ fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.5 }}>Descripción *</label>
                  <textarea id="al-desc" placeholder="Describí la situación..." style={{ background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',padding:'8px 10px',borderRadius:7,fontSize:13,resize:'vertical',minHeight:80,fontFamily:'inherit' }} />
                </div>
              </div>
            </div>
            <div style={{ padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'flex-end',gap:8 }}>
              <button className="btn-secondary" onClick={() => setSubview('profile')}>Cancelar</button>
              <button className="btn-warning" onClick={handleSaveAlert} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Alerta'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
