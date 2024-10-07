// src/apollo-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import   createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

const uploadLink=createUploadLink ({
  uri:'http://localhost:4000/graphql',
})

const client = new ApolloClient({
  link:uploadLink,
  uri: 'http://localhost:4000/graphql', // Replace with your actual GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;