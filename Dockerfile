FROM node:8.9

ADD . /app

ENV NODE_ENV=production \
	PORT=3000 \
	ROOT_URL=http://localhost:3000

RUN set -x \
	&& cd /app/bundle/programs/server \
	&& npm install \
	&& npm cache clear --force

WORKDIR /app/bundle

EXPOSE 3000

CMD ["node", "main.js"]
