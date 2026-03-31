import { z } from 'zod'

// ─── Appointment ────────────────────────────────────────────────────────────

export const appointmentStatusEnum = z.enum([
  'AGENDADA',
  'CONFIRMADA',
  'CONCLUIDA',
  'CANCELADA',
  'FALTA',
])

export const appointmentSchema = z.object({
  patientId: z.string().cuid('ID de paciente inválido'),
  dentistId: z.string().cuid('ID de dentista inválido'),
  datetime: z.coerce.date(),
  duration: z.number().int().min(15).max(480).default(60),
  status: appointmentStatusEnum.default('AGENDADA'),
  service: z.string().min(1, 'Serviço é obrigatório'),
  notes: z.string().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>

// ─── Patient ─────────────────────────────────────────────────────────────────

export const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birthDate: z.coerce.date().optional(),
  notes: z.string().optional(),
})

export type PatientInput = z.infer<typeof patientSchema>

// ─── Lead ────────────────────────────────────────────────────────────────────

export const leadSourceEnum = z.enum([
  'WHATSAPP',
  'INSTAGRAM',
  'AGENDAMENTO_ONLINE',
  'MANUAL',
])

export const leadStageEnum = z.enum([
  'NOVO',
  'CONTATADO',
  'AGENDADO',
  'ATIVO',
  'RECORRENTE',
])

export const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  source: leadSourceEnum,
  stage: leadStageEnum.default('NOVO'),
  notes: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
export type LeadSource = z.infer<typeof leadSourceEnum>
export type LeadStage = z.infer<typeof leadStageEnum>

// ─── Message ─────────────────────────────────────────────────────────────────

export const channelEnum = z.enum(['WHATSAPP', 'INSTAGRAM'])

export const messageSchema = z.object({
  conversationId: z.string().cuid(),
  body: z.string().min(1, 'Mensagem não pode ser vazia'),
  fromMe: z.boolean().default(false),
})

export const createConversationSchema = z.object({
  channel: channelEnum,
  externalId: z.string().min(1),
  patientId: z.string().cuid().optional(),
  leadId: z.string().cuid().optional(),
})

export type MessageInput = z.infer<typeof messageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type Channel = z.infer<typeof channelEnum>

// ─── Financial Entry ─────────────────────────────────────────────────────────

export const paymentStatusEnum = z.enum(['PENDENTE', 'PAGO', 'VENCIDO'])

export const financialEntrySchema = z.object({
  patientId: z.string().cuid().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  status: paymentStatusEnum.default('PENDENTE'),
  dueDate: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
})

export type FinancialEntryInput = z.infer<typeof financialEntrySchema>
export type PaymentStatus = z.infer<typeof paymentStatusEnum>

// ─── Medical Record ───────────────────────────────────────────────────────────

export const medicalRecordSchema = z.object({
  patientId: z.string().cuid(),
  dentistId: z.string().cuid(),
  notes: z.string().min(1, 'Observações são obrigatórias'),
  files: z.array(z.string().url()).default([]),
})

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>
