"use client";

import React, { useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from '@/lib/appointments';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, User, Eye } from "lucide-react";
import { useRouter } from 'next/navigation';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Event-like interface for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  allDay?: boolean;
  resource?: unknown;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectEvent?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ appointments, onSelectEvent }: AppointmentCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  
  // Convert appointments to calendar events
  const events: CalendarEvent[] = appointments.map((appointment: Appointment) => {
    const start = new Date(appointment.date);
    start.setHours(parseInt(appointment.time.split(':')[0]), parseInt(appointment.time.split(':')[1]));
    
    const end = new Date(start);
    end.setHours(end.getHours() + 1); // Assuming 1-hour duration
    
    return {
      id: appointment.id,
      title: appointment.serviceName,
      start,
      end,
      status: appointment.status,
    };
  });

  // Apply custom styling based on appointment status
  const eventStyleGetter = (event: CalendarEvent) => {
    const style = {
      backgroundColor: '#3F88C5', // Steel blue - primary color
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    // Map status to new color palette
    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#10b981'; // Keep green for confirmed
        break;
      case 'pending':
        style.backgroundColor = '#F49D37'; // Carrot orange for pending
        break;
      case 'cancelled':
        style.backgroundColor = '#D72638'; // Crimson for cancelled
        break;
      case 'completed':
        style.backgroundColor = '#3F88C5'; // Steel blue for completed
        break;
      default:
        style.backgroundColor = '#3F88C5'; // Steel blue default
    }
    
    return { style };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      const appointment = appointments.find(a => a.id === event.id);
      if (appointment) {
        onSelectEvent(appointment);
      }
    }
  };
  
  return (
    <Card className="backdrop-blur-sm bg-white/90 shadow-md border-0">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Appointment Calendar</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}
            >
              <span className="hidden sm:inline">Previous Month</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}
            >
              <span className="hidden sm:inline">Next Month</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="h-[400px] sm:h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month']}
            view={view}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            popup
            tooltipAccessor={(event: CalendarEvent) => {
              const statusText = event.status.charAt(0).toUpperCase() + event.status.slice(1);
              return `${event.title}\nStatus: ${statusText}`;
            }}
            components={{
              toolbar: () => null,
              event: ({ event }) => (
                <div className="p-1 text-xs sm:text-sm truncate">
                  {event.title}
                </div>
              ),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
} 