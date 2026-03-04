import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cobrança Gelo",
  description: "Sistema de controle de boletos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Impede tradução automática do Google */}
        <meta name="google" content="notranslate" />
      </head>
      <body>{children}</body>
    </html>
  );
}
