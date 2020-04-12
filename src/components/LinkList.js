import React, { Component } from 'react';
import Link from './Link';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

// create JS constant that stores the query
// gql parser function used to parase plain string that contains the GraphQL code
// use template literal
const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`;

class LinkList extends Component {
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
              {linksToRender.map((link) => (
                <Link key={link.id} link={link} />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
