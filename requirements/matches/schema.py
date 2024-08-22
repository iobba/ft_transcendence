import match_management.schema
import graphene

class Query(match_management.schema.Query, graphene.ObjectType):
    pass

class Mutation(match_management.schema.Mutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
