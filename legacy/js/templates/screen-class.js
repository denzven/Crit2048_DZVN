/**
 * UI TEMPLATE: SCREEN-CLASS
 *
 * Hero selection screen. Displays the grid of available character classes.
 * This code natively maps the component without fetching to safely bypass browser CORS restrictions.
 * WARNING: Do not edit the core HTML IDs, as the logic engine (ui.js) relies on them rigidly!
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["screen-class"] = `
    <div id="screen-class" class="hide w-full flex flex-col h-full relative z-10">
      <h2 class="text-3xl md:text-5xl font-black tracking-widest text-center mb-8 text-white uppercase shrink-0 fx-entrance-pop font-serif">Choose Your Hero</h2>
      <div id="class-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 overflow-y-auto pr-2 pb-8 custom-scrollbar"></div>
    </div>

`;
