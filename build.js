/* ============================================================
   Build step: inject content.json into index.html → _site/
   The source index.html stays readable (and works standalone with
   its default text). Editable elements carry data-cms="dot.path".
   Decap CMS edits content.json; Netlify rebuilds; text updates.
   A failed build is never published, so the live site can't break.
   ============================================================ */
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const OUT = "_site";
const content = JSON.parse(fs.readFileSync("content.json", "utf8"));

function get(obj, dotPath) {
  return dotPath.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

const html = fs.readFileSync("index.html", "utf8");
const $ = cheerio.load(html, { decodeEntities: false });

// innerHTML injection (supports <br>, entities, etc.)
$("[data-cms]").each((_, el) => {
  const val = get(content, $(el).attr("data-cms"));
  if (val != null) $(el).html(String(val));
});
// attribute injections for links/images
const attrMap = { "data-cms-href": "href", "data-cms-src": "src", "data-cms-alt": "alt" };
for (const [dataAttr, realAttr] of Object.entries(attrMap)) {
  $(`[${dataAttr}]`).each((_, el) => {
    const val = get(content, $(el).attr(dataAttr));
    if (val != null) $(el).attr(realAttr, String(val));
  });
}

// write output
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), $.html());
for (const dir of ["assets", "admin"]) {
  if (fs.existsSync(dir)) fs.cpSync(dir, path.join(OUT, dir), { recursive: true });
}
console.log("✓ Built " + OUT + " (content injected)");
