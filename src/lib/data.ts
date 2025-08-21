

export type Shift = {
  id: number;
  employee: string;
  date: Date;
  time: string; // e.g., '9:00 AM - 5:00 PM'
  role: string;
  status: string;
  break: string;
};

export const allShifts: Shift[] = [
  { id: 1, employee: 'Alice', date: new Date(2024, 5, 24), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  { id: 2, employee: 'Bob', date: new Date(2024, 5, 24), time: '11:00 AM - 7:00 PM', role: 'Barista', status: 'Confirmed', break: '2:00 PM - 2:30 PM' },
  { id: 3, employee: 'Alice', date: new Date(2024, 5, 25), time: '9:00 AM - 3:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:00 PM - 12:30 PM' },
  { id: 4, employee: 'Charlie', date: new Date(2024, 5, 25), time: '1:00 PM - 9:00 PM', role: 'Barista', status: 'Pending', break: '4:00 PM - 4:30 PM' },
  { id: 5, employee: 'Bob', date: new Date(2024, 5, 26), time: '11:00 AM - 7:00 PM', role: 'Barista', status: 'Confirmed', break: '2:00 PM - 2:30 PM' },
  { id: 6, employee: 'Alice', date: new Date(2024, 5, 27), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  // Add more shifts for calculation purposes
  { id: 7, employee: 'Alice', date: new Date(2024, 5, 1), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  { id: 8, employee: 'Alice', date: new Date(2024, 5, 2), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  { id: 9, employee: 'Alice', date: new Date(2024, 5, 3), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  { id: 10, employee: 'Alice', date: new Date(2024, 5, 4), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
  { id: 11, employee: 'Alice', date: new Date(2024, 5, 5), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed', break: '12:30 PM - 1:00 PM' },
];

export const allPayStubsData = [
  { id: 1, employee: 'Alice', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 80, rate: 20, total: 1600 },
  { id: 2, employee: 'Alice', payPeriod: 'May 16-31, 2024', payDate: '2024-06-05', hours: 75, rate: 20, total: 1500 },
  { id: 3, employee: 'Bob', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 85, rate: 22, total: 1870 },
  { id: 4, employee: 'Charlie', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 80, rate: 21, total: 1680 },
  { id: 5, employee: 'Bob', payPeriod: 'May 16-31, 2024', payDate: '2024-06-05', hours: 82, rate: 22, total: 1804 },
  { id: 6, employee: 'Charlie', payPeriod: 'May 16-31, 2024', payDate: '2024-06-05', hours: 80, rate: 21, total: 1680 },
].sort((a,b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime());

export const employees = [
  {
    id: 'E1',
    name: 'Alice',
    ptoBalanceHours: 40,
    wageRate: 20,
    state: 'CA',
    yearToDateGross: 3200,
    filingStatus: 'Single or Married filing separately' as const,
    isMultipleJobsChecked: false,
    dependentsAmount: 0,
    otherIncome: 0,
    otherDeductions: 0,
    extraWithholding: 0,
    preTaxDeductions: 100,
  },
  {
    id: 'E2',
    name: 'Bob',
    ptoBalanceHours: 80,
    wageRate: 25,
    state: 'NY',
    yearToDateGross: 4000,
    filingStatus: 'Married filing jointly' as const,
    isMultipleJobsChecked: true,
    dependentsAmount: 2000,
    otherIncome: 0,
    otherDeductions: 0,
    extraWithholding: 50,
    preTaxDeductions: 150,
  },
  {
    id: 'E3',
    name: 'Charlie',
    ptoBalanceHours: 16,
    wageRate: 18,
    state: 'TX',
    yearToDateGross: 2880,
    filingStatus: 'Head of Household' as const,
    isMultipleJobsChecked: false,
    dependentsAmount: 500,
    otherIncome: 100,
    otherDeductions: 0,
    extraWithholding: 0,
    preTaxDeductions: 75,
  },
];
