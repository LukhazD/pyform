"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "¿Qué tipos de preguntas puedo crear?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Pyform incluye <strong>15 tipos de preguntas</strong> listos para usar:
          texto corto, texto largo, email, teléfono, número, URL, fecha,
          desplegable, opción múltiple, casillas de verificación, subida de
          archivos, y módulos especiales como bienvenida, despedida y citas.
        </p>
        <p>
          Cada módulo es personalizable: puedes marcarlos como obligatorios,
          añadir descripciones y reordenarlos con arrastrar y soltar.
        </p>
      </div>
    ),
  },
  {
    question: "¿Cómo funciona el editor?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Nuestro editor es <strong>WYSIWYG en tiempo real</strong>: lo que ves
          mientras editas es exactamente lo que verán tus usuarios. Arrastra
          módulos para reordenarlos, edita propiedades en el panel lateral, y ve
          los cambios reflejados al instante sin modo de vista previa separado.
        </p>
        <p>
          Funciona tanto en escritorio como en móvil, con una interfaz adaptada
          a cada pantalla.
        </p>
      </div>
    ),
  },
  {
    question: "¿Qué analíticas están incluidas?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Cada formulario incluye un panel completo de analíticas con: tasa de
          finalización, tiempo promedio de respuesta, línea de tiempo de envíos
          y un <strong>funnel de abandono</strong> que te muestra exactamente en
          qué pregunta pierdes usuarios.
        </p>
        <p>
          También puedes ver cada respuesta individual y exportar todo a CSV con
          un clic.
        </p>
      </div>
    ),
  },
  {
    question: "¿Puedo personalizar el diseño de mis formularios?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Sí. Desde el panel de ajustes del editor puedes cambiar el{" "}
          <strong>color primario, la tipografía, el radio de bordes y las sombras</strong>.
          Todos los cambios se aplican en tiempo real al formulario.
        </p>
        <p>
          Tu formulario se verá profesional y coherente con tu marca sin
          necesidad de escribir una línea de CSS.
        </p>
      </div>
    ),
  },
  {
    question: "¿Cómo funciona la suscripción?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Pyform utiliza una <strong>tarifa plana mensual</strong>. No cobramos
          por respuesta, así que no importa si tu formulario recibe 10 o 10.000
          envíos — tu precio no cambia.
        </p>
        <p>
          Todas las funcionalidades están incluidas desde el primer día, sin
          planes ocultos ni upgrades forzados. Puedes cancelar cuando quieras.
        </p>
      </div>
    ),
  },
  {
    question: "¿Puedo recibir archivos en mis formularios?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          Sí. El módulo de <strong>subida de archivos</strong> permite a tus
          usuarios adjuntar documentos, imágenes u otros archivos directamente
          en el formulario. Puedes previsualizar los archivos recibidos desde el
          panel de respuestas.
        </p>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="group">
      <button
        className={`relative flex gap-4 items-center w-full py-5 px-6 text-base font-semibold text-left rounded-2xl transition-all duration-200 ${isOpen
          ? "bg-white shadow-sm ring-1 ring-gray-200"
          : "hover:bg-gray-100/80"
          }`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors duration-200 ${isOpen
            ? "bg-gray-900 text-white"
            : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
            }`}
        >
          {isOpen ? "−" : "+"}
        </span>
        <span
          className={`flex-1 ${isOpen ? "text-gray-900" : "text-gray-700"
            }`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-gray-900" : "text-gray-400"
            }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="px-6 pb-5 pt-2 ml-14 text-gray-600 leading-relaxed">
          {item?.answer}
        </div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-gray-50 py-20 md:py-28 overflow-hidden" id="faq">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Todo lo que necesitas saber
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Respuestas a las preguntas más comunes sobre Pyform y cómo puede
            ayudarte.
          </p>
        </div>

        {/* Questions */}
        <ul className="flex flex-col gap-2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
