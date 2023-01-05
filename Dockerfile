FROM --platform=arm64 node:16-slim AS stockbot-build
RUN apt-get update
RUN apt-get install -y openssl
RUN mkdir /src
WORKDIR /src
COPY . /src
RUN npm install
RUN npm run build

FROM stockbot-build
RUN mkdir /app
WORKDIR /app
RUN cp -a /src/dist/. /app/
RUN cp /src/package.json /app/package.json
RUN cp -a /src/node_modules/.prisma/client/. /app/node_modules/.prisma/client/
RUN cp -a /src/node_modules/@prisma/. /app/node_modules/@prisma/
RUN rm -r /src
RUN ls /app
RUN npm install --only=production

ENTRYPOINT [ "node", "app.js" ]
