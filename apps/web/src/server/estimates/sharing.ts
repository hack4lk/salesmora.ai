import "server-only";
import type { EstimateSharedPaper, EstimateSharingReviewResult } from "@salesmora/data";

export function staffEstimatePaper(paper: EstimateSharedPaper): EstimateSharedPaper {
  return {
    ...paper,
    content: {
      ...paper.content,
      business: {
        ...paper.content.business,
        logoPath: paper.content.business.logoPath ? `/api/estimates/${paper.estimateId}/logo` : null,
      },
    },
  };
}

export function staffEstimateSharing(review: EstimateSharingReviewResult): EstimateSharingReviewResult {
  return { ...review, paper: review.paper ? staffEstimatePaper(review.paper) : null };
}
