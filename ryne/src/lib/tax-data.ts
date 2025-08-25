
// src/lib/tax-data.ts

// All data is for the year 2025 and is based on IRS Publication 15-T drafts.
// This is for demonstration purposes and should be verified with official publications.

// FICA Tax Constants
export const socialSecurityRate = 0.062;
export const socialSecurityWageLimit = 174900;
export const medicareRate = 0.0145;
export const additionalMedicareRate = 0.009;

export const additionalMedicareThresholds = {
    'Single or Married filing separately': 200000,
    'Married filing jointly': 250000,
    'Head of Household': 200000,
};

// Federal Income Tax (FIT) Withholding Tables for 2025 (Annualized)
// These tables are a simplified representation of the percentage method tables in IRS Pub 15-T.
// The "over" and "upTo" values define the income brackets.
export const taxBrackets = {
    'Single or Married filing separately': [
        { over: 0, upTo: 14200, rate: 0.10 },
        { over: 14200, upTo: 55950, rate: 0.12 },
        { over: 55950, upTo: 114650, rate: 0.22 },
        { over: 114650, upTo: 213400, rate: 0.24 },
        { over: 213400, upTo: 269750, rate: 0.32 },
        { over: 269750, upTo: 666250, rate: 0.35 },
        { over: 666250, rate: 0.37 },
    ],
    'Married filing jointly': [
        { over: 0, upTo: 28400, rate: 0.10 },
        { over: 28400, upTo: 111900, rate: 0.12 },
        { over: 111900, upTo: 229300, rate: 0.22 },
        { over: 229300, upTo: 426800, rate: 0.24 },
        { over: 426800, upTo: 539500, rate: 0.32 },
        { over: 539500, upTo: 799500, rate: 0.35 },
        { over: 799500, rate: 0.37 },
    ],
    'Head of Household': [
        { over: 0, upTo: 21350, rate: 0.10 },
        { over: 21350, upTo: 74800, rate: 0.12 },
        { over: 74800, upTo: 114650, rate: 0.22 },
        { over: 114650, upTo: 213400, rate: 0.24 },
        { over: 213400, upTo: 269750, rate: 0.32 },
        { over: 269750, upTo: 697900, rate: 0.35 },
        { over: 697900, rate: 0.37 },
    ],
    // This is the higher withholding rate table for when the "Multiple Jobs" box is checked.
    'MultipleJobs': [
         { over: 0, upTo: 14200, rate: 0.10 },
        { over: 14200, upTo: 55950, rate: 0.12 },
        { over: 55950, upTo: 114650, rate: 0.22 },
        { over: 114650, upTo: 213400, rate: 0.24 },
        { over: 213400, upTo: 269750, rate: 0.32 },
        { over: 269750, upTo: 399750, rate: 0.35 },
        { over: 399750, rate: 0.37 },
    ],
};
