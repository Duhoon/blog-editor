// CamelCase를 snake_case로 변환하는 타입
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

// 객체 키를 snake_case로 변환하는 타입
type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<K & string>]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<U extends object ? KeysToSnakeCase<U> : U>
      : T[K] extends Date | RegExp
      ? T[K]
      : KeysToSnakeCase<T[K]>
    : T[K];
};

// CamelCase를 snake_case로 변환하는 함수
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// 객체의 키를 재귀적으로 변환하는 함수
export function convertKeysToSnakeCase<T>(obj: T): KeysToSnakeCase<T> {
  // null이나 undefined 처리
  if (obj === null || obj === undefined) {
    return obj as KeysToSnakeCase<T>;
  }
  
  // 배열인 경우
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item)) as KeysToSnakeCase<T>;
  }
  
  // 객체가 아닌 경우 (primitive 타입)
  if (typeof obj !== 'object') {
    return obj as KeysToSnakeCase<T>;
  }
  
  // Date 객체 등 특수 객체는 그대로 반환
  if (obj instanceof Date || obj instanceof RegExp) {
    return obj as KeysToSnakeCase<T>;
  }
  
  // 객체의 키를 변환
  const result: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = convertKeysToSnakeCase(obj[key]);
    }
  }
  
  return result as KeysToSnakeCase<T>;
}