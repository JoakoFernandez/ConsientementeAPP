const fs = require("fs");
const path = require("path");

const dir = "/app/node_modules/expo-sqlite/build";

(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const fp = path.join(d, f);
    if (fs.statSync(fp).isDirectory()) {
      walk(fp);
    } else if (f.endsWith(".js")) {
      let content = fs.readFileSync(fp, "utf-8");
      const original = content;
      content = content.replace(
        /from\s+'\.\/([^']+)'/g,
        (m, p1) => (p1.endsWith(".js") ? m : "from './" + p1 + ".js'")
      );
      if (content !== original) {
        fs.writeFileSync(fp, content);
        console.log("patched", fp);
      }
    }
  }
})(dir);
