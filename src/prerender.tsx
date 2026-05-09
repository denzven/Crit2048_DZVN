import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.tsx';

export async function prerender() {
    try {
        const html = renderToString(
            <StrictMode>
                <App />
            </StrictMode>
        );
        return { html };
    } catch (e) {
        console.error("Prerender error:", e);
        return { html: '<div id="root"></div>' };
    }
}
