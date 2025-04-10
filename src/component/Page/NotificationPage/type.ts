import type { Notification } from "@/component/layout/type";

interface NotificationUser extends Notification {
  created_by_name: string;
}
export type { NotificationUser };
