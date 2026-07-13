FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install D

COPY . .

CMD ["npm", "start"]