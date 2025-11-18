import CheckoutSuccessClient from './CheckoutSuccessClient'

export default function Page({ searchParams }: { searchParams?: { plan?: string; user?: string } }) {
  const planId = searchParams?.plan
  const userId = searchParams?.user
  return <CheckoutSuccessClient planId={planId} userId={userId} />
}