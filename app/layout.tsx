import type { Metadata } from "next";
import { ScrollReveal } from "../components/ScrollReveal";
import "./globals.css";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = configuredUrl
  ? configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`
  : vercelUrl
    ? `https://${vercelUrl}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Barbearia Black — Seu estilo começa cedo",
    template: "%s | Barbearia Black",
  },
  description:
    "Agende seu corte na Barbearia Black. Atendimento profissional das 06h às 12h, com praticidade, pontualidade e estilo.",
  openGraph: {
    title: "Barbearia Black",
    description: "Seu estilo começa cedo. Agende seu horário das 06h às 12h.",
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    images: [
      {
        url: "/og.jpg",
        width: 1734,
        height: 907,
        alt: "Barbearia Black — Seu estilo começa cedo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barbearia Black",
    description: "Seu estilo começa cedo. Agende seu horário das 06h às 12h.",
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
