# AgriMind — AI model (Docker)

This folder contains the Streamlit + ML model for AgriMind. The included `Dockerfile` builds an image based on Python 3.11 that installs Streamlit, TensorFlow, scikit-learn and other dependencies.

Below are the commands to build the Docker image, run an interactive container (mounting the current folder) and start the Streamlit app using the exact sequence you provided.

Prerequisites

- Docker installed and running

- A working `app.py` (Streamlit app) in this folder

Build the image

Use a tag for the image (example: `agrimind-model:latest`):

    docker build -t agrimind-model:latest .

Run the container and open a shell inside it (mounts the current directory into `/app`):

    docker run -it -p 8501:8501 -v $(pwd):/app agrimind-model:latest bash

Then, inside the container run the commands you supplied (these will ensure the required Python packages are available and start Streamlit):

    cd /app
    pip install streamlit tensorflow pillow
    streamlit run app.py --server.port=8501 --server.address=0.0.0.0

Notes

- The `Dockerfile` already installs Streamlit, TensorFlow, Pillow and other common dependencies, so the `pip install` step inside the container is optional but safe if you want to ensure the latest versions.

- If you prefer not to drop into an interactive shell, you can run Streamlit directly from `docker run` (example):

        docker run -it -p 8501:8501 -v $(pwd):/app agrimind-model:latest \
            bash -c "cd /app && streamlit run app.py --server.port=8501 --server.address=0.0.0.0"

- On macOS with `zsh`, `$(pwd)` expands to the current working directory. If you encounter permission issues when mounting files, ensure Docker has access to the folder in Docker Desktop settings.

Rebuild after changes

- If you edit Python files or the Dockerfile, rebuild the image using the `docker build` command above and re-run the container.


Troubleshooting

- If Streamlit fails to start, inspect the container logs or run Streamlit without `--server.address=0.0.0.0` to check for binding errors.

- If TensorFlow fails to install in the image or inside the container, ensure your Docker base image and OS packages are compatible with the TensorFlow version in the Dockerfile.

Enjoy — open [http://localhost:8501](http://localhost:8501) in your browser after Streamlit starts.

