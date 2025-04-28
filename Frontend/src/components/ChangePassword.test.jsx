// src/components/ChangePassword.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChangePassword from './changePassword';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ChangePassword', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithRouter(<ChangePassword />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows success message on password change', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    renderWithRouter(<ChangePassword />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'oldpassword' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid password', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid password' } },
    });

    renderWithRouter(<ChangePassword />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    });
  });

  it('does not allow submission if fields are empty', async () => {
    renderWithRouter(<ChangePassword />);
  
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
  
    await waitFor(() => {
      expect(screen.getByText(/please fill out all fields/i)).toBeInTheDocument();
    });
  });
  
  it('disables submit button while submitting', async () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 100));
    axios.post.mockReturnValueOnce(promise);
  
    renderWithRouter(<ChangePassword />);
  
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'oldpassword' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
  
    // During loading, button text changes to "Changing..."
    expect(screen.getByRole('button', { name: /changing/i })).toBeDisabled();
  
    await promise; // Wait for mock promise to finish
  });
});
