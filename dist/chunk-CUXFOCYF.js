import{intro as y,outro as S,spinner as j,select as C,text as E,multiselect as v,isCancel as D,cancel as I,confirm as T}from"@clack/prompts";import l from"picocolors";var H={intro:t=>y(l.bgCyan(l.black(" aictx "))+" "+l.bold(t)),outro:t=>S(l.green(t)),checkCancel:t=>(D(t)&&(I("\u64CD\u4F5C\u5DF2\u53D6\u6D88"),process.exit(0)),t),async askConfirm(t,e=!0){let r=await T({message:t,initialValue:e});return this.checkCancel(r)},async askText(t,e,r){let i=await E({message:t,placeholder:e,defaultValue:r});return this.checkCancel(i)},async askSelect(t,e){let r=await C({message:t,options:e});return this.checkCancel(r)},async askMultiSelect(t,e,r=!0,i){let o=await v({message:t,options:e,required:r,initialValues:i});return this.checkCancel(o)},createSpinner(){let t=j();return{start:e=>t.start(e),stop:e=>t.stop(e),message:e=>t.message(e)}}};import{execa as b}from"execa";async function Y(t,e){let r=process.argv[1];if(!r)throw new Error("\u65E0\u6CD5\u5B9A\u4F4D\u5F53\u524D aictx CLI \u5165\u53E3\uFF0C\u8BF7\u624B\u52A8\u6267\u884C\u5BF9\u5E94\u547D\u4EE4\u3002");await b(process.execPath,[r,...t],{cwd:e,stdio:"inherit"})}import s from"fs-extra";import n from"path";import{fileURLToPath as L}from"url";import c from"fs-extra";import u from"path";import{fileURLToPath as $}from"url";var p="<!-- aictx-codex-start -->",f="<!-- aictx-codex-end -->";function A(){let t=$(import.meta.url),e=u.dirname(t),r=e.endsWith("dist");return u.resolve(e,r?"templates":"../../templates")}function P(){return`${p}
# aictx Codex Instructions

This repository uses aictx workflows as the shared source of truth for Codex.

Before doing business-sensitive work in this project, read:

- \`.agents/workflows/common-global.md\` (if present)
- relevant \`.agents/workflows/aictx-*.md\` workflow files
- relevant \`.agents/workflows/project-*.md\` workflow files

## Skills

Codex should use local project skills from:

- \`.agents/skills\`

If the requested skill exists in both \`.agents/skills\` and another IDE-specific directory, prefer \`.agents/skills\`.

## Documents

When you create or update project, product, or architecture documents, rebuild the routing table with:

- \`aictx index\`
${f}`}async function W(t){let e=u.join(t,"AGENTS.md"),r=P();if(!await c.pathExists(e)){await c.writeFile(e,`${r}
`,"utf-8");return}let i=await c.readFile(e,"utf-8");if(i.includes(p)&&i.includes(f)){let a=i.replace(new RegExp(`${p}[\\s\\S]*?${f}`,"g"),r);await c.writeFile(e,a,"utf-8");return}let o=i.endsWith(`
`)?`
`:`

`;await c.writeFile(e,`${i}${o}${r}
`,"utf-8")}async function F(t){let e=u.join(A(),".agents","skills"),r=u.join(t,".agents","skills");await c.pathExists(e)&&await c.copy(e,r,{overwrite:!1})}async function m(t){await c.ensureDir(u.join(t,".agents","workflows")),await W(t),await F(t)}var d=["codex","claude","cursor","windsurf","trae"],ct=["codex"],ut=[{value:"codex",label:"Codex",hint:"AGENTS.md + .agents/* [\u9ED8\u8BA4]"},{value:"claude",label:"Claude Code",hint:"CLAUDE.md + .claude/*"},{value:"cursor",label:"Cursor",hint:".cursor/rules/*"},{value:"windsurf",label:"Windsurf",hint:".windsurf/rules/*"},{value:"trae",label:"Trae",hint:".trae/rules/* + .trae/skills/*"}],R="<!-- aictx-claude-start -->",_="<!-- aictx-claude-end -->";function w(){let t=n.dirname(L(import.meta.url)),e=t.endsWith("dist");return n.resolve(t,e?"templates":"../../templates")}function lt(t){if(typeof t!="string"||t.trim()==="")throw new Error(`--ide \u4E0D\u80FD\u4E3A\u7A7A\u3002\u53EF\u9009\u503C: ${d.join(", ")}`);let e=[...new Set(t.split(",").map(i=>i.trim().toLowerCase()).filter(Boolean))],r=e.filter(i=>!d.includes(i));if(r.length>0)throw new Error(`\u4E0D\u652F\u6301\u7684 AI \u5DE5\u5177: ${r.join(", ")}\u3002\u53EF\u9009\u503C: ${d.join(", ")}`);return e}async function dt(t){let e=n.join(t,"aictx.json");if(await s.pathExists(e))try{let r=await s.readJson(e);if(!Array.isArray(r.ides)||r.ides.length===0)return;let i=r.ides.map(a=>String(a).toLowerCase()),o=i.filter(a=>!d.includes(a));if(o.length>0)throw new Error(`aictx.json \u5305\u542B\u4E0D\u652F\u6301\u7684 AI \u5DE5\u5177: ${o.join(", ")}`);return[...new Set(i)]}catch(r){throw new Error(`\u8BFB\u53D6\u73B0\u6709 aictx.json \u7684 ides \u5931\u8D25: ${r.message}`)}}async function U(t,e,r,i){let o=`${e}
${i}
${r}`;if(!await s.pathExists(t)){await s.writeFile(t,`${o}
`,"utf-8");return}let a=await s.readFile(t,"utf-8");if(a.includes(e)&&a.includes(r)){await s.writeFile(t,a.replace(new RegExp(`${e}[\\s\\S]*?${r}`,"g"),o),"utf-8");return}let k=a.endsWith(`
`)?`
`:`

`;await s.writeFile(t,`${a}${k}${o}
`,"utf-8")}async function h(t,e){let r=n.join(w(),t);await s.pathExists(r)&&await s.copy(r,e,{overwrite:!1})}async function G(t){await s.ensureDir(n.join(t,".claude","rules")),await h(n.join(".agents","skills"),n.join(t,".claude","skills")),await U(n.join(t,"CLAUDE.md"),R,_,"# aictx Claude Code Instructions\n\nThis repository uses aictx rules as its shared source of truth.\n\n- Read relevant `.claude/rules/aictx-*.md` files before business-sensitive changes.\n- Project skills are available under `.claude/skills`.\n- Run `aictx index` after changing product or architecture documents.")}async function N(t){await s.ensureDir(n.join(t,".cursor","rules")),await s.ensureDir(n.join(t,".cursor","commands"));let e=n.join(w(),".agents","skills","aictx-graphify","SKILL.md");if(await s.pathExists(e)){let r=await s.readFile(e,"utf-8");await s.writeFile(n.join(t,".cursor","commands","aictx-graphify.md"),r,"utf-8")}}async function O(t){await s.ensureDir(n.join(t,".windsurf","rules"))}async function B(t){await s.ensureDir(n.join(t,".trae","rules")),await h(n.join(".trae","skills"),n.join(t,".trae","skills"))}async function pt(t,e){for(let r of e)r==="codex"&&await m(t),r==="claude"&&await G(t),r==="cursor"&&await N(t),r==="windsurf"&&await O(t),r==="trae"&&await B(t)}import g from"fs-extra";import M from"os";import x from"path";import{execa as q}from"execa";async function z(t,e={}){return q("graphify-go",t,{cwd:e.cwd,preferLocal:!0,stdio:e.stdio??"inherit"})}async function J(t,e,r={}){return z(["-dir",t,"-out",e],r)}async function xt(t,e,r={}){let i=await g.mkdtemp(x.join(M.tmpdir(),"aictx-graphify-"));try{await J(t,i,{cwd:r.cwd,stdio:"pipe"});let o=e==="json"?"graph.json":"system-graph.md";return g.readFile(x.join(i,o),"utf-8")}finally{await g.remove(i)}}export{H as a,Y as b,m as c,d,ct as e,ut as f,lt as g,dt as h,pt as i,z as j,J as k,xt as l};
