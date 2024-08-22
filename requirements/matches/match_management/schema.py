from graphene_django import DjangoObjectType
from django.conf import settings
from kafka import KafkaProducer
from .models import Match
import graphene
import logging
import dotenv
import json
import os

dotenv.load_dotenv()
# Configure logging for the Kafka consumer
logging.basicConfig(level=logging.WARNING)
# Set the logging level for the Kafka library to WARNING or higher
logging.getLogger("kafka").setLevel(logging.WARNING)
class MatchType(DjangoObjectType):
    class Meta:
        model = Match
        fields = "__all__"

############ CREATE MATCH ############
class CreateMatch(graphene.Mutation):
    class Arguments:
        players = graphene.List(graphene.String, required=True)
        scores = graphene.List(graphene.Int, required=True)

    success = graphene.Boolean()
    message = graphene.String()
    match = graphene.Field(MatchType)

    @classmethod
    def mutate(cls, root, info, players, scores):
        try:
            l = len(players)
            if (l != 2 and l != 4) or len(scores) != 2:
                return CreateMatch(success=False, message="Invalid NO tokens or scores!")
            if l != len(set(players)):
                return CreateMatch(success=False, message="looks like i got some duplicate users!")
            if scores[0] not in range(8) or scores[1] not in range(8):
                return CreateMatch(success=False, message="match's scores limited to the range 0, 7!")
            match = Match.objects.create(
                winner_score=scores[0],
                loser_score=scores[1],
            )
            # send the tokens the users service to be validated
            producer = KafkaProducer(
                bootstrap_servers=os.environ['KAFKA_SERVER'].split(','),
                api_version=(3,8,0),
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                acks='all',  # Ensure all in-sync replicas acknowledge the write
                retries=5,  # Retry sending messages in case of failure
            )
            data = {
                'tokens': players,
                'scores': scores,
                'id': match.id
            }
            producer.send('tokens_topic', value=data)
            producer.flush()
            return CreateMatch(success=True, match=match, message="Match created successfully!")
        except Exception as e:
            logging.error(f"match creation: {e}")

############ MATCH MUTATIONS ############
class Mutation(graphene.ObjectType):
    create_match = CreateMatch.Field()

############ MATCH QUERIES ############
class Query(graphene.ObjectType):
    matches = graphene.List(MatchType)
    match_by_id = graphene.Field(MatchType, id=graphene.ID())
    matches_by_ids = graphene.List(MatchType, ids=graphene.List(graphene.ID, required=True))

    def resolve_matches(self, info):
        return Match.objects.all()

    def resolve_match_by_id(self, info, id):    
        try:
            match = Match.objects.get(id=id)
            return match
        except Match.DoesNotExist:
            return None

    def resolve_matches_by_ids(self, info, ids):
        all_matches =  Match.objects.filter(id__in=ids)
        return sorted(all_matches, key=lambda match: match.date_played, reverse=True)

schema = graphene.Schema(query=Query, mutation=Mutation)