/**
 * Returns the previous business day (skipping Saturday and Sunday) as YYYY-MM-DD,
 * based on today's calendar date in the given time zone.
 *
 * This mirrors the site's own default-date rule (getpreviousbusinessday in ticker.js):
 * on Monday the default is the previous Friday, not Sunday.
 *
 * @param {string} timeZone IANA time zone, e.g. 'America/New_York'
 * @param {Date} [now] Reference time; defaults to the current time
 * @returns {string} Date in YYYY-MM-DD format
 */
function previousBusinessDay(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type) => Number(parts.find((p) => p.type === type).value);

  // Work in UTC so the host machine's own time zone can't shift the date
  const day = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
  do {
    day.setUTCDate(day.getUTCDate() - 1);
  } while (day.getUTCDay() === 0 || day.getUTCDay() === 6);

  return day.toISOString().slice(0, 10);
}

module.exports = { previousBusinessDay };
