import { render, screen } from "@testing-library/react";
import { WatchStatus } from "../src/components/WatchStatus";

describe("WatchStatus component", () => {
    test("shows watched text when the movie has been seen", () => {
        render(
            <WatchStatus
                watched={{
                    seen: true,
                    liked: false,
                    when: "2024-01-01",
                }}
            />,
        );

        expect(screen.getByText("Watched")).toBeInTheDocument();
    });

    test("shows not yet watched text when the movie has not been seen", () => {
        render(
            <WatchStatus
                watched={{
                    seen: false,
                    liked: false,
                    when: null,
                }}
            />,
        );

        expect(screen.getByText("Not yet watched")).toBeInTheDocument();
    });
});
