"use client";

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from '@/lib/appointments';
import { Button } from "@/components/ui/button";

// Setup localizer for react-big-calendar
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Event-like interface for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  allDay?: boolean;
  resource?: any;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectEvent?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({ appointments, onSelectEvent }: AppointmentCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  
  // Convert appointments to calendar events
  const events: CalendarEvent[] = appointments.map((appointment) => {
    // Parse the appointment time (e.g., "10:00 AM" -> hours and minutes)
    const timeParts = appointment.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 0;
    let minutes = 0;
    
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      minutes = parseInt(timeParts[2], 10);
      
      // Adjust hours for PM
      if (timeParts[3].toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      }
      // Adjust for 12 AM
      if (timeParts[3].toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    
    // Create start date from appointment date and parsed time
    const start = new Date(appointment.date);
    start.setHours(hours, minutes, 0, 0);
    
    // Parse duration (e.g., "60 min" -> 60)
    const durationMatch = appointment.duration.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 60;
    
    // Calculate end time based on duration
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);
    
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
    let style = {
      backgroundColor: '#6E3FC9', // Default primary color
      borderRadius: '5px',
      color: 'white',
      border: '0px',
      display: 'block',
    };
    
    // Style based on status
    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#10b981'; // Green
        break;
      case 'pending':
        style.backgroundColor = '#f59e0b'; // Amber
        break;
      case 'cancelled':
        style.backgroundColor = '#ef4444'; // Red
        break;
      case 'completed':
        style.backgroundColor = '#3b82f6'; // Blue
        break;
    }
    
    return {
      style
    };
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