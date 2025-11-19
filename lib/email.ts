import nodemailer from "nodemailer"

const EMAIL_HOST = process.env.EMAIL_SERVER_HOST
const EMAIL_PORT = parseInt(process.env.EMAIL_SERVER_PORT || "587")
const EMAIL_USER = process.env.EMAIL_SERVER_USER
const EMAIL_PASS = process.env.EMAIL_SERVER_PASSWORD
const EMAIL_FROM = process.env.EMAIL_FROM

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.warn('Warning: Email configuration incomplete. Email sending will fail.')
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text: string
  html?: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export async function sendConfirmationEmail(to: string, name: string) {
  await sendEmail({
    to,
    subject: "Welcome to Hackathon 2026 - NIT Silchar",
    text: `Dear ${name},\n\nThank you for registering for Hackathon 2026 at NIT Silchar. We're excited to have you participate!\n\nBest regards,\nHackathon Organizing Committee`,
    html: `
      <h2>Welcome to Hackathon 2026 - NIT Silchar</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering for Hackathon 2026 at NIT Silchar. We're excited to have you participate!</p>
      <p>You can now log in to your account and start solving problems.</p>
      <p>Best regards,<br>Hackathon Organizing Committee</p>
    `,
  })
}

