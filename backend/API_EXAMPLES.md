# API Usage Examples

## Setup
1. Start MongoDB
2. Run `npm run seed` to populate the database
3. Start the server with `npm run dev`

## Example cURL Commands

### 1. Register a New Student

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student2@example.com",
    "password": "SecurePass123",
    "fullName": "John Student",
    "role": "student",
    "regNo": "REG003"
  }'
```

### 2. Login as Student

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Passw0rd!"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "student@example.com",
      "fullName": "Jane Doe",
      "role": "student"
    }
  }
}
```

### 3. Get Public Courses (No Auth Required)

```bash
curl http://localhost:3000/public/courses
```

### 4. Get Offerings for Term

```bash
curl "http://localhost:3000/public/offerings?term=2025S1&year=2025"
```

### 5. Student: Enroll in Course (Requires Auth)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:3000/student/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "offeringId": "OFFERING_ID_FROM_ABOVE",
    "chosenLecturerId": "LECTURER_ID_FROM_ABOVE"
  }'
```

### 6. Student: View Enrollments

```bash
curl "http://localhost:3000/student/enrollments?term=2025S1&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Lecturer: Get My Offerings

```bash
LECTURER_TOKEN="lecturer_jwt_token_here"

curl http://localhost:3000/lecturer/offerings \
  -H "Authorization: Bearer $LECTURER_TOKEN"
```

### 8. Lecturer: View Class List

```bash
curl http://localhost:3000/lecturer/offerings/OFFERING_ID/students \
  -H "Authorization: Bearer $LECTURER_TOKEN"
```

### 9. Lecturer: Upload Marks

```bash
curl -X POST http://localhost:3000/lecturer/marks/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LECTURER_TOKEN" \
  -d '[
    {
      "assessmentId": "ASSESSMENT_ID",
      "studentId": "STUDENT_ID",
      "score": 28,
      "offeringId": "OFFERING_ID"
    }
  ]'
```

### 10. Student: View Grades

```bash
curl "http://localhost:3000/student/grades?term=2025S1&year=2025" \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Lecturer: Export Marks to CSV

```bash
curl http://localhost:3000/lecturer/offerings/OFFERING_ID/marks/export \
  -H "Authorization: Bearer $LECTURER_TOKEN" \
  --output marks.csv
```

### 12. Admin: Create Course

```bash
ADMIN_TOKEN="admin_jwt_token_here"

curl -X POST http://localhost:3000/admin/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "code": "CS401",
    "name": "Advanced Algorithms",
    "credits": 4
  }'
```

### 13. Admin: Create Offering

```bash
curl -X POST http://localhost:3000/admin/offerings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "courseId": "COURSE_ID",
    "term": "2025S1",
    "year": 2025,
    "capacity": 50,
    "assignedLecturerIds": ["LECTURER_ID"]
  }'
```

### 14. Admin: Set Assessments for Offering

```bash
curl -X PUT http://localhost:3000/admin/offerings/OFFERING_ID/assessments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "assessments": [
      {"name": "Quiz", "weight": 20, "maxScore": 20},
      {"name": "Assignment", "weight": 30, "maxScore": 30},
      {"name": "Exam", "weight": 50, "maxScore": 50}
    ]
  }'
```

### 15. Admin: Get Consolidated Mark Sheet

```bash
# All students
curl "http://localhost:3000/admin/marksheets/consolidated?term=2025S1&year=2025" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Specific student
curl "http://localhost:3000/admin/marksheets/consolidated?term=2025S1&year=2025&studentId=STUDENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Common Issues

### Getting 401 Unauthorized
- Check that your JWT token is valid and not expired
- Ensure you're including the token in the Authorization header: `Bearer TOKEN`

### Getting 400 Validation Error
- Ensure required fields are provided
- Check data types (e.g., year should be a number, not a string)

### Assessment weights must sum to 100
- When setting assessments for an offering, all weight values must add up to exactly 100

### Max 5 enrollments per term/year
- A student can only enroll in up to 5 courses in the same term and year




