import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import { consola } from 'consola';
import pc from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const vendorDir = path.resolve(rootDir, 'vendor/graphify');
const repoUrl = 'https://github.com/safishamsi/graphify.git';

async function sync() {
  consola.info(`\n开始同步最新的 Graphify 公版代码 (Upstream: ${repoUrl})...`);
  
  // 1. Clean vendor dir
  if (fs.existsSync(vendorDir)) {
    consola.info('清理本地旧版本...');
    await fs.remove(vendorDir);
  }
  await fs.ensureDir(vendorDir);

  // 2. Git clone
  consola.start(`从上游克隆最新代码 (可能会耗时，视您的网络代理而定)...`);
  try {
    await execa('git', ['clone', '--depth', '1', repoUrl, vendorDir], { stdio: 'inherit' });
  } catch (e) {
    consola.error('Git Clone 失败！请检查您的网络代理 (如设置 HTTPS_PROXY) 或确保网络畅通。');
    process.exit(1);
  }
  
  // Remove git history to keep it clean
  await fs.remove(path.resolve(vendorDir, '.git'));
  consola.success(`克隆完成。`);

  // 3. Check and Patch
  const mainPyPath = path.resolve(vendorDir, 'graphify/__main__.py');
  if (!fs.existsSync(mainPyPath)) {
    consola.error('未找到 __main__.py，上游代码结构可能发生了重大变化！');
    process.exit(1);
  }

  let code = await fs.readFile(mainPyPath, 'utf-8');

  if (code.includes('def build_graph(')) {
    consola.success('🎉 检测到上游已经包含 build_graph 方法，无需打补丁！成功吃到了开源升级红利！');
  } else {
    consola.info('🔧 上游暂未合并我们的 PR，开始注入本地 AST 提取 (build) 的魔改补丁...');
    
    // Inject `build_graph` function before `def main() -> None:`
    const buildGraphCode = `
def build_graph(target_dir: Path, generate_html: bool = True, cluster_only: bool = False) -> None:
    from graphify.detect import detect
    from graphify.extract import collect_files, extract
    from graphify.build import build_from_json
    from graphify.cluster import cluster, score_all
    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.report import generate
    from graphify.export import to_json
    import sys
    
    print(f"[graphify] Detecting files in {target_dir}...")
    detection = detect(target_dir)
    code_files = []
    for f in detection.get("files", {}).get("code", []):
        f_path = Path(f)
        if f_path.is_dir():
            code_files.extend(collect_files(f_path))
        else:
            code_files.append(f_path)

    if not code_files:
        print("[graphify] No code files found for AST extraction.")
        sys.exit(0)
        
    print(f"[graphify] Extracting AST from {len(code_files)} code files...")
    extraction = extract(code_files)
    
    print("[graphify] Building graph...")
    G = build_from_json(extraction)
    
    if G.number_of_nodes() == 0:
        print("[graphify] ERROR: Graph is empty - extraction produced no nodes.")
        sys.exit(1)
        
    print("[graphify] Clustering communities...")
    communities = cluster(G)
    cohesion = score_all(G, communities)
    
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: f"Community {cid}" for cid in communities}
    questions = suggest_questions(G, communities, labels)
    
    out_dir = Path("graphify-out")
    out_dir.mkdir(exist_ok=True)
    
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
    report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, str(target_dir), suggested_questions=questions)
    
    (out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    to_json(G, communities, str(out_dir / "graph.json"))
    
    print(f"[graphify] Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities.")

`;
    code = code.replace('def main() -> None:', buildGraphCode + 'def main() -> None:');

    // Inject the CLI router logic
    const cliRouterCode = `
    elif cmd == "." or cmd.startswith("./") or Path(cmd).is_dir() or cmd == "build":
        # Expose the underlying build process!
        target_dir = Path(cmd if cmd != "build" else ".")
        if not target_dir.exists() or not target_dir.is_dir():
            print(f"error: {cmd} is not a valid directory", file=sys.stderr)
            sys.exit(1)
        
        # Support flags
        no_viz = "--no-viz" in sys.argv
        cluster_only = "--cluster-only" in sys.argv
        
        try:
            print(f"Building knowledge graph for {target_dir.resolve()}...")
            build_graph(
                target_dir, 
                generate_html=not no_viz,
                cluster_only=cluster_only
            )
            print("Knowledge graph built successfully.")
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Build failed: {e}", file=sys.stderr)
            sys.exit(1)
    else:`;
    
    code = code.replace(/    else:\n\s+print\(f"error: unknown command '\{cmd\}'"/, cliRouterCode + '\n        print(f"error: unknown command \'{cmd}\'"');

    await fs.writeFile(mainPyPath, code, 'utf-8');
    consola.success('✅ 补丁注入成功！自动化魔改版本已生成。');
  }

  consola.success(pc.green('🎉 Graphify 同步完毕！你可以直接运行 npm run build 进行发布了。\n'));
}

sync().catch(err => {
  consola.error(err);
  process.exit(1);
});
