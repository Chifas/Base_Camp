import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ExploreSkeleton } from "../explore-skeleton";

describe("ExploreSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<ExploreSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders 12 card skeleton placeholders", () => {
    const { container } = render(<ExploreSkeleton />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.children.length).toBe(12);
  });

  it("each card has a cover band skeleton", () => {
    const { container } = render(<ExploreSkeleton />);
    // Cover band is the first child of each card
    const firstCard = container.firstChild?.firstChild as HTMLElement;
    expect(firstCard).toBeTruthy();
    const coverBand = firstCard.firstChild as HTMLElement;
    expect(coverBand.classList.contains("skeleton")).toBe(true);
  });
});
