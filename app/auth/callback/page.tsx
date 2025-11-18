import AuthCallbackClient from './AuthCallbackClient'

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  return <AuthCallbackClient initialSearchParams={searchParams || {}} />
}