import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { setContext } from 'apollo-link-context';

// import apollo dependencies from installed packages
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BrowserRouter } from 'react-router-dom';
import { AUTH_TOKEN } from './constants';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// create httpLink that connects ApolloClient instance with  GraphQL API
// your GraphQL server will run on localhost 4000
const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

// add Apollo Link middleware to handle authentication for every request to graphQL server by ApolloClient instance in our app.
// the middleware allows you to modify requests (eg return headers to the context so httplink can read them)before sent to server.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  // WARNING: remember NOT safe to store auth token on local storage, this is only for purpose of the tutorial
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// instantiate WebSocketLink for WebSocket connection to know the subscriptions endpoint (similar to HTTP except uses ws instead of http protocol)
// authenticate websocket connection with user's token
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    },
  },
});

// split is for routing of requests when using websocket
// takes 3 args, test (returns boolean whether req is a susbcription), other 2 are a type of ApolloLink, wsLink, and authLink
// if test returns true, req forwards to 2nd arg wsLink, which if false (means is a query or mutation), goes to 3rd arg authLink
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

// create ApolloClient instance using the link which combines all the individual links
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// render root App component, which is wrapped in ApolloProvider higher order component
// receives client as prop
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
