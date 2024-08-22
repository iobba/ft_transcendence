import graphene
import user_management.schema

class Query(user_management.schema.Query, graphene.ObjectType):
    pass

class Mutation(user_management.schema.Mutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
