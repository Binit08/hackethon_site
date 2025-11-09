# Hackathon 2026 Portal - NIT Silchar

A full-stack hackathon management portal built with Next.js, TypeScript, MongoDB, and shadcn/ui.

## Features

- 🔐 **Authentication**: Secure user authentication with NextAuth.js and JWT
- 👥 **Team Management**: Support for individual and team participation
- 📝 **Multi-step Registration**: Smooth registration flow with auto-focus and validation
- 🎯 **MCQ Round**: Dynamic multiple-choice questions with instant feedback
- 💻 **Coding Round**: Monaco editor integration for code submissions
- 📊 **Leaderboard**: Real-time ranking based on scores
- 🏆 **Certificate Generation**: Automatic certificate generation for participants
- 👨‍💼 **Admin Panel**: Manage problems, submissions, and results
- 📧 **Email Notifications**: Confirmation emails and notifications
- ❓ **FAQ & Contact**: Help system for participants
- 📱 **Responsive Design**: Mobile-friendly interface
- ♿ **Accessible**: WCAG compliant components

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Editor**: Monaco Editor
- **Email**: Nodemailer
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackathon-portal-2026
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="mongodb://localhost:27017/hackathon2026?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hackathon.nits.ac.in"
```

4. (Optional) Seed database with sample data:
```bash
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── admin/           # Admin panel
│   ├── dashboard/       # User dashboard
│   ├── rounds/          # MCQ and Coding rounds
│   └── ...
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions
├── models/             # Mongoose models
├── prisma/             # Seed scripts
└── public/             # Static assets
```

## Sample Test Cases

See `prisma/seed.ts` for sample problems and test cases.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, email support@hackathon.nits.ac.in or open an issue on GitHub.

