import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const dispensaries = defineCollection({
  loader: file('src/data/dispensaries.json'),
  schema: z.object({
    tradeName: z.string(),
    licenseNumber: z.string(),
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
    specialStatusTags: z.array(z.string()).default([]),
    needsNarrative: z.boolean().default(false),
    researchInconclusive: z.boolean().default(false),
    slug: z.string().optional(),
  }),
});

const stats = defineCollection({
  loader: file('src/data/stats.json'),
  schema: z.object({
    totalLicenses: z.number(),
    percentIndependent: z.number(),
    totalTowns: z.number(),
  }),
});

export const collections = { dispensaries, stats };
