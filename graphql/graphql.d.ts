

export type GraphQLOptions = {
  schema: any;
  contextValue?: any;
  rootValue?: any;
  variableValues?:any;
  operationName?: any;
  fieldResolver?: any;
  typeResolver?: any;
};

export type GraphQLParams = {
  query: string;
  variables?: object;
  operationName?: string;
};

export interface Otpions {
  schema:any;
  rootValue?: any;
  context?: any;
  resolvers?: any;
}



export type ServerContext<T> = T;
