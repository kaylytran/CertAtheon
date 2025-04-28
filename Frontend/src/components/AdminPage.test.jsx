// AdminPage.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AdminPage from "./AdminPage";
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

describe("AdminPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mock-token"),
      setItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("renders loading text initially", () => {
    renderWithRouter(<AdminPage />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("displays dashboard data after loading", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ 
        data: {
          totalEmployees: 10,
          employeesWithCertificate: 5,
          overallAdoptionRate: 50,
          records: [
            { fullName: "John Doe", email: "john@example.com", role: "Developer" }
          ]
        }
      });

    renderWithRouter(<AdminPage />);

    expect(await screen.findByText(/Total Employees/i)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it("shows error if dashboard fails to load", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockRejectedValueOnce(new Error("API Error"));

    renderWithRouter(<AdminPage />);

    expect(await screen.findByText(/Failed to load dashboard/i)).toBeInTheDocument();
  });

  it("can type in search input and apply search", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ 
        data: {
          totalEmployees: 2,
          employeesWithCertificate: 1,
          overallAdoptionRate: 50,
          records: [
            { fullName: "Alice Wonderland", email: "alice@example.com", role: "Manager" },
            { fullName: "Bob Builder", email: "bob@example.com", role: "Engineer" }
          ]
        }
      });

    renderWithRouter(<AdminPage />);

    expect(await screen.findByText(/Total Employees/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by employee/i);
    await userEvent.type(searchInput, "Alice");
    const searchButton = screen.getByRole("button", { name: /^Submit$/i });
    await userEvent.click(searchButton);

    expect(screen.getByText(/Alice Wonderland/)).toBeInTheDocument();
    expect(screen.queryByText(/Bob Builder/)).not.toBeInTheDocument();
  });

  it("opens and closes Add Employee modal", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ data: { records: [] } });

    renderWithRouter(<AdminPage />);

    await waitFor(() => screen.getByText(/Employee Management/i));

    const addButton = screen.getByRole("button", { name: /Add Employee/i });
    await userEvent.click(addButton);

    expect(screen.getByRole("heading", { name: /Add New Employee/i })).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByRole("heading", { name: /Add New Employee/i })).not.toBeInTheDocument();
  });

  it("navigates to profile page on profile image click", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ data: { records: [] } });

    renderWithRouter(<AdminPage />);

    await waitFor(() => screen.getByText(/Employee Management/i));

    const profileImage = screen.getByAltText(/User Avatar/i);
    await userEvent.click(profileImage);

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("logs out and clears localStorage", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ data: { records: [] } });

    renderWithRouter(<AdminPage />);

    await waitFor(() => screen.getByText(/Employee Management/i));

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    await userEvent.click(logoutButton);

    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles pagination next and previous buttons", async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} }) // Profile
      .mockResolvedValueOnce({ 
        data: {
          totalEmployees: 12,
          employeesWithCertificate: 6,
          overallAdoptionRate: 50,
          records: Array.from({ length: 12 }, (_, i) => ({
            employeeId: i + 1,
            fullName: `Employee ${i + 1}`,
            email: `employee${i + 1}@example.com`,
            role: "Staff",
          }))
        }
      });
  
    renderWithRouter(<AdminPage />);
  
    await waitFor(() => screen.getByText(/Employee Management/i));
  
    const nextButton = await screen.findByText(/^Next$/);
    expect(nextButton).toBeEnabled();
  
    await userEvent.click(nextButton);
  
    const prevButton = await screen.findByText(/^Prev$/);
    expect(prevButton).toBeEnabled();
  });    
});
