# Graphql for Deno

Is very tiny and simple graphql http server built on top of
[Deno http module](https://deno.land/std/http) using some
[GraphQL utilities](http://graphql.org/graphql-js/).

My goal with this was to have a simple dedicated http server to run GraphQL, no
router, midllewares or..., something else. Just your schema and a http server.

> This is heavily on development so the design and some decisions can change,
> still in progress...

## How to use

```javascript
import graphqlHttp from "https://raw.githubusercontent.com/TdfGomes/graphql4deno/master/mod.ts";

import {
  GraphQLObjectType,
  GraphQLSchema,
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
```

You can also do like this:

```javascript
import graphqlHttp from "https://raw.githubusercontent.com/TdfGomes/graphql4deno/master/mod.ts";
import { makeExecutableSchema } from "https://raw.githubusercontent.com/TdfGomes/graphql4deno/master/deps.ts";

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
```

or even like this:

```javascript
import graphqlHttp from "https://raw.githubusercontent.com/TdfGomes/graphql4deno/master/mod.ts";
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
```

To run this from the you will need to use the `allow-net` flag (e.g
`deno run --allow-net example`)

---

## TODO

- [x] Error Handling
- [ ] **Add tests !!!**
- [ ] CORS
- [ ] Improve Typescript
- [ ] Add Graphql Subscriptions
- 🤔

For sure this list will be bigger. If you see a bug or wanted to see an extra
feature here open an issue or a pull request. I will be more than happy to have
help.

---

### Thank you

- [Alex Loberta](https://github.com/alexlbr): For your mentorship
- [Francisco Gomes](https://github.com/FranciscoMCG): For your help teaching me
  typescript
- [João Tiago](https://www.linkedin.com/in/joaosilvatiago/): For your patience,
  guidance and encouraging me
- [Diego Braga](https://github.com/dsbrgg): For allways sharing new tech geek
  stuff with me
