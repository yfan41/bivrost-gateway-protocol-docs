import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MachinesPage from './pages/MachinesPage';
import MachineDetailPage from './pages/MachineDetailPage';
import LibraryPage from './pages/LibraryPage';
import ProgramPage from './pages/ProgramPage';
import TransfersPage from './pages/TransfersPage';
import AuditPage from './pages/AuditPage';
import UsersPage from './pages/UsersPage';
import GatewaysPage from './pages/GatewaysPage';

export default function App() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="login-wrap">Loading…</div>;
  if (!user) return <LoginPage />;

  const engineer = user.role === 'engineer';
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">DNC</div>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/machines">Machines</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/transfers">Transfers</NavLink>
          <NavLink to="/audit">Audit log</NavLink>
          {engineer && <NavLink to="/gateways">Gateways</NavLink>}
          {engineer && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="whoami">
          {user.username} · {user.role}
          <br />
          <button className="small" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/machines/:id" element={<MachineDetailPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/programs/:id" element={<ProgramPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/gateways" element={engineer ? <GatewaysPage /> : <Navigate to="/" />} />
          <Route path="/users" element={engineer ? <UsersPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
