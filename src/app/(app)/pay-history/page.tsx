
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { calculatePayStubAction, type CalculatePayStubOutput } from './actions';
import { useToast } from '@/hooks/use-toast';


const calculateHours = (timeString: string) => {
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
  const [payPeriod, setPayPeriod] = React.useState<DateRange | undefined>();
  
  // AI calculation state
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<CalculatePayStubOutput | null>(null);

  const staffPayStubs = allPayStubs.filter(stub => stub.employee === 'Alice');

  const payStubsToDisplay = (role === 'Admin' || role === 'Manager')
    ? selectedEmployee === 'all'
      ? allPayStubs
      : allPayStubs.filter(stub => stub.employee === selectedEmployee)
    : staffPayStubs;
    
  const getGrossPay = () => {
    if (!payPeriod?.from || !payPeriod?.to || !newStubEmployee || !newStubRate) {
        return 0;
    }
    const relevantShifts = allShifts.filter(shift =>
        shift.employee === newStubEmployee &&
        shift.date >= payPeriod.from! &&
        shift.date <= payPeriod.to!
    );
    const totalHours = relevantShifts.reduce((acc, shift) => acc + calculateHours(shift.time), 0);
    return totalHours * newStubRate;
  }
  
  const handleAiCalculate = async () => {
    const grossPay = getGrossPay();
    if (grossPay <= 0) {
        toast({
            variant: 'destructive',
            title: "Calculation Error",
            description: "Please ensure a valid employee, pay period, and rate are selected.",
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
     if (!aiResult) {
        toast({
            variant: 'destructive',
            title: "Cannot Save Stub",
            description: "Please calculate the pay stub with AI first.",
        });
        return;
    }

    const newStub = {
        id: allPayStubs.length + 1,
        employee: newStubEmployee,
        payPeriod: `${format(payPeriod!.from!, "LLL d, y")} - ${format(payPeriod!.to!, "LLL d, y")}`,
        payDate: format(new Date(), 'yyyy-MM-dd'),
        hours: aiResult.grossPay / newStubRate, // Recalculate hours
        rate: newStubRate,
        total: aiResult.netPay, // Use netPay from AI
    };

    setAllPayStubs(prevStubs => [newStub, ...prevStubs]);
    setIsAddStubOpen(false);
    // Reset form
    setNewStubEmployee('Alice');
    setNewStubRate(20);
    setPayPeriod(undefined);
    setAiResult(null);
  };


  return (
    <>
      <PageHeader
        title="Pay History"
        description={ (role === 'Admin' || role === 'Manager') ? "View and manage employee pay stubs." : "Review your past pay stubs."}
      >
        {(role === 'Admin' || role === 'Manager') && (
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee-name" className="text-right">
                    Employee
                  </Label>
                   <select
                        id="employee-name"
                        value={newStubEmployee}
                        onChange={(e) => setNewStubEmployee(e.target.value)}
                        className="col-span-3 p-2 border rounded-md bg-background text-sm"
                    >
                        {Object.keys(employees).map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pay-period" className="text-right">
                        Pay Period
                    </Label>
                    <div className="col-span-3">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !payPeriod && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {payPeriod?.from ? (
                                payPeriod.to ? (
                                    <>
                                    {format(payPeriod.from, "LLL dd, y")} -{" "}
                                    {format(payPeriod.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(payPeriod.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={payPeriod?.from}
                                selected={payPeriod}
                                onSelect={setPayPeriod}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                        State
                    </Label>
                    <Input id="location" value={newStubState} onChange={(e) => setNewStubState(e.target.value)} className="col-span-3" placeholder="e.g., CA" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rate" className="text-right">
                    Rate ($)
                  </Label>
                  <Input id="rate" type="number" value={newStubRate} onChange={(e) => setNewStubRate(parseFloat(e.target.value) || 0)} className="col-span-3" />
                </div>
                 <div className="col-span-4">
                    <Button onClick={handleAiCalculate} disabled={isCalculating} className="w-full bg-accent hover:bg-accent/90">
                        {isCalculating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                        Calculate with AI
                    </Button>
                 </div>
                 {aiResult && (
                    <div className="col-span-4 space-y-4 rounded-lg border bg-muted/50 p-4 mt-4">
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
                <Button type="submit" onClick={handleAddPayStub} disabled={!aiResult}>Save Pay Stub</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Check Stubs</CardTitle>
                <CardDescription>
                {(role === 'Admin' || role === 'Manager') ? "A log of all pay stubs issued." : "A log of all your pay stubs."}
                </CardDescription>
            </div>
             {(role === 'Admin' || role === 'Manager') && (
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
              {(role === 'Admin' || role === 'Manager') && <div className="col-span-1">Employee</div>}
              <div className="col-span-1">Pay Period</div>
              <div className="col-span-1">Pay Date</div>
              <div className="col-span-1 text-right">Hours</div>
              <div className="col-span-1 text-right">Net Pay</div>
              <div className="col-span-1 text-right"></div>
            </div>
            <div className="divide-y">
                {payStubsToDisplay.map((stub) => (
                    <div key={stub.id} className="grid grid-cols-5 p-3 items-center text-sm">
                        {(role === 'Admin' || role === 'Manager') && <div className="col-span-1 font-medium">{stub.employee}</div>}
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
