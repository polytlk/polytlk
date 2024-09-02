FROM docker.io/nginx:stable-alpine
COPY dist/apps/web-client/* /usr/share/nginx/html/

COPY apps/web-client/nginx.conf /etc/nginx/conf.d/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
