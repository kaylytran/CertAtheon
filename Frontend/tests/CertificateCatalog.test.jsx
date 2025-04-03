// CertificateCatalog.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CertificateCatalog from '../src/components/CertificateCatalog';

describe('CertificateCatalog Component', () => {
  // Mock console.log to track API calls
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log.mockRestore();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <CertificateCatalog />
      </MemoryRouter>
    );
  };

  test('renders without crashing', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /Certificate Catalogue/i })).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText(/Loading certificate catalog/i)).toBeInTheDocument();
  });

  test('completes loading and shows empty state', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/No certificates available in the catalog/i)).toBeInTheDocument();
    }, { timeout: 200 }); // Matches the 100ms delay + buffer
  });

  test('displays navigation buttons', () => {
    renderWithRouter();
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Certificate Catalogue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  // test('navigates to home when home button clicked', async () => {
  //   const mockNavigate = jest.fn();
  //   jest.mock('react-router-dom', () => ({
  //     ...jest.requireActual('react-router-dom'),
  //     useNavigate: () => mockNavigate,
  //   }));

  //   renderWithRouter();
  //   const homeButton = screen.getByRole('button', { name: /Home/i });
  //   await userEvent.click(homeButton);
    
  //   expect(mockNavigate).toHaveBeenCalledWith('/home');
  // });

  // test('navigates to dashboard when dashboard button clicked', async () => {
  //   const mockNavigate = jest.fn();
  //   jest.mock('react-router-dom', () => ({
  //     ...jest.requireActual('react-router-dom'),
  //     useNavigate: () => mockNavigate,
  //   }));

  //   renderWithRouter();
  //   const dashboardButton = screen.getByRole('button', { name: /Dashboard/i });
  //   await userEvent.click(dashboardButton);
    
  //   expect(mockNavigate).toHaveBeenCalledWith('/home');
  // });

  // test('shows error state when API fails', async () => {
  //   // Mock the fetch to reject
  //   jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

  //   renderWithRouter();
    
  //   await waitFor(() => {
  //     expect(screen.getByText(/Failed to load certificate catalog/i)).toBeInTheDocument();
  //     expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  //   }, { timeout: 200 });
  // });

  // test('displays catalog data when loaded', async () => {
  //   // Mock data
  //   const mockData = [
  //     {
  //       id: 1,
  //       name: 'React Certification',
  //       expertise: 'Frontend Development',
  //       category: 'Web Development'
  //     },
  //     {
  //       id: 2,
  //       name: 'AWS Certified',
  //       expertise: 'Cloud Computing',
  //       category: 'DevOps'
  //     }
  //   ];

  //   // Mock the fetch to resolve with our data
  //   jest.spyOn(global, 'fetch').mockImplementation(() =>
  //     Promise.resolve({
  //       json: () => Promise.resolve(mockData)
  //     })
  //   );

  //   renderWithRouter();
    
  //   await waitFor(() => {
  //     expect(screen.getByText(/React Certification/i)).toBeInTheDocument();
  //     expect(screen.getByText(/AWS Certified/i)).toBeInTheDocument();
  //     expect(screen.getByText(/Frontend Development/i)).toBeInTheDocument();
  //     expect(screen.getByText(/Cloud Computing/i)).toBeInTheDocument();
  //   }, { timeout: 200 });
  // });

  // test('has proper table structure', async () => {
  //   renderWithRouter();
    
  //   await waitFor(() => {
  //     const headers = screen.getAllByRole('columnheader');
  //     expect(headers).toHaveLength(3);
  //     expect(headers[0]).toHaveTextContent('Certificate Name');
  //     expect(headers[1]).toHaveTextContent('Expertise');
  //     expect(headers[2]).toHaveTextContent('Category');
  //   });
  // });

  // test('displays alternating row colors', async () => {
  //   // Mock data
  //   const mockData = [
  //     { id: 1, name: 'Test 1', expertise: 'Test', category: 'Test' },
  //     { id: 2, name: 'Test 2', expertise: 'Test', category: 'Test' }
  //   ];

  //   jest.spyOn(global, 'fetch').mockImplementation(() =>
  //     Promise.resolve({
  //       json: () => Promise.resolve(mockData)
  //     })
  //   );

  //   renderWithRouter();
    
  //   await waitFor(() => {
  //     const rows = screen.getAllByRole('row').slice(1); // Skip header row
  //     expect(rows[0]).toHaveClass('bg-gray-200');
  //     expect(rows[1]).not.toHaveClass('bg-gray-200');
  //   });
  // });
});