export async function serialise<T>(storageKey: string, data: T) {
  const serial = JSON.stringify(data);
  window.localStorage.setItem(storageKey, serial);
}

export function deserialise<T>(storageKey: string): T {
  const raw = window.localStorage.getItem(storageKey);
  return JSON.parse(raw ?? "{}") as T;
}
