import React from 'react';
import { Lock, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  onLogout?: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="site-header" aria-label="Main Header">
      {/* PrintMate Logo at Top Left */}
      <button
        onClick={onGoHome}
        className="header-brand"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="PrintMate Home"
      >
        <div className="header-logo-icon">
          {/* Clean custom logo icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="2" />
          </svg>
        </div>
        <span className="header-brand-title">PrintMate</span>
      </button>

      {/* Admin Login button at Top Right (No other navigation buttons or menus) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isAdminLoggedIn ? (
          <>
            <button
              onClick={onOpenAdminDashboard}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              aria-label="Open Admin Dashboard"
            >
              <ShieldCheck size={14} />
              <span>Dashboard</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="btn btn-outline-soft"
                style={{ padding: '8px 14px', fontSize: '13px', color: '#b91c1c' }}
                aria-label="Logout Admin"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
            aria-label="Admin Login"
          >
            <Lock size={13} />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
