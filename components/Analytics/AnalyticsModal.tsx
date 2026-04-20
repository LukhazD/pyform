"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { BarChart3 } from "lucide-react";
import AnalyticsView from "./AnalyticsView";
import { IFormAnalytics } from "@/models/FormAnalytics";
import { useTranslations } from "next-intl";

interface AnalyticsModalProps {
    data: IFormAnalytics | null;
    formTitle: string;
}

export default function AnalyticsModal({ data, formTitle }: AnalyticsModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const t = useTranslations("analytics");
    const tCommon = useTranslations("common");

    return (
        <>
            <Button
                onPress={onOpen}
                color="secondary"
                variant="flat"
                startContent={<BarChart3 size={18} />}
                className="bg-gray-100 text-gray-900 font-medium"
            >
                {t("viewStats")}
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
                                <span className="text-xl font-bold">{t("statsOf", { title: formTitle })}</span>
                                <span className="text-sm text-gray-500 font-normal">{t("detailedStats")}</span>
                            </ModalHeader>
                            <ModalBody className="pb-8">
                                <AnalyticsView data={data} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    {tCommon("close")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
