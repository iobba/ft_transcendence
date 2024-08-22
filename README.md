# ft_transcendence (PING PONG GAME)
## Introduction
This project revolves around developing a robust and scalable website for the mighty Pong contest. The tasks were divided among team members, focusing on three main areas: front-end, game development, and backend architecture. My role centered on the backend, where I implemented a microservices-based architecture to ensure flexibility and efficiency.

The backend is built using Django, GraphQL, Docker, Gunicorn, PostgreSQL, and Kafka, each chosen for its ability to handle the specific demands of the project. Django provides a solid foundation for rapid development and clean design, while GraphQL allows for efficient data querying and manipulation. Docker ensures consistent environments for development, testing, and deployment, and Gunicorn is employed to serve the Django application in a production environment.

Kafka plays a critical role in facilitating communication between the various services, enabling the system to scale effectively and handle high loads with resilience. PostgreSQL serves as the reliable and powerful database system, ensuring data integrity and performance.

## Back-end Structure:
### Services

In the backend architecture of the Pong contest project, the tasks are divided into distinct services to maintain a modular and scalable structure. Each service is designed to handle specific functionalities, ensuring that the system remains efficient and easy to manage. Below are the two primary services within this architecture:

**1. Users Service**

The **Users** service is responsible for all user-related operations, including profile management, authentication, and security features. This service is built using Django and GraphQL, providing a robust API for interacting with user data. Key functionalities include:

- `Profile Management`: Creating, updating, and deleting user profiles, with support for external authentication sources like 42.
- `Authentication`: Validating tokens, handling login checks, and managing password changes.
- `Two-Factor Authentication (2FA)`: Enabling, verifying, and disabling 2FA for enhanced security.
- `Friend Management`: Updating friend lists and handling friend-related interactions.

 ```
############ USERS MUTATIONS ############
class Mutation(graphene.ObjectType):
    create_profile = CreateProfile.Field()
    update_profile = UpdateProfile.Field()
    login_check = LoginCheck.Field()
    change_password = ChangePassword.Field()
    enable_2fa = Enable2fa.Field()
    update_friends = UpdateFriends.Field()
    disable_2fa = Disable2fa.Field()
      ......        ......
      ......        ......
############ USERS QUERIES ############
class Query(graphene.ObjectType):
    profiles = graphene.List(ProfileType)
    users = graphene.List(UserType)
    user_by_username = graphene.Field(UserType, user_username=graphene.String())
      ......        ......
      ......        ......
```

**2. Matches Service**

The **Matches** service is dedicated to handling all aspects of match creation, manipulation, and storage. This includes managing match history, recording wins and losses, and storing all related data.


### Databases

In the initial stages of the project, I utilized a single PostgreSQL database, taking full advantage of Django's powerful ORM to manage relationships between tables. This approach allowed for easy use of ForeignKeys and ManyToMany fields, simplifying the handling of related data.

However, as the project evolved and I transitioned to a microservices architecture, I recognized the benefits of separating the databases for each service. Now, I have two distinct PostgreSQL databases: one dedicated to the users service and another for the matches service. This separation not only aligns with the microservices paradigm but also enhances the efficiency and scalability of the system, allowing each service to manage its own data independently while still maintaining the ability to communicate through Kafka.

To streamline the database setup and management process, I utilized the official PostgreSQL image from DockerHub. By doing so, I leveraged Docker's capabilities to containerize the database environments, ensuring consistency and ease of deployment across different stages of the project.

Below is an example of how I configured one of the databases:
```
# users database
  users_db:
    image: postgres:latest
    container_name: users_db
    environment:
      - POSTGRES_PASSWORD=${U_DB_PASSWORD}
    networks:
      - pong
    ports:
      - "5433:5432"
    volumes:
      - postgres-users-data:/var/lib/postgresql/data
    env_file:
      - .env
```
To ensure that the databases are up and running before the services attempt to connect, I included a script in the Dockerfile. This script checks the database readiness and creates the necessary databases if they don't already exist:
```
# ......
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
# ......
```

This setup ensured that the databases were isolated, scalable, and easily manageable, aligning with the project's microservices-based architecture.

### Kafka Integration

To facilitate communication between the microservices in this project, I employed Apache Kafka, a distributed event streaming platform capable of handling high-throughput data streams. Kafka enables the services to exchange messages asynchronously, ensuring efficient and scalable data flow within the system.

#### Kafka and ZooKeeper Overview

Kafka relies on ZooKeeper to manage distributed brokers and maintain metadata about the Kafka cluster. ZooKeeper is responsible for coordinating distributed processes, electing leaders for Kafka partitions, and tracking the status of brokers. Kafka uses ZooKeeper to keep track of the state of topics and partitions, ensuring that data is replicated and balanced across the cluster.

#### Kafka Setup

For the Kafka setup, I utilized Docker images to create a robust and isolated Kafka environment. Below is the configuration used to set up Kafka and ZooKeeper using Docker Compose:
```
  # Kafka service
  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - pong
    volumes:
      - kafka-data:/var/lib/kafka/data
    restart: on-failure

  # ZooKeeper service
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"
    networks:
      - pong
```

### Important Approach

The Kafka consumers are designed to run in infinite loops, processing messages continuously, and for that i utilized Django management commands to run Kafka consumers. This approach allows the Kafka consumers to operate independently in the background, providing better isolation and control over their execution.

Here’s an example of a Django management command that consumes messages from the Kafka tokens_topic, processes them, and produces results back to Kafka:
```
class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.SUCCESS('users consuming command executed')
        )
        consumer = KafkaConsumer(
            'tokens_topic',
            api_version=(3,8,0),
            bootstrap_servers=os.environ['KAFKA_SERVER'].split(','),
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='tokens-group',
            reconnect_backoff_ms=100,
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )

        producer = KafkaProducer(
            bootstrap_servers=os.environ['KAFKA_SERVER'].split(','),
            api_version=(3,8,0),
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',
            retries=5,
        )

        for message in consumer:
            data = message.value
            tokens = data.get('tokens')
            match_id = data.get('id')
            user_ids = self.validate_tokens(tokens)
            if user_ids: 
                scores = data.get('scores')
                l = len(user_ids)
                for i in range(l):
                    user = User.objects.get(id=user_ids[i])
                    if i < l // 2:
                        user.profile.wins.append(match_id)
                        user.profile.total_score += scores[0]
                    else:
                        user.profile.losses.append(match_id)
                        user.profile.total_score += scores[1]
                    user.profile.save()
                    user.save()  
            self.produce_validated_ids(producer, user_ids, match_id)
        
    def validate_tokens(self, tokens):
        user_ids = []
        for token in tokens:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=os.environ['JWT_ALGOS'].split(","))
                user_id = payload['user_id']
                user = User.objects.get(id=user_id)
                user_ids.append(user_id)
            except Exception as e:
                self.stdout.write(
                    self.style.SUCCESS('invalid tokens in the users consumer')
                ) 
                return []
        return user_ids

    def produce_validated_ids(self, producer, user_ids, match_id):
        validated_data = {
            'ids': user_ids,
            'id': match_id,
        }
        producer.send('validated_ids_m', value=validated_data)
        producer.flush() 
```
## Conclusion

The Backend part culminates in a setup with six containers: `users`, `users_db`, `matches`, `matches_db`, `kafka`, and `zookeeper`. This architecture supports a scalable backend with efficient inter-service communication via Kafka.
