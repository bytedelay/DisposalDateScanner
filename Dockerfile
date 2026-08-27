FROM node:20-slim

# Install Python 3, pip, and Chromium dependencies required by Puppeteer
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    xdg-utils \
    && rm -rf /var/lib/apt-get/lists/*

# Configure Puppeteer environment to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy application files into the image
COPY . .

# Install Node.js dependencies in the subdirectory
RUN cd whatsapp-scheduler && npm install

# Install Python dependencies (uncomment if using a requirements.txt)
# RUN if [ -f "requirements.txt" ]; then pip3 install -r requirements.txt --break-system-packages; fi

# Grant execution rights to your runner script
RUN chmod +x run.sh

# Set entry point script
ENTRYPOINT ["./run.sh"]
