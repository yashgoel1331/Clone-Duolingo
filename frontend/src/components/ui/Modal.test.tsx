import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders only while open and closes from its close button", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open={false} onClose={onClose} title="Lesson complete">
        Results
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Modal open onClose={onClose} title="Lesson complete">
        Results
      </Modal>,
    );
    expect(
      screen.getByRole("dialog", { name: "Lesson complete" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Settings">
        Preferences
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
