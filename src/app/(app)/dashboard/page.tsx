
'use client';

import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Megaphone, PlusCircle, Bell, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from '@/components/ui/calendar';
import { allShifts, type Shift } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';
  const name = role === 'Admin' ? 'Admin' : 'Staff Member';

  const [date, setDate] = React.useState<Date | undefined>(new Date(2024, 5, 24));
  const [isAddShiftOpen, setIsAddShiftOpen] = React.useState(false);
  const [isEditShiftOpen, setIsEditShiftOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);

  const announcements = [
    { title: "Summer Staff Party", date: "June 20, 2024", content: "Don't forget our annual summer party this Friday at 7 PM! RSVP by Wednesday." },
    { title: "New Menu Launch", date: "June 18, 2024", content: "We're launching our new summer menu next Monday. Please familiarize yourselves with the new items." },
  ];

  const handleEditClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditShiftOpen(true);
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  }

  const selectedDayShifts = allShifts.filter(shift =>
    date &&
    shift.date.getDate() === date.getDate() &&
    shift.date.getMonth() === date.getMonth() &&
    shift.date.getFullYear() === date.getFullYear()
  );

  const staffShifts = allShifts.filter(shift => shift.employee === 'Alice').slice(0, 5);

  return (
    <>
      <PageHeader title={`Welcome, ${name}!`} description="Here’s what’s happening at your organization today.">
        {role === 'Admin' && (
           <div className="flex gap-2">
             <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
                <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Shift
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Add New Shift</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to add a new shift to the schedule.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                            Employee
                            </Label>
                            <Input id="name" value="Alice" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                            Time
                            </Label>
                            <Input id="username" value="9:00 AM - 5:00 PM" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                            Role
                            </Label>
                            <Input id="role" value="Cashier" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                    <Button type="submit" onClick={() => setIsAddShiftOpen(false)}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
             <Button variant="outline" onClick={() => console.log('Manage Requests clicked')}>
               <Bell className="mr-2 h-4 w-4" />
               Manage Requests
             </Button>
            <Button variant="outline" onClick={() => console.log('Add User clicked')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        )}
         {(role === 'Staff' || role === 'Manager') && (
           <Button asChild>
             <Link href="#">Request Time Off</Link>
           </Button>
        )}
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
           <Card>
            <CardContent className="p-0">
               <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="w-full"
                modifiers={{
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
           {role === 'Admin' && (
            <div className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Megaphone size={20}/> Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.slice(0,2).map((announcement, index) => (
                      <div key={index}>
                        <p className="font-semibold">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">{announcement.date}</p>
                        <p className="text-sm">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
            <Card className="min-h-[425px]">
              <CardHeader>
                <CardTitle>
                  {role === 'Admin' && date ? `Shifts for ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : "Your Upcoming Shifts"}
                </CardTitle>
                <CardDescription>
                   {role === 'Admin' ? `There are ${selectedDayShifts.length} shifts scheduled.` : "Here are your next five shifts."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(role === 'Admin' ? selectedDayShifts : staffShifts).map((shift) => (
                    <div key={shift.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex-grow">
                        <p className="font-semibold">{shift.employee} <span className="text-sm text-muted-foreground font-normal">as {shift.role}</span></p>
                        <p className="text-sm">{shift.time}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">Break: {shift.break}</p>
                      </div>
                      <Badge variant={shift.status === 'Confirmed' ? 'secondary' : 'default'} className={shift.status === 'Pending' ? "bg-amber-500 text-white" : ""}>
                        {shift.status}
                      </Badge>
                       {role === 'Admin' && (
                        <Button variant="ghost" size="sm" className="ml-4" onClick={() => handleEditClick(shift)}>Edit</Button>
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
       <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>
                Modify the details for {selectedShift?.employee}'s shift.
              </DialogDescription>
            </DialogHeader>
            {selectedShift && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-employee" className="text-right">
                    Employee
                  </Label>
                  <Input id="edit-employee" defaultValue={selectedShift.employee} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-time" className="text-right">
                    Time
                  </Label>
                  <Input id="edit-time" defaultValue={selectedShift.time} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-break" className="text-right">
                    Break
                  </Label>
                  <Input id="edit-break" defaultValue={selectedShift.break} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    Role
                  </Label>
                  <Input id="edit-role" defaultValue={selectedShift.role} className="col-span-3" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={() => setIsEditShiftOpen(false)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
