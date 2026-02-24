FROM node:24-alpine

RUN apk update && \
    apk add --no-cache chromium && \
    apk add --no-cache python3 py3-pip

RUN ln -sf python3 /usr/bin/python && ln -sf pip3 /usr/bin/pip

RUN curl -fsSL https://ollama.com/install.sh | sh

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json .
RUN npm ci 
COPY . .

EXPOSE 3000

CMD sh -c 'ollama serve >/dev/null 2>&1 & sleep 10 && node index.js'