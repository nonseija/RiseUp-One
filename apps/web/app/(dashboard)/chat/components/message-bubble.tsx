import type { ChatMessage } from '@/hooks/use-chat'

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.fromMe

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[70%] rounded-2xl px-4 py-2.5"
        style={
          isMe
            ? {
                backgroundColor: '#f0fffe',
                border: '1px solid rgba(41,217,213,0.3)',
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: '#f7f8fa',
                border: '1px solid #e8eaed',
                borderBottomLeftRadius: 4,
              }
        }
      >
        <p className="text-sm text-[#111111]">{message.body}</p>
        <p className="mt-1 text-right text-[10px] text-[#aaaaaa]">
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
