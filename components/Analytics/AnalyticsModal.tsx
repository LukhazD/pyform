"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { BarChart3 } from "lucide-react";
import AnalyticsView from "./AnalyticsView";
import { IFormAnalytics } from "@/models/FormAnalytics";

interface AnalyticsModalProps {
    data: IFormAnalytics | null;
    formTitle: string;
}

export default function AnalyticsModal({ data, formTitle }: AnalyticsModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button
                onPress={onOpen}
                color="secondary"
                variant="flat"
                startContent={<BarChart3 size={18} />}
                className="bg-purple-100 text-purple-700 font-medium"
            >
                Ver Analíticas
            </Button>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="5xl"
                scrollBehavior="inside"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <span className="text-xl font-bold">Analíticas de {formTitle}</span>
                                <span className="text-sm text-gray-500 font-normal">Rendimiento detallado y estadísticas</span>
                            </ModalHeader>
                            <ModalBody className="pb-8">
                                <AnalyticsView data={data} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
