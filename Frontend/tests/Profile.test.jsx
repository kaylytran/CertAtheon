import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '../src/components/Profile';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Profile Component', () => {
  const mockedNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockedNavigate);
  });

  test('renders profile page with default values', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /user avatar/i })).toBeInTheDocument();
  });

  // test('clicking "Upload" triggers file input', () => {
  //   render(
  //     <MemoryRouter>
  //       <Profile />
  //     </MemoryRouter>
  //   );

  //   const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' });
  //   const uploadButton = screen.getByRole('button', { name: /upload/i });

  //   const clickSpy = jest.spyOn(fileInput, 'click');
  //   fireEvent.click(uploadButton);
  //   expect(clickSpy).toHaveBeenCalled();
  // });

  // test('clicking "Change Password" opens the password modal', () => {
  //   // Ensure the button is rendered with correct text and role
  //   const changePasswordButton = screen.getByText(/change password/i);
  //   userEvent.click(changePasswordButton);
  
  //   // Assert that the modal opened and that all password fields are rendered
  //   expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
  // });
  

//   test("submits password change form with mismatched passwords", async () => {
//     const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

//     render(<Profile />);

//     // Open the password change form
//     userEvent.click(screen.getByRole("button", { name: /Change Password/i }));

//     // Wait for the form elements to be available
//     await waitFor(() => {
//         expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
//     });

//     // Fill out the form with mismatched passwords
//     userEvent.type(screen.getByLabelText(/Current Password/i), "oldpass");
//     userEvent.type(screen.getByLabelText(/New Password/i), "newpass");
//     userEvent.type(screen.getByLabelText(/Confirm New Password/i), "wrongpass");

//     // Submit the form
//     userEvent.click(screen.getByRole("button", { name: /update password/i }));

//     // Assert that the alert was called with the correct message
//     await waitFor(() => {
//         expect(alertMock).toHaveBeenCalledWith("New passwords don't match!");
//     });

//     alertMock.mockRestore();
// });

});
