const TIME_UNITS = [
  { ms: 31536000000, name: 'year' }, // ms for 365 days (~ 1 year)
  { ms: 2592000000, name: 'month' }, // ms for 30 days (~ 1 month)
  { ms: 86400000, name: 'day' }, // ms for 24 hours
  { ms: 3600000, name: 'hour' }, // ms for 60 minutes
  { ms: 60000, name: 'minute' }, // ms for 60 seconds
  { ms: 1000, name: 'second' } // ms for 1 second
];

export function formatDateDistance(date: Date): string {
  let result = 'just now';
  const timeDiff = new Date().getTime() - date.getTime();

  for (const { ms, name } of TIME_UNITS) {
    const count = Math.floor(timeDiff / ms);
    if (count > 0) {
      const prefix = name === 'year' || name === 'month' ? '~' : '';
      const suffix = count > 1 ? 's' : '';
      result = `${prefix}${count} ${name}${suffix} ago`;
      break;
    }
  }

  return result;
}

export function formatDuration(duration: number): string {
  const minutes = `${Math.floor(duration / 60)}`;
  const seconds = `${duration % 60}`;
  return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};