export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / 1024 ** exponent;

  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function formatRelativeTime(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = target.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
    { amount: 4.34524, unit: "weeks" },
    { amount: 12, unit: "months" },
    { amount: Number.POSITIVE_INFINITY, unit: "years" },
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  let duration = diffSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "years");
}
