import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import apiuri from './private/apiuri';
import suburi from './private/suburi';

const GRAPHQL_ENDPOINT = apiuri;
const SUBSCRIPTIONS_ENDPOINT = suburi;

if (!SUBSCRIPTIONS_ENDPOINT) {
    throw Error('Provide a GraphQL Subscriptions endpoint.');
}

if (!GRAPHQL_ENDPOINT) {
    throw Error('Provide a GraphQL endpoint.');
}

const httpLink = new HttpLink({
   uri: GRAPHQL_ENDPOINT,
});

const wsLink = new WebSocketLink({
   uri: SUBSCRIPTIONS_ENDPOINT,
   options: {
       reconnect: true,
   },
});


const link = split(
   ({ query }) => {
       const { kind, operation } = getMainDefinition(query);
       return kind === 'OperationDefinition' && operation === 'subscription';
   },
   wsLink,
   httpLink,
);

const client = new ApolloClient({
   link,
   cache: new InMemoryCache(),
});


const withApolloProvider = Comp => (
   <ApolloProvider client={client}>{Comp}</ApolloProvider>
);

ReactDOM.render(withApolloProvider(<App />), document.getElementById('root'));
registerServiceWorker();