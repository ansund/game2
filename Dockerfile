FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

EXPOSE 8080

CMD ["http-server", "-p", "8080", "--cors", "-c-1"]
