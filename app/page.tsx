
"use client";

import { useState } from "react";
import { io } from "socket.io-client";

import {
  Camera,
  LayoutDashboard,
  Monitor,
  Settings,
  Wifi,
  Plus,
  Radio,
  ShieldCheck,
  Activity,
  Copy,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function generateCameraLink() {
    if (isCreating) return;

    setIsCreating(true);

    const roomId = crypto.randomUUID();

    const ownerToken =
        crypto.randomUUID() + crypto.randomUUID();

    const link = `${window.location.origin}/camera/${roomId}`;

    const socket = io(
        process.env.NEXT_PUBLIC_SIGNALING_URL ||
        "http://localhost:4000",
        {
          autoConnect: false,
          reconnection: false,
          timeout: 8000,
        }
    );

    socket.once("connect", () => {
      socket.emit(
          "room:create",
          { roomId, ownerToken },
          async (response: {
            ok: boolean;
            error?: string;
          }) => {
            socket.disconnect();

            if (!response?.ok) {
              alert(
                  response?.error || "Erro ao criar sala."
              );

              setIsCreating(false);
              return;
            }

            sessionStorage.setItem(
                `camconnect:owner:${roomId}`,
                ownerToken
            );

            setGeneratedLink(link);

            try {
              await navigator.clipboard.writeText(link);
            } catch {
              console.log("Link criado:", link);
            }

            alert("Sala criada com sucesso!");

            setIsCreating(false);
          }
      );
    });

    socket.once("connect_error", () => {
      alert(
          "Não foi possível conectar ao servidor CamConnect."
      );

      socket.disconnect();
      setIsCreating(false);
    });

    socket.connect();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(generatedLink);
      alert("Link copiado!");
    } catch {
      alert("Não foi possível copiar automaticamente.");
    }
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Dispositivos", icon: Monitor },
    { name: "Configurações", icon: Settings },
  ];

  const stats = [
    {
      label: "Dispositivos",
      value: "0",
      icon: Monitor,
    },
    {
      label: "Transmissões ativas",
      value: "0",
      icon: Radio,
    },
    {
      label: "Status do sistema",
      value: "Online",
      icon: Activity,
    },
  ];

  return (
      <main className="min-h-screen bg-[#080b14] text-white flex">

        {/* SIDEBAR */}

        <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col">

          <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Camera size={24} />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                CamConnect
              </h1>

              <p className="text-xs text-gray-500">
                Remote Camera System
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 uppercase">
            Menu principal
          </p>

          {menuItems.map((item) => (
              <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 text-sm transition ${
                      activeTab === item.name
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-400 hover:bg-white/5"
                  }`}
              >
                <item.icon size={19} />
                {item.name}
              </button>
          ))}

          <div className="mt-auto border border-white/10 rounded-xl p-4">

            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Interface ativa
            </div>

            <p className="text-xs text-gray-500 mt-2">
              CamConnect v1.0
            </p>

          </div>

        </aside>

        {/* CONTEÚDO PRINCIPAL */}

        <section className="flex-1 p-6 md:p-10">

          <header className="flex justify-between items-center mb-10">

            <div>
              <h2 className="text-2xl font-bold">
                {activeTab}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Gerencie suas transmissões de câmera.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-full">
              <Wifi size={16} />
              Servidor configurado
            </div>

          </header>

          {/* ESTATÍSTICAS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-[#111725] border border-white/10 rounded-2xl p-6"
                >

                  <div className="flex justify-between text-gray-400 mb-5">
                <span className="text-sm">
                  {stat.label}
                </span>

                    <stat.icon size={20} />
                  </div>

                  <p className="text-3xl font-bold">
                    {stat.value}
                  </p>

                </div>
            ))}

          </div>

          {/* TRANSMISSÕES */}

          <div className="bg-[#111725] border border-white/10 rounded-2xl p-8">

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">

              <div>
                <h3 className="text-lg font-semibold">
                  Transmissões
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Gerencie os dispositivos autorizados a compartilhar suas câmeras.
                </p>
              </div>

              <button
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium"
                  onClick={generateCameraLink}
                  disabled={isCreating}
              >
                <Plus size={18} />

                {isCreating
                    ? "Criando sala..."
                    : "Gerar link"}
              </button>

            </div>

            {/* LINK GERADO */}

            {generatedLink && (
                <div className="mb-8 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">

                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2
                        size={19}
                        className="text-green-400"
                    />

                    <p className="text-sm text-blue-400 font-semibold">
                      Sala criada com sucesso!
                    </p>
                  </div>

                  <p className="text-gray-400 text-xs mb-3">
                    Compartilhe este endereço com quem irá transmitir.
                  </p>

                  <div className="flex flex-col md:flex-row gap-3">

                    <input
                        readOnly
                        value={generatedLink}
                        className="flex-1 min-w-0 bg-[#080b14] border border-white/10 rounded-lg px-3 py-3 text-sm text-gray-300"
                    />

                    <button
                        onClick={copyLink}
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      Copiar link
                    </button>

                  </div>

                </div>
            )}

            {/* ESTADO VAZIO */}

            <div className="border border-dashed border-white/15 rounded-2xl py-16 flex flex-col items-center text-center">

              <div className="bg-blue-500/10 p-5 rounded-2xl mb-5">
                <Camera
                    size={36}
                    className="text-blue-400"
                />
              </div>

              <h4 className="font-semibold text-lg">
                Nenhuma transmissão ativa
              </h4>

              <p className="text-gray-500 text-sm mt-2 max-w-sm">
                Quando um dispositivo iniciar uma transmissão autorizada, ele aparecerá aqui.
              </p>

            </div>

          </div>

          {/* RODAPÉ */}

          <footer className="mt-8 flex items-center gap-2 text-gray-600 text-xs">

            <ShieldCheck size={15} />

            CamConnect — Conexões privadas e autorizadas.

          </footer>

        </section>

      </main>
  );
}
