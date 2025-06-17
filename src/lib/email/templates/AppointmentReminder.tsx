import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentReminderProps {
  name: string;
  serviceName: string;
  date: string;
  time: string;
  reminderType: '24-hour' | '1-hour';
  baseUrl: string;
  bookingId: string;
}

export default function AppointmentReminder({
  name = 'Valued Customer',
  serviceName = 'Your Service',
  date = 'Tomorrow',
  time = '10:00 AM',
  reminderType = '24-hour',
  baseUrl = 'https://yourdomain.com',
  bookingId = '12345'
}: AppointmentReminderProps) {
  const reminderTitle = reminderType === '24-hour' 
    ? 'Appointment Reminder - Tomorrow'
    : 'Appointment Starting Soon';
    
  const reminderMessage = reminderType === '24-hour'
    ? 'Your appointment is scheduled for tomorrow'
    : 'Your appointment is starting in 1 hour';

  return (
    <Html>
      <Head />
      <Preview>
        {reminderTitle} - {serviceName} on {date} at {time}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Servify</Heading>
            <Text style={headerSubtitle}>Appointment Reminder</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>
              {reminderType === '24-hour' ? '⏰ ' : '🔔 '}
              {reminderTitle}
            </Heading>
            
            <Text style={greeting}>Hello {name},</Text>
            
            <Text style={message}>
              {reminderMessage}. Here are your appointment details:
            </Text>

            {/* Appointment Details Card */}
            <Section style={appointmentCard}>
              <Heading style={cardTitle}>Appointment Details</Heading>
              
              <Section style={detailRow}>
                <Text style={detailLabel}>Service:</Text>
                <Text style={detailValue}>{serviceName}</Text>
              </Section>
              
              <Section style={detailRow}>
                <Text style={detailLabel}>Date:</Text>
                <Text style={detailValue}>{date}</Text>
              </Section>
              
              <Section style={detailRow}>
                <Text style={detailLabel}>Time:</Text>
                <Text style={detailValue}>{time}</Text>
              </Section>
              
              <Section style={detailRow}>
                <Text style={detailLabel}>Booking ID:</Text>
                <Text style={detailValue}>{bookingId}</Text>
              </Section>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonContainer}>
              <Button
                style={primaryButton}
                href={`${baseUrl}/appointments/${bookingId}`}
              >
                View Appointment Details
              </Button>
            </Section>

            {/* Preparation Tips */}
            <Section style={tipsSection}>
              <Heading style={tipsTitle}>
                {reminderType === '24-hour' ? 'Preparation Tips' : 'Quick Reminders'}
              </Heading>
              <Text style={tipText}>
                {reminderType === '24-hour' 
                  ? '• Please arrive 5-10 minutes early\n• Bring any necessary documents or items\n• Contact us if you need to reschedule'
                  : '• Your appointment is starting soon\n• Please be ready to arrive on time\n• Contact us immediately if you\'re running late'
                }
              </Text>
            </Section>

            <Hr style={divider} />

            {/* Contact Information */}
            <Section style={contactSection}>
              <Text style={contactTitle}>Need to make changes?</Text>
              <Text style={contactText}>
                If you need to reschedule or cancel your appointment, please contact us as soon as possible.
              </Text>
              <Button
                style={secondaryButton}
                href={`${baseUrl}/appointments/${bookingId}`}
              >
                Manage Appointment
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from Servify. If you have any questions, please contact our support team.
            </Text>
            <Text style={footerText}>
              © 2024 Servify. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '16px',
  margin: '0',
};

const content = {
  padding: '40px',
};

const title = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#333333',
  fontSize: '16px',
  margin: '0 0 16px 0',
};

const message = {
  color: '#555555',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const appointmentCard = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const cardTitle = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '8px 0',
  borderBottom: '1px solid #e9ecef',
  paddingBottom: '8px',
};

const detailLabel = {
  color: '#666666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  width: '30%',
};

const detailValue = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: 'normal',
  margin: '0',
  width: '70%',
  textAlign: 'right' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid #667eea',
  borderRadius: '6px',
  color: '#667eea',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '8px 16px',
};

const tipsSection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const tipsTitle = {
  color: '#856404',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const tipText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-line' as const,
};

const divider = {
  borderColor: '#e9ecef',
  margin: '32px 0',
};

const contactSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const contactTitle = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const contactText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  margin: '0 0 8px 0',
}; 