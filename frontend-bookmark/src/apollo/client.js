import fetch from "cross-fetch";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://7fnnweabrzcivmg3nv6j677npa.appsync-api.us-east-2.amazonaws.com/graphql", // ENTER YOUR GRAPHQL ENDPOINT HERE
    fetch,
    headers: {
      "x-api-key": "da2-a5xhbb35sncfnivenvkigvzyle", // ENTER YOUR APPSYNC API KEY HERE
    },
  }),
  cache: new InMemoryCache(),
});
