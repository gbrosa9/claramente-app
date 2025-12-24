import PatientOverviewClient from './PatientOverviewClient'

interface PageParams {
  patientId: string
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params
  return <PatientOverviewClient patientId={resolvedParams.patientId} />
}
