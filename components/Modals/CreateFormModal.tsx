/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface CreateFormModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function
    CreateFormModal({ isOpen, onOpenChange }: CreateFormModalProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const createForm = async () => {
        const response = await fetch("/api/forms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
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
            // Navigate first, then close modal (keeps loading visible during navigation)
            router.push(`/dashboard/forms/${data._id || data.shortId}/edit`);
            // Modal will close automatically when page navigates away
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
            radius="md"
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
                                radius="md"
                                value={title}
                                onValueChange={setTitle}
                                isDisabled={mutation.isPending}
                                classNames={{
                                    inputWrapper: "border-gray-300 data-[hover=true]:border-gray-400 group-data-[focus=true]:border-gray-900",
                                }}
                            />
                            <Textarea
                                label="Descripción (opcional)"
                                placeholder="Breve descripción del propósito del formulario. (Solo tú la verás)"
                                variant="bordered"
                                radius="md"
                                value={description}
                                onValueChange={setDescription}
                                isDisabled={mutation.isPending}
                                classNames={{
                                    inputWrapper: "border-gray-300 data-[hover=true]:border-gray-400 group-data-[focus=true]:border-gray-900",
                                }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                radius="md"
                                isDisabled={mutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                color="secondary"
                                type="submit"
                                radius="md"
                                className="bg-primary text-white font-medium shadow-lg hover:bg-gray-700"
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
