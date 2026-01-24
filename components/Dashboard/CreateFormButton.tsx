"use client";

import { Button, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import CreateFormModal from "@/components/Modals/CreateFormModal";

export default function CreateFormButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button
                onPress={onOpen}
                radius="full"
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6"
                startContent={<Plus size={20} />}
            >
                Nuevo formulario
            </Button>

            <CreateFormModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </>
    );
}
