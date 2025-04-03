// Login.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/components/Login';

describe('Login Component', () => {
  // Mock console.log to track form submissions
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  // Mock the useNavigate hook
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  test('renders without crashing', () => {
    renderWithRouter();
    expect(screen.getByText(/CertATheon/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
  });

  test('displays email and password fields', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('updates email field when typed', async () => {
    renderWithRouter();
    const emailInput = screen.getByLabelText(/Email:/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });

  test('updates password field when typed', async () => {
    renderWithRouter();
    const passwordInput = screen.getByLabelText(/Password:/i);
    
    await userEvent.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  test('requires both fields to be filled', async () => {
    renderWithRouter();
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Try submitting with empty fields
    await userEvent.click(loginButton);
    
    // Both fields should show validation errors
    expect(screen.getByLabelText(/Email:/i)).toBeInvalid();
    expect(screen.getByLabelText(/Password:/i)).toBeInvalid();
  });

  test('requires valid email format', async () => {
    renderWithRouter();
    const emailInput = screen.getByLabelText(/Email:/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(loginButton);
    
    expect(emailInput).toBeInvalid();
  });

  // test('submits form with valid data', async () => {
  //   const mockNavigate = jest.fn();
  //   render(
  //     <MemoryRouter>
  //       <Login navigate={mockNavigate} />
  //     </MemoryRouter>
  //   );
  
  //   const emailInput = screen.getByLabelText(/Email:/i);
  //   const passwordInput = screen.getByLabelText(/Password:/i);
  //   const loginButton = screen.getByRole('button', { name: /Login/i });
    
  //   await userEvent.type(emailInput, 'test@example.com');
  //   await userEvent.type(passwordInput, 'password123');
  //   await userEvent.click(loginButton);
    
  //   expect(console.log).toHaveBeenCalledWith('Email:', 'test@example.com');
  //   expect(console.log).toHaveBeenCalledWith('Password:', 'password123');
  //   expect(mockNavigate).toHaveBeenCalledWith('/home');
  // });
});