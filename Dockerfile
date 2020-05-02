FROM node
MAINTAINER Rowan Wookey <admin@rwky.net>
WORKDIR app
COPY package.json /app/
COPY package-lock.json /app/
RUN npm ci
COPY index.js /app/
COPY public /app/public
CMD ["node", "index.js"]
