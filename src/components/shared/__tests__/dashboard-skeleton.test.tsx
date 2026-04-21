import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DashboardSkeleton, SessionRowSkeleton } from "../dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders 4 stat skeleton cards", () => {
    const { container } = render(<DashboardSkeleton />);
    // Stats grid has 4 children
    const statsGrid = container.querySelector(".grid");
    expect(statsGrid?.children.length).toBe(4);
  });

  it("renders 3 session row skeletons", () => {
    const { container } = render(<DashboardSkeleton />);
    // Each session row has a flex items-center layout
    const rows = container.querySelectorAll(".flex.items-center.gap-4.rounded-xl");
    expect(rows.length).toBe(3);
  });
});

describe("SessionRowSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<SessionRowSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("has the correct structural elements", () => {
    const { container } = render(<SessionRowSkeleton />);
    // avatar + content + actions
    const root = container.firstChild as HTMLElement;
    expect(root.classList.contains("rounded-xl")).toBe(true);
    expect(root.classList.contains("border")).toBe(true);
  });
});
