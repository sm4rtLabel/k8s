FROM node:22

WORKDIR /usr/app

COPY ./App/package.json .
COPY ./App/package-lock.json .
COPY ./App/src ./src

RUN npm install --omit=dev && \
    mkdir /db/ && \
    mkdir /file-checkpoints/

ENV NODE_ENV=production

EXPOSE 6363

ENTRYPOINT ["npm"]

CMD ["run", "start"]
