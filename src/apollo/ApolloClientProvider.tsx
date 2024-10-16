// src/apollo/ApolloClientProvider.tsx
'use client';  // Ensure this is a client component

// import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
// import React from 'react';

// const client = new ApolloClient({
//   uri: 'http://localhost:4000/graphql',  // Replace with your GraphQL endpoint
//   cache: new InMemoryCache(),
// });

import { ApolloClient, InMemoryCache, ApolloLink} from '@apollo/client';
import  createUploadLink  from 'apollo-upload-client/createUploadLink.mjs';

const httpLink = createUploadLink({
  uri: 'http://localhost:4000/graphql', // Replace with your GraphQL endpoint
});

const client = new ApolloClient({
  link: ApolloLink.from([httpLink]),
  cache: new InMemoryCache()
});

export default client;

// const ApolloClientProvider = ({ children }: { children: React.ReactNode }) => {
//   return <ApolloProvider client={client}>{children}</ApolloProvider>;
// };

// export default ApolloClientProvider;
