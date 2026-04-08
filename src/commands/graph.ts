import { defineCommand } from 'cac';
import { consola } from 'consola';
import { graphify } from 'graphify-go';

export const graphCommand = (cli: ReturnType<typeof defineCommand>) => {
  cli.command('graph [...args]', 'Proxy command for local graphify-go AST engine')
    .allowUnknownOptions()
    .action(async (args: string[], options) => {
      try {
        // 解析传递给 aictx graph 的原始参数
        // process.argv 形如: ['node', 'aictx.js', 'graph', '-dir', '.', '-out', './out']
        // 我们需要截取 'graph' 后面的参数
        const rawArgs = process.argv.slice(3);

        consola.debug('Using graphify-go engine with args:', rawArgs);

        // 调用 npm 包封装的二进制执行接口
        const output = await graphify(rawArgs);
        
        // 由于 graphify-go 直接把日志打到了 stdout，这里的 output 其实是捕获的文本
        // 如果不需要二次处理，直接打印即可
        if (output) {
          console.log(output);
        }

      } catch (err: any) {
        consola.error(`Graphify-Go engine failed: ${err.message}`);
        process.exit(err.exitCode || 1);
      }
    });
};
