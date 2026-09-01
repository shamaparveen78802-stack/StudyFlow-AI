export function formatDate(dateString?: string): string {
  if (!dateString) return 'No due date';
  try {
    const d = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(d.getTime())) return dateString;
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    const formattedMinute = isNaN(m) ? '00' : m.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export function getDaysRemaining(dueDateString?: string): { days: number; text: string; status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none' } {
  if (!dueDateString) return { days: 999, text: 'No deadline', status: 'none' };
  
  try {
    const target = new Date(dueDateString.includes('T') ? dueDateString : `${dueDateString}T23:59:59`);
    const now = new Date();
    
    // Normalize to date strings for day comparison
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: diffDays, text: `${Math.abs(diffDays)}d overdue`, status: 'overdue' };
    } else if (diffDays === 0) {
      return { days: 0, text: 'Due Today', status: 'today' };
    } else if (diffDays === 1) {
      return { days: 1, text: 'Due Tomorrow', status: 'tomorrow' };
    } else {
      return { days: diffDays, text: `Due in ${diffDays} days`, status: 'upcoming' };
    }
  } catch {
    return { days: 999, text: dueDateString, status: 'none' };
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
