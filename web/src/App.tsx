import React, { Component } from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import './App.css';

import  { TopBar } from './components/TopBar';
import  { Home } from './components/home/Home';
import  { ChatSearch } from './components/search/ChatSearch';
import  { History } from './components/history/History';
import  { About } from './components/about/About';
import { Video } from './components/video/Video';
import { ErrorMessage } from './components/common/ErrorMessage';
import { Other } from './components/other/Other';
import { CommonBody } from './components/common/CommonBody';

class App extends Component {
  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <div>
            <Route path="/" component={TopBar}/>
            <div className="content-container">
              <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/video/:id" component={Video}/>
                <Route path="/search" component={ChatSearch}/>
                <Route path="/history" component={History}/>
                <Route path="/other" component={Other}/>
                <Route path="/about" component={About}/>

                <Route path="/" render={() => {
                  return <CommonBody>
                    <ErrorMessage message="ごめんなさい、ページが見つかりませんでした。"/>
                  </CommonBody>;
                }}/>
              </Switch>
            </div>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
