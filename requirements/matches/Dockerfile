# Use the official Python image as a base
FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ARG DATABASE_HOST
ARG DATABASE_NAME
ARG DATABASE_USER
ARG DATABASE_PASSWORD

# Set the working directory in the container
WORKDIR /code

# Copy the dependencies file to the working directory
COPY requirements.txt /code/

# Install dependencies
RUN pip install -r requirements.txt

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install postgresql-client -y

COPY . /code/

CMD until pg_isready -h ${DATABASE_HOST} -U ${DATABASE_USER} -p 5432 ; \
do >&2 echo "Postgresql server is not ready - waiting..." ;\
sleep 2 ;\
done ; \
 \
>&2 echo "Postgresql server is ready for a connection." && \
export PGPASSWORD="${DATABASE_PASSWORD}" && \
if ! psql -h ${DATABASE_HOST} -p 5432 -U ${DATABASE_USER} -lqt | cut -d \| -f 1 | grep -qw ${DATABASE_NAME}; then \
    echo "Creating database ${DATABASE_NAME}..." && \
    psql -h ${DATABASE_HOST} -p 5432 -U ${DATABASE_USER} -c "CREATE DATABASE ${DATABASE_NAME}"; \
fi && \
echo "Applying migrations" && \
python3 manage.py makemigrations && \
python3 manage.py migrate && \
set -m && \
echo "collecting static files" && \
python manage.py collectstatic --noinput && \
echo "Starting Kafka consumers" && \
python3 manage.py start_kafka_consumers & \
echo "Starting Django server" && \
gunicorn --bind 0.0.0.0:8000 matches.wsgi:application --workers 6
