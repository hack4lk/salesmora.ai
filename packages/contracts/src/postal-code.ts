import { z } from 'zod';
export const usPostalCodeSchema = z.string().trim().regex(/^\d{5}(?:-\d{4})?$/, 'Enter a 5-digit US ZIP code or ZIP+4.').transform(value => value.slice(0, 5));
