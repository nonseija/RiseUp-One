export default function ChannelBadge({ channel }: { channel: 'WHATSAPP' | 'INSTAGRAM' }) {
  if (channel === 'WHATSAPP') {
    return (
      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
        WPP
      </span>
    )
  }
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
      IG
    </span>
  )
}
