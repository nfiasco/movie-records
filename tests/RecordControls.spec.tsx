import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordControls } from "../src/components/RecordControls";

function setup(watched: { seen: boolean; liked: boolean; when: string | null }) {
    const changeEditing = jest.fn();
    const setMovieWatched = jest.fn();

    render(
        <RecordControls
            watched={watched}
            changeEditing={changeEditing}
            setMovieWatched={setMovieWatched}
        />,
    );

    return { changeEditing, setMovieWatched };
}

describe("RecordControls component", () => {
    test("marks an unseen movie as watched and opens editing", () => {
        const { changeEditing, setMovieWatched } = setup({
            seen: false,
            liked: false,
            when: null,
        });

        expect(
            screen.getByRole("button", { name: "Mark as watched" }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Liked" })).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Not liked" }),
        ).not.toBeInTheDocument();

        userEvent.click(screen.getByRole("button", { name: "Mark as watched" }));
        expect(setMovieWatched).toHaveBeenCalledWith(true, false);

        userEvent.click(screen.getByRole("button", { name: "Edit" }));
        expect(changeEditing).toHaveBeenCalledTimes(1);
    });

    test("marks a seen unliked movie as unwatched or liked", () => {
        const { setMovieWatched } = setup({
            seen: true,
            liked: false,
            when: "2024-01-01",
        });

        userEvent.click(screen.getByRole("button", { name: "Mark as unwatched" }));
        expect(setMovieWatched).toHaveBeenCalledWith(false, false);

        userEvent.click(screen.getByRole("button", { name: "Not liked" }));
        expect(setMovieWatched).toHaveBeenCalledWith(true, true);
    });

    test("marks a seen liked movie as unwatched or not liked", () => {
        const { setMovieWatched } = setup({
            seen: true,
            liked: true,
            when: "2024-01-01",
        });

        userEvent.click(screen.getByRole("button", { name: "Mark as unwatched" }));
        expect(setMovieWatched).toHaveBeenCalledWith(false, true);

        userEvent.click(screen.getByRole("button", { name: "Liked" }));
        expect(setMovieWatched).toHaveBeenCalledWith(true, false);
    });
});
