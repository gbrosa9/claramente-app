import ConfirmEmailClient from './ConfirmEmailClient'

export default function Page({ searchParams }: { searchParams?: { email?: string } }) {
  const initialEmail = searchParams?.email || ''
  return <ConfirmEmailClient initialEmail={initialEmail} />
}