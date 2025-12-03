require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseOffering = require('../models/CourseOffering');
const GradeScale = require('../models/GradeScale');

const seed = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding database...');

    // Clear existing data
    await GradeScale.deleteMany({});
    await CourseOffering.deleteMany({});
    await Course.deleteMany({});
    await User.deleteMany({});

    // Create grade scales (USIU grading system)
    const gradeScales = [
      { letter: 'A', minPercent: 90, maxPercent: 100, points: 4.0 },
      { letter: 'A-', minPercent: 87, maxPercent: 89, points: 3.7 },
      { letter: 'B+', minPercent: 84, maxPercent: 86, points: 3.3 },
      { letter: 'B', minPercent: 80, maxPercent: 83, points: 3.0 },
      { letter: 'B-', minPercent: 77, maxPercent: 79, points: 2.7 },
      { letter: 'C+', minPercent: 74, maxPercent: 76, points: 2.3 },
      { letter: 'C', minPercent: 70, maxPercent: 73, points: 2.0 },
      { letter: 'C-', minPercent: 67, maxPercent: 69, points: 1.7 },
      { letter: 'D+', minPercent: 64, maxPercent: 66, points: 1.3 },
      { letter: 'D', minPercent: 62, maxPercent: 63, points: 1.0 },
      { letter: 'D-', minPercent: 60, maxPercent: 61, points: 0.7 },
      { letter: 'F', minPercent: 0, maxPercent: 59, points: 0.0 }
    ];

    await GradeScale.insertMany(gradeScales);
    console.log('✓ Grade scales created');

    // Create admin
    const adminPasswordHash = await bcrypt.hash('Passw0rd!', 10);
    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      role: 'admin',
      staffNo: 'ADM001'
    });
    console.log('✓ Admin created:', admin.email);

    // Create lecturer
    const lecturerPasswordHash = await bcrypt.hash('Passw0rd!', 10);
    const lecturer = await User.create({
      email: 'lecturer@example.com',
      passwordHash: lecturerPasswordHash,
      fullName: 'Dr. John Smith',
      role: 'lecturer',
      staffNo: 'LEC001'
    });
    console.log('✓ Lecturer created:', lecturer.email);

    // Create student
    const studentPasswordHash = await bcrypt.hash('Passw0rd!', 10);
    const student = await User.create({
      email: 'student@example.com',
      passwordHash: studentPasswordHash,
      fullName: 'Jane Doe',
      role: 'student',
      regNo: 'REG001'
    });
    console.log('✓ Student created:', student.email);

    // Create courses
    const courses = [
      { code: 'CS101', name: 'Introduction to Computer Science', credits: 3 },
      { code: 'CS102', name: 'Data Structures', credits: 3 },
      { code: 'CS201', name: 'Database Systems', credits: 3 },
      { code: 'CS301', name: 'Software Engineering', credits: 4 },
      { code: 'MATH101', name: 'Calculus I', credits: 3 }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log('✓ Courses created');

    // Create offerings for term 2025S1
    const term = '2025S1';
    const year = 2025;

    const offerings = [
      {
        courseId: createdCourses[0]._id,
        term,
        year,
        capacity: 50,
        assignedLecturerIds: [lecturer._id],
        assessments: [
          { name: 'CAT', weight: 30, maxScore: 30 },
          { name: 'Exam', weight: 70, maxScore: 70 }
        ]
      },
      {
        courseId: createdCourses[1]._id,
        term,
        year,
        capacity: 40,
        assignedLecturerIds: [lecturer._id],
        assessments: [
          { name: 'Assignment', weight: 20, maxScore: 20 },
          { name: 'CAT', weight: 30, maxScore: 30 },
          { name: 'Exam', weight: 50, maxScore: 50 }
        ]
      },
      {
        courseId: createdCourses[2]._id,
        term,
        year,
        capacity: 35,
        assignedLecturerIds: [lecturer._id],
        assessments: [
          { name: 'Project', weight: 25, maxScore: 25 },
          { name: 'CAT', weight: 25, maxScore: 25 },
          { name: 'Exam', weight: 50, maxScore: 50 }
        ]
      },
      {
        courseId: createdCourses[3]._id,
        term,
        year,
        capacity: 30,
        assignedLecturerIds: [lecturer._id],
        assessments: [
          { name: 'CAT', weight: 30, maxScore: 30 },
          { name: 'Exam', weight: 70, maxScore: 70 }
        ]
      },
      {
        courseId: createdCourses[4]._id,
        term,
        year,
        capacity: 60,
        assignedLecturerIds: [lecturer._id],
        assessments: [
          { name: 'CAT', weight: 30, maxScore: 30 },
          { name: 'Exam', weight: 70, maxScore: 70 }
        ]
      }
    ];

    await CourseOffering.insertMany(offerings);
    console.log('✓ Course offerings created');

    console.log('\n✓ Seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin:', admin.email, '/ Passw0rd!');
    console.log('Lecturer:', lecturer.email, '/ Passw0rd!');
    console.log('Student:', student.email, '/ Passw0rd!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();





