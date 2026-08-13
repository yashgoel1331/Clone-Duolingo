import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("reports its determinate value accessibly", () => {
    render(<ProgressBar aria-label="Daily goal" value={7} max={10} />);

    const progress = screen.getByRole("progressbar", { name: "Daily goal" });
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "10");
    expect(progress).toHaveAttribute("aria-valuenow", "7");
  });

  it("clamps values to its accessible range", () => {
    render(<ProgressBar value={120} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
