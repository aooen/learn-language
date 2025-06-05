export enum Lang {
  'ko-KR' = '한국어',
  'en-US' = '영어',
}

export function getLangText(lang: string) {
  return Lang[lang as keyof typeof Lang];
}
