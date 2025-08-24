
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Calendar as CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allPayStubsData, allShifts, employees } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays, addDays, startOfMonth, lastDayOfMonth, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { calculatePayStubAction, type CalculatePayStubOutput } from './actions';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export const dynamic = 'force-dynamic';

const calculateHours = (timeString: string) => {
    if (!timeString || !timeString.includes(' - ')) return 0;
    const [startTime, endTime] = timeString.split(' - ');
    const start = new Date(`1970-01-01 ${startTime}`);
    const end = new Date(`1970-01-01 ${endTime}`);
    let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 0) hours += 24; // Handle overnight shifts
    return hours;
};

export default function PayHistoryPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';
  const { toast } = useToast();
  
  // Dialog state
  const [isGenerateStubOpen, setIsGenerateStubOpen] = React.useState(false);
  
  // Data state
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('all');
  const [allPayStubs, setAllPayStubs] = React.useState(allPayStubsData);
  
  // Form state for the dialog
  const [formState, setFormState] = React.useState({
    employee: 'Alice',
    payFrequency: 'Bi-Weekly' as 'Weekly' | 'Bi-Weekly',
    ptoHours: 8,
  });

  const [payPeriodStartDate, setPayPeriodStartDate] = React.useState<Date | undefined>();
  const [payPeriodEndDate, setPayPeriodEndDate] = React.useState<Date | undefined>();
  const [lastEdited, setLastEdited] = React.useState<'start' | 'end' | null>(null);

  
  // AI calculation state
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<CalculatePayStubOutput | null>(null);

  React.useEffect(() => {
    if (!lastEdited) return;

    let newDate;
    if (lastEdited === 'start' && payPeriodStartDate) {
      switch (formState.payFrequency) {
        case 'Weekly': newDate = addDays(payPeriodStartDate, 6); break;
        case 'Bi-Weekly': newDate = addDays(payPeriodStartDate, 13); break;
      }
      if (newDate && (!payPeriodEndDate || !isSameDay(newDate, payPeriodEndDate))) {
          setPayPeriodEndDate(newDate);
      }
    } else if (lastEdited === 'end' && payPeriodEndDate) {
      let startDate;
      switch (formState.payFrequency) {
        case 'Weekly': startDate = subDays(payPeriodEndDate, 6); break;
        case 'Bi-Weekly': startDate = subDays(payPeriodEndDate, 13); break;
      }
      if (startDate && (!payPeriodStartDate || !isSameDay(startDate, payPeriodStartDate))) {
          setPayPeriodStartDate(startDate);
      }
    }
  }, [formState.payFrequency, lastEdited, payPeriodStartDate, payPeriodEndDate]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const staffPayStubs = allPayStubs.filter(stub => stub.employee === 'Alice');

  const payStubsToDisplay = (role === 'Admin' || role === 'Manager')
    ? allPayStubs
        .filter(stub => selectedEmployee === 'all' || stub.employee === selectedEmployee)
    : staffPayStubs;
    
  const getGrossPayFromHours = () => {
    if (!payPeriodStartDate || !payPeriodEndDate) return 0;
    
    const relevantShifts = allShifts.filter(shift => {
        const shiftDateOnly = new Date(shift.date.getFullYear(), shift.date.getMonth(), shift.date.getDate());
        return shift.employee === formState.employee &&
            shiftDateOnly >= payPeriodStartDate &&
            shiftDateOnly <= payPeriodEndDate;
    });

    const totalHours = relevantShifts.reduce((acc, shift) => acc + calculateHours(shift.time), 0);
    const employeeData = employees.find(e => e.name === formState.employee);
    const rate = employeeData?.wageRate || 0;
    return totalHours * rate;
  }
  
  const handleAiCalculate = async () => {
    const grossPayFromHours = getGrossPayFromHours();
    if (grossPayFromHours <= 0 && formState.ptoHours <= 0) {
        toast({
            variant: 'destructive',
            title: "Calculation Error",
            description: "No hours worked or PTO specified for the selected period.",
        });
        return;
    }
    
    setIsCalculating(true);
    setAiResult(null);

    const employeeData = employees.find(e => e.name === formState.employee);
    if (!employeeData) {
        toast({ variant: 'destructive', title: "Employee not found!" });
        setIsCalculating(false);
        return;
    }

    const result = await calculatePayStubAction({ 
        employeeId: employeeData.id,
        grossPayFromHours: grossPayFromHours,
        ptoHours: formState.ptoHours,
        payFrequency: formState.payFrequency,
    });
    
    if (result.error) {
        toast({
            variant: 'destructive',
            title: "AI Calculation Failed",
            description: result.error,
        });
    } else if (result.data) {
        setAiResult(result.data);
    }
    
    setIsCalculating(false);
  }

  const handleAddPayStub = () => {
     if (!aiResult || !payPeriodStartDate || !payPeriodEndDate) {
        toast({
            variant: 'destructive',
            title: "Cannot Save Stub",
            description: "Please calculate the pay stub with AI first and ensure a pay period is selected.",
        });
        return;
    }
    const employeeData = employees.find(e => e.name === formState.employee);
    const rate = employeeData?.wageRate || 0;

    const newStub = {
        id: allPayStubs.length + 1,
        employee: formState.employee,
        payPeriod: `${format(payPeriodStartDate, "LLL d, y")} - ${format(payPeriodEndDate, "LLL d, y")}`,
        payDate: format(new Date(), 'yyyy-MM-dd'),
        hours: (aiResult.grossPay - (formState.ptoHours * rate)) / rate,
        rate: rate,
        total: aiResult.netPay,
    };

    setAllPayStubs(prevStubs => [newStub, ...prevStubs].sort((a,b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()));
    setIsGenerateStubOpen(false);
  };
  
  const isAdminOrManager = role === 'Admin' || role === 'Manager';


  return (
    <>
      <PageHeader
        title="Pay History"
        description={ isAdminOrManager ? "View and manage employee pay stubs." : "Review your past pay stubs."}
      >
        {isAdminOrManager && (
          <Dialog open={isGenerateStubOpen} onOpenChange={setIsGenerateStubOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle />
                Generate Pay Stub
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Pay Stub</DialogTitle>
                <DialogDescription>
                  Calculate and generate a new pay stub using the employee's onboarded W-4 information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Column 1: Pay Info */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Pay Period Details</h4>
                    <div className="space-y-2">
                        <Label htmlFor="employee">Employee</Label>
                        <select id="employee" name="employee" value={formState.employee} onChange={handleFormChange} className="w-full p-2 border rounded-md bg-background text-sm">
                            {employees.map((emp) => (<option key={emp.id} value={emp.name}>{emp.name}</option>))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ptoHours">PTO Hours to Apply</Label>
                        <Input id="ptoHours" name="ptoHours" type="number" value={formState.ptoHours} onChange={handleFormChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="payFrequency">Pay Frequency</Label>
                        <RadioGroup name="payFrequency" value={formState.payFrequency} onValueChange={(val: 'Weekly' | 'Bi-Weekly') => setFormState(p => ({...p, payFrequency: val}))} className="flex items-center gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Weekly" id="weekly" /><Label htmlFor="weekly" className="font-normal">Weekly</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Bi-Weekly" id="bi-weekly" /><Label htmlFor="bi-weekly" className="font-normal">Bi-Weekly</Label></div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Pay Period</Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !payPeriodStartDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {payPeriodStartDate ? format(payPeriodStartDate, "MM/dd/y") : <span>Start</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={payPeriodStartDate} onSelect={(d) => {setPayPeriodStartDate(d); setLastEdited('start');}} initialFocus /></PopoverContent>
                            </Popover>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !payPeriodEndDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {payPeriodEndDate ? format(payPeriodEndDate, "MM/dd/y") : <span>End</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={payPeriodEndDate} onSelect={(d) => {setPayPeriodEndDate(d); setLastEdited('end');}} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="pt-4">
                        <Button onClick={handleAiCalculate} disabled={isCalculating} className="w-full bg-accent hover:bg-accent/90">
                            {isCalculating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                            Calculate with AI
                        </Button>
                    </div>
                </div>

                {/* Column 2: Calculation Result */}
                 <div className="space-y-4">
                    <h4 className="font-semibold text-lg border-b pb-2">Calculation Result</h4>
                    {isCalculating && <div className='flex justify-center items-center h-40'><Loader2 className="animate-spin" /></div>}
                    {aiResult && !isCalculating && (
                        <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <span>Gross Pay:</span><span className="text-right font-medium">${aiResult.grossPay.toFixed(2)}</span>
                                <span className="pl-2 text-muted-foreground">Pre-Tax Deductions:</span><span className="text-right font-medium">-${aiResult.deductions.preTax.toFixed(2)}</span>
                                <span className="pl-2 text-muted-foreground">Federal Tax:</span><span className="text-right font-medium">-${aiResult.deductions.federal.toFixed(2)}</span>
                                <span className="pl-2 text-muted-foreground">State Tax:</span><span className="text-right font-medium">-${aiResult.deductions.state.toFixed(2)}</span>
                                <span className="pl-2 text-muted-foreground">Social Security:</span><span className="text-right font-medium">-${aiResult.deductions.socialSecurity.toFixed(2)}</span>
                                <span className="pl-2 text-muted-foreground">Medicare:</span><span className="text-right font-medium">-${aiResult.deductions.medicare.toFixed(2)}</span>
                                <span className="font-bold border-t pt-2 mt-1">Net Pay:</span><span className="font-bold border-t pt-2 mt-1 text-right">${aiResult.netPay.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground italic pt-2">{aiResult.reasoning}</p>
                        </div>
                    )}
                     {!aiResult && !isCalculating && (
                        <div className="flex items-center justify-center h-40 text-center text-sm text-muted-foreground border rounded-lg bg-muted/20">
                           <p>Enter pay period details and click "Calculate with AI" to see the results.</p>
                        </div>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsGenerateStubOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleAddPayStub} disabled={!aiResult || isCalculating}>Save Pay Stub</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Check Stubs</CardTitle>
                <CardDescription>
                {isAdminOrManager ? "A log of all pay stubs issued." : "A log of all your pay stubs."}
                </CardDescription>
            </div>
             {isAdminOrManager && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Label className="text-sm font-medium whitespace-nowrap">Filter by Employee:</Label>
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="p-2 border rounded-md bg-background text-sm w-full sm:w-auto"
                    >
                        <option value="all">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.name}>{emp.name}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr className="border-b">
                        {isAdminOrManager && <th className="p-3 text-left font-semibold">Employee</th>}
                        <th className="p-3 text-left font-semibold w-1/3">Pay Period</th>
                        <th className="p-3 text-left font-semibold whitespace-nowrap">Pay Date</th>
                        <th className="p-3 text-right font-semibold">Hours</th>
                        <th className="p-3 text-right font-semibold">Net Pay</th>
                        <th className="p-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {payStubsToDisplay.map((stub) => (
                        <tr key={stub.id}>
                            {isAdminOrManager && <td className="p-3 font-medium">{stub.employee}</td>}
                            <td className="p-3">{stub.payPeriod}</td>
                            <td className="p-3 whitespace-nowrap">{stub.payDate}</td>
                            <td className="p-3 text-right">{stub.hours.toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold">${stub.total.toFixed(2)}</td>
                            <td className="p-3">
                                <div className="flex justify-end">
                                    <Button variant="ghost" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {payStubsToDisplay.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No pay stubs found for the selected filters.
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
