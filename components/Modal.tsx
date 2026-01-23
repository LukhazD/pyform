"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title?: React.ReactNode;
  isFullScreen?: boolean;
}

const Modal = ({ isModalOpen, setIsModalOpen, children, title, isFullScreen = false }: ModalProps) => {
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsModalOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className={`flex min-h-full items-center justify-center text-center ${isFullScreen ? 'p-0' : 'p-4'}`}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`transform overflow-hidden bg-white text-left align-middle shadow-xl transition-all 
                  ${isFullScreen
                    ? 'w-full h-screen rounded-none p-6 md:p-8 flex flex-col'
                    : 'w-full max-w-md rounded-2xl p-6'
                  }`}
              >
                <div className={`flex justify-between items-center ${isFullScreen ? 'mb-8' : 'mb-4'}`}>
                  {title && (
                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                  )}
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-2 text-gray-800 flex-1">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
