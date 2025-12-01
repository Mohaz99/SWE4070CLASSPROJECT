require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');

const verify = async () => {
    try {
        await connectDB();
        console.log('Verifying seed data...');

        const student = await User.findOne({ email: 'student@example.com' });
        if (!student) {
            console.log('❌ Student not found');
            process.exit(1);
        }
        console.log('✓ Student found:', student.email);

        const enrollments = await Enrollment.find({ studentId: student._id });
        console.log(`✓ Found ${enrollments.length} enrollments for student.`);

        if (enrollments.length === 5) {
            console.log('✓ SUCCESS: Student is enrolled in 5 courses.');
        } else {
            console.log('❌ FAILURE: Expected 5 enrollments.');
        }

        const offerings = await CourseOffering.find({}).populate('assignedLecturerIds');
        const lecturer = await User.findOne({ email: 'lecturer@example.com' });

        let allAssigned = true;
        offerings.forEach(o => {
            const assigned = o.assignedLecturerIds.some(l => l._id.equals(lecturer._id));
            if (!assigned) {
                console.log(`❌ Offering ${o._id} not assigned to main lecturer.`);
                allAssigned = false;
            }
        });

        if (allAssigned) {
            console.log('✓ SUCCESS: All offerings assigned to main lecturer.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
