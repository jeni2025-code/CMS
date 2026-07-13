# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system build dependencies required for some Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Copy dependency manifest (prefer requirements.txt, fallback to pyproject.toml)
COPY backend/requirements.txt ./
# If you use pyproject.toml instead, uncomment the line below:
# COPY backend/pyproject.toml ./

# Install Python dependencies
RUN if [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        echo "No requirements.txt found – skipping dependency install"; \
    fi

# Copy application source code
COPY backend/ ./

# Expose the port the FastAPI app runs on
EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
