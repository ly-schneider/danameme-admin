import Footer from "@/components/footer";
import "./globals.css";
import Navigation from "@/components/navigation";
import Container from "@/components/container";
import Script from "next/script";

export const metadata = {
  title: "DANAMEME - Admin",
  description: "DANAMEME, die Plattform für Campus-Releated Memes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="bg-background flex min-h-screen flex-col items-center ">
        <Navigation />
        <Container>{children}</Container>
        <Footer />
      </body>
    </html>
  );
}
