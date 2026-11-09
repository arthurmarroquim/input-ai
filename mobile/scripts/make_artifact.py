# Converte o build web (com baseUrl=/__ENSINA_BASE__) numa página de Artifact.
# Uso: EXPO_PUBLIC_DEMO=1 EXPO_BASE_URL=/__ENSINA_BASE__ npx expo export --platform web --output-dir <build>
#      python3 scripts/make_artifact.py <build> <saida>
import glob, os, re, sys, shutil
src, out = sys.argv[1], sys.argv[2]
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(src, out)
os.remove(os.path.join(out, "index.html"))
for f in ("metadata.json", "favicon.ico"):
    p = os.path.join(out, f)
    if os.path.exists(p): os.remove(p)
n = 0
for f in glob.glob(os.path.join(out, "_expo/static/js/web/*.js")):
    s = open(f).read()
    s2, k = re.subn(r'(?<!\\)"/__ENSINA_BASE__', '(globalThis.__EB__||"")+"', s)
    n += k
    open(f, "w").write(s2)
html = open(os.path.join(src, "index.html")).read()
styles = "\n".join(re.findall(r"<style[^>]*>.*?</style>", html, flags=re.S))
scripts = re.findall(r'<script src="/__ENSINA_BASE__/([^"]+)"[^>]*></script>', html)
body = re.search(r"<body[^>]*>(.*?)</body>", html, flags=re.S).group(1)
body = re.sub(r"<script[^>]*></script>", "", body)
boot = """<script>
// Descobre o endereço em que a página foi publicada e usa como caminho base do app.
(function () {
  var p = location.pathname;
  var b = p.replace(/\\/[^\\/]*$/, "");
  globalThis.__EB__ = b;
  try { if (p !== b + "/") history.replaceState(null, "", b + "/" + location.search + location.hash); } catch (e) {}
})();
</script>"""
page = f"""<title>ENSINA A.I</title>
{styles}
<style>html, body {{ background: #ffffff; color: #2C0533; }}</style>
{body.strip()}
{boot}
""" + "\n".join(f'<script src="{s}" defer></script>' for s in scripts) + "\n"
open(os.path.join(out, "ensina-ai.html"), "w").write(page)
print("substituições:", n, "scripts:", len(scripts), "arquivos:", sum(len(fs) for _, _, fs in os.walk(out)))

# --- nomes seguros para o serviço de Artifacts (sem "_" no início, sem [ ] +) ---
jsdir_old = os.path.join(out, "_expo/static/js/web")
jsdir_new = os.path.join(out, "app-js")
os.makedirs(jsdir_new, exist_ok=True)
renames = {}
for f in os.listdir(jsdir_old):
    safe = f.replace("[", "").replace("]", "").replace("+", "plus-")
    renames[f] = safe
    shutil.move(os.path.join(jsdir_old, f), os.path.join(jsdir_new, safe))
shutil.rmtree(os.path.join(out, "_expo"))
def fix(s):
    for old, new in renames.items():
        s = s.replace("/_expo/static/js/web/" + old, "/app-js/" + new)
        s = s.replace("_expo/static/js/web/" + old, "app-js/" + new)
    return s
for f in os.listdir(jsdir_new):
    p = os.path.join(jsdir_new, f)
    s = open(p).read(); open(p, "w").write(fix(s))
p = os.path.join(out, "ensina-ai.html")
s = open(p).read(); open(p, "w").write(fix(s))
left = sum(open(os.path.join(jsdir_new, f)).read().count("_expo/static/js/web/") for f in os.listdir(jsdir_new))
print("referências antigas restantes:", left)
