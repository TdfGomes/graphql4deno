export type GraphQLOptions = {
  schema: any;
  contextValue?: any;
  rootValue?: any;
  variableValues?: object;
  operationName?: string;
  fieldResolver?: () => any;
  typeResolver?: () => any;
};

export type GraphQLParams = {
  query: string;
  variables?: object;
  operationName?: string;
};

export interface Options {
  schema: any;
  rootValue?: any;
  context?: any;
  resolvers?: any;
}

export type ServerContext<T> = T;
