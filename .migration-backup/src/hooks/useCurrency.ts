import { useState, useCallback } from 'react'

export type Currency = 'USD' | 'LBP'

export function useCurrency(initial: Currency = 'USD') {
  const [currency, setCurrency] = useState<Currency>(initial)

  const toggle = useCallback(() => {
    setCurrency(c => (c === 'USD' ? 'LBP' : 'USD'))
  }, [])

  return { currency, toggle }
}

/**
 * Given a price string in USD (e.g. "$3.50") and its LBP string (e.g. "300,000 LBP"),
 * returns the correct one based on the active currency.
 */
export function displayPrice(usdPrice: string, lbpPrice: string, currency: Currency): string {
  return currency === 'USD' ? usdPrice : lbpPrice
}
