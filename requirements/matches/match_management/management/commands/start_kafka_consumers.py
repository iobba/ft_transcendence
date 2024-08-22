from django.core.management.base import BaseCommand
from match_management.models import Match
from kafka import KafkaConsumer
import threading
import logging
import dotenv
import json
import os

dotenv.load_dotenv()
# Configure logging for the Kafka consumer
logging.basicConfig(level=logging.WARNING)
# Set the logging level for the Kafka library to WARNING or higher
logging.getLogger("kafka").setLevel(logging.WARNING)
class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.SUCCESS('matches consuming command executed')
        ) 
        consumer = KafkaConsumer(
            'validated_ids_m',
            api_version=(3,8,0),
            bootstrap_servers=os.environ['KAFKA_SERVER'].split(','),
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='validated-ids-m',
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )

        # Infinite loop to consume messages from the Kafka topic
        for message in consumer:
            self.stdout.write(
                self.style.SUCCESS('an event has been recieved')
            ) 
            self.msg_process(message)

    def msg_process(self, message):
        data = message.value
        match_id = data['id']
        ids = data['ids']
        l = len(ids)
        try:
            match = Match.objects.get(id=match_id)
            if not ids:
                match.delete()
                self.stdout.write(
                    self.style.SUCCESS(f'match : {match_id}, got deleted')
                ) 
            else:
                if l == 4:
                    match.winners = ids[:2]
                    match.losers = ids[2:]
                else:
                    match.winners = [ids[0],]
                    match.losers = [ids[1],]
                match.save()
        except Exception as e:
            self.stdout.write(
                self.style.SUCCESS(f'match id not found: {match_id}')
            ) 