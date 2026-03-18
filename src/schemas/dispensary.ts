import { z } from 'astro/zod';

/**
 * All 8 MCC "Special Status" tags recognized by the directory.
 * Tags come ONLY from the structured "Special Status" column in the XLSX.
 */
export const specialStatusTags = [
  'Woman-Owned',
  'Minority-Owned',
  'Social Equity',
  'Veteran-Owned',
  'LGBTQ+-Owned',
  'Disability-Owned',
  'Economic Empowerment',
  'MTC Priority',
] as const;

/**
 * Zod schema for a single dispensary record.
 *
 * Required fields: tradeName, licenseNumber (build fails if missing).
 * All other fields are optional/nullable.
 * Derived fields (needsNarrative, researchInconclusive) default to false.
 */
export const dispensarySchema = z.object({
  // Required fields -- build MUST fail if missing
  tradeName: z.string().min(1, 'Trade Name is required'),
  licenseNumber: z.string().min(1, 'License # is required'),

  // Optional fields -- null/empty allowed
  owner: z.string().nullable().optional(),
  normalizedOwner: z.string().nullable().optional(),
  brandCompany: z.string().nullable().optional(),
  parentCompany: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  licenseType: z.string().nullable().optional(),
  ownershipDetails: z.string().nullable().optional(),
  independent: z.enum(['Yes', 'No']).nullable().optional(),

  // Derived fields
  specialStatusTags: z.array(z.enum(specialStatusTags)).default([]),
  needsNarrative: z.boolean().default(false),
  researchInconclusive: z.boolean().default(false),
  slug: z.string().optional(),
});

export type Dispensary = z.infer<typeof dispensarySchema>;

/**
 * Schema for Summary sheet aggregate stats.
 */
export const statsSchema = z.object({
  totalLicenses: z.number().default(0),
  percentIndependent: z.number().default(0),
  totalTowns: z.number().default(0),
});

export type Stats = z.infer<typeof statsSchema>;
