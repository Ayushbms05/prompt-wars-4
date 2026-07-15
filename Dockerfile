FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY dist ./dist
CMD serve -s dist -l $PORT
