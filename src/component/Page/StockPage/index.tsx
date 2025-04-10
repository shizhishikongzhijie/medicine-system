"use client";
import "./index.css";

import { IconInfoCircle } from "@douyinfe/semi-icons";
import { Button, Input, Modal, Notification, Table } from "@douyinfe/semi-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MedicinePopover, StockUploadForm } from "@/component";
import type { Stock } from "@/component/Page/StockPage/type";
import { UTCFormat } from "@/tools";
import { NextAxios } from "@/tools/axios/NextAxios";
import type { ResType } from "@/tools/axios/type";

const columns = [
  {
    title: "药品名",
    width: 200,
    dataIndex: "medicine_name",
    fixed: true,
    render: (text: string, record: Stock) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>{text}</div>
          <MedicinePopover medicineId={record.medicine_id}>
            <IconInfoCircle />
          </MedicinePopover>
        </div>
      );
    },
    ellipsis: true,
  },
  {
    title: "入库数量",
    width: 100,
    dataIndex: "quantity",
    render: (text: number) => <div>{text}</div>,
    ellipsis: true,
  },
  {
    title: "批号",
    width: 200,
    dataIndex: "batch_number",
    render: (text: string) => {
      return <div>{text}</div>;
    },
  },
  {
    title: "生产日期",
    width: 200,
    dataIndex: "production_date",
    render: (value: string) => {
      return <span>{UTCFormat(value)}</span>;
    },
  },
  {
    title: "有效期至",
    width: 200,
    dataIndex: "expiry_date",
    render: (value: string) => {
      return <span>{UTCFormat(value)}</span>;
    },
  },
  {
    title: "备注",
    width: 200,
    dataIndex: "remark",
    render: (text: string) => {
      return <div>{text}</div>;
    },
  },
  {
    title: "入库日期",
    width: 200,
    dataIndex: "stock_in_date",
    render: (value: string) => {
      return <span>{UTCFormat(value)}</span>;
    },
  },
];
const StockPage = () => {
  const [dataSource, setData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInfo, setSearchInfo] = useState<string>("");
  const [allCount, setAllCount] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<
    (string | number)[] | undefined
  >([]);
  const [index, setIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const scroll = useMemo(() => ({ y: 280 }), []);
  const StockUploadFormRef = useRef<{
    openModal: () => void;
    closeModal: () => void;
    setFormValues: (values: Stock) => void;
  }>();
  const getData = useCallback(async () => {
    const newRes: ResType = await NextAxios({
      map: "get",
      url: "/api/stock",
      data: {
        searchInfo: searchInfo,
        index: index,
        pageSize: pageSize,
      },
    });

    console.log(newRes.data);
    setData(
      newRes.data.data.map((item: any) => {
        item.key = item.id;
        delete item.id;
        return item;
      }),
    );
    setAllCount(newRes.data.count);
    setLoading(false);
  }, [index, searchInfo, pageSize]);

  function deleteConfirm() {
    const names =
      selectedRowKeys?.map((id: any) => {
        const item: Stock | undefined = dataSource.find(
          (item: Stock) => item.key === id,
        );
        return item?.medicine_name;
      }) ?? []; // 处理 selectedRowKeys 为 null/undefined 的情况
    const validNames = names.filter((name) => name !== undefined);
    const content =
      validNames.length > 0 ? validNames.join(", ") : "未选中任何货物";
    Modal.confirm({
      title: "确定删除此货物？",
      content: content,
      onOk: onDelete,
    });
  }

  const onDelete = async () => {
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      return;
    }
    const res: ResType = await NextAxios({
      map: "delete",
      url: "/api/stock",
      data: {
        ids: selectedRowKeys,
      },
    });
    if (res.code === 200) {
      Notification.success({
        title: "删除成功",
        content: "删除成功",
      });
    }
    getData();
  };

  const onUpdate = () => {
    const id = selectedRowKeys?.[0] as number;
    StockUploadFormRef?.current?.setFormValues(
      dataSource.find((item: Stock) => item.key === id) as Stock,
    );
    setLoading(true);
    getData();
  };
  useEffect(() => {
    getData();
  }, [index, pageSize]);

  return (
    <div>
      <StockUploadForm ref={StockUploadFormRef} callBack={getData} />
      <div className={"stock-table-header"}>
        <div className={"stock-table-header__left"}>
          <Button
            onClick={() => {
              console.log("StockUploadFormRef", StockUploadFormRef);
              StockUploadFormRef?.current?.openModal();
            }}
          >
            导入
          </Button>
          <Button
            disabled={!(selectedRowKeys && selectedRowKeys?.length > 0)}
            onClick={deleteConfirm}
          >
            删除
          </Button>
          <Button disabled={selectedRowKeys?.length != 1} onClick={onUpdate}>
            更新
          </Button>
        </div>
        <div className={"stock-table-header__right"}>
          <Input
            placeholder={"请输入药品名"}
            value={searchInfo}
            onChange={(value) => {
              setSearchInfo(value);
            }}
          />
          <Button
            onClick={() => {
              console.log("searchInfo", searchInfo);
              setLoading(true);
              setIndex(1);
              getData();
            }}
          >
            搜索
          </Button>
        </div>
      </div>
      <Table
        loading={loading}
        columns={columns}
        scroll={scroll}
        pagination={{
          currentPage: index,
          pageSize: pageSize,
          pageSizeOpts: [5, 10, 20, 50],
          total: allCount,
          showSizeChanger: true,
          onPageChange: (page) => {
            console.log(page);
            setLoading(true);
            setIndex(page);
          },
          onPageSizeChange: (pageSize) => {
            console.log(pageSize);
            setLoading(true);
            setPageSize(pageSize);
          },
        }}
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            console.log(
              `selectedRowKeys: ${selectedRowKeys}`,
              "selectedRows: ",
              selectedRows,
            );
          },
          fixed: true,
        }}
        dataSource={dataSource}
      />
    </div>
  );
};
export default StockPage;
