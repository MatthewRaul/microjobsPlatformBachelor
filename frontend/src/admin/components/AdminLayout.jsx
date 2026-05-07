import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({ title, children }) {
  return (
    <div style={styles.wrapper}>
      <AdminSidebar />

      <div style={styles.mainArea}>
        <AdminTopbar title={title} />

        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
  },
  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: "24px",
  },
};