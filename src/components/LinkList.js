import React, { Component } from 'react';
import Link from './Link';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

// create JS constant that stores the query
// gql parser function used to parase plain string that contains the GraphQL code
// use template literal
export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

class LinkList extends Component {
  // method  to update cache in Link component after vote mutation occurs
  _updateCacheAfterVote = (store, createVote, linkId) => {
    // read current state of cached data for FEED QUERY from the store
    const data = store.readQuery({ query: FEED_QUERY });
    // get the link that the user just voted for and manipulate by updating vote count to what server says it is
    const votedLink = data.feed.links.find((link) => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    // update the store with the modified data
    store.writeQuery({ query: FEED_QUERY, data });
  };

  // calling _subscribeToNewLinks with subscribeToMore func subscribes to events (eg update, delete, create link),and opens websocket connection to subscription server
  // subscribeToMore takes 2 args: document (subscription query), updateQuery (similar to cache update prop, how store should be updated after event occurs; similar to Redux reducer too takes prior state of query and subscription data)
  _subscribeToNewLinks = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink;
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename,
          },
        });
      },
    });
  };

  _subscribeToNewVotes = (subscribeToMore) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  };

  render() {
    // wrap the returned code in Query component, passing it the query constant
    // Query component will fetch data for you under the hood
    // Apollo injects several props into the render prop function: loading, error, data
    // use subscribeToMore in Query component as prop in the component’s render prop function

    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          // loading: true while response hasn't been received
          // error: will say what went wrong
          // data: data returned from server, which has a links property which represents a list of Link elements

          // graphQL Apollo subscriptions - when events fire, Apollo auto updates
          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewVotes(subscribeToMore);

          const linksToRender = data.feed.links;
          // this will return an object where links is a key and the value is an array of objects, each representing a different link with it's url, description and unique ID
          return (
            <div>
              {linksToRender.map((link, index) => (
                <Link
                  key={link.id}
                  link={link}
                  index={index}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                  // Link component invokes this updateCacheAfterVote method, passed via props, after vote mutation is performed
                />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
