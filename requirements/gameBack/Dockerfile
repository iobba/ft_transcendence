FROM python:3.10

EXPOSE 9000

WORKDIR /code 

COPY . /code

RUN apt update -y && apt upgrade -y 

RUN apt install -y openssl

RUN openssl req -x509 -nodes -days 365 -subj "/C=XX" \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt 

CMD [ "./start.sh" ]

