FROM node
MAINTAINER Rowan Wookey <admin@rwky.net>
WORKDIR app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm i
COPY index.js /app/
COPY public /app/public
COPY views /app/views
CMD ["node", "index.js"]
