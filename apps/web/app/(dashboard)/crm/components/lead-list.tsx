import type { Lead } from '../types'
import SourceBadge from './source-badge'
import StageBadge from './stage-badge'
import { Phone } from 'lucide-react'

interface Props {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

export default function LeadList({ leads, onLeadClick }: Props) {
  if (leads.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-[#e8eaed] bg-white">
        <p className="text-sm text-[#aaaaaa]">Nenhum lead encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Telefone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Origem</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Etapa</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Data</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="cursor-pointer border-b border-[#e8eaed] transition-colors hover:bg-[#f7f8fa] last:border-b-0"
            >
              <td className="px-4 py-3 font-medium text-[#111111]">{lead.name}</td>
              <td className="px-4 py-3 text-[#555555]">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-[#aaa]" />
                  {lead.phone}
                </div>
              </td>
              <td className="px-4 py-3">
                <SourceBadge source={lead.source} />
              </td>
              <td className="px-4 py-3">
                <StageBadge stage={lead.stage} />
              </td>
              <td className="px-4 py-3 text-xs text-[#888888]">
                {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
