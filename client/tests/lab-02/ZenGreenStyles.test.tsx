import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("STYLE-01 Zen Green semantics", () => {
  beforeEach(() => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockResolvedValue([
      { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" },
    ]);
  });

  it("exposes labeled requester selection and the required shell classes", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Select Development Requester" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(document.querySelector(".selection-card")).toBeInTheDocument();
  });
});
