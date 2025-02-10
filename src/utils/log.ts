import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, 'access.log');

export function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}`;
  console.log(logMessage);
}