import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';
import PaymentReceipt from './templates/PaymentReceipt';
import AppointmentCancellation from './templates/AppointmentCancellation';
import React from 'react';
import 'server-only';

// Initialize Resend with API key - only works on server
let resend: Resend | null = null;
if (typeof window === 'undefined') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Base URL for application links
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Send a payment receipt email
 */
export async function sendPaymentReceiptEmail({
  email,
  name,
  bookingId,
  serviceName,
  date,
  time,
  amount
}: {
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
}) {
  try {
    if (!resend) {
      console.error('Resend not initialized. This function can only be called from server components.');
      return { success: false, error: 'Email sending is only available server-side' };
    }
    
    // Render the React email component to HTML
    const html = await renderAsync(
      React.createElement(PaymentReceipt, {
        name,
        bookingId,
        serviceName,
        date,
        time,
        amount,
        baseUrl: BASE_URL
      })
    );

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Servify <onboarding@resend.dev>',
      to: email,
      subject: `Payment Receipt for ${serviceName}`,
      html
    });

    if (error) {
      console.error('Error sending payment receipt email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendPaymentReceiptEmail:', error);
    return { success: false, error };
  }
}

/**
 * Send an appointment cancellation email
 */
export async function sendAppointmentCancellationEmail({
  email,
  name,
  bookingId,
  serviceName,
  date,
  time
}: {
  email: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  try {
    if (!resend) {
      console.error('Resend not initialized. This function can only be called from server components.');
      return { success: false, error: 'Email sending is only available server-side' };
    }
    
    // Render the React email component to HTML
    const html = await renderAsync(
      React.createElement(AppointmentCancellation, {
        name,
        bookingId,
        serviceName,
        date,
        time,
        baseUrl: BASE_URL
      })
    );

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Servify <onboarding@resend.dev>',
      to: email,
      subject: `Your appointment for ${serviceName} has been cancelled`,
      html
    });

    if (error) {
      console.error('Error sending appointment cancellation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendAppointmentCancellationEmail:', error);
    return { success: false, error };
  }
} 