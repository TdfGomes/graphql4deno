import graphqlHttp from "../mod.ts";

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from "https://cdn.pika.dev/graphql@^15.0.0";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      greeting: {
        type: GraphQLString,
        resolve: (_obj, _args, context) => {
          return "Hello world";
        },
      },
    },
  }),
});

graphqlHttp({ port: 8080 }, "/graphql", { schema });