import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { useAuthStore } from '../store/authStore';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    hydrated: false,
  });
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});