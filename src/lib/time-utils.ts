export function getTodayStr() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getTomorrowStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function isEntryWindow() {
  // Removed restriction: Entry is now allowed at any time for the current day.
  return true;
}

export function formatRemainingTime() {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const diff = endOfDay.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatDateLabel(dateStr: string) {
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
