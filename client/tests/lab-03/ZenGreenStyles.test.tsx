import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Lab 3 Zen Green style contract", () => { it("keeps role and private-note semantic classes available", () => { render(<><span className="badge badge--role">IT STAFF</span><section className="internal-note-panel"><h2>Internal Notes</h2></section></>); expect(screen.getByText("IT STAFF")).toHaveClass("badge--role"); expect(screen.getByRole("heading", { name: "Internal Notes" }).parentElement).toHaveClass("internal-note-panel"); }); });
