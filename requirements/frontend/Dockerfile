FROM alpine:3.19.1 AS base

RUN apk update 

RUN apk add openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "/etc/nginx/ssl/nginx.key" \
  -out "/etc/nginx/ssl/nginx.csr" \
  -subj "/CN=pingpong.com"
# -subj "/C=MA/ST=/L=/O=/OU=/CN=pingpong.com/emailAddress="

FROM alpine:3.19.1

RUN apk update

RUN apk add nginx

#-----------
#
# RUN apk add git
#
# RUN apk add curl
#
# RUN apk add wget
#
# RUN apk add zsh
#
# RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" -y
#
# RUN apk add openrc --no-cache
#
# RUN mkdir -p /run/openrc && touch /run/openrc/softlevel
#
# RUN apk add gcc clang curl git wget make zsh xsel
#
# RUN git clone https://github.com/LazyVim/starter ~/.config/nvim
#
# RUN rm -rf ~/.config/nvim/.git
#
# RUN apk add neovim ripgrep fd
#

# ----------

COPY --from=base /etc/nginx/ssl /etc/nginx/ssl

COPY conf/default.conf /etc/nginx/http.d/default.conf

RUN apk add npm

#----------

RUN npm install -g sass

WORKDIR /var/www/pingpong

COPY --chmod=777 ./tools/startUp.sh /startUp.sh

COPY --chmod=777 srcs/package* /var/www/pingpong

RUN npm install

COPY --chmod=777 srcs /var/www/pingpong

RUN sass css/bootstrap.scss node_modules/bootstrap/dist/css/bootstrap.css

RUN rm -rf css/bootstrap.scss

ARG AUTH_URL

RUN echo "export default class environment { static INTRA_API = '${AUTH_URL}'; }" > ./js/environment.js

CMD /startUp.sh


