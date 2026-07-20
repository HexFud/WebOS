// Entry point: mounts <App/> wrapped in the error boundary onto #root.
import { h } from './lib/dom.js';
import { ErrorBoundary } from './components/error-boundary.js';
import { App } from './App.js';

ReactDOM.createRoot(document.getElementById('root')).render(h(ErrorBoundary, null, h(App)));
