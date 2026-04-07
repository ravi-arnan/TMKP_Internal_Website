import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import MemberForm from './pages/MemberForm';
import Verification from './pages/Verification';
import FinancialReports from './pages/FinancialReports';

// Placeholder pages for routes not yet fully implemented
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-2xl font-bold text-slate-400">{title} Page Coming Soon</h1>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MemberList />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="verification" element={<Verification />} />
          <Route path="organization" element={<Placeholder title="Kepengurusan" />} />
          <Route path="events" element={<Placeholder title="Kegiatan" />} />
          <Route path="reports" element={<FinancialReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
