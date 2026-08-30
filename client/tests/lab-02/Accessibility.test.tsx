import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("A11Y-01 required accessible semantics", () => {
  beforeEach(() => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockResolvedValue([
      { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" },
    ]);
  });

  it("provides a labeled requester control and live loading state", async () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(await screen.findByRole("combobox")).toHaveAccessibleName(/Development Requester/);
  });
});
