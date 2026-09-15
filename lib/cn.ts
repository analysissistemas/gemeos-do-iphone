export function cn(...partes: (string | false | null | undefined)[]) {
  return partes.filter(Boolean).join(" ");
}
