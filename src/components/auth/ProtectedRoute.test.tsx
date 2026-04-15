import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../pages/LoginPage';
import { renderWithProviders } from '../../test/renderWithProviders';
import { useAuthStore } from '../../store/authStore';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', async () => {
    useAuthStore.setState({ user: null, token: null, hydrated: true });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tickets" element={<div>Tickets Content</div>} />
        </Route>
      </Routes>,
      { route: '/tickets' },
    );

    expect(await screen.findByText('Access your workspace')).toBeInTheDocument();
  });

  it('allows authenticated users through protected routes', async () => {
    useAuthStore.setState({
      user: {
        id: 'agent-1',
        name: 'Marco Agent',
        email: 'agent@smartit.local',
        role: 'AGENT',
        avatar: 'MA',
      },
      token: 'token',
      hydrated: true,
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tickets" element={<div>Tickets Content</div>} />
        </Route>
      </Routes>,
      { route: '/tickets' },
    );

    expect(await screen.findByText('Tickets Content')).toBeInTheDocument();
  });

  it('redirects authenticated users away from the login page', async () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        name: 'Alicia Admin',
        email: 'admin@smartit.local',
        role: 'ADMIN',
        avatar: 'AA',
      },
      token: 'token',
      hydrated: true,
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard Home</div>} />
      </Routes>,
      { route: '/login' },
    );

    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument();
  });
});