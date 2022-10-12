import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Kards from './components/Kards'
import GetNFTs from './components/GetNFTs'
import { count } from 'console';

const App: React.FC = () => {
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const [userAddress, setUserAddress] = useState<string>('')
  const [tokenIds, setTokenIds] = useState< Map<number, [any]> >()
  const [names, setNames] = useState< Map<number, [any]> >()
  const [count, setCount] = useState<number>(0)
  const [bambooAmount, setBambooAmount] = useState<number>(0)

  const refreshState = () => {
    setUserAddress('')
    setTokenIds(undefined)
    setNames(undefined)
    setLoaded(false)
  };

  const p1 = {
    holderAddress: userAddress,
    loaded: loaded,
    setLoaded: setLoaded,
    tokenIds: tokenIds,
    setTokenIds: setTokenIds,
    names: names,
    setNames: setNames,
    setCount: setCount,
    setBambooAmount: setBambooAmount
  }

  return (
    <div className="App">
      <GetNFTs {...p1} />
      <header className="App-header">
        <h1>Hoge Pandas 🐼 - Web Manager</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <Kards
          bambooAmount={bambooAmount}
          count={count}
          loaded={loaded}
          tokenIds={tokenIds}
          names={names}
        />
      </header>
    </div>
  );
}

export default App;
