import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChangePassword from "../src/components/changePassword.jsx";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("axios");

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("ChangePassword Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the change password form", () => {
    renderWithRouter(<ChangePassword />);

    // Check for input fields and button
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument();
  });

  it("shows a success message on successful password change", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    renderWithRouter(<ChangePassword />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));

    // Wait for the success message to appear
    const successMessage = await screen.findByText(/password changed successfully/i);
    expect(successMessage).toBeInTheDocument();
  });

  it("shows an error message for invalid current password", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid current password" } },
    });

    renderWithRouter(<ChangePassword />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/invalid current password/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("shows a generic error message for server issues", async () => {
    axios.post.mockRejectedValueOnce(new Error("Server error"));

    renderWithRouter(<ChangePassword />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));

    // Wait for the generic error message to appear
    const errorMessage = await screen.findByText(/an error occurred. please try again./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("disables the button while submitting", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });
  
    renderWithRouter(<ChangePassword />);
  
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: "oldpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpassword123" },
    });
  
    // Submit the form
    const submitButton = screen.getByRole("button", { name: /change password/i });
    fireEvent.click(submitButton);
  
    // Check if the button is disabled
    expect(submitButton).toBeDisabled();
  
    // Wait for the success message to appear
    await screen.findByText(/password changed successfully/i);
  });
});