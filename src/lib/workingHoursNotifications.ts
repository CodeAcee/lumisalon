import * as Notifications from "expo-notifications";
import type { WorkingHours } from "../store/settings";

// expo-notifications weekday: 1=Sunday, 2=Monday … 7=Saturday
const DAY_TO_WEEKDAY: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
};

const ALL_DAYS = Object.keys(DAY_TO_WEEKDAY);

function idStart(day: string) {
  return `wh-${day.toLowerCase()}-start`;
}
function idEnd(day: string) {
  return `wh-${day.toLowerCase()}-end`;
}

function subtractMinutes(
  timeStr: string,
  mins: number,
): { hour: number; minute: number } {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m - mins;
  const clamped = ((total % 1440) + 1440) % 1440; // wrap midnight
  return { hour: Math.floor(clamped / 60), minute: clamped % 60 };
}

export async function scheduleWorkingHourNotifications(
  workingHours: WorkingHours[],
  enabled: boolean,
): Promise<void> {
  await cancelWorkingHourNotifications();

  if (!enabled) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  for (const day of workingHours) {
    if (!day.enabled) continue;

    const weekday = DAY_TO_WEEKDAY[day.day];
    if (!weekday) continue;

    const startTime = subtractMinutes(day.start, 10);
    const endTime = subtractMinutes(day.end, 10);

    await Notifications.scheduleNotificationAsync({
      identifier: idStart(day.day),
      content: {
        title: "Working day starts soon ☀️",
        body: `Your ${day.day} shift begins at ${day.start} — in 10 minutes`,
        sound: true,
      },
      trigger: {
        type: "weekly" as any,
        weekday,
        hour: startTime.hour,
        minute: startTime.minute,
        repeats: true,
      },
    });

    await Notifications.scheduleNotificationAsync({
      identifier: idEnd(day.day),
      content: {
        title: "Working day ending soon 🌙",
        body: `Your ${day.day} shift ends at ${day.end} — in 10 minutes`,
        sound: true,
      },
      trigger: {
        type: "weekly" as any,
        weekday,
        hour: endTime.hour,
        minute: endTime.minute,
        repeats: true,
      },
    });
  }
}

export async function cancelWorkingHourNotifications(): Promise<void> {
  await Promise.allSettled(
    ALL_DAYS.flatMap((day) => [
      Notifications.cancelScheduledNotificationAsync(idStart(day)),
      Notifications.cancelScheduledNotificationAsync(idEnd(day)),
    ]),
  );
}
