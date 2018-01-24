# API.cc Url Shortener in React and GraphQL

* repo: react-graphql-urlshortener
URL shortener using React. Graphql, Node.js


## Outline

* Setup/install of initial libraries.
* Customizing the React component.


## 1 - Getting Started - Setup

1. Install Create React App glocally `npm install -g create-react-app`
2. Install Graphcool glocally `npm install -g graphcool`
3. `create-react-app urlshortener` 
4. `cd urlshortener && yarn start` to check initial setup works. Normal.
5. Change title of `public/index.html` to Url Shortener
6. `mkdir graphcool && cd graphcool`
7. `graphcool init` initializes the GraphQL project and creates config files (graphcool.yml for config, types.graphq for data model, src folder )
8. In types.graphql remove the User example type placeholder and add:
```
type Link @model {
    id: ID! @isUnique
    hash: String!
    url: String!
    description: String
}

```
Reference on Graphcool docs: https://www.graph.cool/docs/reference/database/data-modelling-eiroozae8u/

9. `graphcool deploy` - (1) choose a cluster, (2) prod, (3) your Servcie Name - here I will use "Shorty"
10. It will generate an API url, send you to a web page and you will have to login through Github, FB or another service.
11. Next, after being authenticated, you can go to the console interface.
12. Switch to the Project Shorty
13. Also note in the console you have Simple API, Relay API, Subscription API urls
14. These are the API endpoints we'll be using.
15. Install Apollo - `yarn add apollo-client-preset react-apollo graphql-tag graphql`
16. Modify `src/index.js` to include at the top of the page:
```
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory'
```
17. Create an ApolloClient instance (a) get your service id with `graphcool info` 
18. (b) Insert this js in `src/index.js`
```
const client = new ApolloClient({
    link: new HttpLink('https://api.graph.cool/simple/v1/[SERVICE_ID]'),
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

## 2 - Customizing the React Component









### notes:

I'm starting out following instructions as found on an article on Hacker Noon and then will be customizing this to my own specifications.

.