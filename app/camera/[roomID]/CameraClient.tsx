
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Camera, ShieldCheck, Video, VideoOff } from "lucide-react";

export default function CameraPage() {
    const params = useParams<{ roomId: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function startCamera() {
        setLoading(true);
        setError("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setActive(true);
        } catch (err) {
            setError(
                "Não foi possível acessar a câmera ou o microfone. Verifique as permissões do navegador."
            );
        } finally {
            setLoading(false);
        }
    }

    function stopCamera() {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setActive(false);
    }

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#080b14] text-white flex items-center justify-center p-5">
            <div className="w-full max-w-xl">

                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="bg-blue-600 p-3 rounded-xl">
                        <Camera size={26} />
                    </div>

                    <h1 className="text-2xl font-bold">CamConnect</h1>
                </div>

                <div className="bg-[#111725] border border-white/10 rounded-2xl p-7">

                    <div className="text-center mb-7">
                        <div className="inline-flex bg-blue-500/10 p-4 rounded-2xl mb-4">
                            <ShieldCheck size={35} className="text-blue-400" />
                        </div>

                        <h2 className="text-2xl font-bold">
                            Compartilhamento de câmera
                        </h2>

                        <p className="text-gray-400 text-sm mt-3">
                            Você está entrando em uma sala privada do CamConnect.
                            Ao iniciar, sua câmera e seu microfone serão compartilhados
                            com o administrador desta sala.
                        </p>
                    </div>

                    <div className="bg-[#080b14] rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-5 border border-white/10">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${
                                active ? "block" : "hidden"
                            }`}
                        />

                        {!active && (
                            <div className="text-center text-gray-500">
                                <VideoOff size={42} className="mx-auto mb-3" />
                                <p className="text-sm">Câmera desligada</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-gray-400">
              Identificação da sala
            </span>

                        <span className="text-xs text-blue-400 font-mono">
              {params.roomId?.slice(0, 8)}
            </span>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mb-4">{error}</p>
                    )}

                    {!active ? (
                        <button
                            onClick={startCamera}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-4 font-semibold flex items-center justify-center gap-2"
                        >
                            <Video size={19} />
                            {loading ? "Solicitando permissão..." : "Autorizar e iniciar câmera"}
                        </button>
                    ) : (
                        <button
                            onClick={stopCamera}
                            className="w-full bg-red-600 hover:bg-red-500 rounded-xl py-4 font-semibold flex items-center justify-center gap-2"
                        >
                            <VideoOff size={19} />
                            Encerrar transmissão
                        </button>
                    )}

                    <p className="text-center text-gray-600 text-xs mt-5">
                        A transmissão só começa após sua autorização.
                    </p>
                </div>
            </div>
        </main>
    );
}
