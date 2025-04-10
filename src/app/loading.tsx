"use client";
import { Spin } from "@douyinfe/semi-ui";

const Loading = () => {
  return (
    <div
      className={"loading-cover"}
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </div>
  );
};
export default Loading;
