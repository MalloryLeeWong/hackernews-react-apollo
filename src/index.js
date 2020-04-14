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
import {AUTH_TOKEN} from './constants'

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

// create ApolloClient instance by passing the httpLinka nd new instance of InMemoryCache
const client = new ApolloClient({
  link: authLink.concat(httpLink)
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
