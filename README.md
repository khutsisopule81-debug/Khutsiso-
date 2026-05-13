# Stars of Africa Football Academy - Trial Registration System

A complete, production-ready trial registration system for Stars of Africa Football Academy built with Next.js, React, Prisma, and PostgreSQL.

## 🚀 Features

✅ **Beautiful, Responsive Registration Form**
- Complete form validation (client & server-side)
- File upload for proof of payment (JPG, PNG, PDF - max 5MB)
- Accessible UI with ARIA labels and error messaging
- Real-time form validation feedback
- Smooth success/error notifications

✅ **Backend API**
- RESTful POST endpoint at `/api/register`
- Prisma ORM for database operations
- File upload handling with security validation
- Comprehensive error handling

✅ **Email Notifications**
- Beautiful HTML emails to parents confirming registration
- Admin notifications with full registration details
- Professional email templates with academy branding

✅ **Database**
- Prisma ORM with PostgreSQL
- Automatic migrations
- Indexed queries for performance
- Prisma Studio for data management

✅ **Security**
- File type and size validation
- Environment variable protection
- CORS-ready for API calls
- Proper error messages without sensitive data leaks

## 📋 Prerequisites

- Node.js 18+ (ideally v20)
- PostgreSQL database (free options: Railway, Vercel Postgres, Neon)
- Gmail account with 2FA enabled (or other SMTP service)

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Choose one of these options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create a database
createdb stars_of_africa

# Get your connection string
# postgresql://user:password@localhost:5432/stars_of_africa
```

**Option B: Cloud Database (Recommended)**
- **Railway**: https://railway.app (PostgreSQL template)
- **Vercel Postgres**: https://vercel.com/postgres
- **Neon**: https://neon.tech (free tier)

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stars_of_africa"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
REGISTRATION_EMAIL="admin@starsofafrica.com"
```

### 4. Gmail Setup (for Email Notifications)

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** → Enable **2-Step Verification**
3. Generate an [App Password](https://support.google.com/accounts/answer/185833)
4. Use the 16-character password as `EMAIL_PASSWORD` in `.env.local`

### 5. Initialize Database

```bash
npm run db:init
```

This creates the database schema and generates Prisma client.

### 6. Create Uploads Directory

```bash
mkdir -p public/uploads/proofs
```

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📁 Project Structure

```
.
├── app/
│   ├── api/
│   │   └── register/
│   │       └── route.ts          # Registration API endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── StarsOfAfricaWebsite.tsx  # Main registration form
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   └── schema.prisma             # Database schema
├── public/
│   └── uploads/
│       └── proofs/               # Uploaded payment proofs
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── .env.example
```

## 🔄 How It Works

### Form Submission Flow

1. **User fills form** → Client-side validation
2. **User uploads file** → File type/size validation
3. **Form submitted** → POST to `/api/register`
4. **File saved** → Stored in `public/uploads/proofs/`
5. **Data saved** → Stored in PostgreSQL via Prisma
6. **Emails sent** → Confirmation to parent, notification to admin
7. **Success response** → User sees success message

### API Response

**Success (201):**
```json
{
  "success": true,
  "message": "Registration submitted successfully! We will contact you soon.",
  "registrationId": "clx1234abcd5678efgh"
}
```

**Error (400/500):**
```json
{
  "error": "Failed to process registration",
  "message": "Error details here"
}
```

## 🗄️ Database Management

### View Data with Prisma Studio

```bash
npm run db:studio
```

Opens `http://localhost:5555` with a visual database editor.

### Run Migrations

```bash
# After schema changes
npm run db:migrate
```

## 📧 Email Configuration

### Using Different Email Services

**Gmail** (recommended)
```env
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="app-password"
# Already configured in route.ts
```

**Outlook/Office 365**
```env
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
```

Update `app/api/register/route.ts` transporter:
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

```bash
npm install -g vercel
vercel
```

### Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Railway auto-detects Next.js
4. Add PostgreSQL plugin
5. Set environment variables
6. Deploy!

### Deploy to Heroku

```bash
npm install -g heroku
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 🧪 Testing

### Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/register \
  -F "playerName=John Doe" \
  -F "dateOfBirth=2010-05-15" \
  -F "position=Midfielder" \
  -F "school=St. John's High" \
  -F "ageCategory=U13" \
  -F "parentName=Jane Doe" \
  -F "contactNumber=0734429023" \
  -F "email=parent@example.com" \
  -F "needsTransport=Yes" \
  -F "proofOfPayment=@payment.jpg"
```

## 📊 Monitoring

Monitor registrations in real-time:

```bash
# View all registrations
npm run db:studio

# Check application logs
tail -f ~/.pm2/logs/*.log
```

## 🔒 Security Best Practices

✅ Done:
- Environment variables for sensitive data
- File type validation (JPG, PNG, PDF only)
- File size limits (5MB max)
- Server-side validation (don't trust client)
- CSRF protection via Next.js

⚠️ To-Do:
- Add rate limiting (use `express-rate-limit`)
- Add CAPTCHA verification (Google reCAPTCHA)
- Hash sensitive data in database
- Add user authentication for admin panel
- Set up SSL/TLS for HTTPS

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Test connection: `psql postgres://user:pass@localhost:5432/db`

### Email Not Sending
```
Error: Invalid login: 535-5.7.8 Username and password not accepted
```
- Use App Password, not regular Gmail password
- Enable 2FA on Gmail account
- Check EMAIL_USER and EMAIL_PASSWORD are correct

### File Upload Not Working
- Check `public/uploads/proofs/` directory exists
- Verify file permissions
- Check file size < 5MB
- Verify MIME type is JPG, PNG, or PDF

## 📞 Support

Need help? Contact Stars of Africa:
- **WhatsApp**: 073 442 9023
- **Address**: 72 Indra Street, Mayfair West, Johannesburg

## 📄 License

This project is proprietary to Stars of Africa Football Academy.

---

**Built with ❤️ by GitHub Copilot**
