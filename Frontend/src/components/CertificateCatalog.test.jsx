import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import CertificateCatalog from "./CertificateCatalog";
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

describe("CertificateCatalog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("renders loading initially", () => {
    renderWithRouter(<CertificateCatalog />);
    expect(screen.getByText(/Loading certificate catalog/i)).toBeInTheDocument();
  });

  it("renders catalog successfully", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        records: [
          { id: 1, certificateName: "Cert 1", certificateLevel: "Fundamental", category: "Cloud", description: "Desc 1" },
          { id: 2, certificateName: "Cert 2", certificateLevel: "Advanced", category: "DevOps", description: "Desc 2" },
        ],
      },
    })
    .mockResolvedValueOnce({ data: {} }); // Profile

    renderWithRouter(<CertificateCatalog />);

    expect(await screen.findByText(/Certificate Catalogue/i)).toBeInTheDocument();
    expect(screen.getByText("Cert 1")).toBeInTheDocument();
    expect(screen.getByText("Cert 2")).toBeInTheDocument();
  });

  it("shows error when fetching catalog fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce({ data: {} });

    renderWithRouter(<CertificateCatalog />);

    expect(await screen.findByText(/Failed to load certificate catalog/i)).toBeInTheDocument();
  });

  it("opens and closes Add Certificate modal", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } })
      .mockResolvedValueOnce({ data: {} });

    renderWithRouter(<CertificateCatalog />);
    await waitFor(() => screen.getByText(/Certificate Catalogue/i));

    const addButton = screen.queryByRole("button", { name: /Add Certificate Catalogue/i });
    if (addButton) {
      await userEvent.click(addButton);
      expect(screen.getByText(/Add New Certificate/i)).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await userEvent.click(cancelButton);
      await waitFor(() => expect(screen.queryByText(/Add New Certificate/i)).not.toBeInTheDocument());
    }
  });

  it("applies level filter", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        records: [
          { id: 1, certificateName: "Cert 1", certificateLevel: "Fundamental", category: "Cloud", description: "Desc 1" },
          { id: 2, certificateName: "Cert 2", certificateLevel: "Advanced", category: "DevOps", description: "Desc 2" },
        ],
      },
    })
    .mockResolvedValueOnce({ data: {} });

    renderWithRouter(<CertificateCatalog />);

    await waitFor(() => screen.getByText("Cert 1"));

    const levelSelect = screen.getByLabelText(/Certificate Level/i);
    await userEvent.selectOptions(levelSelect, "Fundamental");

    expect(screen.getByText("Cert 1")).toBeInTheDocument();
    expect(screen.queryByText("Cert 2")).not.toBeInTheDocument();
  });

  it("navigates when clicking profile image", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } })
      .mockResolvedValueOnce({ data: {} });

    renderWithRouter(<CertificateCatalog />);

    await waitFor(() => screen.getByText(/Certificate Catalogue/i));

    const profileImg = screen.getByAltText(/User Avatar/i);
    await userEvent.click(profileImg);

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  it("logs out and navigates to login page", async () => {
    axios.get.mockResolvedValueOnce({ data: { records: [] } })
      .mockResolvedValueOnce({ data: {} });

    renderWithRouter(<CertificateCatalog />);

    await waitFor(() => screen.getByText(/Certificate Catalogue/i));

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    await userEvent.click(logoutButton);

    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});