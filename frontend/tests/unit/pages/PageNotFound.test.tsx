import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageNotFound from "../../../src/pages/PageNotFound";

describe("PageNotFound", () => {
  it("should render correctly", () => {
    render(<PageNotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });
});
