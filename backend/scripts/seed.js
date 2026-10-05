import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Notice from '../models/Notice.js';
import CalendarEvent from '../models/CalendarEvent.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'vaibhavkr387@gmail.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash('Vaibhav1122@', 10);
      await User.create({
        email: adminEmail,
        password: hashed,
        full_name: 'Super Admin',
        role: 'admin',
        is_active: true,
      });
      console.log('Admin account created:', adminEmail);
    } else {
      console.log('Admin account already exists');
    }

    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.create([
        { title: 'Welcome to SCIM College Portal', content: 'Your one-stop platform for study materials, tests, doubts, and academic updates.', is_active: true },
        { title: 'Mid-Term Examinations Schedule Released', content: 'Check the academic calendar for your course and semester exam dates.', is_active: true },
        { title: 'New Study Materials Added', content: 'Fresh materials have been uploaded for BBA and BCA students. Check the Study Materials section.', is_active: true },
      ]);
      console.log('Sample notices created');
    }

    const eventCount = await CalendarEvent.countDocuments();
    if (eventCount === 0) {
      const today = new Date();
      const fmt = (d) => d.toISOString().split('T')[0];
      await CalendarEvent.create([
        { title: 'Semester Classes Begin', event_type: 'class', event_date: fmt(new Date(today.getFullYear(), today.getMonth(), 1)) },
        { title: 'Mid-Term Exams', event_type: 'exam', event_date: fmt(new Date(today.getFullYear(), today.getMonth(), 15)), end_date: fmt(new Date(today.getFullYear(), today.getMonth(), 18)) },
        { title: 'BBA Workshop', event_type: 'event', course: 'BBA', event_date: fmt(new Date(today.getFullYear(), today.getMonth(), 22)) },
      ]);
      console.log('Sample calendar events created');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
