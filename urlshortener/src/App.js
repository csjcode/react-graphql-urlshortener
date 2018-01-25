import React, { Component } from 'react';
import LinkList from './components/LinkList';
import CreateShortLink from './components/CreateShortLink';
import './App.css';


class App extends Component {
    render() {
        return (
          <div className="App--link-content-container">
            <div className="App--link-content">
                <div className="App--link-create-link">
                    <h2>Create a short link</h2>
                    <CreateShortLink />
                </div>
                <div className="App--link-list-links">
                    <h2>All links</h2>
                    <LinkList />
                </div>

            </div>
          </div>
        );
    }
}

export default App;