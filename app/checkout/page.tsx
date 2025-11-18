import CheckoutClient from './CheckoutClient'

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const planId = Array.isArray(searchParams?.plan) ? searchParams?.plan[0] : searchParams?.plan
  return <CheckoutClient initialPlanId={planId} />
}
