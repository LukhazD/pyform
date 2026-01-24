"use client";

import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CreateFormModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function CreateFormModal({ isOpen, onOpenChange }: CreateFormModalProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");

    const createForm = async () => {
        const response = await fetch("/api/forms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            throw new Error("Failed to create form");
        }

        return response.json();
    };

    const mutation = useMutation({
        mutationFn: createForm,
        onSuccess: (data) => {
            toast.success("Formulario creado correctamente");
            onOpenChange(false);
            router.push(`/editor/${data._id || data.shortId}`);
            setTitle("");
        },
        onError: () => {
            toast.error("Error al crear el formulario");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        mutation.mutate();
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            radius="lg"
            classNames={{
                backdrop: "bg-black/50 backdrop-blur-sm",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={handleSubmit}>
                        <ModalHeader className="flex flex-col gap-1">
                            Crear nuevo formulario
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus
                                label="Título del formulario"
                                placeholder="Ej. Encuesta de satisfacción"
                                variant="bordered"
                                radius="full"
                                value={title}
                                onValueChange={setTitle}
                                isDisabled={mutation.isPending}
                                classNames={{
                                    inputWrapper: "border-gray-300 data-[hover=true]:border-gray-400 group-data-[focus=true]:border-purple-500",
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                radius="full"
                                isDisabled={mutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                color="secondary"
                                type="submit"
                                radius="full"
                                className="bg-purple-500 text-white font-medium"
                                isLoading={mutation.isPending}
                            >
                                Crear formulario
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
}
