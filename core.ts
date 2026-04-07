export async function loadModules() {
  const module = await import("baileys");
  return module;
}
