export type LeadSource = 'WHATSAPP' | 'INSTAGRAM' | 'AGENDAMENTO_ONLINE' | 'MANUAL'
export type LeadStage = 'NOVO' | 'CONTATADO' | 'AGENDADO' | 'ATIVO' | 'RECORRENTE'

export interface LeadActivity {
  id: string
  leadId: string
  type: string
  content: string
  createdAt: string
}

export interface Lead {
  id: string
  clinicId: string
  name: string
  phone: string
  email?: string
  source: LeadSource
  stage: LeadStage
  notes?: string
  createdAt: string
  updatedAt: string
  activities: LeadActivity[]
}

export interface FunnelItem {
  stage: LeadStage
  count: number
}

export interface StageMeta {
  label: string
  color: string
  bg: string
  border?: string
  fontWeight?: number
}

export interface SourceMeta {
  label: string
  color: string
  bg: string
  border?: string
}

export const STAGE_META: Record<LeadStage, StageMeta> = {
  NOVO:       { label: 'Novo',       color: '#29d9d5', bg: '#141414' },
  CONTATADO:  { label: 'Contatado',  color: '#141414', bg: '#29d9d5' },
  AGENDADO:   { label: 'Agendado',   color: '#29d9d5', bg: '#0a4f4e' },
  ATIVO:      { label: 'Ativo',      color: '#141414', bg: '#ffffff', border: '2px solid #29d9d5' },
  RECORRENTE: { label: 'Recorrente', color: '#ffffff', bg: '#29d9d5', fontWeight: 700 },
}

export const SOURCE_META: Record<LeadSource, SourceMeta> = {
  WHATSAPP:           { label: 'WhatsApp',  color: '#25d366', bg: '#141414' },
  INSTAGRAM:          { label: 'Instagram', color: '#e1306c', bg: '#141414' },
  AGENDAMENTO_ONLINE: { label: 'Online',    color: '#141414', bg: '#29d9d5' },
  MANUAL:             { label: 'Manual',    color: '#141414', bg: '#ffffff', border: '1px solid #141414' },
}

export const STAGES: LeadStage[] = ['NOVO', 'CONTATADO', 'AGENDADO', 'ATIVO', 'RECORRENTE']
