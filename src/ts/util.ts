export class Deferred<T> {
 public promise: Promise<T>;
 public resolve: (value?: T | PromiseLike<T>) => void;
 public reject: (reason?: any) => void;
 constructor() {
   this.promise = new Promise<T>((resolve, reject) => {
     this.resolve = resolve;
     this.reject = reject;
   });
 }
}

export class Logger {
  static active = () => !(process.env.SILENT === "true");

  public static info (...args: any[]): void {
    if(Logger.active()) {
      console.log(Logger.colorFgWhite("[decade]"), ...args);
    }
  }

  public static good (...args: any[]): void {
    if(Logger.active()) {
      console.log(Logger.colorFgGreen("[decade]"), ...args);
    }
  }

  public static error (...args: any[]): void {
    if(Logger.active()) {
      console.error(Logger.colorFgRed("[decade]"), ...args);
    }
  }

  /** Color Utilities */
  private static colorApply = (color: string, message: any) => `${color}${message}${Logger.colorReset()}`;
  private static colorReset = () => "\x1b[0m";

  /** Foreground Colors */
  private static colorFgBlack = (message: any) => Logger.colorApply("\x1b[30m", message);
  private static colorFgRed = (message: any) => Logger.colorApply("\x1b[31m", message);
  private static colorFgGreen = (message: any) => Logger.colorApply("\x1b[32m", message);
  private static colorFgYellow = (message: any) => Logger.colorApply("\x1b[33m", message);
  private static colorFgBlue = (message: any) => Logger.colorApply("\x1b[34m", message);
  private static colorFgMagenta = (message: any) => Logger.colorApply("\x1b[35m", message);
  private static colorFgCyan = (message: any) => Logger.colorApply("\x1b[36m", message);
  private static colorFgWhite = (message: any) => Logger.colorApply("\x1b[37m", message);

  /** Background Colors */
  private static colorBgBlack = (message: any) => Logger.colorApply("\x1b[40m", message);
  private static colorBgRed = (message: any) => Logger.colorApply("\x1b[41m", message);
  private static colorBgGreen = (message: any) => Logger.colorApply("\x1b[42m", message);
  private static colorBgYellow = (message: any) => Logger.colorApply("\x1b[43m", message);
  private static colorBgBlue = (message: any) => Logger.colorApply("\x1b[44m", message);
  private static colorBgMagenta = (message: any) => Logger.colorApply("\x1b[45m", message);
  private static colorBgCyan = (message: any) => Logger.colorApply("\x1b[46m", message);
  private static colorBgWhite = (message: any) => Logger.colorApply("\x1b[47m", message);
}
