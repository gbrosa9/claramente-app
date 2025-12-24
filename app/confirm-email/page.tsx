import ConfirmEmailClient from './ConfirmEmailClient'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const rawEmail = resolvedParams?.email
  const initialEmail = Array.isArray(rawEmail) ? rawEmail[0] ?? '' : rawEmail ?? ''

  return <ConfirmEmailClient initialEmail={initialEmail} />
}