import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@/components/layouts/PublicLayout.jsx';
import StudentLayout from '@/components/layouts/StudentLayout.jsx';
import DashboardLayout from '@/components/layouts/DashboardLayout.jsx';
import ProtectedRoute from '@/components/shared/ProtectedRoute.jsx';

import LandingPage from '@/pages/public/LandingPage.jsx';
import LoginPage from '@/pages/public/LoginPage.jsx';

import AdminDashboard from '@/pages/admin/AdminDashboard.jsx';
import AdminStudents from '@/pages/admin/AdminStudents.jsx';
import AdminTeam from '@/pages/admin/AdminTeam.jsx';
import AdminMaterials from '@/pages/admin/AdminMaterials.jsx';
import AdminTests from '@/pages/admin/AdminTests.jsx';
import AdminNotices from '@/pages/admin/AdminNotices.jsx';
import AdminCalendar from '@/pages/admin/AdminCalendar.jsx';
import AdminDoubts from '@/pages/admin/AdminDoubts.jsx';
import AdminFeedback from '@/pages/admin/AdminFeedback.jsx';

import StudentDashboard from '@/pages/student/StudentDashboard.jsx';
import StudentMaterials from '@/pages/student/StudentMaterials.jsx';
import StudentTests from '@/pages/student/StudentTests.jsx';
import TestTake from '@/pages/student/TestTake.jsx';
import PdfViewer from '@/pages/student/PdfViewer.jsx';
import StudentDoubts from '@/pages/student/StudentDoubts.jsx';
import StudentCalendar from '@/pages/student/StudentCalendar.jsx';
import StudentSaved from '@/pages/student/StudentSaved.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'co_member']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="calendar" element={<AdminCalendar />} />
        <Route path="doubts" element={<AdminDoubts />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>

      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="materials/:id" element={<PdfViewer />} />
        <Route path="tests" element={<StudentTests />} />
        <Route path="tests/:id" element={<TestTake />} />
        <Route path="doubts" element={<StudentDoubts />} />
        <Route path="calendar" element={<StudentCalendar />} />
        <Route path="saved" element={<StudentSaved />} />
      </Route>
    </Routes>
  );
}
