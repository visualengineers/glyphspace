/** `baseName`, or `baseName (1)`, `baseName (2)`, … when that name is taken. */
export function uniqueDatasetName(baseName: string, existingNames: readonly string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }
  let counter = 1;
  while (existingNames.includes(`${baseName} (${counter})`)) {
    counter++;
  }
  return `${baseName} (${counter})`;
}
