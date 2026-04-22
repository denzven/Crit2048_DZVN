/**
 * UI TEMPLATE: SCREEN-CLASS
 *
 * Hero selection screen. Displays the grid of available character classes.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-class"] = `
    <div id="screen-class" class="hide w-full max-w-5xl relative z-10 flex flex-col h-full">
      <h2 class="text-2xl font-black tracking-widest text-center mb-6 text-white uppercase shrink-0">Choose Your Hero</h2>
      <div id="class-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 overflow-y-auto pr-2 pb-4"></div>
    </div>

`;
