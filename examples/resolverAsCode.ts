import graphqlHttp from "../mod.ts";
import { makeExecutableSchema } from "../deps.ts";

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      greeting: String
    }
  `,
  resolvers: {
    Query: {
      greeting: () => "Hello World",
    },
  },
});

graphqlHttp({ port: 8080 }, "/graphql", { schema });
