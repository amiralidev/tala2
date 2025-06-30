# Stage 1: Build the Next.js application
# We use the official 'oven/bun' image as our base, which includes Bun runtime.
FROM oven/bun as builder

# Set the working directory inside the container for all subsequent commands.
WORKDIR /app

# Copy package.json and bun.lock (if it exists) to leverage Docker's build cache.
# This step is crucial for efficient caching: if these files don't change,
# Docker won't re-run 'bun install' in subsequent builds.
# We are now copying 'bun.lock' as per your project's setup.
COPY package.json bun.lock ./

# Install project dependencies using Bun.
# The --frozen-lockfile flag ensures that Bun strictly adheres to bun.lock,
# making your builds reproducible across environments.
RUN bun install --frozen-lockfile

# Copy the rest of your application's source code into the container.
COPY . .

# Build the Next.js application for production.
# This command executes the "build" script defined in your package.json,
# which is "next build". This step compiles your Next.js app, including
# any shadcn/ui components you've integrated.
RUN bun run build

# Stage 2: Create a lightweight production image
# We start again from the 'oven/bun' image, but this time, it will only contain
# the necessary files to run the Next.js application, not the build tools.
FROM oven/bun

# Set the working directory for the final image.
WORKDIR /app

# Set the NODE_ENV to production. This optimizes Next.js for production use.
ENV NODE_ENV production

# Copy the essential build artifacts from the 'builder' stage to the final image.
# .next: Contains the compiled Next.js application, server code, and client bundles.
# public: Contains static assets like images, fonts, etc.
# package.json: Needed by Next.js at runtime to resolve internal paths and dependencies.
# node_modules: Contains all production dependencies required to run the app.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000, which is the default port Next.js applications run on.
# This informs Docker that the container listens on this port at runtime.
EXPOSE 3000

# Define the command to start the Next.js production server.
# This executes the "start" script from your package.json, which is "next start".
CMD ["bun", "run", "start"]
