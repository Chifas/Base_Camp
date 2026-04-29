export const LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "Inglés" },
  { code: "fr", name: "Francés" },
  { code: "de", name: "Alemán" },
  { code: "pt", name: "Portugués" },
  { code: "it", name: "Italiano" },
  { code: "ca", name: "Catalán" },
  { code: "eu", name: "Euskera" },
  { code: "gl", name: "Gallego" },
  { code: "zh", name: "Chino" },
  { code: "ja", name: "Japonés" },
  { code: "ar", name: "Árabe" },
  { code: "ru", name: "Ruso" },
  { code: "nl", name: "Neerlandés" },
  { code: "pl", name: "Polaco" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function getLanguageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
