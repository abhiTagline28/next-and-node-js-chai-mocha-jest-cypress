import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "../page";

// Mock the auth service
jest.mock("@/services/auth", () => ({
  me: jest.fn(),
  logout: jest.fn(),
}));

const mockMe = require("@/services/auth").me;
const mockLogout = require("@/services/auth").logout;

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockedLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  it("renders dashboard title", () => {
    mockMe.mockResolvedValue({ user: null });

    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows welcome message for authenticated user", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome, Admin User")).toBeInTheDocument();
    });
  });

  it("shows welcome message with email when name is not available", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Welcome, admin@example.com")
      ).toBeInTheDocument();
    });
  });

  it("shows all management cards for admin users", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Management")).toBeInTheDocument();
      expect(screen.getByText("Teacher Management")).toBeInTheDocument();
      expect(screen.getByText("Analytics & Reports")).toBeInTheDocument();
    });
  });

  it("shows only student management card for teacher users", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "teacher@example.com",
        role: "teacher",
        name: "Teacher User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Student Management")).toBeInTheDocument();
      expect(screen.queryByText("Teacher Management")).not.toBeInTheDocument();
      expect(screen.queryByText("Analytics & Reports")).not.toBeInTheDocument();
    });
  });

  it("shows no management cards for student users", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "student@example.com",
        role: "student",
        name: "Student User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText("Student Management")).not.toBeInTheDocument();
      expect(screen.queryByText("Teacher Management")).not.toBeInTheDocument();
      expect(screen.queryByText("Analytics & Reports")).not.toBeInTheDocument();
    });
  });

  it("renders logout button", () => {
    mockMe.mockResolvedValue({ user: null });

    render(<DashboardPage />);

    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("handles logout correctly", async () => {
    mockMe.mockResolvedValue({ user: null });

    render(<DashboardPage />);

    const logoutButton = screen.getByTestId("logout-button");
    logoutButton.click();

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("handles auth service errors gracefully", async () => {
    mockMe.mockRejectedValue(new Error("Auth service error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Welcome,")).not.toBeInTheDocument();
    });
  });

  it("renders user information section", () => {
    mockMe.mockResolvedValue({ user: null });

    render(<DashboardPage />);

    expect(screen.getByText("User Information")).toBeInTheDocument();
  });

  it("renders management cards with correct links", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      const studentManagementLink = screen
        .getByText("Student Management")
        .closest("a");
      const teacherManagementLink = screen
        .getByText("Teacher Management")
        .closest("a");
      const analyticsLink = screen
        .getByText("Analytics & Reports")
        .closest("a");

      expect(studentManagementLink).toHaveAttribute("href", "/students");
      expect(teacherManagementLink).toHaveAttribute("href", "/teachers");
      expect(analyticsLink).toHaveAttribute("href", "/analytics");
    });
  });

  it("applies correct CSS classes for responsive grid", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      // Look for the grid container that actually has the grid classes
      const gridContainer = screen
        .getByText("Student Management")
        .closest("div")?.parentElement?.parentElement;
      expect(gridContainer).toHaveClass(
        "grid",
        "gap-4",
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-3"
      );
    });
  });
});
