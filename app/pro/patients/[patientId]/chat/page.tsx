import DirectChatClient from '../DirectChatClient'

export default async function DirectChatPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params
  return <DirectChatClient patientId={patientId} />
}
