import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
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

