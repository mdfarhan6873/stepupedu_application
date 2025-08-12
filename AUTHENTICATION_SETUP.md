# StepUpEdu Authentication Setup Guide

## Overview
This application uses NextAuth v5 (Auth.js) for authentication with role-based access control for Admin, Student, and Teacher users.

## Features Implemented

### 1. Authentication System
- ✅ NextAuth v5 integration with credentials provider
- ✅ Secure password hashing using bcrypt
- ✅ JWT-based session management
- ✅ Role-based authentication (Admin, Student, Teacher)

### 2. Protected Routes
- ✅ Middleware-based route protection
- ✅ Automatic redirection based on user role
- ✅ Prevents unauthorized access to dashboards
- ✅ Redirects authenticated users from login page to their respective dashboards

### 3. User Interface
- ✅ Beautiful, responsive login page with StepUpEdu branding
- ✅ Role selection dropdown in login form
- ✅ Separate dashboards for Admin, Student, and Teacher
- ✅ Session-aware navigation with user info display
- ✅ Sign out functionality

### 4. Database Integration
- ✅ MongoDB connection with Mongoose
- ✅ Three separate models/collections (Admin, Student, Teacher)
- ✅ Unique mobile number validation
- ✅ Automatic timestamps

## Test Credentials

After running the seed script, you can use these credentials to test:

| Role    | Mobile Number | Password    |
|---------|---------------|-------------|
| Admin   | 9999999999    | admin123    |
| Student | 8888888888    | student123  |
| Teacher | 6666666666    | teacher123  |

## Project Structure

```
stepupedu_application/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API route
│   │   └── register/route.ts            # User registration API
│   ├── dashboard/
│   │   ├── admin/page.tsx              # Admin dashboard
│   │   ├── student/page.tsx            # Student dashboard
│   │   └── teacher/page.tsx            # Teacher dashboard
│   ├── login/page.tsx                  # Login page
│   └── layout.tsx                      # Root layout with SessionProvider
├── components/
│   └── providers/
│       └── session-provider.tsx        # NextAuth SessionProvider wrapper
├── lib/
│   ├── db.ts                          # MongoDB connection
│   └── modals/
│       ├── admin.ts                   # Admin model
│       ├── student.ts                 # Student model
│       └── teacher.ts                 # Teacher model
├── scripts/
│   └── seed.ts                        # Database seeding script
├── types/
│   └── next-auth.d.ts                # TypeScript definitions for NextAuth
├── auth.ts                            # NextAuth configuration
└── middleware.ts                      # Route protection middleware
```

## Setup Instructions

### 1. Install Dependencies
All dependencies have been installed. The project uses:
- `next-auth@beta` - Authentication library
- `bcryptjs` - Password hashing
- `mongoose` - MongoDB ODM
- `mongodb` - MongoDB driver

### 2. Environment Variables
Update the `.env` file with your production values:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000  # Change for production
NEXTAUTH_SECRET=generate-a-secure-secret-for-production
AUTH_SECRET=same-as-nextauth-secret
```

To generate a secure secret for production:
```bash
openssl rand -base64 32
```

### 3. Database Setup
Run the seed script to create test users:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login (handled by NextAuth)
- `POST /api/auth/signout` - User logout (handled by NextAuth)
- `GET /api/auth/session` - Get current session (handled by NextAuth)

### User Registration
- `POST /api/register` - Register new user (admin only)

Example request body for registering a student:
```json
{
  "role": "student",
  "name": "John Doe",
  "class": "10th",
  "section": "A",
  "rollNo": "102",
  "mobileNo": "1234567890",
  "password": "password123",
  "parentName": "Jane Doe",
  "parentMobileNo": "0987654321",
  "address": "123 Main St"
}
```

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt with a salt factor of 12
   - Plain text passwords are never stored in the database

2. **Session Management**
   - JWT-based sessions with 30-day expiry
   - Secure session cookies in production

3. **Route Protection**
   - Middleware checks authentication status
   - Role-based access control for dashboards
   - Automatic redirection for unauthorized access

4. **Input Validation**
   - Mobile number uniqueness validation
   - Required field validation
   - Role validation

## Production Deployment Checklist

- [ ] Generate secure `NEXTAUTH_SECRET` and `AUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Use production MongoDB instance
- [ ] Enable HTTPS
- [ ] Set secure cookie options in production
- [ ] Implement rate limiting for login attempts
- [ ] Add password reset functionality
- [ ] Implement email/SMS verification
- [ ] Add audit logging for authentication events
- [ ] Set up monitoring and alerting

## Customization

### Adding New Roles
1. Update the TypeScript types in `types/next-auth.d.ts`
2. Create a new model in `lib/modals/`
3. Update the auth configuration in `auth.ts`
4. Add role-specific routes in `middleware.ts`
5. Create a new dashboard page

### Modifying Login UI
Edit `app/login/page.tsx` to customize the login page appearance.

### Changing Session Duration
Update the `maxAge` property in `auth.ts`:
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

## Troubleshooting

### Common Issues

1. **"MONGODB_URI not defined" error**
   - Ensure `.env` file exists and contains `MONGODB_URI`

2. **Login fails with valid credentials**
   - Check if users exist in database (run `npm run seed`)
   - Verify MongoDB connection string
   - Check if password hashing is working correctly

3. **Session not persisting**
   - Verify `AUTH_SECRET` is set in `.env`
   - Check browser cookies are enabled
   - Ensure `NEXTAUTH_URL` matches your domain

4. **Redirect loops**
   - Check middleware configuration
   - Verify role assignments in database
   - Clear browser cookies and try again

## Support

For issues or questions, please contact the StepUpEdu development team.
