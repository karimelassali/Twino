export default function Layout({ children }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
