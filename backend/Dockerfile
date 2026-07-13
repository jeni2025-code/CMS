# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy pyproject and lock files (if any)
COPY backend/pyproject.toml ./

# Install poetry or pip-tools – we'll use pip
RUN pip install --no-cache-dir --upgrade pip

# Install runtime dependencies
RUN pip install --no-cache-dir -r <(pip freeze) || true

# Copy application source
COPY backend/ .

# Expose port
EXPOSE 8000

# Run the app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
