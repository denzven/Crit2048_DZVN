import re

with open('d:/Crit2048_scale/js/pack-forge.js', 'r', encoding='utf-8') as f:
    code = f.read()

def replacer(match):
    list_name = match.group(1)
    return f'''      let html = '';
      const page = currentPages.{list_name} || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.{list_name}.length);

      for (let idx = startIdx; idx < endIdx; idx++) {{
        const item = currentPack.{list_name}[idx];'''

code = re.sub(r"let html = '';\s*currentPack\.([a-zA-Z]+)\.forEach\(\(item, idx\) => \{", replacer, code)

def replacer_end(match):
    # Try to find the nearest `renderX` above this match to determine the list name
    m_func = re.search(r'render([a-zA-Z]+)\(\)', code[:match.start()])
    if m_func:
        list_name = m_func.group(1).lower()
        if list_name == 'hazards': # Edge case for pluralization if needed
            list_name = 'hazards'
    else:
        list_name = 'enemies' # fallback
    
    return f'''      }}

      if (currentPack.{list_name}.length > ITEMS_PER_PAGE) {{
        const maxPages = Math.ceil(currentPack.{list_name}.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('${list_name}', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${{page <= 1 ? 'disabled' : ''}}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${{page}} of ${{maxPages}}</span>
            <button onclick="PackForge.changePage('${list_name}', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${{page >= maxPages ? 'disabled' : ''}}>Next</button>
          </div>
        `;
      }}
      container.innerHTML = html;'''

# Use positive lookbehind for the end of the loop body
code = re.sub(r"      \}\);\s*container\.innerHTML = html;", replacer_end, code)

with open('d:/Crit2048_scale/js/pack-forge.js', 'w', encoding='utf-8') as f:
    f.write(code)
