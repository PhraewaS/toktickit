import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the TokTickIT heading", () => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockImplementation(
      () => new Promise(() => undefined),
    );
    render(<App />);
    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows the requester-selection screen when the API is available", async () => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockResolvedValue([
      { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" },
    ]);

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /select development requester/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Jennifer Anderson" }),
    ).toBeInTheDocument();
  });

  it("shows a safe error message when the API is unavailable", async () => {
    vi.spyOn(api, "fetchDevelopmentRequesters").mockRejectedValue(
      new Error("System is offline"),
    );

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load development requesters/i,
    );
  });
});
