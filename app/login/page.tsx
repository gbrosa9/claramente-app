import LoginClient from './LoginClient'

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  return <LoginClient initialSearchParams={searchParams || {}} />
}
