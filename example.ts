import graphqlHttp from './mod.ts'
import { makeExecutableSchema } from "./deps.ts";


import { 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString } from "https://cdn.pika.dev/graphql@^15.0.0";
import gql from "https://raw.githubusercontent.com/davidmwhynot/graphql-tag-deno/master/mod.ts";

// const schema = makeExecutableSchema({
//   typeDefs: `
//     type Query {
//       greeting: String
//     }
//   `,
//   resolvers: {
//     Query: {
//       greeting: () => "Hello World",
//     },
//   },
// });
// graphqlHttp({ port: 8080 }, "/graphql", { schema });

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "Query",
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve: (_obj, _args, context) => {
//           console.log({ _obj, _args, context });
//           return "Hello world";
//         },
//       },
//     },
//   }),
// });
// graphqlHttp({ port: 8080 }, "/graphql", { schema });


const schema = gql`
	type Query {
     greeting: String
  }
`;

const resolvers = {
  Query: {
    greeting: () => "Hello World",
  },
}

graphqlHttp({ port: 8080 }, "/graphql", { schema, resolvers });