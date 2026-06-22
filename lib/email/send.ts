import { resend, FROM_EMAIL } from './client'

export async function sendEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
}
