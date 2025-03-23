# learn-language

## Prepare databases

1. Install [Docker](hthttps://docs.docker.com/engine/install/h)

1. Run instances using docker compose:

    ```bash
    docker compose up -d
    ```

## Run to dev

1. Install [Bun](https://bun.sh/docs/installation)

1. To install dependencies:

    ```bash
    bun install
    ```

1. To run:

    ```bash
    bun dev # run backend dev server
    bun dev:backend # run backend dev server
    bun dev:frontend # run frontend dev server
    ```
