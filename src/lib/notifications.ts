/**
 * In-app notification helper.
 *
 * Fire-and-forget: logs errors but never throws, so a failed
 * notification creation never breaks an API response.
 */

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/** Create a single in-app notification (fire-and-forget). */
export async function createNotification(data: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
  } catch (error) {
    logger.error("Error creando notificación", {
      type: data.type,
      userId: data.userId,
      error: String(error),
    });
  }
}

/** Create notifications for multiple users at once (fire-and-forget). */
export async function createNotifications(
  items: CreateNotificationInput[]
) {
  await Promise.allSettled(items.map((item) => createNotification(item)));
}
