// A minimal React error boundary so a render crash shows a message instead of a blank page.
import { h } from '../lib/dom.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return h('div', {
        style: {
          padding: '24px',
          color: 'white',
          background: '#09111f',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }
      }, `WebOS render error:\n${this.state.error.message || String(this.state.error)}`);
    }

    return this.props.children;
  }
}
