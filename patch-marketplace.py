import re

with open('d:/Crit2048_scale/js/pack-marketplace.js', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('this.renderGrid();', 'await this.renderGrid();')
code = code.replace('renderGrid() {', 'async renderGrid() {')
code = code.replace('if (_currentTab === "browse") this.renderBrowseGrid();', 'if (_currentTab === "browse") await this.renderBrowseGrid();')
code = code.replace('else this.renderInstalledGrid();', 'else await this.renderInstalledGrid();')
code = code.replace('renderBrowseGrid() {', 'async renderBrowseGrid() {')
code = code.replace('renderInstalledGrid() {', 'async renderInstalledGrid() {')
code = code.replace('const installedPacks = PackEngine.getInstalledPacks();', 'const installedPacks = await PackEngine.getInstalledPacks();')
code = code.replace('const installed = PackEngine.getInstalledPacks();', 'const installed = await PackEngine.getInstalledPacks();')
code = code.replace('setTab(tabId) {', 'async setTab(tabId) {')

# Add openLocalFolder
open_folder_code = '''
    async openLocalFolder() {
      if (window.__TAURI__ && window.__TAURI__.core) {
        const dir = await window.PackStorage.getPacksDir();
        if (dir) {
          await window.__TAURI__.core.invoke('plugin:opener|open_path', { path: dir });
        }
      } else {
        alert('Local folders are only available in the desktop app. Web versions use browser storage.');
      }
    },
'''

code = code.replace('async refresh() {', open_folder_code + '\n    async refresh() {')

# Fix installPack
code = code.replace('const res = PackEngine.installPack(packJson);', 'const res = await PackEngine.installPack(packJson);')
# Fix uninstallPack
code = code.replace('uninstallPack(packId) {', 'async uninstallPack(packId) {')
code = code.replace('if (PackEngine.removePack(packId)) {', 'if (await PackEngine.removePack(packId)) {')

with open('d:/Crit2048_scale/js/pack-marketplace.js', 'w', encoding='utf-8') as f:
    f.write(code)
