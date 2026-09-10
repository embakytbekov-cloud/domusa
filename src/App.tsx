import { useEffect, type ReactNode } from "react";
import { useAppStore } from "./store/appStore";
import { initTelegram } from "./lib/telegram";
import { FeedScreen } from "./screens/FeedScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { SavedScreen } from "./screens/SavedScreen";
import { AddScreen } from "./screens/AddScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { TabBar } from "./components/TabBar";
import { TopBar } from "./components/TopBar";
import { DetailBookingBar } from "./components/DetailBookingBar";
import { AddPublishBar } from "./components/AddPublishBar";
import { FiltersSheet } from "./components/FiltersSheet";
import { GateSheet } from "./components/GateSheet";
import { Toast } from "./components/Toast";

export default function App() {
  const screen = useAppStore((s) => s.screen);
  const tab = useAppStore((s) => s.tab);
  const initUser = useAppStore((s) => s.initUser);

  useEffect(() => {
    initTelegram();
    initUser();
  }, [initUser]);

  const isDetail = screen === "detail";
  const showTabs = !isDetail;

  let body: ReactNode;
  if (isDetail) {
    body = <DetailScreen />;
  } else if (tab === "search") {
    body = <FeedScreen />;
  } else if (tab === "saved") {
    body = <SavedScreen />;
  } else if (tab === "add") {
    body = <AddScreen />;
  } else {
    body = <ProfileScreen />;
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        height: "100dvh",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 0 60px rgba(20,16,13,.08)",
      }}
    >
      {isDetail && <TopBar title="Объявление" />}

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>{body}</div>

      {isDetail && <DetailBookingBar />}
      {!isDetail && tab === "add" && <AddPublishBar />}

      {showTabs && <TabBar />}

      <FiltersSheet />
      <GateSheet />
      <Toast />
    </div>
  );
}
