# Url Shortener in React and GraphQL

* URL shortener using React. Graphql, Node.js
* credit original author of this code: Peter Jausovec - I am just working through his article on Hacker Noon, adding notes for those who may find it useful and educational. Most of the code was originally in the Hacker Noon article although there were some modifications needed for my system to work. 
* I am plannign to use some variant of this on API.cc - I did hit a roadblock with the serverless deployment, I'm looking into now. Apparently Graphcool had some network issues at the time I was deploying.
* repo: react-graphql-urlshortener - public examples
* I'm starting out planning and architecture with a combo of info derived (especially initial sections) from a useful Hacker Noon Graphql article (Building URL shortener using React, Apollo and GraphQL by Peter Jausovec), kind of a fork actually,  and docs from GraphQL and Graphcool as well as Graphcool signup info.
* I am refactoring some of this as I go along, however, intially following the original article and docs just to get things working first.
* Finally, I will be restyling everything and making it look nice.


## Outline

* Setup/install of initial libraries.
* Customizing the React component.
* Get Data and Queries
* Subscriptions

---------------------------------------------

## 1 - Getting Started - Setup

---------------------------------------------

1. Install Create React App locally `$ npm install -g create-react-app`
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
```javascript
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
```javascript
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
```javascript
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
```javascript
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
```javascript
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

12. NOTE: I also put my api token into a private file, listed in .gitginore so not uploaded to public repo.

13. Create file `src/private/mykey.js`
```javascript
var apiuri = 'https://api.graph.cool/simple/v1/[key]';
export default apiuri;
```

14. In index.js:
```javascript
import apiuri from './private/mykey.js';
```


---------------------------------------------

### Component for Creating Links

---------------------------------------------

1. Create `src/components/CreateShortLink.js`
2. Add code:
```javascript
import React, { Component } from 'react';

class CreateShortLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            url: '',
        };
    }

    createShortLink = async () => {
        // Create a short link here.
    };

    render() {
        return (
            <div>
                <input
                    id="url"
                    type="text"
                    value={this.state.url}
                    placeholder="Link URL"
                    onChange={e => this.setState({ url: e.target.value })}
                />
                <input
                    id="description"
                    type="text"
                    value={this.state.description}
                    placeholder="Link description"
                    onChange={e =>
                        this.setState({ description: e.target.value })
                    }
                />
                <button onClick={() => this.createShortLink()}>Create</button>
            </div>
        );
    }
}

export default CreateShortLink;
```
3. Refactor the previous mutation with a new one with new variables:
```
mutation CreateLinkMutation($url: String!, $description: String!, $hash: String!) {
  createLink(
    url: $url,
    description: $description,
    hash: $hash) {
    id
  }
}
```
4. Translation into code for React would be like this:
```javascript
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const CREATE_SHORT_LINK_MUTATION = gql`
    mutation CreateLinkMutation($url: String!, $description: String!, $hash: String!) {
        createLink(url: $url, description: $description, hash: $hash) {
            id
        }
    }
`;
```

5. Also we will need a hash creating function for the link digits, this is just to demonstrate what we'll be adding at the end with all the code for this file:
```javascript
createHash = (itemCount) => {
    let hashDigits = [];
    // dividend is a unique integer (in our case, number of links)
    let dividend = itemCount + 1;
    let remainder = 0;
    while (dividend > 0) {
        remainder = dividend % 62;
        dividend = Math.floor(dividend / 62);
        hashDigits.unshift(remainder);
    }
    console.log(hashDigits);
    const alphabetArray = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.split(
        '',
    );
    // Convert hashDigits to base62 representation
    let hashString = '';
    let i = 0;
    while (hashDigits.length > i) {
        hashString += alphabetArray[hashDigits[i]];
        i++;
    }
    return hashString;
}
```
6. Update code in CreateShortLink.js here:
```javascript
import React, { Component } from 'react';

import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';

const CREATE_SHORT_LINK_MUTATION = gql`
    mutation CreateLinkMutation($url: String!, $description: String!) {
        createLink(url: $url, description: $description) {
            id
        }
    }
`;

const GET_LINK_COUNT_QUERY = gql`
    query GetLinkCountQuery {
        links: _allLinksMeta {
            count
        }
    }
`;

const createHash = itemCount => {
    let hashDigits = [];
    // dividend is a unique integer (in our case, number of links)
    let dividend = itemCount + 1;
    let remainder = 0;
    while (dividend > 0) {
        remainder = dividend % 62;
        dividend = Math.floor(dividend / 62);
        hashDigits.unshift(remainder);
    }
    console.log(hashDigits);
    const alphabetArray = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.split(
        '',
    );
    // Convert hashDigits to base62 representation
    let hashString = '';
    let i = 0;
    while (hashDigits.length > i) {
        hashString += alphabetArray[hashDigits[i]];
        i++;
    }
    return hashString;
};

class CreateShortLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            url: '',
        };
    }

   createShortLink = async () => {
      const linkCountQuery = await this.props.client.query({
         query: GET_LINK_COUNT_QUERY,
      });

      const linkCount = linkCountQuery.data.links.count;
      const hash = createHash(linkCount);

      const { url, description } = this.state;
      await this.props.createShortLinkMutation({
         variables: {
               url,
               description,
               hash,
         },
      });
   };

    render() {
        return (
            <div>
                <input
                    id="url"
                    type="text"
                    value={this.state.url}
                    placeholder="Link URL"
                    onChange={e => this.setState({ url: e.target.value })}
                />
                <input
                    id="description"
                    type="text"
                    value={this.state.description}
                    placeholder="Link description"
                    onChange={e =>
                        this.setState({ description: e.target.value })
                    }
                />
                <button onClick={() => this.createShortLink()}>Create</button>
            </div>
        );
    }
}

export default graphql(CREATE_SHORT_LINK_MUTATION, {
    name: 'createShortLinkMutation',
})(withApollo(CreateShortLink));
```

7. Update App.js

```javascript
import React, { Component } from 'react';
import LinkList from './components/LinkList';
import CreateShortLink from './components/CreateShortLink';

class App extends Component {
    render() {
        return (
            <div>
                <div>
                    <h2>All links</h2>
                    <LinkList />
                </div>
                <div>
                    <h2>Create a short link</h2>
                    <CreateShortLink />
                </div>
            </div>
        );
    }
}

export default App;
```

8. Check to make sure it's working: http://localhost:3000/

---------------------------------------------------

### Subscriptions

Note: this part was more difficult to document, and there maybe some parts left out of the instructions, however, at the end the main files in full are available and the app should eb working (at least it was for me).

Make sure to fill in the variables below with your own info (in the instructions they are blank)
```
const GRAPHQL_ENDPOINT = '[INSERT_YOUR_INFO_HERE]';
const SUBSCRIPTIONS_ENDPOINT = '[INSERT_YOUR_INFO_HERE]';
```

---------------------------------------------------

1. GraphQL can do subscriptions, in addition to queries and mutations.

2. `$ yarn add apollo-link-ws subscriptions-transport-ws`

3. Create a web socket, first get endpoints: `$ graphcool info` 

4. In `src/index.js` add:

```javascript
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink } from 'apollo-link';

const GRAPHQL_ENDPOINT = '';
const SUBSCRIPTIONS_ENDPOINT = '';

if (!SUBSCRIPTIONS_ENDPOINT) {
    throw Error('Provide a GraphQL Subscriptions endpoint.');
}

if (!GRAPHQL_ENDPOINT) {
    throw Error('Provide a GraphQL endpoint.');
}


```

5. and also in `src/index.js`

```javascript
const wsLink = new WebSocketLink({
    uri: SUBSCRIPTIONS_ENDPOINT,
    options: {
        reconnect: true,
    },
});

// We inspect the query and use the split function to return the web socket link
// in case the operation is a subscription and return an httpLink in any other case (query or mutation)
const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLinkWithToken,
);

const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
});

```


6. Insert code into `src/components/LinkedList.js`:
```javascript
const LINKS_SUBSCRIPTION = gql`
    subscription NewLinkCreatedSubscription($createdById: ID!) {
        Link(
            filter: {
                mutation_in: [CREATED, UPDATED]
                node: { createdBy: { id: $createdById } }
            }
        ) {
            node {
                id
                url
                description
                hash
                stats {
                    clicks
                }
            }
        }
    }
`;
```

7. Also, add more code into `src/components/LinkedList.js`:
```javascript
componentDidMount() {
    this.props.allLinksQuery.subscribeToMore({
        document: LINKS_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
            const newLinks = [
                ...prev.allLinks,
                subscriptionData.data.Link.node,
            ];
            const result = {
                ...prev,
                allLinks: newLinks,
            };
            return result;
        },
    });
}
```

8. `In CreateShortLink.js`, edit the `const linkCountQuery` to add network only. (according to Hacker Noon article, Network-only option Apollo doesn't use cached values, will re-query).

```javascript
const linkCountQuery = await this.props.client.query({
   query: GET_LINK_COUNT_QUERY,
   fetchPolicy: 'network-only',
});
```


---------------------------------------------------------------------------

### WORKING at this point

### SUMMARY of main 3 files TO THIS POINT WITH SUBSCRIPTIONS WORKING

Some of the above notes in the previous section may be confusing or slightly incomplete at parts -- so check this section if still not working.

With a working app you should have a list of links under "All links" - when you create a link it will show up in the list automatically (reactively)

---------------------------------------------------------------------------

1. **index.js**
```javascript
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

const GRAPHQL_ENDPOINT = 'https://api.graph.cool/simple/v1/[MY_TOKEN_INSERT_HERE]';
const SUBSCRIPTIONS_ENDPOINT = 'wss://subscriptions.graph.cool/v1/[MY_TOKEN_INSERT_HERE]';

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
```
2. **LinkList.js**
```javascript

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

const LINKS_SUBSCRIPTION = gql`
    subscription NewLinkCreatedSubscription {
        Link(filter: { mutation_in: [CREATED] }) {
            node {
                id
                url
                description
                hash
            }
        }
    }
`;

class LinkList extends Component {
    componentDidMount() {
        this.props.allLinksQuery.subscribeToMore({
            document: LINKS_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
                const newLinks = [
                    ...prev.allLinks,
                    subscriptionData.data.Link.node,
                ];
                const result = {
                    ...prev,
                    allLinks: newLinks,
                };
                return result;
            },
        });
    }

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

export default graphql(ALL_LINKS_QUERY, {
    name: 'allLinksQuery',
})(LinkList);

```
3. **CreateShortLink.js**
```javascript
import React, { Component } from 'react';

import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';

const CREATE_SHORT_LINK_MUTATION = gql`
    mutation CreateLinkMutation(
        $url: String!
        $description: String!
        $hash: String!
    ) {
        createLink(url: $url, description: $description, hash: $hash) {
            id
        }
    }
`;

const GET_LINK_COUNT_QUERY = gql`
    query GetLinkCountQuery {
        links: _allLinksMeta {
            count
        }
    }
`;

const createHash = itemCount => {
   let hashDigits = [];
   // dividend is a unique integer (in our case, number of links)
   let dividend = itemCount + 1;
   let remainder = 0;
   while (dividend > 0) {
       remainder = dividend % 62;
       dividend = Math.floor(dividend / 62);
       hashDigits.unshift(remainder);
   }
   const alphabetArray = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.split(
       '',
   );
   // Convert hashDigits to base62 representation
   let hashString = '';
   let i = 0;
   while (hashDigits.length > i) {
       hashString += alphabetArray[hashDigits[i]];
       i++;
   }
   return hashString;
};

class CreateShortLink extends Component {
   constructor(props) {
       super(props);
       this.state = {
           description: '',
           url: '',
       };
}

createShortLink = async () => {
   const linkCountQuery = await this.props.client.query({
       query: GET_LINK_COUNT_QUERY,
       fetchPolicy: 'network-only',
   });

   const linkCount = linkCountQuery.data.links.count;
   const hash = createHash(linkCount);

   const { url, description } = this.state;
   await this.props.createShortLinkMutation({
       variables: {
           url,
           description,
           hash,
       },
   });
};

render() {
   return (
       <div>
           <input
               id="url"
               type="text"
               value={this.state.url}
               placeholder="Link URL"
               onChange={e => this.setState({ url: e.target.value })}
           />
           <input
               id="description"
               type="text"
               value={this.state.description}
               placeholder="Link description"
               onChange={e =>
                   this.setState({ description: e.target.value })
               }
           />
           <button onClick={() => this.createShortLink()}>Create</button>
       </div>
   );
}
}

export default graphql(CREATE_SHORT_LINK_MUTATION, {
name: 'createShortLinkMutation',
})(withApollo(CreateShortLink));
```

---------------------------------------------------------------------------

### Serverless Functions on GraphCool

---------------------------------------------------------------------------

1. Functions need to be defined in the Graphcool service definition file (graphcool.yml).

2. Function types supported include operationBefore/operationAfter, Subscriptions, Resolvers

3. Move the hash function to subscription

4. Create `graphcool/src` folder

5. Create  `graphcool/src/createShortLink.graphql` with:
```javascript
subscription {
  Link(filter: { mutation_in: [CREATED] }) {
    node {
      id
    }
  }
}
```

6. Create `createShortLink.js` with:

```javascript
const { fromEvent } = require('graphcool-lib');

const createHash = itemCount => {
    let hashDigits = [];
    // dividend is a unique integer (in our case, number of links)
    let dividend = itemCount + 1;
    let remainder = 0;
    while (dividend > 0) {
        remainder = dividend % 62;
        dividend = Math.floor(dividend / 62);
        hashDigits.unshift(remainder);
    }
    const alphabetArray = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`.split(
        '',
    );
    // Convert hashDigits to base62 representation
    let hashString = '';
    let i = 0;
    while (hashDigits.length > i) {
        hashString += alphabetArray[hashDigits[i]];
        i++;
    }
    return hashString;
};

module.exports = async event => {
    // Get the data from the event - the data
    // is determined by the subscription. In our case, it will look like this:
    // event = {
    //     "data": {
    //         "Link": {
    //             "node": {
    //                 "id": "LINK_ID"
    //             }
    //         }
    //     }
    // }
    const { id } = event.data.Link.node;

    const graphcool = fromEvent(event);
    const api = graphcool.api('simple/v1');

    // 1. Get the link count.
    const getLinkCountQuery = `
        query GetLinkCountQuery {
            links: _allLinksMeta {
                count
            }
        }`;

    const linkCountQueryResult = await api.request(getLinkCountQuery);
    const linkCount = linkCountQueryResult.links.count;

    // 2. Get the hash.
    const hash = createHash(linkCount);

    // 3. Update the link with a hash.
    const updateLinkMutation = `
        mutation ($id: ID!, $hash: String!) {
            updateLink(id: $id, hash: $hash) {
                id  
            } 
        }`;

    const variables = { id, hash };
    await api.request(updateLinkMutation, variables);

    return {
        data: {
            success: true,
        },
    };
};
```

7. where package.json fiile is in graphcool subfolder: `npm install graphcool-lib --save`

8. Update the `graphcool.yml` file:
```javascript
 functions:
  createShortLink:
    type: subscription
    query: src/createShortLink.graphql
    handler:
      code: src/createShortLink.js
```

9. `graphcool deploy`

result: Code storage limit exceeded [I looked at Graphcool's status page and this is a known issue as of 1/22 on eu-west for functions]


















### notes:

I'm starting out following instructions as found on an article on Hacker Noon and then will be customizing this to my own specifications.

.