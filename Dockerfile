FROM --platform=linux/amd64 nginx:latest

COPY ./dist /usr/share/nginx/html