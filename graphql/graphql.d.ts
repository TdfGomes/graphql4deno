

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

export type Otpions = {
  contextValue?: any
  operationName?: any
}



export type ServerContext<T> = T;
