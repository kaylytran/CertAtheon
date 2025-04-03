// Home.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/components/Home';

// Mock console.log to track API calls
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

describe('CertificationDashboard', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  };

  test('renders dashboard without crashing', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /Certifications/i })).toBeInTheDocument();
  });

  test('shows empty state when no certifications are found', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText(/No certifications found/i)).toBeInTheDocument();
    });
  });

  test('opens add modal when Add New Certificate button is clicked', async () => {
    renderWithRouter();
    const addButton = screen.getByRole('button', { name: /Add New Certificate/i });
    await userEvent.click(addButton);
    expect(await screen.findByLabelText('Certificate')).toBeInTheDocument();
  });

  test('fills form and adds a certification', async () => {
    renderWithRouter();
    
    // Open modal
    const addButton = screen.getByRole('button', { name: /Add New Certificate/i });
    await userEvent.click(addButton);
    
    // Fill form
    const certInput = await screen.findByLabelText('Certificate');
    const certDateInput = screen.getByLabelText('Certified Date');
    const validThroughInput = screen.getByLabelText('Valid Through');
    const levelSelect = screen.getByLabelText('Certificate Level');
    
    // Use fireEvent for more reliable input in tests
    fireEvent.change(certInput, { target: { value: 'React Basics' } });
    fireEvent.change(certDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(validThroughInput, { target: { value: '2026-01-01' } });
    fireEvent.change(levelSelect, { target: { value: 'Beginner' } });
    
    // Verify inputs
    expect(certInput).toHaveValue('React Basics');
    expect(certDateInput).toHaveValue('2024-01-01');
    expect(validThroughInput).toHaveValue('2026-01-01');
    expect(levelSelect).toHaveValue('Beginner');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await userEvent.click(submitButton);
    
    // Verify new certification appears
    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
    }, { timeout: 2000 }); // Increased timeout
  });

  test('edits an existing certification', async () => {
    renderWithRouter();
    
    // First add a certification
    await userEvent.click(screen.getByRole('button', { name: /Add New Certificate/i }));
    
    const certInput = await screen.findByLabelText('Certificate');
    fireEvent.change(certInput, { target: { value: 'React Basics' } });
    fireEvent.change(screen.getByLabelText('Certified Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Valid Through'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('Certificate Level'), { target: { value: 'Beginner' } });
    
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Wait for it to appear
    await screen.findByText('React Basics');
    
    // Click Modify button
    const modifyButtons = screen.getAllByRole('button', { name: /Modify/i });
    await userEvent.click(modifyButtons[0]);
    
    // Edit the certification
    const editInput = await screen.findByLabelText('Certificate');
    fireEvent.change(editInput, { target: { value: 'React Advanced' } });
    expect(editInput).toHaveValue('React Advanced');
    
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Verify update
    await waitFor(() => {
      expect(screen.getByText('React Advanced')).toBeInTheDocument();
    });
  });

  test('deletes an existing certification', async () => {
    renderWithRouter();
    
    // Add a certification to delete
    await userEvent.click(screen.getByRole('button', { name: /Add New Certificate/i }));
    
    const certInput = await screen.findByLabelText('Certificate');
    fireEvent.change(certInput, { target: { value: 'To Delete' } });
    fireEvent.change(screen.getByLabelText('Certified Date'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Valid Through'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('Certificate Level'), { target: { value: 'Beginner' } });
    
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));
    
    // Verify it exists
    await screen.findByText('To Delete');
    
    // Click Delete button
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await userEvent.click(deleteButtons[0]);
    
    // Verify deletion
    await waitFor(() => {
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });
  });
});