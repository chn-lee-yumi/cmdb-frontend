FROM nginx:latest
COPY cmdb-manager/static /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf