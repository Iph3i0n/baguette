FROM node:lts AS build

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY tsconfig.json tsconfig.json
COPY src src

RUN npm run build

FROM node:lts AS run

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --omit=dev

COPY --from=build /app/dist dist

COPY templates templates
COPY views views
COPY bin bin

RUN npm link

WORKDIR /site

EXPOSE 3000
EXPOSE 3001

CMD ["baguette", "develop"] 