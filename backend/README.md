Online Examination System - Backend API

A RESTful API for managing an online examination system with support for three user roles: **Student**, **Lecturer**, and **Admin**.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Student Features**: Register/login, enroll in courses (max 5 per term), view grades
- **Lecturer Features**: Register/login, view assigned courses & students, upload marks, export class marks as CSV
- **Admin Features**: Register/login, create courses & offerings, assign lecturers, define assessments, export consolidated mark sheets

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **express-validator** - Input validation
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file (see `.env.example` for structure):
```bash
MONGO_URL=mongodb://localhost:27017/exams
JWT_SECRET=your_secret_key_here
PORT=3000
```

3. Install dependencies:
```bash
npm install
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@example.com / Passw0rd!
- **Lecturer**: lecturer@example.com / Passw0rd!
- **Student**: student@example.com / Passw0rd!

## API Endpoints

### Authentication

```bash
# Register
POST /auth/register
Body: { email, password, fullName, role, regNo (for students), staffNo (for lecturers/admin) }

# Login
POST /auth/login
Body: { email, password }
Response: { success, data: { token, user } }
```

### Public Endpoints

```bash
# Get all courses
GET /public/courses

# Get offerings (with optional filters)
GET /public/offerings?term=2025S1&year=2025

# Get grade scales
GET /public/grade-scales
```

### Admin Endpoints (requires admin role)

```bash
# Create course
POST /admin/courses
Body: { code, name, credits }

# Create offering
POST /admin/offerings
Body: { courseId, term, year, capacity?, assignedLecturerIds[] }

# Update assessments
PUT /admin/offerings/:id/assessments
Body: { assessments: [{ name, weight, maxScore }] }
Note: Total weight must sum to exactly 100

# Get consolidated mark sheet
GET /admin/marksheets/consolidated?term=2025S1&year=2025&studentId=...
```

### Student Endpoints (requires student role)

```bash
# Get enrollments
GET /student/enrollments?term=2025S1&year=2025

# Create enrollment
POST /student/enrollments
Body: { offeringId, chosenLecturerId }
Note: Max 5 enrollments per term/year

# Delete enrollment
DELETE /student/enrollments/:id

# Get grades
GET /student/grades?term=2025S1&year=2025
```

### Lecturer Endpoints (requires lecturer role)

```bash
# Get my offerings
GET /lecturer/offerings

# Get students in offering
GET /lecturer/offerings/:id/students

# Post marks (batch)
POST /lecturer/marks/batch
Body: [{ assessmentId, studentId, score, offeringId }]

# Export marks to CSV
GET /lecturer/offerings/:id/marks/export?format=csv
```

## Example Usage

### Register a Student

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@example.com",
    "password": "SecurePass123",
    "fullName": "Alice Johnson",
    "role": "student",
    "regNo": "REG002"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Passw0rd!"
  }'
```

### Student Enrolls in Course (with authentication)

```bash
curl -X POST http://localhost:3000/student/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "offeringId": "OFFERING_ID_HERE",
    "chosenLecturerId": "LECTURER_ID_HERE"
  }'
```

### Lecturer Uploads Marks (batch)

```bash
curl -X POST http://localhost:3000/lecturer/marks/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LECTURER_TOKEN" \
  -d '[
    {
      "assessmentId": "ASSESSMENT_ID",
      "studentId": "STUDENT_ID",
      "score": 25,
      "offeringId": "OFFERING_ID"
    },
    {
      "assessmentId": "ASSESSMENT_ID_2",
      "studentId": "STUDENT_ID",
      "score": 60,
      "offeringId": "OFFERING_ID"
    }
  ]'
```

## Business Rules

1. **Student Enrollments**: Maximum 5 enrollments per (term, year)
2. **Assessment Weights**: Must sum to exactly 100
3. **Lecturer Assignment**: Lecturers can only post marks for offerings they're assigned to
4. **Unique Marks**: Each (student, assessment) can have at most one mark
5. **Lecturer Selection**: Student must select a lecturer who is assigned to the offering

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # Database connection
│   │   └── jwt.js         # JWT utilities
│   ├── middleware/
│   │   ├── auth.js        # Authentication middleware
│   │   ├── roles.js       # Role-based access control
│   │   ├── validate.js    # Validation middleware
│   │   └── errorHandler.js # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── CourseOffering.js
│   │   ├── Enrollment.js
│   │   ├── Mark.js
│   │   ├── GradeScale.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── student.controller.js
│   │   └── lecturer.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── student.routes.js
│   │   ├── lecturer.routes.js
│   │   └── public.routes.js
│   ├── services/
│   │   ├── enrollment.service.js
│   │   ├── grading.service.js
│   │   └── export.service.js
│   ├── scripts/
│   │   └── seed.js        # Database seeding
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── package.json
└── README.md
```

## Error Handling

All responses follow a consistent format:

```json
{
  "success": true/false,
  "data": { ... },
  "error": "Error message"
}
```

## License

ISC


