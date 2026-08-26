import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

vi.mock("../../src/api.js", () => ({
  fetchDevelopmentRequesters: vi.fn(),
}));

const requesters = [
  { id: 1, name: "Jennifer Anderson", email: "jennifer@example.test" },
  { id: 2, name: "Narin Chai", email: "narin@example.test" },
];

describe("Development Requester selection", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(api.fetchDevelopmentRequesters).mockResolvedValue(requesters);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads active requesters and requires a selection before continuing", async () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading development requesters/i);
    const select = await screen.findByRole("combobox", {
      name: /development requester/i,
    });
    const continueButton = screen.getByRole("button", { name: /continue/i });

    expect(screen.getByRole("option", { name: "Jennifer Anderson" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /inactive/i })).not.toBeInTheDocument();
    expect(continueButton).toBeDisabled();

    fireEvent.change(select, { target: { value: "1" } });
    expect(continueButton).toBeEnabled();
  });

  it("stores the requester in the tab session and shows the requester shell", async () => {
    render(<App />);

    fireEvent.change(
      await screen.findByRole("combobox", { name: /development requester/i }),
      { target: { value: "1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText("Jennifer Anderson")).toBeInTheDocument();
    expect(screen.getByText(/not authentication/i)).toBeInTheDocument();
    expect(sessionStorage.getItem("toktickit.developmentRequesterId")).toBe("1");
  });

  it("restores only a requester that is still active", async () => {
    sessionStorage.setItem("toktickit.developmentRequesterId", "2");

    render(<App />);

    expect(await screen.findByText("Narin Chai")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("clears the requester context when Change requester is selected", async () => {
    sessionStorage.setItem("toktickit.developmentRequesterId", "1");
    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: /change requester/i }),
    );

    expect(sessionStorage.getItem("toktickit.developmentRequesterId")).toBeNull();
    expect(
      screen.getByRole("heading", { name: /select development requester/i }),
    ).toBeInTheDocument();
  });

  it("shows an accessible empty state when no active requester exists", async () => {
    vi.mocked(api.fetchDevelopmentRequesters).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        /no active development requester/i,
      );
    });
  });

  it("shows a safe failure with a working retry action", async () => {
    vi.mocked(api.fetchDevelopmentRequesters)
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce(requesters);

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not load development requesters/i,
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(api.fetchDevelopmentRequesters).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByRole("combobox", { name: /development requester/i }),
    ).toBeInTheDocument();
  });
});
