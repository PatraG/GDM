# Geospatial Dental Modeler

A comprehensive web-based survey data collection system for oral health research, built with Next.js 15, TypeScript, and Appwrite Cloud.

## 📋 Overview

This application enables structured oral health data collection through a web interface with robust authentication, respondent management, session tracking, multi-survey workflows, and privacy-compliant pseudonymization.

**Key Features:**
- 🔐 Role-based authentication (Admin & Enumerator)
- 👥 Enumerator account management (Admin)
- 📊 Dynamic survey form rendering
- 📍 GPS coordinate capture for responses
- 🔄 Multi-survey per session support
- 👤 Respondent pseudonymization (PDP Law compliant)
- 📈 Admin dashboard with analytics
- 📤 CSV/JSON export functionality
- ⚡ Network retry with exponential backoff
- 🔒 Survey version locking for data integrity

## 🏗️ Architecture

**Tech Stack:**
- **Frontend**: Next.js 15.4.3 (App Router), React 19, TypeScript 5.x
- **UI**: Tailwind CSS 4.x, shadcn/ui components
- **Backend**: Appwrite Cloud (Singapore) - BaaS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

**Collections (Appwrite Database):**
- `users` - Enumerator accounts
- `respondents` - Survey respondents (pseudonymized)
- `sessions` - Data collection sessions
- `surveys` - Survey instruments with versioning
- `questions` - Survey questions
- `options` - Question options (radio/checkbox/scale)
- `responses` - Survey submissions
- `answers` - Individual question answers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (v18.19.1 or higher recommended)
- npm 9+
- Appwrite Cloud account (or self-hosted Appwrite instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PatraG/GDM.git
   cd geospasial-dental-modeler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in your Appwrite credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=oral_health_survey
   ```

4. **Set up Appwrite project** (See [Appwrite Setup Guide](#appwrite-setup))

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Appwrite Setup

### Option 1: Appwrite Cloud (Recommended)

1. **Create Appwrite Project**
   - Go to [cloud.appwrite.io](https://cloud.appwrite.io)
   - Create a new project
   - Select Singapore (sgp) region
   - Copy your Project ID

2. **Create Database**
   - In your project, go to "Databases"
   - Create database: `oral_health_survey`
   - Copy the Database ID

3. **Create Collections**
   
   Run the automated setup script (coming soon) or manually create collections:
   
   **Users Collection:**
   ```
   Attributes:
   - userId (string, required)
   - role (string, required, default: 'enumerator')
   - status (string, required, default: 'active')
   - createdAt (datetime)
   - updatedAt (datetime)
   
   Permissions:
   - role:admin (CRUD)
   - role:enumerator (Read own)
   ```

   **Respondents Collection:**
   ```
   Attributes:
   - pseudonym (string, required, unique) - Auto-generated code
   - ageRange (string, required) - e.g., "18-24"
   - sex (string, required) - "male" | "female" | "other"
   - adminArea (string, required) - Geographic area
   - consentGiven (boolean, required)
   - consentTimestamp (datetime, required)
   - enumeratorId (string, required)
   - createdAt (datetime)
   
   Permissions:
   - role:admin (CRUD)
   - role:enumerator (CRUD own created records)
   ```

   *(Similar structure for other collections - see `/specs/001-survey-workflow/plan.md`)*

4. **Configure Authentication**
   - Go to "Auth" > "Settings"
   - Enable Email/Password auth method
   - Set session length to 2 hours
   - Add your app URL to allowed origins

5. **Create Admin User**
   ```bash
   # In Appwrite Console > Auth > Users
   # Click "Add User"
   # Email: admin@example.com
   # Password: (secure password)
   # Then manually add to 'users' collection with role='admin'
   ```

### Option 2: Self-Hosted Appwrite

1. Install Appwrite following [official docs](https://appwrite.io/docs/installation)
2. Update `NEXT_PUBLIC_APPWRITE_ENDPOINT` to your instance URL
3. Follow collection setup steps from Option 1

## 📖 User Roles & Workflows

### Enumerator Workflow

1. **Login** with email/password
2. **Create Session** for new or existing respondent
3. **Fill Surveys**:
   - Select survey from active list
   - Capture GPS automatically
   - Answer all required questions
   - Submit with retry on network failure
4. **View Session Summary** with submitted surveys
5. **End Session** when data collection complete

### Admin Workflow

1. **Login** with admin credentials
2. **Manage Enumerators**:
   - Create enumerator accounts
   - Suspend/activate accounts
   - View enumerator statistics
3. **View Dashboard**:
   - Submission statistics
   - Charts (responses by survey, time series)
   - Filter submissions by date/enumerator/survey
4. **Quality Control**:
   - Void invalid responses with reason
   - Export data to CSV/JSON
   - Monitor active enumerators

## 🗂️ Project Structure

```
geospasial-dental-modeler/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Auth pages (login)
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── enumerator/      # Enumerator pages
│   │   │   │   ├── respondents/ # Respondent management
│   │   │   │   ├── sessions/    # Session management
│   │   │   │   └── surveys/     # Survey filling
│   │   │   └── admin/           # Admin pages
│   │   │       ├── enumerators/ # Enumerator management
│   │   │       └── dashboard/   # Analytics dashboard
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── admin/               # Admin-specific components
│   │   ├── auth/                # Auth components
│   │   ├── enumerator/          # Enumerator components
│   │   ├── shared/              # Shared components
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Utilities & services
│   │   ├── appwrite/            # Appwrite client & config
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # Business logic services
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Helper functions
│   └── middleware.ts            # Route protection middleware
├── specs/                       # Feature specifications
│   └── 001-survey-workflow/
│       ├── spec.md              # Requirements
│       ├── plan.md              # Technical plan
│       └── tasks.md             # Task breakdown
└── public/                      # Static assets
```

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced via pre-commit hooks
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables:
     ```
     NEXT_PUBLIC_APPWRITE_ENDPOINT
     NEXT_PUBLIC_APPWRITE_PROJECT_ID
     NEXT_PUBLIC_APPWRITE_DATABASE_ID
     ```

3. **Deploy**
   - Vercel automatically deploys on push
   - Production URL provided

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## � Data Privacy & Compliance

**Indonesian PDP Law (UU PDP No. 27/2022) Compliance:**
- ✅ Respondents pseudonymized (R-00001 format)
- ✅ No full names collected
- ✅ Explicit consent required and tracked
- ✅ GPS coordinates justified for spatial analysis
- ✅ Age collected as ranges (18-24, etc.)

**Data Immutability:**
- Submitted responses cannot be edited
- Survey versioning prevents retroactive changes
- Void action creates audit trail

## 🔒 Security

- Role-based access control (RBAC)
- Session timeout after 2-hour inactivity
- Password minimum 8 characters
- All API requests authenticated
- Appwrite built-in security features

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a research project. For collaboration inquiries, please contact the project maintainers.

## 📧 Support

For issues or questions, please open an issue on GitHub or contact:
- **Project Lead**: [Your Name]
- **Email**: [your.email@example.com]

## 🙏 Acknowledgments

- Built with [Appwrite](https://appwrite.io) - Open-source BaaS
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Chart library: [Recharts](https://recharts.org)
- Framework: [Next.js](https://nextjs.org)

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: ✅ Production Ready