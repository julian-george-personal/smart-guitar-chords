export function comparePriorities(aPriority: number, bPriority: number) {
  if (aPriority < bPriority) {
    return -1;
  } else if (aPriority > bPriority) {
    return 1;
  }
  return null;
}
