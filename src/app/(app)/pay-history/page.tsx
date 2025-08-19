
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const allPayStubs = [
  { id: 1, employee: 'Alice', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 80, rate: 20, total: 1600 },
  { id: 2, employee: 'Alice', payPeriod: 'May 16-31, 2024', payDate: '2024-06-05', hours: 75, rate: 20, total: 1500 },
  { id: 3, employee: 'Bob', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 85, rate: 22, total: 1870 },
  { id: 4, employee: 'Charlie', payPeriod: 'June 1-15, 2024', payDate: '2024-06-20', hours: 80, rate: 21, total: 1680 },
  { id: 5, employee: 'Bob', payPeriod: 'May 16-31, 2024', payDate: '2024-06-05', hours: 82, rate: 22, total: 1804 },
];

const staffPayStubs = allPayStubs.filter(stub => stub.employee === 'Alice');

// A simple map of employee names to employee IDs for filtering
const employees = {
  'Alice': 'E1',
  'Bob': 'E2',
  'Charlie': 'E3'
};

export default function PayHistoryPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('all');

  const payStubsToDisplay = role === 'Admin'
    ? selectedEmployee === 'all'
      ? allPayStubs
      : allPayStubs.filter(stub => stub.employee === selectedEmployee)
    : staffPayStubs;

  return (
    <>
      <PageHeader
        title="Pay History"
        description={role === 'Admin' ? "View and manage employee pay stubs." : "Review your past pay stubs."}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Check Stubs</CardTitle>
                <CardDescription>
                {role === 'Admin' ? "A log of all pay stubs issued." : "A log of all your pay stubs."}
                </CardDescription>
            </div>
             {role === 'Admin' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter by employee:</span>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="p-2 border rounded-md bg-background text-sm"
                    >
                        <option value="all">All Employees</option>
                        {Object.entries(employees).map(([name, id]) => (
                            <option key={id} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="grid grid-cols-5 p-3 font-semibold bg-muted/50 border-b">
              {role === 'Admin' && <div className="col-span-1">Employee</div>}
              <div className="col-span-1">Pay Period</div>
              <div className="col-span-1">Pay Date</div>
              <div className="col-span-1 text-right">Hours</div>
              <div className="col-span-1 text-right">Total Pay</div>
              <div className="col-span-1 text-right"></div>
            </div>
            <div className="divide-y">
                {payStubsToDisplay.map((stub) => (
                    <div key={stub.id} className="grid grid-cols-5 p-3 items-center text-sm">
                        {role === 'Admin' && <div className="col-span-1 font-medium">{stub.employee}</div>}
                        <div className="col-span-1">{stub.payPeriod}</div>
                        <div className="col-span-1">{stub.payDate}</div>
                        <div className="col-span-1 text-right">{stub.hours}</div>
                        <div className="col-span-1 text-right font-semibold">${stub.total.toFixed(2)}</div>
                        <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {payStubsToDisplay.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No pay stubs found for the selected employee.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

    