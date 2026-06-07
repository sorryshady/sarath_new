// React's <ViewTransition> ships in the experimental build Next aliases in when
// experimental.viewTransition is enabled. Re-export it WITHOUT a 'use client'
// boundary: routing a React built-in through a client boundary turns the export
// into a client reference (a promise), which breaks server-component usage such
// as the site layout ("Element type is invalid. Received a promise that resolves
// to: ViewTransition"). A plain re-export resolves to the correct React build in
// both server and client components.
export { ViewTransition } from 'react';
