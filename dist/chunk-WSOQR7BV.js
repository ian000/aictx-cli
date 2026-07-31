import{intro as y,outro as j,spinner as S,select as v,text as C,multiselect as E,isCancel as I,cancel as D,confirm as T}from"@clack/prompts";import l from"picocolors";var H={intro:e=>y(l.bgCyan(l.black(" aictx "))+" "+l.bold(e)),outro:e=>j(l.green(e)),checkCancel:e=>(I(e)&&(D("\u64CD\u4F5C\u5DF2\u53D6\u6D88"),process.exit(0)),e),async askConfirm(e,t=!0){let r=await T({message:e,initialValue:t});return this.checkCancel(r)},async askText(e,t,r){let i=await C({message:e,placeholder:t,defaultValue:r});return this.checkCancel(i)},async askSelect(e,t){let r=await v({message:e,options:t});return this.checkCancel(r)},async askMultiSelect(e,t,r=!0,i){let o=await E({message:e,options:t,required:r,initialValues:i});return this.checkCancel(o)},createSpinner(){let e=S();return{start:t=>e.start(t),stop:t=>e.stop(t),message:t=>e.message(t)}}};import{execa as b}from"execa";async function Y(e,t){let r=process.argv[1];if(!r)throw new Error("\u65E0\u6CD5\u5B9A\u4F4D\u5F53\u524D aictx CLI \u5165\u53E3\uFF0C\u8BF7\u624B\u52A8\u6267\u884C\u5BF9\u5E94\u547D\u4EE4\u3002");await b(process.execPath,[r,...e],{cwd:t,stdio:"inherit"})}import n from"fs-extra";import s from"path";import{fileURLToPath as L}from"url";import c from"fs-extra";import u from"path";import{fileURLToPath as $}from"url";var p="<!-- aictx-codex-start -->",f="<!-- aictx-codex-end -->";function A(){let e=$(import.meta.url),t=u.dirname(e),r=t.endsWith("dist");return u.resolve(t,r?"templates":"../../templates")}function P(){return`${p}
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

- Before reading project, product, or architecture documents for a user request, run \`aictx route "<question>"\` and read the returned documents in order.
- If no route matches, read the relevant \`aictx-docs/**/00-Index.md\` first, then broaden search only when the index is insufficient.
- When you create or update project, product, or architecture documents, rebuild the routing table with:

- \`aictx index\`
${f}`}async function W(e){let t=u.join(e,"AGENTS.md"),r=P();if(!await c.pathExists(t)){await c.writeFile(t,`${r}
`,"utf-8");return}let i=await c.readFile(t,"utf-8");if(i.includes(p)&&i.includes(f)){let a=i.replace(new RegExp(`${p}[\\s\\S]*?${f}`,"g"),r);await c.writeFile(t,a,"utf-8");return}let o=i.endsWith(`
`)?`
`:`

`;await c.writeFile(t,`${i}${o}${r}
`,"utf-8")}async function F(e){let t=u.join(A(),".agents","skills"),r=u.join(e,".agents","skills");await c.pathExists(t)&&await c.copy(t,r,{overwrite:!1})}async function g(e){await c.ensureDir(u.join(e,".agents","workflows")),await W(e),await F(e)}var d=["codex","claude","cursor","windsurf","trae"],ce=["codex"],ue=[{value:"codex",label:"Codex",hint:"AGENTS.md + .agents/* [\u9ED8\u8BA4]"},{value:"claude",label:"Claude Code",hint:"CLAUDE.md + .claude/*"},{value:"cursor",label:"Cursor",hint:".cursor/rules/*"},{value:"windsurf",label:"Windsurf",hint:".windsurf/rules/*"},{value:"trae",label:"Trae",hint:".trae/rules/* + .trae/skills/*"}],R="<!-- aictx-claude-start -->",_="<!-- aictx-claude-end -->";function w(){let e=s.dirname(L(import.meta.url)),t=e.endsWith("dist");return s.resolve(e,t?"templates":"../../templates")}function le(e){if(typeof e!="string"||e.trim()==="")throw new Error(`--ide \u4E0D\u80FD\u4E3A\u7A7A\u3002\u53EF\u9009\u503C: ${d.join(", ")}`);let t=[...new Set(e.split(",").map(i=>i.trim().toLowerCase()).filter(Boolean))],r=t.filter(i=>!d.includes(i));if(r.length>0)throw new Error(`\u4E0D\u652F\u6301\u7684 AI \u5DE5\u5177: ${r.join(", ")}\u3002\u53EF\u9009\u503C: ${d.join(", ")}`);return t}async function de(e){let t=s.join(e,"aictx.json");if(await n.pathExists(t))try{let r=await n.readJson(t);if(!Array.isArray(r.ides)||r.ides.length===0)return;let i=r.ides.map(a=>String(a).toLowerCase()),o=i.filter(a=>!d.includes(a));if(o.length>0)throw new Error(`aictx.json \u5305\u542B\u4E0D\u652F\u6301\u7684 AI \u5DE5\u5177: ${o.join(", ")}`);return[...new Set(i)]}catch(r){throw new Error(`\u8BFB\u53D6\u73B0\u6709 aictx.json \u7684 ides \u5931\u8D25: ${r.message}`)}}async function U(e,t,r,i){let o=`${t}
${i}
${r}`;if(!await n.pathExists(e)){await n.writeFile(e,`${o}
`,"utf-8");return}let a=await n.readFile(e,"utf-8");if(a.includes(t)&&a.includes(r)){await n.writeFile(e,a.replace(new RegExp(`${t}[\\s\\S]*?${r}`,"g"),o),"utf-8");return}let k=a.endsWith(`
`)?`
`:`

`;await n.writeFile(e,`${a}${k}${o}
`,"utf-8")}async function h(e,t){let r=s.join(w(),e);await n.pathExists(r)&&await n.copy(r,t,{overwrite:!1})}async function G(e){await n.ensureDir(s.join(e,".claude","rules")),await h(s.join(".agents","skills"),s.join(e,".claude","skills")),await U(s.join(e,"CLAUDE.md"),R,_,'# aictx Claude Code Instructions\n\nThis repository uses aictx rules as its shared source of truth.\n\n- Read relevant `.claude/rules/aictx-*.md` files before business-sensitive changes.\n- Project skills are available under `.claude/skills`.\n- Before reading product, architecture, or project docs for a request, run `aictx route "<question>"` and read the returned documents in order.\n- If routing has no match, read the relevant `aictx-docs/**/00-Index.md` before broad search.\n- Run `aictx index` after changing product or architecture documents.')}async function N(e){await n.ensureDir(s.join(e,".cursor","rules")),await n.ensureDir(s.join(e,".cursor","commands"));let t=s.join(w(),".agents","skills","aictx-graphify","SKILL.md");if(await n.pathExists(t)){let r=await n.readFile(t,"utf-8");await n.writeFile(s.join(e,".cursor","commands","aictx-graphify.md"),r,"utf-8")}}async function q(e){await n.ensureDir(s.join(e,".windsurf","rules"))}async function O(e){await n.ensureDir(s.join(e,".trae","rules")),await h(s.join(".trae","skills"),s.join(e,".trae","skills"))}async function pe(e,t){for(let r of t)r==="codex"&&await g(e),r==="claude"&&await G(e),r==="cursor"&&await N(e),r==="windsurf"&&await q(e),r==="trae"&&await O(e)}import m from"fs-extra";import B from"os";import x from"path";import{execa as M}from"execa";async function z(e,t={}){return M("graphify-go",e,{cwd:t.cwd,preferLocal:!0,stdio:t.stdio??"inherit"})}async function J(e,t,r={}){return z(["-dir",e,"-out",t],r)}async function xe(e,t,r={}){let i=await m.mkdtemp(x.join(B.tmpdir(),"aictx-graphify-"));try{await J(e,i,{cwd:r.cwd,stdio:"pipe"});let o=t==="json"?"graph.json":"system-graph.md";return m.readFile(x.join(i,o),"utf-8")}finally{await m.remove(i)}}export{H as a,Y as b,g as c,d,ce as e,ue as f,le as g,de as h,pe as i,z as j,J as k,xe as l};
