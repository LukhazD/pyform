import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle gradient orbs for depth */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 md:px-8 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Tu próximo formulario,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            en minutos
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Editor en vivo, analíticas incluidas y un precio que no cambia con el
          éxito de tus formularios. Sin sorpresas.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-white">15</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">
              Tipos de pregunta
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-white">∞</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">
              Respuestas incluidas
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-2xl md:text-3xl font-bold text-white">&lt;5m</div>
            <div className="text-xs md:text-sm text-gray-400 mt-1">
              Para crear un formulario
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          Crear mi primer formulario
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
