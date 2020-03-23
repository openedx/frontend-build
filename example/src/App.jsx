import React from 'react';
import appleUrl, { ReactComponent as Apple } from './apple.svg';

export default function App() {
  const newEnglandApples = ['macintosh', 'granny smith'];
  const allApples = [...newEnglandApples, 'fuji', 'golden delicious'];
  return (
    <div>
      <h1>The Apples</h1>
      <ul>
        {allApples.map(apple => <li key={apple}>{apple}</li>)}
      </ul>
      <Apple style={{ width: '10rem' }} />
      <img src={appleUrl} alt="apple" style={{ width: '10rem' }} />
      <img src={appleUrl} alt="apple" style={{ width: '10rem' }} />
    </div>
  );
}
