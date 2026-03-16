import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AcademicCalendar from '../components/AcademicCalendar';

const CalendarPage = () => {
  return (
    <DashboardLayout title="Academic Calendar">
      <AcademicCalendar />
    </DashboardLayout>
  );
};

export default CalendarPage;