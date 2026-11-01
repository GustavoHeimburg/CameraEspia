
import { Suspense } from "react";
import CameraClient from "./CameraClient";

export default function CameraPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                    Carregando câmera...
                </main>
            }
        >
            <CameraClient />
        </Suspense>
    );
}
