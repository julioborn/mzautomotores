// src/lib/base-url.ts
export function getBaseUrl() {
    // PRIORIDADES:
    // 1) NEXT_PUBLIC_BASE_URL (p. ej. https://tu-dominio.com)
    // 2) VERCEL_URL (sin protocolo; agregar https://)
    // 3) localhost (dev)
    const fromPublic = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    if (fromPublic) return fromPublic.replace(/\/$/, "");

    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

    const port = process.env.PORT || "3000";
    return `http://localhost:${port}`;
}
