import{intro as g,outro as d,spinner as m,select as w,text as h,multiselect as x,isCancel as k,cancel as y,confirm as C}from"@clack/prompts";import a from"picocolors";var _={intro:t=>g(a.bgCyan(a.black(" aictx "))+" "+a.bold(t)),outro:t=>d(a.green(t)),checkCancel:t=>(k(t)&&(y("\u64CD\u4F5C\u5DF2\u53D6\u6D88"),process.exit(0)),t),async askConfirm(t,e=!0){let r=await C({message:t,initialValue:e});return this.checkCancel(r)},async askText(t,e,r){let i=await h({message:t,placeholder:e,defaultValue:r});return this.checkCancel(i)},async askSelect(t,e){let r=await w({message:t,options:e});return this.checkCancel(r)},async askMultiSelect(t,e,r=!0,i){let o=await x({message:t,options:e,required:r,initialValues:i});return this.checkCancel(o)},createSpinner(){let t=m();return{start:e=>t.start(e),stop:e=>t.stop(e),message:e=>t.message(e)}}};import s from"fs-extra";import n from"path";import{fileURLToPath as T}from"url";var c="<!-- aictx-codex-start -->",l="<!-- aictx-codex-end -->";function j(){let t=T(import.meta.url),e=n.dirname(t),r=e.endsWith("dist");return n.resolve(e,r?"templates":"../../templates")}function b(){return`${c}
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
${l}`}async function S(t){let e=n.join(t,"AGENTS.md"),r=b();if(!await s.pathExists(e)){await s.writeFile(e,`${r}
`,"utf-8");return}let i=await s.readFile(e,"utf-8");if(i.includes(c)&&i.includes(l)){let f=i.replace(new RegExp(`${c}[\\s\\S]*?${l}`,"g"),r);await s.writeFile(e,f,"utf-8");return}let o=i.endsWith(`
`)?`
`:`

`;await s.writeFile(e,`${i}${o}${r}
`,"utf-8")}async function v(t){let e=n.join(j(),".agents","skills"),r=n.join(t,".agents","skills");await s.pathExists(e)&&await s.copy(e,r,{overwrite:!1})}async function L(t){await s.ensureDir(n.join(t,".agents","workflows")),await S(t),await v(t)}import{execa as E}from"execa";async function z(t,e){let r=process.argv[1];if(!r)throw new Error("\u65E0\u6CD5\u5B9A\u4F4D\u5F53\u524D aictx CLI \u5165\u53E3\uFF0C\u8BF7\u624B\u52A8\u6267\u884C\u5BF9\u5E94\u547D\u4EE4\u3002");await E(process.execPath,[r,...t],{cwd:e,stdio:"inherit"})}import p from"fs-extra";import A from"os";import u from"path";import{execa as D}from"execa";async function $(t,e={}){return D("graphify-go",t,{cwd:e.cwd,preferLocal:!0,stdio:e.stdio??"inherit"})}async function F(t,e,r={}){return $(["-dir",t,"-out",e],r)}async function K(t,e,r={}){let i=await p.mkdtemp(u.join(A.tmpdir(),"aictx-graphify-"));try{await F(t,i,{cwd:r.cwd,stdio:"pipe"});let o=e==="json"?"graph.json":"system-graph.md";return p.readFile(u.join(i,o),"utf-8")}finally{await p.remove(i)}}export{_ as a,L as b,z as c,$ as d,F as e,K as f};
