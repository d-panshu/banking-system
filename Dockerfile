FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

# Run migrations, seed data, then start application

CMD ["sh", "-c", "node migrations/migrate.js && node migrations/seed.js && node src/app.js"]