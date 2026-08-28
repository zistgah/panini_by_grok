#!/usr/bin/env node
import { runSource } from "../runtime/interpreter.js";
let n = 0, fail = 0;
async function check(name, src, expect) {
  n++;
  try {
    const r = await runSource(src, name + ".pni");
    const v = r.result?.value ?? r.result;
    if (v !== expect) { fail++; console.log("FAIL", name, v); }
    else console.log("ok  ", name);
  } catch (e) { fail++; console.log("FAIL", name, e.message); }
}
await check("lambda", `
FUNCTION main()
    f = FUNCTION (x)
        RETURN x * 2
    END
    RETURN f(21)
END
`, 42);
await check("LAMBDA kw", `
FUNCTION main()
    f = LAMBDA (x)
        RETURN x + 1
    END
    RETURN f(41)
END
`, 42);
await check("class", `
CLASS Box
    FIELD n
    METHOD init(v)
        this.n = v
    END
    METHOD get()
        RETURN this.n
    END
END
FUNCTION main()
    b = NEW Box(7)
    RETURN b.n
END
`, 7);
await check("theme presets", `
MODULE PANINI.Theme
FUNCTION presets()
    RETURN {jazz: {label: "Jazz", primary: TRUE}}
END
FUNCTION main()
    RETURN presets().jazz.primary
END
END
`, true);
console.log(fail ? `FAILED ${fail}/${n}` : `PASSED ${n}/${n}`);
process.exit(fail ? 1 : 0);
