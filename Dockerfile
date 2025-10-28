FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

EXPOSE 8081

CMD ["http-server", "-p", "8081", "--cors", "-c-1"]
