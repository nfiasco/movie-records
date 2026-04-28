import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieView } from "../src/components/MovieView";
import type { Movie } from "../src/interfaces/movie";

const mockMovie: Movie = {
    id: "movie-view-id",
    title: "Movie View Test",
    rating: 8,
    description: "A movie view description",
    released: 2004,
    soundtrack: [
        { id: "track-one", name: "Track One", by: "Artist One" },
        { id: "track-two", name: "Track Two", by: "Artist Two" },
    ],
    watched: {
        seen: false,
        liked: false,
        when: null,
    },
};

function setup(movie: Movie = mockMovie) {
    const deleteMovie = jest.fn();
    const editMovie = jest.fn();
    const setMovieWatched = jest.fn();

    const result = render(
        <MovieView
            movie={movie}
            deleteMovie={deleteMovie}
            editMovie={editMovie}
            setMovieWatched={setMovieWatched}
        />,
    );

    return { ...result, deleteMovie, editMovie, setMovieWatched };
}

describe("MovieView component", () => {
    test("renders the movie details and media embeds", () => {
        const { container } = setup();

        expect(
            screen.getByRole("heading", { name: "Movie View Test" }),
        ).toBeInTheDocument();
        expect(container).toHaveTextContent("A movie view description");
        expect(container).toHaveTextContent("Released 2004");
        expect(container).toHaveTextContent("⭐⭐⭐⭐✰");

        const trailer = screen.getByTitle("YouTube video player");
        expect(trailer).toHaveAttribute(
            "src",
            "https://www.youtube.com/embed/movie-view-id",
        );
        expect(
            container.querySelectorAll('iframe[src*="open.spotify.com/embed"]'),
        ).toHaveLength(2);
    });

    test("opens and closes the editor from the view", () => {
        setup();

        userEvent.click(screen.getByRole("button", { name: "Edit" }));

        expect(screen.getByDisplayValue("Movie View Test")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

        userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(
            screen.getByRole("heading", { name: "Movie View Test" }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    });

    test("sends the movie id with watch updates", () => {
        const { setMovieWatched } = setup();

        userEvent.click(screen.getByRole("button", { name: "Mark as watched" }));

        expect(setMovieWatched).toHaveBeenCalledTimes(1);
        expect(setMovieWatched).toHaveBeenCalledWith("movie-view-id", true, false);
    });
});
