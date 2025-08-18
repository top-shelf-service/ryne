import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Clock, Megaphone, PlusCircle } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const upcomingShifts = [
    { day: "Today", date: "June 24", time: "9:00 AM - 5:00 PM", role: "Cashier" },
    { day: "Tomorrow", date: "June 25", time: "11:00 AM - 7:00 PM", role: "Barista" },
    { day: "Wednesday", date: "June 26", time: "9:00 AM - 3:00 PM", role: "Cashier" },
  ];

  const announcements = [
    { title: "Summer Staff Party", date: "June 20, 2024", content: "Don't forget our annual summer party this Friday at 7 PM! RSVP by Wednesday." },
    { title: "New Menu Launch", date: "June 18, 2024", content: "We're launching our new summer menu next Monday. Please familiarize yourselves with the new items." },
  ];

  return (
    <>
      <PageHeader title="Welcome, Admin!" description="Here’s what’s happening at your organization today." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Your next 3 scheduled shifts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingShifts.map((shift, index) => (
                <div key={index} className="flex items-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col items-center justify-center h-16 w-16 bg-primary/10 text-primary rounded-lg mr-4">
                    <span className="text-sm font-medium">{shift.day}</span>
                    <span className="text-xs text-primary/80">{shift.date}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{shift.time}</p>
                    <p className="text-sm text-muted-foreground">{shift.role}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Clock In
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
           <CardFooter>
            <Button variant="link" className="p-0">View Full Schedule &rarr;</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock size={20}/> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline"><PlusCircle className="mr-2" /> Request Time Off</Button>
              <Button variant="outline"><PlusCircle className="mr-2" /> Find Open Shifts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone size={20}/> Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.slice(0,1).map((announcement, index) => (
                  <div key={index}>
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{announcement.date}</p>
                    <p className="text-sm">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0">View All Announcements &rarr;</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
       <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
             <CardDescription>A quick look at who's working today.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
               <div key={i} className="flex flex-col items-center text-center gap-2">
                 <Image src={`https://placehold.co/80x80.png`} alt="Team member" width={80} height={80} className="rounded-full" data-ai-hint="person portrait" />
                 <div className="text-sm">
                   <p className="font-semibold">Person {i+1}</p>
                   <p className="text-muted-foreground text-xs">9am - 5pm</p>
                 </div>
               </div>
            ))}
          </CardContent>
        </Card>
    </>
  );
}
