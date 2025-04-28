import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

// Helper to wrap with Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Helper to fill out the form
const fillOutForm = () => {
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'Password123!' } });
  fireEvent.change(screen.getByLabelText(/grade/i), { target: { value: 'A' } });
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
  fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Engineer' } });
};


describe('Register', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all fields and button', () => {
    renderWithRouter(<Register />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/grade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    renderWithRouter(<Register />);

    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('shows error message on server validation failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: [{ description: 'Email already exists.' }] },
    });

    renderWithRouter(<Register />);

    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('shows generic error message if unexpected server error occurs', async () => {
    axios.post.mockRejectedValueOnce({});

    renderWithRouter(<Register />);

    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred. please try again./i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    renderWithRouter(<Register />);

    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const toggleButton = screen.getByRole('button', { name: /show/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    fireEvent.click(toggleButton);

    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Button text should change to "Hide"
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
  });
});
