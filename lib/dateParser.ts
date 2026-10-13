import { QuestPriority } from './types';

export interface ParsedQuickAdd {
  title: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: QuestPriority;
  tags: string[];
}

export function parseNaturalLanguageQuest(input: string): ParsedQuickAdd {
  let text = input.trim();
  let dueDate: string | undefined = undefined;
  let dueTime: string | undefined = undefined;
  let priority: QuestPriority = 'common';
  const tags: string[] = [];

  // 1. Extract Tags (#tag)
  const tagMatches = text.match(/#([\w-]+)/g);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      tags.push(t.replace('#', '').toLowerCase());
    });
    text = text.replace(/#([\w-]+)/g, '').trim();
  }

  // 2. Extract Priority (!legendary, !epic, !rare, !uncommon, !high, !urgent)
  if (/!(legendary|urgent)/i.test(text)) {
    priority = 'legendary';
    text = text.replace(/!(legendary|urgent)/gi, '').trim();
  } else if (/!(epic|high)/i.test(text)) {
    priority = 'epic';
    text = text.replace(/!(epic|high)/gi, '').trim();
  } else if (/!(rare|medium)/i.test(text)) {
    priority = 'rare';
    text = text.replace(/!(rare|medium)/gi, '').trim();
  } else if (/!(uncommon|low)/i.test(text)) {
    priority = 'uncommon';
    text = text.replace(/!(uncommon|low)/gi, '').trim();
  } else if (/!common/i.test(text)) {
    priority = 'common';
    text = text.replace(/!common/gi, '').trim();
  }

  // 3. Extract Time (e.g., "5pm", "17:00", "9:30am", "at 4pm", "at 14:00")
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  const time24Regex = /(?:at\s+)(\d{1,2}):(\d{2})/i;

  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    dueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    text = text.replace(timeMatch[0], '').trim();
  } else {
    const time24Match = text.match(time24Regex);
    if (time24Match) {
      const hour = parseInt(time24Match[1], 10);
      const minute = parseInt(time24Match[2], 10);
      dueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      text = text.replace(time24Match[0], '').trim();
    }
  }

  // 4. Extract Date ("today", "tomorrow", "in X days", "next monday", "monday", "friday", etc.)
  const now = new Date();

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (/\btoday\b/i.test(text)) {
    dueDate = formatDate(now);
    text = text.replace(/\btoday\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    dueDate = formatDate(d);
    text = text.replace(/\btomorrow\b/gi, '').trim();
  } else {
    const inDaysMatch = text.match(/in\s+(\d+)\s+days?/i);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1], 10);
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      dueDate = formatDate(d);
      text = text.replace(inDaysMatch[0], '').trim();
    } else {
      // Days of week
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayRegex = new RegExp(`\\b(?:next\\s+)?(${weekdays.join('|')})\\b`, 'i');
      const dayMatch = text.match(dayRegex);
      if (dayMatch) {
        const targetDay = weekdays.indexOf(dayMatch[1].toLowerCase());
        const currentDay = now.getDay();
        let daysAhead = targetDay - currentDay;
        if (daysAhead <= 0 || dayMatch[0].toLowerCase().includes('next')) {
          daysAhead += 7;
        }
        const d = new Date(now);
        d.setDate(d.getDate() + daysAhead);
        dueDate = formatDate(d);
        text = text.replace(dayMatch[0], '').trim();
      }
    }
  }

  // Clean trailing punctuation or whitespace
  text = text.replace(/\s+/g, ' ').replace(/^[\s,-]+|[\s,-]+$/g, '');

  return {
    title: text || input,
    dueDate,
    dueTime,
    priority,
    tags,
  };
}
