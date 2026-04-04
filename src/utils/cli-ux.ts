import { intro, outro, spinner, select, text, multiselect, isCancel, cancel } from '@clack/prompts';
import pc from 'picocolors';

export const cliUX = {
  intro: (message: string) => intro(pc.bgCyan(pc.black(` aictx `)) + ' ' + pc.bold(message)),
  outro: (message: string) => outro(pc.green(message)),
  
  checkCancel: (value: any) => {
    if (isCancel(value)) {
      cancel('操作已取消');
      process.exit(0);
    }
    return value;
  },

  async askText(message: string, placeholder?: string, defaultValue?: string) {
    const result = await text({
      message,
      placeholder,
      defaultValue,
    });
    return this.checkCancel(result);
  },

  async askSelect<T>(message: string, options: { value: T; label: string; hint?: string }[]) {
    const result = await select({
      message,
      options,
    });
    return this.checkCancel(result);
  },

  async askMultiSelect<T>(message: string, options: { value: T; label: string; hint?: string }[], required: boolean = true) {
    const result = await multiselect({
      message,
      options,
      required,
    });
    return this.checkCancel(result);
  },

  createSpinner() {
    const s = spinner();
    return {
      start: (msg: string) => s.start(msg),
      stop: (msg: string) => s.stop(msg),
    };
  }
};
