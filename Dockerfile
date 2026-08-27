FROM node:20-slim

# Install system dependencies, Python 3, OpenCV, and Chromium
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-opencv \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    xdg-utils \
    dos2unix \
    && rm -rf /var/lib/apt-get/lists/*

# Install required Python packages
RUN pip3 install --break-system-packages pandas numpy pillow pytesseract opencv-python

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /DisposalDateScanner-main

COPY . .

# Install Node.js dependencies
RUN cd whatsapp-scheduler && npm install

# Convert line endings and make executable
RUN dos2unix run.sh && chmod +x run.sh

ENTRYPOINT ["./run.sh"]
