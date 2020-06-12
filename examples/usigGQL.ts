import graphqlHttp from "../mod.ts";
import gql from "https://raw.githubusercontent.com/davidmwhynot/graphql-tag-deno/master/mod.ts";

const schema = gql`
	type Query {
     greeting: String
  }
`;

const resolvers = {
  Query: {
    greeting: () => "Hello World",
  },
};

graphqlHttp({ port: 8080 }, "/graphql", { schema, resolvers });