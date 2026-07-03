import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Composer } from "../Composer";

describe("Composer", () => {
  it("sends the trimmed message and clears the input on button click", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<Composer onSend={onSend} disabled={false} />);

    const textbox = screen.getByPlaceholderText(/ask about nimbus/i);
    await user.type(textbox, "  How does billing work?  ");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith("How does billing work?");
    expect(textbox).toHaveValue("");
  });

  it("submits on Enter but inserts a newline on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<Composer onSend={onSend} disabled={false} />);

    const textbox = screen.getByPlaceholderText(/ask about nimbus/i);
    await user.type(textbox, "line one{Shift>}{Enter}{/Shift}line two");
    expect(onSend).not.toHaveBeenCalled();
    expect(textbox).toHaveValue("line one\nline two");

    await user.type(textbox, "{Enter}");
    expect(onSend).toHaveBeenCalledWith("line one\nline two");
  });

  it("does not send while disabled", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<Composer onSend={onSend} disabled={true} />);

    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send an empty or whitespace-only message", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<Composer onSend={onSend} disabled={false} />);

    const textbox = screen.getByPlaceholderText(/ask about nimbus/i);
    await user.type(textbox, "   ");
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });
});
