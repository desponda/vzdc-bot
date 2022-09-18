
class Log {

  static write(message: string, error: boolean | null): void {
    const d = new Date();
    let msg = `[${d.toISOString()}] ${error ? " ERROR - " : " INFO  - "} ${message}`
    console.log(msg);
  }

  static info(message: string): void {
    Log.write(message, false);
  }

  static error(message: string): void {
    Log.write(message, true);
  }
}

export default Log;
