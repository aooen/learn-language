# Start from Bun base image
FROM oven/bun

# Create app directory
WORKDIR /app

# Copy all files to the container
COPY . .

# Install dependencies using Bun
RUN bun install

# Run backend and frontend in parallel
CMD ["bun", "run", "dev"]
