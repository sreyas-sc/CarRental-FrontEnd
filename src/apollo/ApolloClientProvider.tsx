// src/apollo/ApolloClientProvider.tsx
'use client';  // Ensure this is a client component

import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import React from 'react';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',  // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

const ApolloClientProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloClientProvider;
