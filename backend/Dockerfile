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

# Copy dependency manifest
COPY pyproject.toml ./

# Install Python dependencies using pip
RUN pip install --no-cache-dir .

# Copy application source code
COPY . ./

# Expose the port the FastAPI app runs on
EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
