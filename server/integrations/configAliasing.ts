function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function toCamelCase(key: string): string {
  return key
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part, idx) => {
      const lower = part.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function toSnakeCase(key: string): string {
  return key
    .replace(/-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/__+/g, '_')
    .toLowerCase();
}

function toKebabCase(key: string): string {
  return key
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/--+/g, '-')
    .toLowerCase();
}

function candidateAliasKeys(key: string): string[] {
  const out = new Set<string>();
  out.add(key);

  if (key.includes('_') || key.includes('-')) {
    out.add(toCamelCase(key));
  }

  if (/[A-Z]/.test(key)) {
    out.add(toSnakeCase(key));
    out.add(toKebabCase(key));
  }

  if (key.includes('-')) out.add(key.replace(/-/g, '_'));
  if (key.includes('_')) out.add(key.replace(/_/g, '-'));

  // Common casing normalizations
  out.add(toSnakeCase(key));
  out.add(toCamelCase(key));
  out.add(toKebabCase(key));

  return Array.from(out);
}

export function createConfigAliasProxy<T>(input: T): T {
  if (!isPlainObject(input)) return input;

  const target = input as any;

  return new Proxy(target, {
    get(obj, prop, receiver) {
      if (typeof prop !== 'string') return Reflect.get(obj, prop, receiver);

      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const value = Reflect.get(obj, prop, receiver);
        return isPlainObject(value) ? createConfigAliasProxy(value) : value;
      }

      for (const alt of candidateAliasKeys(prop)) {
        if (alt === prop) continue;
        if (Object.prototype.hasOwnProperty.call(obj, alt)) {
          const value = Reflect.get(obj, alt, receiver);
          return isPlainObject(value) ? createConfigAliasProxy(value) : value;
        }
      }

      return undefined;
    },

    set(obj, prop, value, receiver) {
      return Reflect.set(obj, prop, value, receiver);
    },

    has(obj, prop) {
      if (typeof prop !== 'string') return Reflect.has(obj, prop);
      if (Reflect.has(obj, prop)) return true;
      for (const alt of candidateAliasKeys(prop)) {
        if (alt === prop) continue;
        if (Reflect.has(obj, alt)) return true;
      }
      return false;
    },
  }) as T;
}
