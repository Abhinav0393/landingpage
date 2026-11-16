import { siteEnv } from '../lib/site-env';

export interface LegalSection {
  id: string;
  number: number;
  title: string;
  content: string[]; // Markdown/HTML paragraphs or list items
  internalNote?: string;
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  effectiveDate: string | null;
  lastUpdated: string | null;
  approved: boolean;
  sections: LegalSection[];
}

export const legalPlaceholders: Record<string, string | null> = {
  firmName: null, // e.g. "RIVORA Advocates & Associates" or full registered legal entity name
  registeredOffice: null, // Physical registered office address in Telangana/Andhra Pradesh/Delhi
  grievanceEmail: null, // Official grievance officer email address
  retentionPeriod: null, // Specific enquiry data retention window (e.g. "90 days from enquiry resolution")
  governingCourtCity: null, // Specific court jurisdiction city (e.g. "Hyderabad")
  effectiveDate: null, // Effective date upon written advocate confirmation
};

export const legalApproved = false;

// Production guard: fail build if approved is false or placeholders remain
if (siteEnv === 'production') {
  const missingPlaceholders = Object.entries(legalPlaceholders)
    .filter(([_, value]) => value === null || value.trim() === '')
    .map(([key]) => key);

  if (!legalApproved || missingPlaceholders.length > 0) {
    const reasons: string[] = [];
    if (!legalApproved) {
      reasons.push('legal terms and privacy policy are marked approved:false (draft status)');
    }
    if (missingPlaceholders.length > 0) {
      reasons.push(`unresolved legal placeholders remain: ${missingPlaceholders.join(', ')}`);
    }
    throw new Error(
      `RIVORA production build blocked: ${reasons.join('; ')}. Written approval by advocate and resolution of all placeholders in src/data/legal.ts is required before production publication.`
    );
  }
}

/**
 * PRIVACY POLICY DRAFT
 * Internal review note: advocate to confirm applicable provisions and wording under the Digital Personal Data Protection Act, 2023 and Information Technology Act, 2000.
 */
export const privacyPolicy: LegalDocument = {
  title: 'Privacy Policy',
  subtitle: 'Draft document prepared for advocate review. Governs data collection and handling across the RIVORA website.',
  effectiveDate: legalPlaceholders.effectiveDate,
  lastUpdated: '11 November 2026',
  approved: legalApproved,
  sections: [
    {
      id: 'scope',
      number: 1,
      title: 'Who We Are and Scope',
      content: [
        'This Privacy Policy applies to the website operated on behalf of {firmName} ("we", "us", or "the firm"), an Indian legal practice providing property title verification, due diligence, and related advisory services across Telangana, Andhra Pradesh, and New Delhi.',
        'This policy explains how personal information received through this website is handled. It does not alter or replace standard advocate-client confidentiality obligations established under separate written engagements.',
      ],
      internalNote: 'Advocate to confirm registered practice entity name and jurisdictional scope.',
    },
    {
      id: 'data-collected',
      number: 2,
      title: 'Personal Data We Collect',
      content: [
        'When you submit an enquiry through our contact form, we collect the information you choose to enter: your full name, telephone number, optional email address, property location or survey number, enquiry category, and message summary.',
        'When you access the website, web server hosting infrastructure may automatically record standard technical connection details in server logs, including your internet protocol (IP) address, browser type, operating system, and request timestamps.',
        'If you initiate contact via direct telephone call or WhatsApp links on the website, your telephone number and message history are transmitted through and handled by those respective telecommunication or third-party messaging providers in accordance with their terms.',
      ],
    },
    {
      id: 'purposes',
      number: 3,
      title: 'Purposes and Legal Basis for Processing',
      content: [
        'We process the details submitted through the contact form solely to review your enquiry, verify whether the matter falls within our practice scope, communicate with you, and schedule consultations.',
        'The primary basis for processing is your consent, provided when you check the consent confirmation box on the contact form, as well as necessary preliminary communication regarding potential legal representation under applicable Indian professional standards.',
      ],
      internalNote: 'Advocate to confirm alignment with notice and consent provisions under DPDP Act 2023.',
    },
    {
      id: 'confidentiality-caution',
      number: 4,
      title: 'What You Should Not Send',
      content: [
        'Please do not transmit original title deeds, registered documents, encumbrance certificates, financial records, or sensitive confidential records through this website form.',
        'Initial contact should contain only a general overview of the property location, survey number, and nature of verification required. If document review is initiated, our office will provide instructions for secure transfer.',
      ],
    },
    {
      id: 'sharing',
      number: 5,
      title: 'Data Sharing and Disclosures',
      content: [
        'We do not sell, rent, trade, or monetize personal data collected through this website.',
        'Data submitted through the form is accessed only by authorized advocates and staff members for enquiry evaluation. Information may be processed by technical service providers who host our web infrastructure or support email delivery, strictly under confidentiality obligations.',
        'We may disclose personal information if required by applicable Indian law, court order, or formal regulatory directive.',
      ],
    },
    {
      id: 'retention',
      number: 6,
      title: 'Data Retention',
      content: [
        'Contact form enquiries that do not proceed to a formal written legal engagement are retained only for a reasonable verification window ({retentionPeriod}) to allow follow-up, after which they are deleted or anonymized.',
        'Where an enquiry leads to a formal engagement, retention of client files is governed by professional advocate record-keeping requirements and applicable limitation laws.',
      ],
      internalNote: 'Advocate to specify exact retention window for non-client enquiry submissions.',
    },
    {
      id: 'security',
      number: 7,
      title: 'Information Security',
      content: [
        'We implement reasonable technical and organizational measures to safeguard data against unauthorized access, loss, or misuse, including HTTPS encryption in transit.',
        'However, no internet transmission or electronic storage method is completely secure. We cannot guarantee absolute security against malicious interception.',
      ],
    },
    {
      id: 'rights',
      number: 8,
      title: 'Your Rights and Choices',
      content: [
        'Subject to applicable law including the Digital Personal Data Protection Act, 2023, you have the right to request access to the personal data you provided, seek correction of inaccurate records, request deletion where data is no longer necessary for enquiry evaluation, and withdraw consent.',
        'To exercise these rights, please submit a written request using the contact details set out below.',
      ],
      internalNote: 'Advocate to verify compliance with DPDP Act 2023 Section 11-13 rights framework.',
    },
    {
      id: 'cookies',
      number: 9,
      title: 'Cookies and Tracking',
      content: [
        'This website does not set non-essential marketing, tracking, or advertising cookies.',
        'We do not operate third-party analytics trackers or cross-site behavioral tracking scripts.',
      ],
    },
    {
      id: 'third-party-links',
      number: 10,
      title: 'Third-Party Links and Services',
      content: [
        'The website includes links to third-party services, such as WhatsApp for communication. We have no control over the privacy practices of third-party platforms. Your interactions with them are governed by their respective privacy policies.',
      ],
    },
    {
      id: 'minors',
      number: 11,
      title: 'Children and Minors',
      content: [
        'This website is intended for individuals capable of entering legal transactions regarding immovable property and is not directed at persons under 18 years of age.',
      ],
    },
    {
      id: 'changes',
      number: 12,
      title: 'Changes to This Policy',
      content: [
        'We may update this Privacy Policy from time to time. The updated version will be indicated by the "Last updated" date at the top of this page.',
      ],
    },
    {
      id: 'contact-grievance',
      number: 13,
      title: 'Contact and Grievance Officer',
      content: [
        'If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, you may reach our office:',
        'Practice Office: {firmName}',
        'Registered Address: {registeredOffice}',
        'Telephone: +91 8099888851',
        'Grievance Contact: {grievanceEmail}',
      ],
      internalNote: 'Advocate to confirm designated grievance contact person and email address.',
    },
  ],
};

/**
 * TERMS & CONDITIONS DRAFT
 * Internal review note: advocate to confirm compliance with Bar Council of India rules and applicable High Court practice rules.
 */
export const termsAndConditions: LegalDocument = {
  title: 'Terms & Conditions',
  subtitle: 'Draft terms prepared for advocate review. Governs the general informational use of the RIVORA website.',
  effectiveDate: legalPlaceholders.effectiveDate,
  lastUpdated: '11 November 2026',
  approved: legalApproved,
  sections: [
    {
      id: 'acceptance',
      number: 1,
      title: 'Acceptance and Use',
      content: [
        'By accessing and using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please discontinue using the site.',
      ],
    },
    {
      id: 'information-only',
      number: 2,
      title: 'Informational Content Only; Not Legal Advice',
      content: [
        'The materials, descriptions of practice areas, process overviews, and statutory summaries on this website are provided for general informational purposes only.',
        'Nothing on this website constitutes legal advice, formal title certification, or a binding legal opinion. Property title verification requires case-specific examination of certified revenue records and registered deeds.',
      ],
    },
    {
      id: 'no-relationship',
      number: 3,
      title: 'No Advocate-Client Relationship',
      content: [
        'Viewing this website, submitting an enquiry through the contact form, sending an email, or contacting us via phone or WhatsApp does not create an advocate-client relationship between you and {firmName} or any of our advocates.',
        'An advocate-client relationship is formed solely upon formal conflict clearance, mutual execution of a written engagement letter or vakalatnama, and agreed terms of representation.',
        'Unsolicited information sent through the website cannot be treated as privileged or confidential before an engagement is formalized.',
      ],
    },
    {
      id: 'professional-rules',
      number: 4,
      title: 'Compliance with Professional Rules',
      content: [
        'This website is maintained in accordance with the standards of the Bar Council of India and applicable High Court practice rules. It does not solicit work, advertise professional services, or make comparative or superlative marketing claims.',
        'The purpose of this site is solely to provide information regarding the practice profile, areas of practice, and contact channels of the firm to existing and prospective clients seeking information.',
      ],
      internalNote: 'Advocate to confirm whether a formal acknowledgement gate or specific Bar Council of India disclaimer wording is required.',
    },
    {
      id: 'no-guarantee',
      number: 5,
      title: 'Accuracy and No Guarantee of Outcomes',
      content: [
        'While we strive to keep information on this website accurate, property laws, revenue portal procedures (such as Dharani or Meebhoomi), and registration rules evolve. We make no warranty that information on the site is continuously complete or current.',
        'Past examination findings or transaction summaries do not guarantee similar outcomes in future matters.',
      ],
    },
    {
      id: 'intellectual-property',
      number: 6,
      title: 'Intellectual Property',
      content: [
        'All contents of this website, including text, structure, graphics, and the RIVORA logo, are the intellectual property of the firm or its licensors and are protected under Indian copyright and trademark laws.',
        'You may view and print individual pages for your personal reference. No part of this site may be reproduced, republished, or distributed without prior written consent.',
      ],
    },
    {
      id: 'acceptable-use',
      number: 7,
      title: 'Acceptable Use',
      content: [
        'You agree to use this website only for lawful purposes. You must not attempt to compromise website security, introduce malicious code, submit fraudulent enquiries, or probe network vulnerability.',
      ],
    },
    {
      id: 'third-party-links',
      number: 8,
      title: 'Third-Party Links',
      content: [
        'Links to external websites or third-party platforms (such as messaging apps or state land registries) are provided solely for user convenience. We do not endorse and assume no responsibility for external content.',
      ],
    },
    {
      id: 'limitation-liability',
      number: 9,
      title: 'Limitation of Liability',
      content: [
        'To the fullest extent permitted by applicable Indian law, the firm and its advocates shall not be liable for any direct, indirect, incidental, or consequential loss arising from reliance on website materials before formal legal engagement.',
      ],
    },
    {
      id: 'governing-law',
      number: 10,
      title: 'Governing Law and Jurisdiction',
      content: [
        'These Terms & Conditions and any dispute arising in connection with this website shall be governed by and construed in accordance with the laws of India.',
        'The competent courts located at {governingCourtCity} shall have exclusive jurisdiction over any proceeding arising out of these terms.',
      ],
      internalNote: 'Advocate to confirm city of exclusive court jurisdiction.',
    },
    {
      id: 'changes',
      number: 11,
      title: 'Changes to These Terms',
      content: [
        'We reserve the right to revise these Terms & Conditions at any time. Changes will be effective upon posting the revised terms on the website.',
      ],
    },
    {
      id: 'contact',
      number: 12,
      title: 'Contact Information',
      content: [
        'For queries concerning these Terms & Conditions, please contact:',
        'Practice: {firmName}',
        'Office: {registeredOffice}',
        'Telephone: +91 8099888851',
      ],
    },
  ],
};

