import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

function movieCard(title: string): HTMLElement {
    const heading = screen.getByRole("heading", { name: title });
    const card = heading.closest(".bg-light");

    if (!(card instanceof HTMLElement)) {
        throw new Error(`Could not find card for ${title}`);
    }

    return card;
}

function trailerIframes(): HTMLIFrameElement[] {
    return screen
        .getAllByTitle("YouTube video player")
        .filter((iframe): iframe is HTMLIFrameElement => iframe instanceof HTMLIFrameElement);
}

describe("App Component", () => {
    test("renders the initial movie records", () => {
        render(<App />);

        expect(screen.getByRole("banner")).toHaveTextContent("Movie Records");
        expect(
            screen.getByRole("heading", { name: "Kiki's Delivery Service" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Ponyo" })).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: "Howl's Moving Castle" }),
        ).toBeInTheDocument();
        expect(trailerIframes()).toHaveLength(6);
    });

    test("updates watch and like controls for a movie", () => {
        render(<App />);

        const kiki = movieCard("Kiki's Delivery Service");
        userEvent.click(
            within(kiki).getByRole("button", { name: "Mark as watched" }),
        );

        expect(
            within(kiki).getByRole("button", { name: "Mark as unwatched" }),
        ).toBeInTheDocument();
        expect(within(kiki).getByRole("button", { name: "Not liked" })).toBeInTheDocument();

        userEvent.click(within(kiki).getByRole("button", { name: "Not liked" }));
        expect(within(kiki).getByRole("button", { name: "Liked" })).toBeInTheDocument();

        userEvent.click(
            within(kiki).getByRole("button", { name: "Mark as unwatched" }),
        );
        expect(
            within(kiki).getByRole("button", { name: "Mark as watched" }),
        ).toBeInTheDocument();
        expect(within(kiki).queryByRole("button", { name: "Liked" })).not.toBeInTheDocument();
    });

    test("edits a movie title through the app", () => {
        render(<App />);

        const kiki = movieCard("Kiki's Delivery Service");
        userEvent.click(within(kiki).getByRole("button", { name: "Edit" }));

        const titleInput = screen.getByDisplayValue("Kiki's Delivery Service");
        userEvent.clear(titleInput);
        userEvent.type(titleInput, "Kiki Updated");
        userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(
            screen.getByRole("heading", { name: "Kiki Updated" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("heading", { name: "Kiki's Delivery Service" }),
        ).not.toBeInTheDocument();
    });

    test("deletes a movie through the app", () => {
        render(<App />);

        const ponyo = movieCard("Ponyo");
        userEvent.click(within(ponyo).getByRole("button", { name: "Edit" }));
        userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(screen.queryByRole("heading", { name: "Ponyo" })).not.toBeInTheDocument();
        expect(trailerIframes()).toHaveLength(5);
    });

    test("adds a unique movie from the add movie modal", () => {
        render(<App />);

        expect(trailerIframes()).toHaveLength(6);

        userEvent.click(screen.getByRole("button", { name: "Add New Movie" }));
        userEvent.type(screen.getByLabelText(/YouTube ID/i), "new-video-id");
        userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        const trailers = trailerIframes();
        expect(trailers).toHaveLength(7);
        expect(
            trailers.some((iframe) =>
                iframe.src.includes("https://www.youtube.com/embed/new-video-id"),
            ),
        ).toBe(true);
    });

    test("does not add a duplicate movie id", () => {
        render(<App />);

        expect(trailerIframes()).toHaveLength(6);

        userEvent.click(screen.getByRole("button", { name: "Add New Movie" }));
        userEvent.type(screen.getByLabelText(/YouTube ID/i), "4bG17OYs-GA");
        userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        expect(trailerIframes()).toHaveLength(6);
    });
});
