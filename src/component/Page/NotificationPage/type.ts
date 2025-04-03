import {Notification} from "@/component/Layout/type";

interface NotificationUser extends Notification{
    created_by_name: string
}
export type { NotificationUser}