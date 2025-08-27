import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

const TestComponent = () => (
  <div>
    <h1>Test Component</h1>
    <p>This is a test component</p>
  </div>
);

describe("React Basic Test Suite", () => {
  it("should render test component", () => {
    render(<TestComponent />);
    expect(screen.getByText("Test Component")).toBeInTheDocument();
    expect(screen.getByText("This is a test component")).toBeInTheDocument();
  });

  it("should have correct heading level", () => {
    render(<TestComponent />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Component");
  });
});
