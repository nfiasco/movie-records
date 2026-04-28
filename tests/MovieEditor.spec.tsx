import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieEditor } from "../src/components/MovieEditor";
import type { Movie } from "../src/interfaces/movie";

const mockMovie: Movie = {
    id: "test-movie-123",
    title: "The Test Movie",
    rating: 8,
    description: "A movie for testing",
    released: 2020,
    soundtrack: [
        { id: "song1", name: "Test Song", by: "Test Artist" },
        { id: "song2", name: "Second Song", by: "Second Artist" },
    ],
    watched: {
        seen: true,
        liked: true,
        when: "2023-01-01",
    },
};

function setup(movie: Movie = mockMovie) {
    const changeEditing = jest.fn();
    const editMovie = jest.fn();
    const deleteMovie = jest.fn();

    render(
        <MovieEditor
            changeEditing={changeEditing}
            movie={movie}
            editMovie={editMovie}
            deleteMovie={deleteMovie}
        />,
    );

    return { changeEditing, editMovie, deleteMovie, movie };
}

describe("MovieEditor Component", () => {
    test("saves edited movie fields and soundtrack updates", () => {
        const { changeEditing, editMovie, movie } = setup();

        const titleInput = screen.getByLabelText(/Title/i);
        userEvent.clear(titleInput);
        userEvent.type(titleInput, "Updated Movie");

        const releaseInput = screen.getByDisplayValue("2020");
        userEvent.clear(releaseInput);
        userEvent.type(releaseInput, "2024");

        userEvent.selectOptions(screen.getByRole("combobox"), "10");

        const descriptionInput = screen.getByLabelText(/Description/i);
        userEvent.clear(descriptionInput);
        userEvent.type(descriptionInput, "Updated description");

        const songNameInput = screen.getByDisplayValue("Test Song");
        userEvent.clear(songNameInput);
        userEvent.type(songNameInput, "Updated Song");

        const songByInput = screen.getByDisplayValue("Test Artist");
        userEvent.clear(songByInput);
        userEvent.type(songByInput, "Updated Artist");

        userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(editMovie).toHaveBeenCalledTimes(1);
        expect(editMovie).toHaveBeenCalledWith(movie.id, {
            ...movie,
            title: "Updated Movie",
            released: 2024,
            rating: 10,
            description: "Updated description",
            soundtrack: [
                {
                    id: "song1",
                    name: "Updated Song",
                    by: "Updated Artist",
                },
                {
                    id: "song2",
                    name: "Second Song",
                    by: "Second Artist",
                },
            ],
        });
        expect(changeEditing).toHaveBeenCalledTimes(1);
    });

    test("saves blank numeric fields as zero", () => {
        const { editMovie } = setup();

        const releaseInput = screen.getByDisplayValue("2020");
        userEvent.clear(releaseInput);
        userEvent.selectOptions(screen.getByRole("combobox"), "0");
        userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(editMovie).toHaveBeenCalledWith(
            mockMovie.id,
            expect.objectContaining({
                released: 0,
                rating: 0,
            }),
        );
    });

    test("cancel closes editing without saving", () => {
        const { changeEditing, editMovie, deleteMovie } = setup();

        userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(changeEditing).toHaveBeenCalledTimes(1);
        expect(editMovie).not.toHaveBeenCalled();
        expect(deleteMovie).not.toHaveBeenCalled();
    });

    test("delete calls deleteMovie with the movie id", () => {
        const { changeEditing, editMovie, deleteMovie } = setup();

        userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(deleteMovie).toHaveBeenCalledTimes(1);
        expect(deleteMovie).toHaveBeenCalledWith(mockMovie.id);
        expect(editMovie).not.toHaveBeenCalled();
        expect(changeEditing).not.toHaveBeenCalled();
    });
});
