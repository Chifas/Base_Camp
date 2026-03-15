import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calendar } from "lucide-react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Calendar}
        title="Sin sesiones"
        description="No hay sesiones programadas."
      />
    );

    expect(screen.getByText("Sin sesiones")).toBeInTheDocument();
    expect(screen.getByText("No hay sesiones programadas.")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    const { container } = render(
      <EmptyState
        icon={Calendar}
        title="Test"
        description="Desc"
      />
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
