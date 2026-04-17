import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import MemberForm from './pages/MemberForm';
import MemberEdit from './pages/MemberEdit';
import Verification from './pages/Verification';
import FinancialReports from './pages/FinancialReports';
import Organization from './pages/Organization';
import Events from './pages/Events';
import SettingsPage from './pages/Settings';
import PublicSubmission from './pages/PublicSubmission';
import PublicBorrowing from './pages/PublicBorrowing';
import BorrowingReview from './pages/BorrowingReview';
import Frontpage from './pages/Frontpage';
import { useAuth } from './lib/auth-context';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frontpage />} />
        <Route path="/submission" element={<PublicSubmission />} />
        <Route path="/peminjaman" element={<PublicBorrowing />} />

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<MemberList />} />
            <Route path="organization" element={<Organization />} />
            <Route path="events" element={<Events />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="members/new" element={<MemberForm />} />
            <Route path="members/:id/edit" element={<MemberEdit />} />
            <Route path="verification" element={<Verification />} />
            <Route path="borrowing" element={<BorrowingReview />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
