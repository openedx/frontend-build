import React from 'react';

export default function App() {
  const newEnglandApples = ['macintosh', 'granny smith'];
  const allApples = [...newEnglandApples, 'fuji', 'golden delicious'];
  return (
    <div>
      <h1>The Apples</h1>
      <ul>
        {allApples.map(apple => <li key={apple}>{apple}</li>)}
      </ul>
    </div>
  );
}
