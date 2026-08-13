import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          IndoKerja<span>.id</span>
        </NavLink>

        {user && (
          <nav className="nav-links">
            {user.role === 'JOB_SEEKER' && (
              <>
                <NavLink to="/" end>
                  Lowongan
                </NavLink>
                <NavLink to="/my-applications">Lamaran Saya</NavLink>
              </>
            )}
            {user.role === 'COMPANY' && (
              <>
                <NavLink to="/" end>
                  Lowongan Saya
                </NavLink>
                <NavLink to="/company/create-job">Buat Lowongan</NavLink>
              </>
            )}
          </nav>
        )}

        <div className="navbar-right">
          {user ? (
            <>
              <span className="user-chip">
                {user.name} <small>({user.role === 'COMPANY' ? 'Company' : 'Job Seeker'})</small>
              </span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
