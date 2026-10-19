export const leadServiceCardData = {
  title: 'Service request', address: 'Service address', missingService: 'Service not provided', missingDetails: 'No request details provided.', missingAddress: 'Not provided',
  stories: { title: 'Lead service card', description: 'Read-only service request and address for the lead record.',
    service: 'Kitchen remodel', details: 'Planning a full kitchen refresh and wants to discuss timing. The customer is gathering a few ideas before choosing a start date.',
    address: '18 Willow Street, Brooklyn, NY 11201',
    multilineDetails: 'Replace the kitchen sink and inspect the supply lines.\n\nCustomer is available after 2 PM.\nPlease call before visiting.',
    multilineAddress: '18 Willow Street\nApartment 4B\nBrooklyn, NY 11201',
    longService: 'Residential kitchen plumbing inspection and whole-house water supply replacement planning',
    longDetails: 'Review the existing supply lines and water pressure throughout the residence. Include access requirements, replacement options and a phased installation schedule. The customer wants to understand how the work affects use of the kitchen and upstairs bathrooms.',
    longAddress: 'Apartment 24, East Residential Building, 1824 West Willow Gardens Boulevard, Brooklyn, New York 11201',
    plainText: '<strong>Customer instructions</strong>\nhttps://example.com/request\n<script>alert("preview")</script>',
  },
} as const;
