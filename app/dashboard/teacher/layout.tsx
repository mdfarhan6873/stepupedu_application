export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Teacher Dashboard</h1>
      {children}
    </div>
  );
}