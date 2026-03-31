import { redirect } from 'next/navigation'

export default function WhatsappPage() {
  redirect('/chat?channel=WHATSAPP')
}
