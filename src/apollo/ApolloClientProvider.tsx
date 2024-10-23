// src/apollo/ApolloClientProvider.tsx
'use client';  // Ensure this is a client component
import { ApolloClient, InMemoryCache, ApolloLink} from '@apollo/client';
import  createUploadLink  from 'apollo-upload-client/createUploadLink.mjs';

const httpLink = createUploadLink({
  uri: 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
  link: ApolloLink.from([httpLink]),
  cache: new InMemoryCache()
});

export default client;
