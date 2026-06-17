export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}
