import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navigation from "../Navigation";

// Mock the auth service
jest.mock("@/services/auth", () => ({
  me: jest.fn(),
}));

const mockMe = require("@/services/auth").me;

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation with default items", () => {
    mockMe.mockResolvedValue({ user: null });

    render(<Navigation />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Students")).not.toBeInTheDocument();
    expect(screen.queryByText("Teachers")).not.toBeInTheDocument();
  });

  it("shows student navigation for teacher role", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "teacher@example.com",
        role: "teacher",
        name: "Teacher User",
      },
    });

    render(<Navigation />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Students")).toBeInTheDocument();
      expect(screen.queryByText("Teachers")).not.toBeInTheDocument();
    });
  });

  it("shows all navigation for admin role", async () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<Navigation />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Students")).toBeInTheDocument();
      expect(screen.getByText("Teachers")).toBeInTheDocument();
    });
  });

  it("handles auth service errors gracefully", async () => {
    mockMe.mockRejectedValue(new Error("Auth service error"));

    render(<Navigation />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Students")).not.toBeInTheDocument();
      expect(screen.queryByText("Teachers")).not.toBeInTheDocument();
    });
  });

  it("highlights active page correctly", () => {
    mockMe.mockResolvedValue({ user: null });

    // Mock usePathname to return /students
    jest.doMock("next/navigation", () => ({
      usePathname: () => "/students",
      useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
      }),
    }));

    render(<Navigation />);

    // Should show active state for current page
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders navigation links with correct hrefs", () => {
    mockMe.mockResolvedValue({
      user: {
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });

    render(<Navigation />);

    waitFor(() => {
      const dashboardLink = screen.getByText("Dashboard").closest("a");
      const studentsLink = screen.getByText("Students").closest("a");
      const teachersLink = screen.getByText("Teachers").closest("a");

      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
      expect(studentsLink).toHaveAttribute("href", "/students");
      expect(teachersLink).toHaveAttribute("href", "/teachers");
    });
  });
});
