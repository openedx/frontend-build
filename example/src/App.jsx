import config from 'env.config';
import appleUrl, { ReactComponent as Apple } from './apple.svg';
import appleImg from './apple.jpg';

import './style.scss';
import ParagonPreview from './ParagonPreview';

// eslint-disable-next-line react/function-component-definition
export default function App() {
  const newEnglandApples = ['macintosh', 'granny smith'];
  const allApples = [...newEnglandApples, 'fuji', 'golden delicious'];
  return (
    <div>
      <h1>Test page</h1>
      <h2>SCSS parsing tests</h2>
      <h3>The Apples</h3> (&quot;The Apples&quot; should be red)
      <h2>ES6 parsing tests</h2>
      <ul>
        {allApples.map(apple => <li key={apple}>{apple}</li>)}
      </ul>
      <h2>JSX parsing tests</h2>
      <Apple style={{ width: '10rem' }} />
      <h2>Asset import tests</h2>
      <img src={appleUrl} alt="apple" style={{ width: '10rem' }} />
      <img src={appleUrl} alt="apple" style={{ width: '10rem' }} />
      <br />
      <img src={appleImg} alt="apple" style={{ width: '10rem' }} />
      <p>Photo by Louis Hansel @shotsoflouis on Unsplash</p>
      <h2>process.env tests</h2>
      <p>Test process.env variable: {process.env.TEST_VARIABLE}</p>
      <p>Non-existent process.env variable (nothing here is good): {process.env.I_AM_NOT_HERE}</p>
      <h2>env.config.js tests</h2>
      <p><span>env.config.js boolean test: </span>
        {config.FALSE_VALUE === false ? config.CORRECT_BOOL_VALUE : config.INCORRECT_BOOL_VALUE}
      </p>
      <p>env.config.js integer test: {Number.isInteger(config.INTEGER_VALUE) ? 'It was an integer. Great.' : 'It was not an integer! Why not? '}</p>
      <h2>Right-to-left language handling tests</h2>
      <p className="text-align-right">I&apos;m aligned right, but left in RTL.</p>
      <ParagonPreview />
    </div>
  );
}
