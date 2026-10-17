// One playback owner per browser document. No browser globals: also unit-testable.
type Playback = {owner: symbol; stop: () => void};
let current: Playback | undefined;

export function claimNarration(owner: symbol, stop: () => void): void {
  if (current?.owner === owner) { current.stop = stop; return; }
  const previous = current;
  current = undefined;
  // Stop synchronously before the new engine starts. An exception fails closed.
  previous?.stop();
  current = {owner, stop};
}

export function releaseNarration(owner: symbol): void {
  if (current?.owner === owner) current = undefined;
}

export function ownsNarration(owner: symbol): boolean {
  return current?.owner === owner;
}
