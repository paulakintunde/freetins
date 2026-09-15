// Publication timing only. No verification or content-state decisions belong here.
export const pstDate = (value) => new Date(+new Date(value) - 8 * 3600000).toISOString().slice(0, 10);
export function slotAt(now, startDate) {
  const time = +new Date(now);
  const day = pstDate(now);
  const hours = day === startDate ? [9, 14, 19] : [9, 14];
  const slots = hours.map(hour => Date.parse(day + 'T' + String(hour).padStart(2, '0') + ':30:00-08:00'));
  // A missed slot does not trigger a batch catch-up. Only this half-hour is eligible.
  return slots.find(slot => time >= slot && time < slot + 30 * 60000) ?? null;
}
export function nextPublication(plan, ledger, now = new Date()) {
  if (ledger.pendingDeployment) return { reason: 'Deployment needs reconciliation', item: null };
  const released = new Set(ledger.releases.map(row => row.slug));
  const item = plan.items.find(row => !released.has(row.slug));
  if (!item) return { reason: 'All publications complete', item: null };
  const today = pstDate(now);
  const firstDay = ledger.releases[0]?.slot ? pstDate(ledger.releases[0].slot) : (today >= plan.startDate ? today : plan.startDate);
  const slot = slotAt(now, firstDay);
  if (!ledger.releases.length && slot && new Date(slot - 8 * 3600000).getUTCHours() !== 9) return { reason: 'First release starts at 09:30 PST', item: null };
  if (!slot || +new Date(item.scheduledAt) > +new Date(now)) return { reason: 'Outside publication slot', item: null };
  if (ledger.releases.some(row => row.slot === new Date(slot).toISOString())) return { reason: 'Slot already used', item: null };
  const sameDay = ledger.releases.filter(row => pstDate(row.slot) === pstDate(slot));
  if (sameDay.length >= (pstDate(slot) === firstDay ? 3 : 2)) return { reason: 'Daily limit reached', item: null };
  const last = ledger.releases.at(-1);
  if (last && slot - Date.parse(last.slot) < 5 * 3600000) return { reason: 'Five-hour spacing', item: null };
  return { reason: 'Ready', item, slot: new Date(slot).toISOString() };
}
export function stripPendingLinks(markdown, pendingPaths) {
  return markdown.replace(/\[([^\]]+)\]\((\/[^\s)]+)\)/g, (whole, label, href) =>
    pendingPaths.has(href.split('#')[0]) ? label : whole);
}
