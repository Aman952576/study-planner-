FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=10000

EXPOSE 10000

CMD gunicorn app:app --bind 0.0.0.0:10000 --workers 2 --timeout 120
