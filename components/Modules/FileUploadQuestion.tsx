"use client";

import React, { useState, useRef } from "react";
import { Card, Progress } from "@heroui/react";
import { Upload, File as FileIcon, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    title?: string;
    description?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
}

interface FileUploadQuestionProps {
    module: Module;
    value?: string | File;
    onChange?: (_v: string | File) => void;
    isPreview?: boolean;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
    formId?: string;
}

export default function FileUploadQuestion({ module, value, onChange, primaryColor, radius = "lg", shadow = "sm", formId }: FileUploadQuestionProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        if (!formId) {
            toast.error("Error intencionado: Falta ID del formulario");
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            // 1. Get Presigned URL
            const { data } = await axios.post("/api/storage/presigned", {
                formId,
                fileType: file.type,
                fileName: file.name
            });

            // 2. Upload to S3/MinIO
            await axios.put(data.uploadUrl, file, {
                headers: { "Content-Type": file.type },
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded * 100) / (p.total || file.size));
                    setProgress(percent);
                }
            });

            // 3. Save Key
            if (onChange) {
                // We save the key. The backend knows how to find it.
                // We also strip the key to just the filename for display if needed?
                // Saving the full key is safest.
                onChange(data.key);
            }
            setFileName(file.name);
            toast.success("Archivo subido correctamente");

        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Error al subir el archivo");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) await uploadFile(file);
    };

    // If value exists (it's a string key), we show "File uploaded"
    const isUploaded = !!value && typeof value === "string" && value.length > 0;

    return (
        <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center p-4 md:p-8">
            <Card shadow={shadow} radius={radius === "full" ? "lg" : radius} className="max-w-2xl w-full p-6 md:p-10 bg-white">
                <div className="space-y-6">
                    <div>
                        <label className="text-xl md:text-2xl font-semibold text-gray-900 block mb-2">
                            {module.title || "Subir archivo"}
                            {module.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {module.description && (
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />

                    {!isUploaded ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${uploading ? 'border-primary bg-primary/5 cursor-wait' : 'border-gray-300 hover:border-primary'}`}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={!uploading ? handleDrop : undefined}
                        >
                            {uploading ? (
                                <div className="py-4">
                                    <p className="text-primary font-medium mb-2">Subiendo {progress}%...</p>
                                    <Progress value={progress} size="sm" color="primary" className="max-w-xs mx-auto" />
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                                    <p className="text-gray-700 font-medium mb-1">
                                        Arrastra archivos aquí
                                    </p>
                                    <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Máximo 10MB • PDF, DOC, JPG, PNG
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="border border-green-200 bg-green-50 rounded-lg p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full text-green-600">
                                    <FileIcon size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-green-800">Archivo subido</p>
                                    <p className="text-xs text-green-600 break-all">{fileName || (typeof value === 'string' ? value.split('_').pop() : 'Archivo')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (onChange) onChange(""); // Clear
                                    setFileName("");
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
