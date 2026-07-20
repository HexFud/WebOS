// Thin re-export of the React globals (loaded via the UMD <script> tags in
// index.html) so every other module can `import` them like normal named
// exports instead of reaching for `window.React` everywhere.
export const h = React.createElement;
export const { Fragment, useEffect, useReducer, useRef, useState } = React;
