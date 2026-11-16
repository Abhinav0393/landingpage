export interface ClientReview {
  id: string;
  quote: string;
  /** Attribution shown under the quote. Sample entries use a neutral label only. */
  name: string;
  /** Buyer context, not a company or job title. */
  role: string;
  /** Written approval from the client is required before production publication. */
  approved: boolean;
  /** Preview-only copy. A production build fails while any sample entry exists. */
  sample: boolean;
}

/**
 * PREVIEW-ONLY SAMPLE REVIEWS
 *
 * These entries are written for design review. They contain no client names,
 * companies, locations, money amounts, ratings, comparisons or promised
 * outcomes. Replace them with approved client reviews (sample:false,
 * approved:true) before a production build.
 */
export const clientReviews: ClientReview[] = [
  {
    id: 'review-01',
    quote:
      'The written opinion separated confirmed facts from items that still needed checking, and each finding pointed to the record it came from.',
    name: 'Sample client 1',
    role: 'Plot purchaser',
    approved: false,
    sample: true,
  },
  {
    id: 'review-02',
    quote:
      'The team explained the documents required at the start and gave a clear update at the end of each stage.',
    name: 'Sample client 2',
    role: 'Agricultural land buyer',
    approved: false,
    sample: true,
  },
  {
    id: 'review-03',
    quote:
      'Questions about an older mutation entry were answered with the relevant extracts and a short written note.',
    name: 'Sample client 3',
    role: 'Family property owner',
    approved: false,
    sample: true,
  },
  {
    id: 'review-04',
    quote:
      'The examination was thorough, and the report set out what had been checked, what remained open and what to do next.',
    name: 'Sample client 4',
    role: 'Institutional acquisition team',
    approved: false,
    sample: true,
  },
  {
    id: 'review-05',
    quote:
      'Communication stayed steady throughout the engagement, and the final report was easy to follow.',
    name: 'Sample client 5',
    role: 'First-time buyer',
    approved: false,
    sample: true,
  },
];

export const sampleReviews = clientReviews.filter((review) => review.sample);
export const unapprovedReviews = clientReviews.filter((review) => !review.approved);
export const approvedReviews = clientReviews.filter((review) => review.approved && !review.sample);
