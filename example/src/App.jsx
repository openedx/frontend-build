import React from 'react';

import appleUrl, { ReactComponent as Apple } from './apple.svg';
import appleImg from './apple.jpg';

import './style.scss';

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
      <br />
      <img src={appleImg} alt="apple" style={{ width: '10rem' }} />
      <p>Photo by Louis Hansel @shotsoflouis on Unsplash</p>
      <p>Test variable: {process.env.TEST_VARIABLE}</p>
      <p>Non-existent variable: {process.env.I_AM_NOT_HERE}</p>
      <p className="text-align-right">I&apos;m aligned right, but left in RTL.</p>
    </div>
  );
}
