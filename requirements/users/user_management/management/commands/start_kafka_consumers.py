from django.core.management.base import BaseCommand
from kafka import KafkaConsumer, KafkaProducer
from django.contrib.auth.models import User
from django.conf import settings
import logging
import dotenv
import json
import jwt
import os

dotenv.load_dotenv()
# Configure logging for the Kafka consumer
logging.basicConfig(level=logging.WARNING)
# Set the logging level for the Kafka library to WARNING or higher
logging.getLogger("kafka").setLevel(logging.WARNING)
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
            acks='all',  # Ensure all in-sync replicas acknowledge the write
            retries=5,  # Retry sending messages in case of failure
        )

        for message in consumer:
            self.stdout.write(
                self.style.SUCCESS('an event has been recieved')
            )  
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
        self.stdout.write(
            self.style.SUCCESS(f'some event has been produced \n {user_ids}')
        ) 


