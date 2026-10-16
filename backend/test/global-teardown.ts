export default function globalTeardown(): void {
  const pid = Number(process.env.E2E_API_PID);
  if (pid) process.kill(pid);
}
