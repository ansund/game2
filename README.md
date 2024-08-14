# Cell Eater Game

Cell Eater is a simple browser-based game inspired by agar.io. This README provides instructions on how to build and run the game using Docker.

## Prerequisites

- Docker
- Docker Compose

## Building and Running the Game

1. Clone the repository to your local machine.

2. Navigate to the project directory in your terminal.

3. Build and run the Docker container:

   ```
   docker-compose up --build
   ```

4. Once the container is running, open your web browser and go to:

   ```
   http://localhost:8080
   ```

5. You should now see the game running in your browser.

## Stopping the Game

To stop the game and shut down the Docker container:

1. In the terminal where the container is running, press `Ctrl+C`.

2. To remove the container, run:

   ```
   docker-compose down
   ```

## Development

If you want to make changes to the game:

1. Modify the files as needed.

2. Hard Refresh your browser to see the changes. "cmd + shift + r"

Note: The project directory is mounted as a volume in the Docker container, so changes to the files should be reflected immediately without needing to rebuild the container.
