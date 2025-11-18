'use client'

import React from 'react'

type Props = {
  initialPlanId?: string | string[] | undefined
}

export default function CheckoutClient({ initialPlanId }: Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-slate-600">Plano selecionado: {String(initialPlanId ?? 'nenhum')}</p>
      <p className="mt-4 text-sm text-slate-500">Implement the checkout UI here.</p>
    </div>
  )
}
