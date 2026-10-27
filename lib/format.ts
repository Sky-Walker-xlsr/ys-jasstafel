const dateTime = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso));
}

const num = new Intl.NumberFormat("de-CH");
export function formatPoints(n: number) {
  return num.format(n);
}
