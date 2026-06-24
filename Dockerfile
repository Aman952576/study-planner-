FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

RUN useradd -m -u 1000 user

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build && chown -R user:user /app

USER user
ENV PATH="/home/user/.local/bin:$PATH"

ENV HOST=0.0.0.0
ENV PORT=7860

EXPOSE 7860

CMD gunicorn app:app --bind 0.0.0.0:7860 --workers 2 --timeout 120 --log-level debug
