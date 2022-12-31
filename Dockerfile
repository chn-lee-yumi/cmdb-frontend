FROM nginx:latest
COPY cmdb-manager/static /usr/share/nginx/html/static
COPY default.conf /etc/nginx/conf.d/default.conf