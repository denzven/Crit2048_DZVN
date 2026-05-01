with open('d:/Crit2048_scale/js/pack-forge.js', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("PackForge.changePage('$enemies'", "PackForge.changePage('enemies'")
code = code.replace("PackForge.changePage('$classes'", "PackForge.changePage('classes'")
code = code.replace("PackForge.changePage('$weapons'", "PackForge.changePage('weapons'")
code = code.replace("PackForge.changePage('$hazards'", "PackForge.changePage('hazards'")
code = code.replace("PackForge.changePage('$artifacts'", "PackForge.changePage('artifacts'")

with open('d:/Crit2048_scale/js/pack-forge.js', 'w', encoding='utf-8') as f:
    f.write(code)
