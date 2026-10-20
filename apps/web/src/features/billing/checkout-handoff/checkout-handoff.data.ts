export const checkoutHandoffData = {
  title:'Complete your workspace setup', description:'Your account and business details are saved. Review your selected plan before subscribing.',
  sandbox:'Stripe sandbox · Test payments only',
  selected:'Selected plan', next:'Enter payment details',
  loading:'Loading secure payment form…', missingKey:'Secure payment is temporarily unavailable. Please try again later.', secure:'Your card details are handled securely by Stripe.', retry:'Retry payment form', preview:'Embedded Stripe payment form appears here in the app.',
  check:'Check payment status', pending:'Working…', home:'Open workspace',
  ready:'Your paid plan is active. Your workspace is ready.',
  unpaid:'Paid access starts only after payment is verified. Closing checkout preserves your progress.',
  error:'Payment could not be completed or confirmed yet. Try again; your progress is saved.',
  verifying:'Payment is being confirmed. If you just paid, check again in a moment.',
  names:{free:'Free',standard:'Standard',premium:'Premium'},
  price:(cents:number)=>`$${cents/100} USD / month`,
} as const;
