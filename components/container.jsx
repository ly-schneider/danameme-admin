export default function Container({ children }) {
  return (
    <main className="justify-center container ml-[219px] px-12 min-h-screen">
      <div className="mx-auto mt-8">{children}</div>
    </main>
  );
}
