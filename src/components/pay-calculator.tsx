'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calculator } from 'lucide-react';

export function PayCalculator() {
  const [grossPay, setGrossPay] = React.useState(0);
  const [deductions, setDeductions] = React.useState(0);

  const handleGrossPayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGrossPay(parseFloat(event.target.value) || 0);
  };

  const handleDeductionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeductions(parseFloat(event.target.value) || 0);
  };

  const netPay = grossPay - deductions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator size={20} /> Pay Calculator
        </CardTitle>
        <CardDescription>Quickly calculate net pay from gross pay and deductions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gross-pay">Gross Pay ($)</Label>
          <Input id="gross-pay" type="number" placeholder="e.g., 2000" onChange={handleGrossPayChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deductions">Deductions ($)</Label>
          <Input id="deductions" type="number" placeholder="e.g., 350" onChange={handleDeductionsChange} />
        </div>
        <div className="space-y-2 pt-2">
          <Label>Net Pay</Label>
          <div className="text-2xl font-bold tracking-tight text-primary">
            ${netPay.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">This is an estimate. Actual pay may vary.</p>
        </div>
      </CardContent>
    </Card>
  );
}
