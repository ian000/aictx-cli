import{a as n,b as G,c as I,e as D}from"./chunk-IVCSUZDK.js";import{consola as d}from"consola";import e from"fs-extra";import t from"path";import s from"picocolors";import{globby as N}from"globby";import{fileURLToPath as E}from"url";var P=class{options;constructor(i){this.options=i}async run(){n.intro("\u{1F680} \u5F00\u59CB\u5B58\u91CF\u9879\u76EE\u9006\u5411\u5DE5\u7A0B (Brownfield Onboarding)");let i=n.createSpinner();i.start("\u9636\u6BB5 1/4: \u6B63\u5728\u8FDB\u884C\u9759\u6001\u7ED3\u6784\u63A2\u6D4B (Static Sniffing)...");let a=await this.sniffStaticInfo();i.stop(`\u63A2\u6D4B\u5B8C\u6210: \u53D1\u73B0 ${s.cyan(a.dependencies.length)} \u4E2A\u6838\u5FC3\u4F9D\u8D56, ${s.cyan(a.fileCount)} \u4E2A\u4E1A\u52A1\u6587\u4EF6`);let r=!0;if(this.options.yes||(r=await n.askConfirm("\u662F\u5426\u7ACB\u5373\u542F\u52A8\u57FA\u4E8E Graphify \u7684\u5168\u91CF\u4EE3\u7801\u9006\u5411\u63A5\u7BA1 (Zero Token, Zero Model)?")),!r){n.outro("\u5DF2\u53D6\u6D88\u63A5\u7BA1\u3002\u60A8\u968F\u65F6\u53EF\u4EE5\u518D\u6B21\u8FD0\u884C aictx init\u3002");return}d.info("\u51C6\u5907\u542F\u52A8\u57FA\u4E8E AST \u62D3\u6251\u56FE\u8C31\u7684\u89E3\u6790\u6D41\u7A0B..."),await this.executeASTExtraction(a)}async executeASTExtraction(i){let a=n.createSpinner();d.info(`
${s.bgBlue(" AST EXTRACTION PHASE ")} \u5F00\u59CB\u8C03\u7528 Graphify \u8FDB\u884C\u5168\u9879\u76EE AST \u89E3\u6790...`);let r=n.createSpinner();r.start("\u6B63\u5728\u751F\u6210 Call Graph \u4E0E\u5B9E\u4F53\u62D3\u6251\u56FE (Zero LLM/Zero VRAM)...");let u=Date.now();try{d.start("\u6B63\u5728\u542F\u52A8 Graphify-Go \u7EAF\u672C\u5730\u5F15\u64CE\u8FDB\u884C\u4EE3\u7801\u9006\u5411..."),await D(this.options.cwd,t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out"),{cwd:this.options.cwd,stdio:"inherit"}),d.success("Graphify-Go \u9006\u5411\u5206\u6790\u5B8C\u6210\uFF01")}catch(o){r.stop("\u63D0\u53D6\u5931\u8D25"),d.error("Graphify AST \u56FE\u8C31\u751F\u6210\u5931\u8D25",o.message);return}let p=t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out/graph.json"),h=t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out/system-graph.md");if(!e.existsSync(p)||!e.existsSync(h)){r.stop("\u6587\u4EF6\u672A\u751F\u6210"),d.error(`\u672A\u80FD\u627E\u5230\u751F\u6210\u7684\u77E5\u8BC6\u56FE\u8C31\u6216\u5BA1\u67E5\u62A5\u544A\uFF1A${p}`);return}let m=await e.readJson(p),f=m.nodes?.length||0,x=m.links?.length||0;r.stop(`AST \u56FE\u8C31\u751F\u6210\u5B8C\u6BD5\uFF01(\u8017\u65F6 ${((Date.now()-u)/1e3).toFixed(1)}s, \u8282\u70B9: ${f}, \u8FB9: ${x})`),d.info(`
${s.bgGreen(" TRANSFORM PHASE ")} \u6B63\u5728\u5C06\u56FE\u8C31\u8F6C\u6362\u4E3A aictx \u89C4\u8303\u6587\u6863...`);let c=n.createSpinner();c.start("\u6B63\u5728\u751F\u6210\u4E1A\u52A1\u67B6\u6784\u7EA2\u7EBF\u6587\u6863...");let j=await e.readFile(h,"utf-8"),k=m.nodes?.filter(o=>o.degree>3||o.type==="class").slice(0,10).map(o=>o.label||o.id)||[],R=`---
tags:
  - aictx
  - architecture
  - generated
aliases:
  - [\u7CFB\u7EDF\u67B6\u6784\u56FE\u8C31, System Graph]
entities:
  - [${k.join(", ")}]
roles:
  - [AI Assistant]
---
# \u7CFB\u7EDF\u67B6\u6784\u62D3\u6251\u5BA1\u67E5 (System Architecture Report)

> **Context as Code \u81EA\u52A8\u751F\u6210**: \u672C\u6587\u6863\u7531 \`aictx onboard\` \u5E95\u5C42\u8C03\u7528 \`graphify-go\` \u7EAF\u672C\u5730 AST \u5F15\u64CE\u751F\u6210\uFF0C**\u5168\u7A0B\u672A\u7ECF\u8FC7\u4EFB\u4F55 LLM \u5E7B\u89C9\u5904\u7406**\uFF0C\u4EE3\u8868\u4E86\u4EE3\u7801\u5E93\u6700\u771F\u5B9E\u3001\u6700\u51C6\u786E\u7684\u7269\u7406\u4F9D\u8D56\u5173\u7CFB (Single Source of Truth)\u3002

## \u6838\u5FC3\u4E1A\u52A1\u8282\u70B9 (God Nodes)
\u7CFB\u7EDF\u8FD0\u884C\u7684\u6838\u5FC3\u4E2D\u67A2\uFF0C\u8FD9\u4E9B\u7EC4\u4EF6\u88AB\u5927\u91CF\u5176\u4ED6\u6A21\u5757\u8C03\u7528\uFF0C\u4FEE\u6539\u65F6\u5FC5\u987B\u6781\u5176\u8C28\u614E\u3002
${k.map(o=>`- **${o}**`).join(`
`)}

## \u62D3\u6251\u7ED3\u6784\u5206\u6790\u62A5\u544A (Topology Analysis)
${j}

## \u7EA6\u675F\u5EFA\u8BAE (AI Instructions)
1. \u5728\u4FEE\u6539\u4EFB\u4F55\u6D89\u53CA\u4E0A\u8FF0 \`God Nodes\` \u7684\u4EE3\u7801\u524D\uFF0C\u5FC5\u987B\u4F18\u5148\u67E5\u8BE2\u8C03\u7528\u94FE\u8DEF\u3002
2. \u672C\u9879\u76EE\u7684\u57FA\u7840\u67B6\u6784\u5F3A\u4F9D\u8D56\u4E8E\u4E0A\u8FF0\u5206\u6790\u62A5\u544A\u4E2D\u7684 Community \u805A\u7C7B\u5173\u7CFB\uFF0C\u7981\u6B62\u8DE8\u793E\u533A\u53D1\u751F\u5FAA\u73AF\u4F9D\u8D56\u3002
`;await e.ensureDir(t.resolve(this.options.cwd,"aictx-docs/architecture")),await e.writeFile(t.resolve(this.options.cwd,"aictx-docs/architecture/system-graph.md"),R);let l=this.getDefaultIdes();c.message(`\u6B63\u5728\u4E3A ${l.join(", ")} \u5B89\u88C5\u5185\u7F6E\u6280\u80FD (Skills)...`);let $=E(import.meta.url),w=t.dirname($),O=w.endsWith("dist"),g=t.resolve(w,O?"templates/.trae/skills":"../../templates/.trae/skills"),L=t.resolve(this.options.cwd,".trae/skills");e.existsSync(g)&&l.includes("trae")?await e.copy(g,L,{overwrite:!1}):e.existsSync(g)||d.warn(`\u672A\u627E\u5230\u6A21\u677F\u76EE\u5F55: ${g} (__dirnamePath: ${w})`),l.includes("codex")&&await G(this.options.cwd);let C=t.resolve(this.options.cwd,".trae/skills/aictx-graphify");await e.ensureDir(C);let A=`---
name: "aictx-graphify"
description: "Inspect the local Graphify AST knowledge graph artifacts. Invoke when the user asks about project architecture, dependencies, codebase structure, code connections, or module relationships."
---

# Graphify Knowledge Graph Assistant

This project has been onboarded with \`aictx\` and has a local AST knowledge graph generated by \`graphify-go\` at \`aictx-docs/architecture/graphify-out/graph.json\`.

## When to Use This Skill
- When you need to understand the relationships between different modules, classes, or functions.
- When answering architecture or codebase questions.
- To find "God Nodes" (highly connected components) or "Surprising Connections".

## How to Use
Use the \`aictx graph\` CLI tool via the \`RunCommand\` tool:

1. **Rebuild the Graph Artifacts:**
   \`\`\`bash
   aictx graph analyze --dir . --out aictx-docs/architecture/graphify-out
   \`\`\`

2. **Print a Fresh Markdown Summary to stdout:**
   \`\`\`bash
   aictx graph print --dir . --format markdown
   \`\`\`

3. **Print the Raw JSON Graph to stdout:**
   \`\`\`bash
   aictx graph print --dir . --format json
   \`\`\`

4. **Read the Report:**
   Read \`aictx-docs/architecture/system-graph.md\` or \`aictx-docs/architecture/graphify-out/system-graph.md\` for god nodes and community structure before searching raw files.

5. **Inspect Specific Symbols:**
   Search for symbol names inside \`aictx-docs/architecture/graphify-out/graph.json\` before broad raw-file search.
`;if(l.includes("trae")&&await e.writeFile(t.resolve(C,"SKILL.md"),A),l.includes("codex")){let o=t.resolve(this.options.cwd,".agents/skills/aictx-graphify");await e.ensureDir(o),await e.writeFile(t.resolve(o,"SKILL.md"),A)}c.stop("\u77E5\u8BC6\u5E93\u4E0E IDE Skill \u8F6C\u6362\u751F\u6210\u5B8C\u6BD5\uFF01");let v=t.resolve(this.options.cwd,"aictx.json");if(!e.existsSync(v)){let o=t.basename(this.options.cwd),M={$schema:"https://unpkg.com/aictx/schema.json",version:"1.0",repository:"",ides:l,tags:["backend","frontend","common",o],overrides:{}};await e.writeJson(v,M,{spaces:2})}c.start("\u6B63\u5728\u81EA\u52A8\u89E6\u53D1 aictx sync \u62C9\u53D6\u5E76\u91CA\u653E\u89C4\u5219...");try{await I(["sync"],this.options.cwd),c.stop("\u81EA\u52A8 aictx sync \u89C4\u5219\u4E0B\u53D1\u5B8C\u6210\uFF01")}catch(o){c.stop("\u81EA\u52A8 aictx sync \u89E6\u53D1\u5931\u8D25"),console.error(s.red(`\u81EA\u52A8 aictx sync \u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u6267\u884C \`aictx sync\`: ${o.message}`))}console.log(`
======================================================================`),console.log("\u{1F389} \u57FA\u4E8E\u7EAF\u672C\u5730 AST \u56FE\u8C31\u7684\u9006\u5411\u5DE5\u7A0B (Onboarding) \u6210\u529F\u5B8C\u6210\uFF01"),console.log(`\u2705 ${s.cyan("aictx-docs/architecture/system-graph.md")}`),l.includes("trae")&&console.log(`\u2705 ${s.cyan(".trae/skills/aictx-graphify/SKILL.md")} (\u5DF2\u4E3A IDE \u81EA\u52A8\u6302\u8F7D Graphify \u6280\u80FD)`),l.includes("codex")&&(console.log(`\u2705 ${s.cyan(".agents/skills/aictx-graphify/SKILL.md")} (\u5DF2\u4E3A Codex \u81EA\u52A8\u6302\u8F7D Graphify \u6280\u80FD)`),console.log(`\u2705 ${s.cyan("AGENTS.md")} (\u5DF2\u4E3A Codex \u81EA\u52A8\u751F\u6210\u9879\u76EE\u5165\u53E3\u6307\u4EE4)`)),console.log("\u5168\u7A0B\u96F6 Token \u6D88\u8017\u3001\u96F6\u4E91\u7AEF API \u8C03\u7528\u3001\u7EDD\u5BF9\u4FDD\u62A4\u4EE3\u7801\u9690\u79C1\uFF01"),console.log(`
\u{1F4A1} `+s.yellow("\u4E3A\u4EC0\u4E48\u8FD9\u6837\u505A\u80FD\u7701\u4E0B 90% \u7684 Token \u4E0E\u5927\u6A21\u578B API \u8D39\u7528\uFF1F")),console.log(s.gray("\u5982\u679C\u4F60\u76F4\u63A5\u8BA9 AI \u53BB\u9605\u8BFB\u8FD9\u4E2A\u62E5\u6709\u6210\u767E\u4E0A\u5343\u4E2A\u6587\u4EF6\u7684\u8001\u9879\u76EE\uFF0C\u4E0D\u4EC5\u4F1A\u7ACB\u523B\u89E6\u53D1\u5927\u6A21\u578B\u4E0A\u4E0B\u6587\u7206\u70B8\uFF08Context Bloat\uFF09\u5BFC\u81F4\u4E25\u91CD\u5E7B\u89C9\uFF0C\u8FD8\u4F1A\u4E00\u6B21\u6027\u6D88\u8017\u6389\u51E0\u5341\u4E07 Tokens\u3002")),console.log(s.gray("\u73B0\u5728\uFF0Caictx onboard \u5DF2\u7ECF\u4F7F\u7528\u7EAF\u672C\u5730\u7684\u5F15\u64CE\u5C06\u5341\u51E0\u4E07\u884C\u7684\u7269\u7406\u4EE3\u7801\u9AD8\u5EA6\u538B\u7F29\u6210\u4E86\u4E00\u4EFD\u5343\u5B57\u5DE6\u53F3\u7684\u67B6\u6784\u56FE\u8C31\uFF08system-graph.md\uFF09\u3002\u5927\u6A21\u578B\u53EA\u9700\u8981\u9605\u8BFB\u8FD9\u4EFD\u9AD8\u6D53\u5EA6\u201C\u6458\u8981\u201D\uFF0C\u5C31\u80FD\u7CBE\u51C6\u63A8\u6F14\u51FA\u6574\u4E2A\u9879\u76EE\u7684\u67B6\u6784\u4E0E\u4E1A\u52A1\u3002"));let T=!0,S=t.basename(this.options.cwd),b=t.resolve(this.options.cwd,".aictx-sync-status.json");if(e.existsSync(b))try{let o=await e.readJson(b);T=o.hasDomainRules,S=o.projectName||S,await e.remove(b)}catch{}console.log(`
======================================================================`),console.log("\u{1F680} \u3010\u4E0B\u4E00\u6B65\u884C\u52A8\u3011\u8BF7\u590D\u5236\u4EE5\u4E0B\u63D0\u793A\u8BCD\uFF0C\u4EA4\u7ED9\u4F60\u7684 AI \u52A9\u624B (\u5982 Trae/Cursor/Codex)\uFF1A"),console.log(`======================================================================
`);let y="";y+=s.cyan("\u{1F4A1} \u6838\u5FC3\u6307\u4EE4\uFF1A\u8BF7\u4ED4\u7EC6\u9605\u8BFB `aictx-docs/architecture/system-graph.md` \u4E2D\u7684 AST \u67B6\u6784\u56FE\u8C31 (\u7531\u4E8E\u662F\u7269\u7406\u538B\u7F29\u6458\u8981\uFF0C\u9605\u8BFB\u5B83\u4EC5\u6D88\u8017\u6781\u5C11\u91CF\u7684 Token)\u3002\n\u57FA\u4E8E\u5176\u4E2D\u7684 God Nodes (\u6838\u5FC3\u8282\u70B9) \u4E0E\u805A\u7C7B\u7ED3\u6784\uFF0C\u6267\u884C\u4EE5\u4E0B\u52A8\u4F5C\uFF1A\n\n1. \u5E2E\u6211\u53CD\u63A8\u8FD9\u4E2A\u9879\u76EE\u7684\u5546\u4E1A\u903B\u8F91\u4E0E\u4EA7\u54C1\u5B9A\u4F4D\uFF0C\u5728 `aictx-docs/product/` \u4E0B\u751F\u6210\u4E00\u4EFD\u8BE6\u5B9E\u7684 PRD \u6587\u6863\u3002\n2. \u5E2E\u6211\u68B3\u7406\u76EE\u524D\u7684\u771F\u5B9E\u6280\u672F\u6808\u73B0\u72B6\u3001\u6A21\u5757\u4F9D\u8D56\u5173\u7CFB\u4EE5\u53CA\u53EF\u80FD\u7684\u6280\u672F\u503A\uFF0C\u5728 `aictx-docs/architecture/` \u4E0B\u751F\u6210\u4E00\u4EFD\u5F53\u524D\u7CFB\u7EDF\u67B6\u6784\u7EAA\u5B9E\u6587\u6863\u3002\u6CE8\u610F\uFF1A\u5FC5\u987B\u771F\u5B9E\u53CD\u6620\u73B0\u72B6\uFF0C\u4E25\u7981\u968F\u610F\u865A\u6784\u91CD\u6784\u65B9\u6848\u3002"),T||(y+=s.yellow(`

3. \u26A0\uFE0F \u4E1A\u52A1\u7EA2\u7EBF\u521D\u59CB\u5316\uFF1A\u6211\u4EEC\u53D1\u73B0\u4F60\u8FD8\u6CA1\u6709\u5F53\u524D\u9879\u76EE\u7684\u4E13\u5C5E\u4E1A\u52A1\u7EA2\u7EBF\u3002\u8BF7\u6839\u636E\u4E0A\u8FF0\u7B2C1\u30012\u6B65\u4E2D\u53CD\u63A8\u51FA\u7684\u771F\u5B9E\u9879\u76EE\u4FE1\u606F\uFF0C\u8C03\u7528\u5185\u7F6E\u7684 \`aictx-biz-scaffolder\` \u6280\u80FD\uFF0C\u4E3A\u6211\u751F\u6210 \`${S}\` \u9879\u76EE\u7684\u4E1A\u52A1\u89C4\u5219\u811A\u624B\u67B6\u3002\u6CE8\u610F\uFF1A\u5FC5\u987B\u4E25\u683C\u57FA\u4E8E\u672C\u9879\u76EE\u7684\u771F\u5B9E\u7269\u7406\u4EE3\u7801\u63A8\u6F14\uFF0C\u7EDD\u4E0D\u80FD\u51ED\u7A7A\u634F\u9020\u6216\u6DF7\u5165\u65E0\u5173\u5386\u53F2\u9879\u76EE\u7684\u8BB0\u5FC6\uFF01`)),y+=s.cyan("\n\n4. \u6240\u6709\u67B6\u6784\u6587\u6863\u4E0E\u811A\u624B\u67B6\u64B0\u5199\u5B8C\u6210\u540E\uFF0C\u8BF7\u5E2E\u6211\u6267\u884C `aictx index` \u547D\u4EE4\uFF0C\u66F4\u65B0\u9879\u76EE\u7684 MOC \u8DEF\u7531\u8868\u3002"),console.log(y),console.log(`
======================================================================
`)}async fallbackMockGraphifyOutput(){await e.ensureDir(t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out"));let i={nodes:[{id:"UserController",type:"class",label:"UserController",degree:5,community:1},{id:"AuthService",type:"class",label:"AuthService",degree:8,community:1},{id:"OrderRepository",type:"class",label:"OrderRepository",degree:4,community:2},{id:"PaymentGateway",type:"class",label:"PaymentGateway",degree:2,community:2},{id:"DatabaseConnection",type:"class",label:"DatabaseConnection",degree:15,community:0}],links:[{source:"UserController",target:"AuthService",label:"calls"},{source:"AuthService",target:"DatabaseConnection",label:"calls"}]},a=`## Community 0
- \u6838\u5FC3\u57FA\u7840\u8BBE\u65BD\u5C42\uFF0C\u5904\u7406\u5E95\u5C42\u8FDE\u63A5\u4E0E\u901A\u7528\u5DE5\u5177\u3002
## Community 1
- \u7528\u6237\u4E0E\u8BA4\u8BC1\u57DF\uFF0C\u5904\u7406\u767B\u5F55\u9274\u6743\u4E0E\u7528\u6237\u8D44\u6599\u3002
## Community 2
- \u4EA4\u6613\u57DF\uFF0C\u5904\u7406\u8BA2\u5355\u72B6\u6001\u673A\u4E0E\u652F\u4ED8\u7F51\u5173\u5BF9\u63A5\u3002

**Surprising connections**:
- \`UserController\` \u5B58\u5728\u8DE8\u57DF\u76F4\u63A5\u8C03\u7528 \`PaymentGateway\` \u7684\u9690\u60A3\uFF0C\u5EFA\u8BAE\u91CD\u6784\u901A\u8FC7 \`OrderService\` \u4EE3\u7406\u3002`;await e.writeJson(t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out/graph.json"),i),await e.writeFile(t.resolve(this.options.cwd,"aictx-docs/architecture/graphify-out/GRAPH_REPORT.md"),a)}async readHeadLines(i,a){try{return(await e.readFile(i,"utf-8")).split(`
`).slice(0,a).join(`
`)}catch{return""}}getDefaultIdes(){return["codex"]}async sniffStaticInfo(){let i=t.resolve(this.options.cwd,"package.json"),a=[];if(e.existsSync(i)){let h=await e.readJson(i),m={...h.dependencies,...h.devDependencies},f=["react","vue","next","nuxt","express","nestjs","prisma","typeorm","tailwindcss"];a=Object.keys(m).filter(x=>f.some(c=>x.includes(c)))}let r=await N(["src/**/*.{ts,tsx,js,jsx}","app/**/*.{ts,tsx,js,jsx}","lib/**/*.{ts,tsx,js,jsx}"],{cwd:this.options.cwd,ignore:["node_modules","**/*.test.*","**/*.spec.*"]}),u=e.existsSync(t.resolve(this.options.cwd,"prisma/schema.prisma")),p=e.existsSync(t.resolve(this.options.cwd,"Dockerfile"));return{dependencies:a.length>0?a:["unknown"],fileCount:r.length,hasPrisma:u,hasDocker:p}}executeTier2Fallback(i){console.log(`
======================================================================`),console.log(`${s.yellow("\u26A0\uFE0F \u672A\u6302\u8F7D\u672C\u5730\u6A21\u578B\uFF0C\u5DF2\u4E3A\u60A8\u964D\u7EA7\u4E3A Tier 2 (IDE \u5F15\u5BFC\u6A21\u5F0F)")}`),console.log(`\u8BF7\u590D\u5236\u4EE5\u4E0B Prompt\uFF0C\u7C98\u8D34\u5230\u60A8\u7684 Trae / Cursor / Claude Code \u7684\u804A\u5929\u6846\u4E2D\uFF1A
`),console.log(s.dim("----------------------------------------------------------------------")),console.log(s.green(`\u4F5C\u4E3A\u4E00\u540D\u8D44\u6DF1\u67B6\u6784\u5E08\uFF0C\u8BF7\u5E2E\u6211\u5C06\u5F53\u524D\u9879\u76EE\u9006\u5411\u89E3\u6784\u4E3A aictx \u89C4\u8303\u7684 RAG \u77E5\u8BC6\u5E93\u3002

\u9879\u76EE\u57FA\u7840\u4FE1\u606F\uFF1A
- \u6838\u5FC3\u6280\u672F\u6808\uFF1A${i.dependencies.join(", ")}
- \u4E1A\u52A1\u89C4\u6A21\uFF1A\u7EA6 ${i.fileCount} \u4E2A\u6587\u4EF6

\u8BF7\u6267\u884C\u4EE5\u4E0B\u4EFB\u52A1\uFF1A
1. \u6DF1\u5EA6\u9605\u8BFB\u5F53\u524D\u4ED3\u5E93\u7684 src \u76EE\u5F55\uFF0C\u63D0\u53D6\u51FA\u5168\u5C40\u7684\uFF1A
   - \u67B6\u6784\u8BBE\u8BA1\u89C4\u8303 (\u5982\u6587\u4EF6\u547D\u540D\u3001\u76EE\u5F55\u804C\u8D23)
   - API \u54CD\u5E94/\u9519\u8BEF\u7801\u679A\u4E3E\u7EA6\u675F
   - \u6838\u5FC3\u6570\u636E\u5E93\u6A21\u578B (Schema) \u4E0E\u4E1A\u52A1\u7EA2\u7EBF
2. \u5C06\u4EE5\u4E0A\u4FE1\u606F\uFF0C\u62C6\u5206\u4E3A 3~5 \u4E2A\u72EC\u7ACB\u7684 Markdown \u6587\u4EF6\u3002
3. \u6BCF\u4E2A Markdown \u6587\u4EF6\u7684\u5F00\u5934\uFF0C\u5FC5\u987B\u5305\u542B\u5982\u4E0B YAML Frontmatter\uFF1A
---
tags: [aictx, onboard]
aliases: [\u6587\u6863\u522B\u540D]
entities: [\u6D89\u53CA\u7684\u6838\u5FC3\u5B9E\u4F53]
---
4. \u5C06\u8FD9\u4E9B\u6587\u4EF6\u521B\u5EFA\u5728\u9879\u76EE\u6839\u76EE\u5F55\u7684 \`aictx-docs/\` \u6587\u4EF6\u5939\u4E0B\uFF0C\u5E76\u6309\u7167 \`product/\`, \`architecture/\` \u5206\u7C7B\u3002`)),console.log(s.dim("----------------------------------------------------------------------")),console.log(`
\u5F53 IDE \u4E3A\u60A8\u751F\u6210\u5B8C\u8FD9\u4E9B\u6587\u6863\u540E\uFF0C\u8BF7\u5728\u7EC8\u7AEF\u8FD0\u884C\uFF1A`),console.log(s.cyan("aictx index")+" \u4EE5\u751F\u6210 MOC \u53CC\u5411\u8DEF\u7531\u8868\uFF0C\u5B8C\u6210\u63A5\u7BA1\u3002"),console.log(`======================================================================
`),n.outro("Context as Code - \u964D\u7EA7\u7B56\u7565\u6267\u884C\u5B8C\u6BD5")}};export{P as OnboardEngine};
