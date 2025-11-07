# =====================================
# 🍅 AgriMind Streamlit + KNN + PCA
# Base: Python 3.11 slim
# =====================================

FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies (needed for image handling and TensorFlow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir \
        streamlit \
        tensorflow \
        scikit-learn \
        joblib \
        pillow \
        numpy \
        matplotlib

# Expose Streamlit port
EXPOSE 8501

# Default command: open bash (you'll start streamlit manually)
CMD ["bash"]