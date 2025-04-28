import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";
import { vi } from "vitest";
import axios from "axios";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock axios
vi.mock("axios");

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("renders the Home page with heading", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } }); // certificates
    axios.get.mockResolvedValueOnce({ data: { records: [] } }); // catalog
    axios.get.mockResolvedValueOnce({ data: {} }); // profile

    renderWithRouter(<Home />);

    expect(await screen.findByText(/My Certifications/i)).toBeInTheDocument();
  });

  it("displays loading text initially", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText(/Loading your certifications/i)).toBeInTheDocument();
  });

  it("opens and closes Add Certificate modal", async () => {
    axios.get
      .mockImplementationOnce(() => Promise.resolve({ data: { records: [] } })) // certificates
      .mockImplementationOnce(() => Promise.resolve({ data: { records: [] } })) // catalog
      .mockImplementationOnce(() => Promise.resolve({ data: {} })); // profile
  
    renderWithRouter(<Home />);
  
    await waitFor(() => screen.getByText(/My Certifications/i));
  
    const addButton = screen.getByRole("button", { name: /Add New Certificate/i });
    await userEvent.click(addButton);
  
    // ✅ Now after clicking, the modal should appear
    expect(await screen.findByRole('heading', { name: /Add New Certificate/i })).toBeInTheDocument();
  
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    await userEvent.click(cancelButton);
  
    // ✅ After clicking cancel, the modal should disappear
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add New Certificate/i })).not.toBeInTheDocument();
    });
  });
  

  it("shows 'No certifications found' if certifications fail to load", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error")); // certificates
    axios.get.mockResolvedValueOnce({ data: { records: [] } }); // catalog
    axios.get.mockResolvedValueOnce({ data: {} }); // profile
  
    renderWithRouter(<Home />);
  
    await waitFor(() => {
      expect(screen.getByText(/No certifications found/i)).toBeInTheDocument();
    });
  });  

  // it("handles pagination changes", async () => {
  //   axios.get
  //     .mockResolvedValueOnce({
  //       data: { records: Array.from({ length: 12 }, (_, i) => ({ id: i, certificateName: `Cert ${i}` })) }, // certificates
  //     })
  //     .mockResolvedValueOnce({
  //       data: { records: Array.from({ length: 12 }, (_, i) => ({ id: i, certificateName: `Cert ${i}`, certificateLevel: "Beginner" })) }, // catalog
  //     })
  //     .mockResolvedValueOnce({ data: {} }); // profile
  
  //   renderWithRouter(<Home />);
  
  //   await waitFor(() => screen.getByText(/My Certifications/i));
  
  //   // Now Next button will EXIST
  //   const nextButton = await screen.findByRole("button", { name: /Next/i });
  //   await userEvent.click(nextButton);
  
  //   expect(screen.getByText(/Showing/i)).toBeInTheDocument();
  // });   

  it("navigates to profile when clicking profile image", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } });
    axios.get.mockResolvedValueOnce({ data: { records: [] } });
    axios.get.mockResolvedValueOnce({ data: {} });

    renderWithRouter(<Home />);

    await waitFor(() => screen.getByText(/My Certifications/i));

    const profileImg = screen.getByAltText(/User Avatar/i);
    await userEvent.click(profileImg);

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("logs out and clears localStorage", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } });
    axios.get.mockResolvedValueOnce({ data: { records: [] } });
    axios.get.mockResolvedValueOnce({ data: {} });

    renderWithRouter(<Home />);

    await waitFor(() => screen.getByText(/My Certifications/i));

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    await userEvent.click(logoutButton);

    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
