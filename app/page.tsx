
"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [generatedLink, setGeneratedLink] = useState("");

  async function generateCameraLink() {
    const roomId = crypto.randomUUID();

    const link = `${window.location.origin}/camera/${roomId}`;

    setGeneratedLink(link);

    try {
      await navigator.clipboard.writeText(link);
    } catch {
      console.log("Link gerado:", link);
    }
  }

  return (
      <main className="min-h-screen bg-[#080b14] text-white flex">
        <aside className="w-64 border-r border-white/10 p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Camera size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl">CamConnect</h1>
              <p className="text-xs text-gray-500">Remote Camera System</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 uppercase">
            Menu principal
          </p>

          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "Dispositivos", icon: Monitor },
            { name: "Configurações", icon: Settings },
          ].map((item) => (
              <button
                  key={item.name}
                  onClick={generateCameraLink}
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

          {generatedLink && (
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400 font-semibold mb-2">
                  Link de transmissão criado!
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <input
                      readOnly
                      value={generatedLink}
                      className="flex-1 bg-[#080b14] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                  />

                  <button
                      onClick={() => navigator.clipboard.writeText(generatedLink)}
                      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
          )}

          <div className="mt-auto border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Sistema online
            </div>
            <p className="text-xs text-gray-500 mt-2">
              CamConnect v1.0
            </p>
          </div>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold">{activeTab}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Gerencie suas transmissões de câmera.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-full">
              <Wifi size={16} />
              Servidor online
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { label: "Dispositivos", value: "0", icon: Monitor },
              { label: "Transmissões ativas", value: "0", icon: Radio },
              { label: "Status do sistema", value: "Online", icon: Activity },
            ].map((stat) => (
                <div key={stat.label} className="bg-[#111725] border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between text-gray-400 mb-5">
                    <span className="text-sm">{stat.label}</span>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
            ))}
          </div>

          <div className="bg-[#111725] border border-white/10 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold">Transmissões</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Visualize os dispositivos que autorizaram compartilhar suas câmeras.
                </p>
              </div>

              <button
                  className="bg-blue-600 hover:bg-blue-500 transition rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium"
                  onClick={generateCameraLink}
              >
                <Plus size={18} />
                Gerar link
              </button>
            </div>

            <div className="border border-dashed border-white/15 rounded-2xl py-16 flex flex-col items-center text-center">
              <div className="bg-blue-500/10 p-5 rounded-2xl mb-5">
                <Camera size={36} className="text-blue-400" />
              </div>
              <h4 className="font-semibold text-lg">
                Nenhuma transmissão ativa
              </h4>
              <p className="text-gray-500 text-sm mt-2 max-w-sm">
                Quando um dispositivo iniciar uma transmissão autorizada,
                ele aparecerá aqui.
              </p>
            </div>
          </div>

          <footer className="mt-8 flex items-center gap-2 text-gray-600 text-xs">
            <ShieldCheck size={15} />
            CamConnect — Conexões privadas e autorizadas.
          </footer>
        </section>
      </main>
  );
}
