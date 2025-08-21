
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
  const [isAddStubOpen, setIsAddStubOpen] = React.useState(false);
  
  // Data state
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('all');
  const [allPayStubs, setAllPayStubs] = React.useState(allPayStubsData);
  
  // Form state
  const [newStubEmployee, setNewStubEmployee] = React.useState('Alice');
  const [newStubRate, setNewStubRate] = React.useState(20);
  const [newStubState, setNewStubState] = React.useState('CA');
  const [payFrequency, setPayFrequency] = React.useState<'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly'>('bi-weekly');
  const [payPeriodStartDate, setPayPeriodStartDate] = React.useState<Date | undefined>();
  const [payPeriodEndDate, setPayPeriodEndDate] = React.useState<Date | undefined>();
  const [lastEdited, setLastEdited] = React.useState<'start' | 'end' | null>(null);

  
  // AI calculation state
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<CalculatePayStubOutput | null>(null);

  React.useEffect(() => {
    if (!lastEdited) return;

    if (lastEdited === 'start' && payPeriodStartDate) {
      let endDate;
      switch (payFrequency) {
        case 'weekly':
          endDate = addDays(payPeriodStartDate, 6);
          break;
        case 'bi-weekly':
          endDate = addDays(payPeriodStartDate, 13);
          break;
        case 'semi-monthly':
          if (payPeriodStartDate.getDate() === 1) {
            endDate = new Date(payPeriodStartDate.getFullYear(), payPeriodStartDate.getMonth(), 15);
          } else if (payPeriodStartDate.getDate() === 16) {
            endDate = lastDayOfMonth(payPeriodStartDate);
          }
          break;
        case 'monthly':
          endDate = lastDayOfMonth(payPeriodStartDate);
          break;
      }
      if (endDate && (!payPeriodEndDate || !isSameDay(endDate, payPeriodEndDate))) {
          setPayPeriodEndDate(endDate);
      }
    } else if (lastEdited === 'end' && payPeriodEndDate) {
      let startDate;
      switch (payFrequency) {
        case 'weekly':
          startDate = subDays(payPeriodEndDate, 6);
          break;
        case 'bi-weekly':
          startDate = subDays(payPeriodEndDate, 13);
          break;
        case 'semi-monthly':
           if (payPeriodEndDate.getDate() <= 15) {
                startDate = startOfMonth(payPeriodEndDate);
            } else {
                startDate = new Date(payPeriodEndDate.getFullYear(), payPeriodEndDate.getMonth(), 16);
            }
          break;
        case 'monthly':
          startDate = startOfMonth(payPeriodEndDate);
          break;
      }
       if (startDate && (!payPeriodStartDate || !isSameDay(startDate, payPeriodStartDate))) {
          setPayPeriodStartDate(startDate);
       }
    }
  }, [payFrequency, lastEdited, payPeriodStartDate, payPeriodEndDate]);

  const handleStartDateSelect = (date: Date | undefined) => {
    setPayPeriodStartDate(date);
    setLastEdited('start');
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setPayPeriodEndDate(date);
    setLastEdited('end');
  };

  const handleFrequencyChange = (value: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly') => {
    setPayFrequency(value);
    setPayPeriodStartDate(undefined);
    setPayPeriodEndDate(undefined);
    setLastEdited(null);
    setAiResult(null);
  };

  const staffPayStubs = allPayStubs.filter(stub => stub.employee === 'Alice');

  const payStubsToDisplay = (role === 'Admin' || role === 'Manager')
    ? allPayStubs
        .filter(stub => selectedEmployee === 'all' || stub.employee === selectedEmployee)
    : staffPayStubs;
    
  const getGrossPay = () => {
    if (!payPeriodStartDate || !payPeriodEndDate || !newStubEmployee || !newStubRate) {
        return 0;
    }

    // Ensure start date is before end date
    const startDate = payPeriodStartDate < payPeriodEndDate ? payPeriodStartDate : payPeriodEndDate;
    const endDate = payPeriodStartDate < payPeriodEndDate ? payPeriodEndDate : payPeriodStartDate;

    const relevantShifts = allShifts.filter(shift => {
        const shiftDateOnly = new Date(shift.date.getFullYear(), shift.date.getMonth(), shift.date.getDate());
        return shift.employee === newStubEmployee &&
            shiftDateOnly >= startDate &&
            shiftDateOnly <= endDate;
    });

    const totalHours = relevantShifts.reduce((acc, shift) => acc + calculateHours(shift.time), 0);
    return totalHours * newStubRate;
  }
  
  const handleAiCalculate = async () => {
    const grossPay = getGrossPay();
    if (grossPay <= 0) {
        toast({
            variant: 'destructive',
            title: "Calculation Error",
            description: "Please select an employee, a valid pay period, and rate. Ensure shifts exist in that period.",
        });
        return;
    }
    
    setIsCalculating(true);
    setAiResult(null);

    const result = await calculatePayStubAction({ grossPay, location: newStubState });
    
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

    const newStub = {
        id: allPayStubs.length + 1,
        employee: newStubEmployee,
        payPeriod: `${format(payPeriodStartDate, "LLL d, y")} - ${format(payPeriodEndDate, "LLL d, y")}`,
        payDate: format(new Date(), 'yyyy-MM-dd'),
        hours: aiResult.grossPay / newStubRate, // Recalculate hours
        rate: newStubRate,
        total: aiResult.netPay, // Use netPay from AI
    };

    setAllPayStubs(prevStubs => [newStub, ...prevStubs].sort((a,b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()));
    setIsAddStubOpen(false);
    // Reset form
    setNewStubEmployee('Alice');
    setNewStubRate(20);
    setPayPeriodStartDate(undefined);
    setPayPeriodEndDate(undefined);
    setPayFrequency('bi-weekly');
    setAiResult(null);
    setLastEdited(null);
  };
  
  const isAdminOrManager = role === 'Admin' || role === 'Manager';


  return (
    <>
      <PageHeader
        title="Pay History"
        description={ isAdminOrManager ? "View and manage employee pay stubs." : "Review your past pay stubs."}
      >
        {isAdminOrManager && (
          <Dialog open={isAddStubOpen} onOpenChange={setIsAddStubOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle />
                Add Pay Stub
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Pay Stub</DialogTitle>
                <DialogDescription>
                  Calculate and generate a new pay stub using AI-powered deductions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee-name">Employee</Label>
                        <select
                            id="employee-name"
                            value={newStubEmployee}
                            onChange={(e) => setNewStubEmployee(e.target.value)}
                            className="w-full p-2 border rounded-md bg-background text-sm"
                        >
                            {Object.keys(employees).map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pay-frequency">Pay Frequency</Label>
                        <RadioGroup
                            value={payFrequency}
                            onValueChange={handleFrequencyChange}
                            className="flex items-center gap-4 flex-wrap"
                        >
                            <div className="flex items-center space-x-2"><RadioGroupItem value="weekly" id="weekly" /><Label htmlFor="weekly" className="font-normal">W</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="bi-weekly" id="bi-weekly" /><Label htmlFor="bi-weekly" className="font-normal">B</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="semi-monthly" id="semi-monthly" /><Label htmlFor="semi-monthly" className="font-normal">S</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="monthly" id="monthly" /><Label htmlFor="monthly" className="font-normal">M</Label></div>
                        </RadioGroup>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="pay-period-start">Period Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button id="start-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !payPeriodStartDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {payPeriodStartDate ? format(payPeriodStartDate, "LLL dd, y") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={payPeriodStartDate} onSelect={handleStartDateSelect} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pay-period-end">Period End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button id="end-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !payPeriodEndDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {payPeriodEndDate ? format(payPeriodEndDate, "LLL dd, y") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={payPeriodEndDate} onSelect={handleEndDateSelect} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">State</Label>
                        <Input id="location" value={newStubState} onChange={(e) => setNewStubState(e.target.value)} placeholder="e.g., CA" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rate">Rate ($/hr)</Label>
                        <Input id="rate" type="number" value={newStubRate} onChange={(e) => setNewStubRate(parseFloat(e.target.value) || 0)} />
                    </div>
                 </div>

                 <div className="pt-2">
                    <Button onClick={handleAiCalculate} disabled={isCalculating} className="w-full bg-accent hover:bg-accent/90">
                        {isCalculating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                        Calculate with AI
                    </Button>
                 </div>
                 {aiResult && (
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4 mt-4">
                        <h4 className="font-semibold">Calculation Result</h4>
                         <div className="grid grid-cols-2 gap-2 text-sm">
                            <span>Gross Pay:</span><span className="text-right font-medium">${aiResult.grossPay.toFixed(2)}</span>
                            <span>Federal Tax:</span><span className="text-right font-medium">-${aiResult.deductions.federal.toFixed(2)}</span>
                            <span>State Tax:</span><span className="text-right font-medium">-${aiResult.deductions.state.toFixed(2)}</span>
                            <span>FICA:</span><span className="text-right font-medium">-${aiResult.deductions.fica.toFixed(2)}</span>
                            <span className="font-bold border-t pt-2">Net Pay:</span><span className="font-bold border-t pt-2 text-right">${aiResult.netPay.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mt-2">{aiResult.reasoning}</p>
                    </div>
                 )}
              </div>
              <DialogFooter>
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
                        {Object.entries(employees).map(([name, id]) => (
                            <option key={id} value={name}>{name}</option>
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

