export function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  console.log(logMessage);
}