'use client';

import * as React from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, UserPlus, Bell } from 'lucide-react';

const allShifts = [
  { id: 1, employee: 'Alice', date: new Date(2024, 5, 24), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed' },
  { id: 2, employee: 'Bob', date: new Date(2024, 5, 24), time: '11:00 AM - 7:00 PM', role: 'Barista', status: 'Confirmed' },
  { id: 3, employee: 'Alice', date: new Date(2024, 5, 25), time: '9:00 AM - 3:00 PM', role: 'Cashier', status: 'Confirmed' },
  { id: 4, employee: 'Charlie', date: new Date(2024, 5, 25), time: '1:00 PM - 9:00 PM', role: 'Barista', status: 'Pending' },
  { id: 5, employee: 'Bob', date: new Date(2024, 5, 26), time: '11:00 AM - 7:00 PM', role: 'Barista', status: 'Confirmed' },
  { id: 6, employee: 'Alice', date: new Date(2024, 5, 27), time: '9:00 AM - 5:00 PM', role: 'Cashier', status: 'Confirmed' },
];

const staffShifts = allShifts.filter(shift => shift.employee === 'Alice').slice(0, 3);


export default function SchedulesPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';
  const [date, setDate] = React.useState<Date | undefined>(new Date(2024, 5, 24));

  const createHrefWithRole = (href: string) => {
    return `${href}?role=${role}`;
  }
  
  const selectedDayShifts = allShifts.filter(shift => 
    shift.date.getDate() === date?.getDate() &&
    shift.date.getMonth() === date?.getMonth() &&
    shift.date.getFullYear() === date?.getFullYear()
  );

  return (
    <div>
      <PageHeader
        title="Schedules"
        description={role === 'Admin' ? "Plan and manage schedules for your team." : "View your upcoming shifts."}
      >
        {role === 'Admin' && (
           <div className="flex gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
             <Button variant="outline">
               <Bell className="mr-2 h-4 w-4" />
               Manage Requests
             </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        )}
         {role === 'Staff' && (
           <Button asChild>
             <Link href="#">Request Time Off</Link>
           </Button>
        )}
      </PageHeader>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-0">
               <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                modifiers={{
                  // Highlight days with shifts
                  hasShifts: allShifts.map(s => s.date)
                }}
                modifiersStyles={{
                   hasShifts: {
                     fontWeight: 'bold',
                     textDecoration: 'underline',
                   }
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
           <Card className="min-h-[425px]">
              <CardHeader>
                <CardTitle>
                  {role === 'Admin' ? `Shifts for ${date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : "Your Upcoming Shifts"}
                </CardTitle>
                <CardDescription>
                   {role === 'Admin' ? `There are ${selectedDayShifts.length} shifts scheduled.` : "Here are your next three shifts."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(role === 'Admin' ? selectedDayShifts : staffShifts).map((shift) => (
                    <div key={shift.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex-grow">
                        <p className="font-semibold">{shift.employee} <span className="text-sm text-muted-foreground font-normal">as {shift.role}</span></p>
                        <p className="text-sm">{shift.time}</p>
                      </div>
                      <Badge variant={shift.status === 'Confirmed' ? 'secondary' : 'default'} className={shift.status === 'Pending' ? "bg-amber-500 text-white" : ""}>
                        {shift.status}
                      </Badge>
                       {role === 'Admin' && (
                        <Button variant="ghost" size="sm" className="ml-4">Edit</Button>
                      )}
                    </div>
                  ))}
                   {role === 'Admin' && selectedDayShifts.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No shifts scheduled for this day.</p>
                      </div>
                  )}
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
