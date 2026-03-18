import type { Dispensary } from '../schemas/dispensary';

export interface QualityReportEntry {
  licenseNumber: string;
  tradeName: string;
}

export interface QualityReport {
  totalRecords: number;
  issueCount: number;
  needsNarrative: { count: number; records: QualityReportEntry[] };
  researchInconclusive: { count: number; records: QualityReportEntry[] };
  missingFields: {
    phone: number;
    address: number;
    owner: number;
    town: number;
  };
  warnings: string[];
}

/**
 * Generate a data quality report from validated dispensary records.
 * Counts and lists records with missing optional data, narrative needs,
 * and inconclusive research flags.
 */
export function generateQualityReport(
  records: Dispensary[],
  warnings: string[],
): QualityReport {
  const needsNarrativeRecords: QualityReportEntry[] = [];
  const inconclusiveRecords: QualityReportEntry[] = [];
  let missingPhone = 0;
  let missingAddress = 0;
  let missingOwner = 0;
  let missingTown = 0;

  for (const record of records) {
    const entry = {
      licenseNumber: record.licenseNumber,
      tradeName: record.tradeName,
    };

    if (record.needsNarrative) {
      needsNarrativeRecords.push(entry);
    }
    if (record.researchInconclusive) {
      inconclusiveRecords.push(entry);
    }
    if (!record.phone) missingPhone++;
    if (!record.address) missingAddress++;
    if (!record.owner) missingOwner++;
    if (!record.town) missingTown++;
  }

  const issueCount =
    needsNarrativeRecords.length +
    inconclusiveRecords.length +
    missingPhone +
    missingAddress +
    missingOwner +
    missingTown;

  return {
    totalRecords: records.length,
    issueCount,
    needsNarrative: {
      count: needsNarrativeRecords.length,
      records: needsNarrativeRecords,
    },
    researchInconclusive: {
      count: inconclusiveRecords.length,
      records: inconclusiveRecords,
    },
    missingFields: {
      phone: missingPhone,
      address: missingAddress,
      owner: missingOwner,
      town: missingTown,
    },
    warnings,
  };
}
