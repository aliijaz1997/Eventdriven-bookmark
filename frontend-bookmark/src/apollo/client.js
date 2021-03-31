import fetch from "cross-fetch";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://54efwjif6rbw7inaq4miz36mbm.appsync-api.us-east-2.amazonaws.com/graphql", // ENTER YOUR GRAPHQL ENDPOINT HERE
    fetch,
    headers: {
      "x-api-key": "da2-ro6ayczwk5eyzmfwlmmzsyucyi", // ENTER YOUR APPSYNC API KEY HERE
    },
  }),
  cache: new InMemoryCache(),
});