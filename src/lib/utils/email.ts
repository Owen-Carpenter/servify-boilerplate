/**
 * Email utility functions
 */

/**
 * Get the sender email address from environment variables
 * Falls back to a default if not configured
 */
export function getSenderEmail(): string {
  const envEmail = process.env.EMAIL_FROM;
  
  // Don't use EMAIL_FROM if it's an unverified domain like gmail.com, yahoo.com, etc.
  if (envEmail && 
      !envEmail.includes('gmail.com') && 
      !envEmail.includes('yahoo.com') && 
      !envEmail.includes('hotmail.com') &&
      !envEmail.includes('outlook.com')) {
    return envEmail;
  }
  
  // Fallback to default verified domain
  return 'noreply@servify-booking.shop';
}

/**
 * Get the formatted sender string with name and email
 */
export function getFormattedSender(name: string = 'Servify'): string {
  return `${name} <${getSenderEmail()}>`;
} 