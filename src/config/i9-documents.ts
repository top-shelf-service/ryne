/**
 * USCIS I-9 Acceptable Documents
 * List A: identity + employment authorization
 * List B: identity only
 * List C: employment authorization only
 *
 * Source: USCIS Handbook for Employers M-274
 */

export type I9Document = {
  list: "A" | "B" | "C";
  code: string; // internal key
  label: string; // display name
  requiresExpiration?: boolean;
  requiresNumber?: boolean;
};

export const I9_DOCUMENTS: I9Document[] = [
  // === List A ===
  {
    list: "A",
    code: "us_passport",
    label: "U.S. Passport or U.S. Passport Card",
    requiresExpiration: true,
    requiresNumber: true,
  },
  {
    list: "A",
    code: "green_card",
    label: "Permanent Resident Card (Form I-551, Green Card)",
    requiresExpiration: true,
    requiresNumber: true,
  },
  {
    list: "A",
    code: "ead_card",
    label: "Employment Authorization Document (Form I-766, with photo)",
    requiresExpiration: true,
    requiresNumber: true,
  },
  {
    list: "A",
    code: "foreign_passport_i94",
    label: "Foreign passport with Form I-94 or I-94A showing work authorization",
    requiresExpiration: true,
    requiresNumber: true,
  },
  {
    list: "A",
    code: "fsm_rmi_passport",
    label: "Passport from Micronesia/Marshall Islands with Form I-94 or I-94A",
    requiresExpiration: true,
    requiresNumber: true,
  },

  // === List B ===
  {
    list: "B",
    code: "driver_license",
    label: "Driver’s license or ID card issued by state (with photo or info)",
    requiresExpiration: true,
    requiresNumber: true,
  },
  {
    list: "B",
    code: "school_id",
    label: "School ID card with photograph",
    requiresNumber: true,
  },
  {
    list: "B",
    code: "voter_card",
    label: "Voter registration card",
    requiresNumber: true,
  },
  {
    list: "B",
    code: "military_card",
    label: "U.S. military card or draft record",
    requiresNumber: true,
  },
  {
    list: "B",
    code: "tribal_doc_b",
    label: "Native American tribal document (identity)",
    requiresNumber: true,
  },

  // === List C ===
  {
    list: "C",
    code: "ssn_card",
    label: "U.S. Social Security card (unrestricted)",
    requiresNumber: true,
  },
  {
    list: "C",
    code: "birth_cert",
    label: "Birth Certificate (original or certified copy)",
  },
  {
    list: "C",
    code: "birth_abroad",
    label: "Certification of Birth Abroad (Form FS-545, DS-1350)",
  },
  {
    list: "C",
    code: "tribal_doc_c",
    label: "Native American tribal document (work authorization)",
    requiresNumber: true,
  },
  {
    list: "C",
    code: "dhs_doc",
    label: "Employment authorization document issued by DHS (not List A)",
    requiresExpiration: true,
    requiresNumber: true,
  },
];

/**
 * Helper: get docs by list type
 */
export function getDocumentsByList(list: "A" | "B" | "C") {
  return I9_DOCUMENTS.filter(d => d.list === list);
}
