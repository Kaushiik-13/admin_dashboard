import TopNavBar from "../components/TopNavBar";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopNavBar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: "24px 32px",
            background: "#f5f5f5",
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
