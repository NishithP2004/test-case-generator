FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    python3 \
    python3-pip \
    curl \
    zstd \
    ca-certificates \
    xvfb \
    xauth \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python && ln -sf /usr/bin/pip3 /usr/bin/pip

# RUN curl -fsSL https://ollama.com/install.sh | sh

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true 

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

# CMD ["/bin/sh", "-c", "ollama serve > /dev/null 2>&1 & (until curl -s http://127.0.0.1:11434 > /dev/null; do sleep 1; done) && xvfb-run -a --server-args=\"-screen 0 1920x1080x24\" node index.js"]
CMD ["/bin/sh", "-c", "xvfb-run -a --server-args=\"-screen 0 1920x1080x24\" node index.js"]