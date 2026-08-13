import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("exposes its button role and accessible name", () => {
    render(<Button>Continue</Button>);

    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
  });
});
