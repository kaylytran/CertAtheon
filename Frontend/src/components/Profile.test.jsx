import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

// Mock localStorage
beforeEach(() => {
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
    if (key === 'token') return 'mock-token';
    if (key === 'profilePictureUrl') return null;
    return null;
  });
  vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {});
  vi.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => {});
});

// Helper to render with Router
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Profile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    axios.get.mockReturnValueOnce(new Promise(() => {})); // pending promise to simulate loading

    renderWithRouter(<Profile />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it('renders error message if fetch fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed'));

    renderWithRouter(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load profile data/i)).toBeInTheDocument();
    });
  });

  it('renders profile data after successful fetch', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        userName: 'johndoe',
        appRole: 'Admin',
        phoneNumber: '1234567890',
        jobTitle: 'Engineer',
        mustChangePassword: true,
        profilePictureUrl: '/profile.jpg',
      },
    });
  
    renderWithRouter(<Profile />);
  
    expect(await screen.findAllByText(/john doe/i)).toBeTruthy(); // 🛠 Fix here!
  
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/yes/i)).toBeInTheDocument(); // Must change password: Yes
  });  

  it('opens and closes the password change modal', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    });
  
    renderWithRouter(<Profile />);
  
    // Wait for profile to load
    await screen.findAllByText(/john doe/i); // 👈 Fixed here
  
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(changePasswordButton);
  
    expect(screen.getByText(/current password/i)).toBeInTheDocument(); // Modal is shown
  
    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
  
    await waitFor(() => {
      expect(screen.queryByText(/current password/i)).not.toBeInTheDocument(); // Modal disappears
    });
  });  

  it('handles logout correctly', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    });
  
    renderWithRouter(<Profile />);
  
    // Wait for profile to load
    await screen.findAllByText(/john doe/i); // 👈 use findAllByText here
  
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
  
    expect(window.localStorage.clear).toHaveBeenCalled();
  });
});
