import { getKycWorkshopSeedData } from './seedKycWorkshop.js';
import { getPartsCsatSeedData } from './seedPartsCsat.js';

export function getExtensionSeedData() {
  const { kycList, jobCards } = getKycWorkshopSeedData();
  const { spareParts, csatSurveys } = getPartsCsatSeedData();
  return { kycList, jobCards, spareParts, csatSurveys };
}