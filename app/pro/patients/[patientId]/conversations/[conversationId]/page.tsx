import PatientConversationClient from './PatientConversationClient'

interface PageParams {
  patientId: string
  conversationId: string
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params
  return (
    <PatientConversationClient
      patientId={resolvedParams.patientId}
      conversationId={resolvedParams.conversationId}
    />
  )
}
