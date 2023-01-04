FROM --platform=arm node:16 AS stockbot-build
RUN mkdir /src
WORKDIR /src
COPY . /src
RUN npm install
RUN npm run generate
RUN npm run build

FROM stockbot-build
RUN mkdir /app
WORKDIR /app
RUN cp -a /src/dist/. /app/
RUN cp /src/package.json /app/package.json
RUN rm -r /src
RUN ls /app
RUN npm install --only=production

ENTRYPOINT [ "node", "app.js" ]
