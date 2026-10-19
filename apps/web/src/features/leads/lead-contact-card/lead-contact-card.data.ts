export const leadContactCardData = {
  title: 'Contact details', name: 'Name', owner: 'Lead owner', email: 'Email', phone: 'Phone',
  missing: 'Not provided', unassigned: 'Unassigned', former: 'Former member', assignedMe: 'Assigned to you',
  stories: { title: 'Lead contact card', description: 'Read-only contact details for the lead record. Email and phone links open the user’s chosen mail or calling app.',
    contact: { name: 'Jordan Lee', email: 'jordan@example.com', phone: '+1 (212) 555-0134', owner: { id: 'sam', name: 'Sam Rivera' } },
    longName: 'Alexandra Morgan-Williams and Christopher Rivera', longOwner: 'Taylor Morgan from the residential installation and maintenance team',
    longEmail: 'alexandra.morgan-williams.residential.installations@example.com',
    invalidEmail: 'jordan@example.com?subject=Injected', invalidPhone: 'javascript:123456',
  },
} as const;
