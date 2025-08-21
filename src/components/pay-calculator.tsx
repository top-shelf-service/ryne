
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator } from 'lucide-react';
import { taxBrackets, additionalMedicareThresholds, socialSecurityRate, socialSecurityWageLimit, medicareRate, additionalMedicareRate } from '@/lib/tax-data';

// Mock state tax function as per requirements
const calculateStateTax = (state: string, taxableIncome: number) => {
  // In a real app, this would be a complex function based on state laws.
  if (state.toUpperCase() === 'CA') return taxableIncome * 0.08;
  if (state.toUpperCase() === 'NY') return taxableIncome * 0.065;
  if (state.toUpperCase() === 'TX') return 0; // No state income tax
  return taxableIncome * 0.05; // Default mock rate
};


export function PayCalculator() {
  const [inputs, setInputs] = React.useState({
    grossPay: 0,
    payFrequency: 'Bi-Weekly',
    yearToDateGross: 0,
    filingStatus: 'Single or Married filing separately',
    isMultipleJobsChecked: false,
    dependentsAmount: 0,
    otherIncome: 0,
    otherDeductions: 0,
    extraWithholding: 0,
    healthInsuranceDeduction: 0,
    _401kDeduction: 0,
    roth401kDeduction: 0,
    garnishments: 0,
    state: 'CA', // Added state for state tax calculation
  });

  const [results, setResults] = React.useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // Asserting target is an HTMLInputElement for checkbox handling
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

    setInputs(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
  };
  
  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
      setInputs(prev => ({ ...prev, isMultipleJobsChecked: !!checked }));
  }


  const handleCalculate = () => {
    // 1. Calculate Total Pre-Tax Deductions
    const totalPreTaxDeductions = inputs.healthInsuranceDeduction + inputs._401kDeduction;

    // 2. Determine Taxable Income
    const ficaTaxableIncome = Math.max(0, inputs.grossPay - inputs.healthInsuranceDeduction);
    const federalTaxableIncome = Math.max(0, inputs.grossPay - totalPreTaxDeductions);
    
    // 3. Calculate FICA Taxes
    const remainingSSTaxable = socialSecurityWageLimit - inputs.yearToDateGross;
    const currentSSTaxable = Math.max(0, Math.min(ficaTaxableIncome, remainingSSTaxable));
    const socialSecurityWithholding = currentSSTaxable * socialSecurityRate;

    let medicareWithholding = ficaTaxableIncome * medicareRate;

    const ytdPlusCurrentGross = inputs.yearToDateGross + ficaTaxableIncome;
    const medicareThreshold = additionalMedicareThresholds[inputs.filingStatus as keyof typeof additionalMedicareThresholds] || 200000;
    let additionalMedicareWithholding = 0;
    if (ytdPlusCurrentGross > medicareThreshold) {
      const additionalTaxableBase = (ytdPlusCurrentGross - medicareThreshold) - Math.max(0, inputs.yearToDateGross - medicareThreshold);
      additionalMedicareWithholding = additionalTaxableBase * additionalMedicareRate;
    }

    // 4. Calculate Federal Income Tax (FIT)
    const annualTaxableWages = (federalTaxableIncome * (inputs.payFrequency === 'Weekly' ? 52 : 26)) - inputs.otherDeductions;
    const adjustedAnnualWage = Math.max(0, annualTaxableWages + inputs.otherIncome);

    const bracketKey = inputs.isMultipleJobsChecked ? 'MultipleJobs' : inputs.filingStatus as keyof typeof taxBrackets;
    const brackets = taxBrackets[bracketKey];
    
    let tentativeWithholding = 0;
    let remainingIncome = adjustedAnnualWage;
    
    for (const bracket of brackets) {
      if (remainingIncome > bracket.over) {
        const taxableInBracket = Math.min(remainingIncome - bracket.over, (bracket.upTo || Infinity) - bracket.over);
        tentativeWithholding += taxableInBracket * bracket.rate;
      }
    }
    
    const taxCredits = inputs.dependentsAmount;
    const annualWithholding = Math.max(0, tentativeWithholding - taxCredits);
    let federalIncomeTaxWithholding = (annualWithholding / (inputs.payFrequency === 'Weekly' ? 52 : 26)) + inputs.extraWithholding;

    // 5. Calculate State Tax
    // For simplicity, using federal taxable income as base for state. This can vary by state.
    const stateTaxableIncome = federalTaxableIncome; 
    const stateIncomeTaxWithholding = calculateStateTax(inputs.state, stateTaxableIncome);

    // 6. Calculate Total Deductions and Withholding
    const totalTaxes = federalIncomeTaxWithholding + socialSecurityWithholding + medicareWithholding + additionalMedicareWithholding + stateIncomeTaxWithholding;
    const totalPostTaxDeductions = inputs.roth401kDeduction + inputs.garnishments;
    const totalDeductions = totalPreTaxDeductions + totalTaxes + totalPostTaxDeductions - inputs.extraWithholding; // Extra is part of FIT

    // 7. Calculate Net Pay
    const netPay = inputs.grossPay - (totalTaxes + totalPreTaxDeductions + totalPostTaxDeductions);


    setResults({
      grossPay: inputs.grossPay,
      totalPreTaxDeductions,
      healthInsuranceDeduction: inputs.healthInsuranceDeduction,
      _401kDeduction: inputs._401kDeduction,
      totalTaxes,
      federalIncomeTaxWithholding,
      socialSecurityWithholding,
      medicareWithholding,
      additionalMedicareWithholding,
      stateIncomeTaxWithholding,
      roth401kDeduction: inputs.roth401kDeduction,
      garnishments: inputs.garnishments,
      netPay
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={20} /> Paycheck Calculator
          </CardTitle>
          <CardDescription>Estimate your take-home pay for a single pay period.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pay Information */}
          <fieldset className="space-y-4 p-4 border rounded-lg">
            <legend className="text-lg font-semibold px-2">Pay Information</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grossPay">Gross Pay</Label>
                <Input id="grossPay" name="grossPay" type="number" onChange={handleInputChange} value={inputs.grossPay} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payFrequency">Pay Frequency</Label>
                <select name="payFrequency" id="payFrequency" className="w-full p-2 border rounded-md bg-background text-sm" onChange={handleInputChange} value={inputs.payFrequency}>
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                </select>
              </div>
               <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="yearToDateGross">Year-to-Date Gross Pay</Label>
                <Input id="yearToDateGross" name="yearToDateGross" type="number" onChange={handleInputChange} value={inputs.yearToDateGross}/>
              </div>
            </div>
          </fieldset>
          
           {/* Federal Tax Withholding */}
          <fieldset className="space-y-4 p-4 border rounded-lg">
            <legend className="text-lg font-semibold px-2">Federal Tax (W-4)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="filingStatus">Filing Status</Label>
                    <select id="filingStatus" name="filingStatus" className="w-full p-2 border rounded-md bg-background text-sm" onChange={handleInputChange} value={inputs.filingStatus}>
                        <option>Single or Married filing separately</option>
                        <option>Married filing jointly</option>
                        <option>Head of Household</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dependentsAmount">Dependents Amount (Step 3)</Label>
                    <Input id="dependentsAmount" name="dependentsAmount" type="number" onChange={handleInputChange} value={inputs.dependentsAmount}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="otherIncome">Other Income (Step 4a)</Label>
                    <Input id="otherIncome" name="otherIncome" type="number" onChange={handleInputChange} value={inputs.otherIncome}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="otherDeductions">Other Deductions (Step 4b)</Label>
                    <Input id="otherDeductions" name="otherDeductions" type="number" onChange={handleInputChange} value={inputs.otherDeductions}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="extraWithholding">Extra Withholding (Step 4c)</Label>
                    <Input id="extraWithholding" name="extraWithholding" type="number" onChange={handleInputChange} value={inputs.extraWithholding}/>
                </div>
                 <div className="flex items-center space-x-2 sm:col-span-2">
                    <Checkbox id="isMultipleJobsChecked" name="isMultipleJobsChecked" onCheckedChange={handleCheckboxChange} checked={inputs.isMultipleJobsChecked} />
                    <Label htmlFor="isMultipleJobsChecked" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Multiple jobs or spouse works (Step 2c)
                    </Label>
                </div>
            </div>
          </fieldset>
          
           {/* Deductions & Contributions */}
          <fieldset className="space-y-4 p-4 border rounded-lg">
            <legend className="text-lg font-semibold px-2">Deductions</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="healthInsuranceDeduction">Health Insurance (Pre-tax)</Label>
                <Input id="healthInsuranceDeduction" name="healthInsuranceDeduction" type="number" onChange={handleInputChange} value={inputs.healthInsuranceDeduction}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="_401kDeduction">401(k) (Pre-tax)</Label>
                <Input id="_401kDeduction" name="_401kDeduction" type="number" onChange={handleInputChange} value={inputs._401kDeduction}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roth401kDeduction">Roth 401(k) (Post-tax)</Label>
                <Input id="roth401kDeduction" name="roth401kDeduction" type="number" onChange={handleInputChange} value={inputs.roth401kDeduction}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="garnishments">Garnishments (Post-tax)</Label>
                <Input id="garnishments" name="garnishments" type="number" onChange={handleInputChange} value={inputs.garnishments}/>
              </div>
            </div>
          </fieldset>
          
            {/* State */}
            <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-lg font-semibold px-2">State Information</legend>
                 <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" type="text" placeholder="e.g. CA" onChange={handleInputChange} value={inputs.state}/>
                </div>
            </fieldset>

          <Button onClick={handleCalculate} className="w-full">Calculate</Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>An itemized breakdown of your estimated pay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
             <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                <span className="font-semibold">Gross Pay</span>
                <span className="font-semibold">${results.grossPay.toFixed(2)}</span>
            </div>
            
            <div className="space-y-1">
                <h4 className="font-semibold text-muted-foreground">Pre-Tax Deductions</h4>
                <div className="flex justify-between p-2 border-b"><span>Health Insurance</span><span>-${results.healthInsuranceDeduction.toFixed(2)}</span></div>
                <div className="flex justify-between p-2 border-b"><span>401(k)</span><span>-${results._401kDeduction.toFixed(2)}</span></div>
            </div>

            <div className="space-y-1">
                 <h4 className="font-semibold text-muted-foreground">Taxes Withheld</h4>
                 <div className="flex justify-between p-2 border-b"><span>Federal Income Tax</span><span>-${results.federalIncomeTaxWithholding.toFixed(2)}</span></div>
                 <div className="flex justify-between p-2 border-b"><span>Social Security</span><span>-${results.socialSecurityWithholding.toFixed(2)}</span></div>
                 <div className="flex justify-between p-2 border-b"><span>Medicare</span><span>-${(results.medicareWithholding + results.additionalMedicareWithholding).toFixed(2)}</span></div>
                 <div className="flex justify-between p-2 border-b"><span>State Tax</span><span>-${results.stateIncomeTaxWithholding.toFixed(2)}</span></div>
            </div>

            <div className="space-y-1">
                 <h4 className="font-semibold text-muted-foreground">Post-Tax Deductions</h4>
                 <div className="flex justify-between p-2 border-b"><span>Roth 401(k)</span><span>-${results.roth401kDeduction.toFixed(2)}</span></div>
                 <div className="flex justify-between p-2 border-b"><span>Garnishments</span><span>-${results.garnishments.toFixed(2)}</span></div>
            </div>

             <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md mt-4">
                <span className="text-lg font-bold">Net Pay</span>
                <span className="text-lg font-bold">${results.netPay.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground italic text-center pt-2">This is an estimate. Actual pay may vary.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
