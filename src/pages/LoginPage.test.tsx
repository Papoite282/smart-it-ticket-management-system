import { Routes, Route } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { useAuthStore } from '../store/authStore';

describe('LoginPage', () => {
  it('shows an error for invalid credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.clear(emailInput);
    await user.type(emailInput, 'nope@smartit.local');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('autofills credentials from a demo account button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByRole('button', { name: /Vera Viewer/i }));

    expect(screen.getByLabelText('Email')).toHaveValue('viewer@smartit.local');
    expect(screen.getByLabelText('Password')).toHaveValue('viewer123');
  });

  it('signs in successfully and navigates to the default route', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard Home</div>} />
      </Routes>,
      { route: '/login' },
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.clear(emailInput);
    await user.type(emailInput, 'agent@smartit.local');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'agent123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe('AGENT');
    });
    expect(await screen.findByText('Dashboard Home')).toBeInTheDocument();
  });
});