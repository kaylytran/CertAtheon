import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import axios from 'axios';
import { vi } from 'vitest';

// 👇 Setup: Create mock navigate and mock react-router-dom immediately
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock axios
vi.mock('axios');

// Mock localStorage
beforeEach(() => {
  vi.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => {});
  vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {});
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Login', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements', () => {
    renderWithRouter(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    const promise = new Promise(() => {}); // pending promise
    axios.post.mockReturnValue(promise);

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('navigates to /admin if role is not Employee', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        appRole: 'Admin',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    });

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'adminpassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('navigates to /changepassword if mustChangePassword is true', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        appRole: 'Employee',
        mustChangePassword: true,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    });

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'changepass@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/changepassword');
    });
  });

  it('navigates to /home if employee does not need to change password', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'mock-token',
        appRole: 'Employee',
        mustChangePassword: false,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    });

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'employee@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error on invalid credentials', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 401 },
    });

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows general error on unknown error', async () => {
    axios.post.mockRejectedValueOnce({});

    renderWithRouter(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), 'error@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'errorpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred. please try again later./i)).toBeInTheDocument();
    });
  });
});
