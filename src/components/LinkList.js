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

  render() {
    // wrap the returned code in Query component, passing it the query constant
    // Query component will fetch data for you under the hood
    // Apollo injects several props into the render prop function: loading, error, data

    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) return <div>Fetching</div>;
          if (error) return <div>Error</div>;

          // loading: true while response hasn't been received
          // error: will say what went wrong
          // data: data returned from server, which has a links property which represents a list of Link elements

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
