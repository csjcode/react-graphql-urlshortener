# API.cc Url Shortener in React and GraphQL

* URL shortener using React. Graphql, Node.js
* repo: react-graphql-urlshortener - public examples
* starting out planning and architecture with a combo of info from Hacker Noon article and docs from GraphQL and Graphcool as well as Graphcool signup info.


## Outline

* Setup/install of initial libraries.
* Customizing the React component.

---------------------------------------------

## 1 - Getting Started - Setup

---------------------------------------------

1. Install Create React App glocally `$ npm install -g create-react-app`
2. Install Graphcool glocally `$ npm install -g graphcool`
3. `$ create-react-app urlshortener` 
4. `$ cd urlshortener && yarn start` to check initial setup works. Normal.
5. Change title of `public/index.html` to Url Shortener
6. `$ mkdir graphcool && cd graphcool`
7. `$ graphcool init` initializes the GraphQL project and creates config files (graphcool.yml for config, types.graphq for data model, src folder )
8. In types.graphql remove the User example type placeholder and add:
```
type Link @model {
    id: ID! @isUnique
    hash: String!
    url: String!
    description: String
}

```
Reference on Graphcool docs: 

https://www.graph.cool/docs/reference/database/data-modelling-eiroozae8u/


9. Console: `$ graphcool deploy` - (1) choose a cluster, (2) prod, (3) your Servcie Name - here I will use "Shorty"
10. It will generate an API url, send you to a web page and you will have to login through Github, FB or another service.
11. Next, after being authenticated, you can go to the console interface.
------------

### **IMPORTANT!** 

Follow the instructions here, and if you are getting "error" later, it may be due to this section being messed up, as it will prvent the api connection if not setup correctly.

(1) In https://console.graph.cool in account settings you get a token you need to run fron console `graphcool login --token "[TOKEN THEY LIST IN YOUR ACCT]"`

This messed me up for a while as I thought it had been hooked up and I was getting errors. 

(2) After that you may also have to rerun with `graphcool deploy --force` which deletes the old original schema model info

------------
12. Switch to the Project Shorty
13. Also note in the console you have Simple API, Relay API, Subscription API urls
14. These are the API endpoints we'll be using.
15. Install Apollo [IMPORTANT: from project (app) root ie. urlshortener/ NOT /graphcool] - `$ yarn add apollo-client-preset react-apollo graphql-tag graphql`
16. Modify `src/index.js` to include at the top of the page:
```
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory'
```
17. Create an ApolloClient instance (a) get your service id with `$ graphcool info` 
18. (b) Insert this js in `src/index.js`
```
const client = new ApolloClient({
   link: new HttpLink({uri:'[yourapiurl]'}),
   cache: new InMemoryCache(),
});
```
19. Wrap the App in an HOC
```
const withApolloProvider = Comp => (
  <ApolloProvider client={client}>{Comp}</ApolloProvider>
);

ReactDOM.render(
    withApolloProvider(<App />),
    document.getElementById('root'));
```
---------------------------------------------

## 2 - Customizing the React Components

---------------------------------------------

1. Create `src/components` and Create `src/components/Link.js`
2. `$ yarn add prop-types`
3. Add code to Link.js
```
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Link extends Component {
    render() {
        return (
            <div>
                <div>
                    {this.props.link.description} ({this.props.link.url} -{' '}
                    {this.props.link.hash})
                </div>
            </div>
        );
    }
}

Link.propTypes = {
    link: PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string,
        hash: PropTypes.string,
        description: PropTypes.string,
    }),
};

export default Link;
```
4. Create `LinkList.js`
5. Add code to LinkList.js:
```
import React, { Component } from 'react';
import Link from './Link';

const ALL_LINKS = [
    {
        id: '1',
        hash: 'ABC',
        url: 'http://google.com',
        description: 'Google shortlink',
    },
    {
        id: '2',
        hash: 'DEF',
        url: 'http://graph.cool',
        description: 'Graphcool shortlink',
    },
    {
        id: '3',
        hash: 'GHI',
        url: 'http://reactjs.org',
        description: 'ReactJS shortlink',
    },
];

class LinkList extends Component {
    render() {
        return (
            <div>
                {ALL_LINKS.map(link => <Link key={link.id} link={link} />)}
            </div>
        );
    }
}

export default LinkList;
```
6. Update `App.js` to render `LinkList`
```
import React, { Component } from 'react';
import LinkList from './components/LinkList';

class App extends Component {
    render() {
        return <LinkList />;
    }
}

export default App;
```
7. View the web page at `http://localhost:3000`

Should show something like 
```
Google shortlink (http://google.com - ABC)
Graphcool shortlink (http://graph.cool - DEF)
ReactJS shortlink (http://reactjs.org - GHI)
```
---------------------------------------------

### Getting Data from GraphQL

---------------------------------------------

1. We need to query all links ie.:
```
const ALL_LINKS_QUERY = gql`
    query AllLinksQuery {
        allLinks {
            id
            url
            description
            hash
        }
    }`;
```
2. `gql` is a helper function from the module `react-apollo`
3. `allLinks` was generated from our type definitions
4. A single link query would be like:
```
query SingleLink {
    Link (id: "someid") {
        url
        description
    }
}
```
5. More docs about the Query API: https://www.graph.cool/docs/reference/graphql-api/query-api-nia9nushae/

6. Update LinkList.js with:
```
import React, { Component } from 'react';
import Link from './Link';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const ALL_LINKS_QUERY = gql`
    query AllLinksQuery {
        allLinks {
            id
            url
            description
            hash
        }
    }
`;

class LinkList extends Component {
    render() {
        if (this.props.allLinksQuery && this.props.allLinksQuery.loading) {
            return <div>Loading ...</div>;
        }

        if (this.props.allLinksQuery && this.props.allLinksQuery.error) {
            return <div>Error occurred</div>;
        }

        const allLinks = this.props.allLinksQuery.allLinks;
        if (allLinks.length === 0) {
            return <div>No links...</div>;
        }

        return (
            <div>
                {allLinks.map(link => <Link key={link.id} link={link} />)}
            </div>
        );
    }
}

export default graphql(ALL_LINKS_QUERY, { name: 'allLinksQuery' })(LinkList);

```
7. Notes: We are checking if the data prop as been received, and render a response accordingly.
8. Exporting at the bottom combines the component and query.
9. Go to the graphcool playground for your project (the one you previously setup on the graphcool website): ie. https://console.graph.cool/Shorty/playground
10. We're going to put in a mutation to add data, insert code:
```
mutation CreateLinkMutation {
  createLink(
    description:"First link from GraphQL",
    url:"http://example.com",
    hash:"somehash") {
    id
  }
}
```
11. Now check back at http://localhost:3000

---------------------------------------------

### Component for Creating Links

---------------------------------------------

### notes:

I'm starting out following instructions as found on an article on Hacker Noon and then will be customizing this to my own specifications.

.