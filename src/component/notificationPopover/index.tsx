import {Empty, List} from "@douyinfe/semi-ui";
import {Notification} from "@/component/Layout/type";
import './index.css'

interface NotificationPopoverProps {
    dataSource?: Notification[]
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({dataSource}) => {

    return (
        <List dataSource={dataSource}
              className={'message-popover'}
              emptyContent={<Empty description="暂无系统通知"/>}
              renderItem={(item: Notification) => (
                  <List.Item
                      main={
                          <div>
                              <span style={{color: 'var(--semi-color-text-0)', fontWeight: 500}}>{item.title}</span>
                              <p className={'message-popover-content'}
                                 style={{color: 'var(--semi-color-text-2)', margin: '4px 0'}}>
                                  {item.content}
                              </p>
                          </div>
                      }
                  />
              )}
              header={<div style={{fontWeight: 500, color: 'var(--semi-color-text-0)'}}>系统通知</div>}
              footer={<a href="/notification">查看全部</a>}
        />)
}
export default NotificationPopover