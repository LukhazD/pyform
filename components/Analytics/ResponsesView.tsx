"use client";

import { useState, useMemo } from "react";
import {
    Card, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,
} from "@heroui/react";
import { IQuestion } from "@/models/Question";
import { ISubmission } from "@/models/Submission";
import { Calendar, Smartphone, Monitor, Search, ChevronRight, User as UserIcon, BarChart3 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ResponsesViewProps {
    questions: IQuestion[];
    submissions: ISubmission[];
}

const CHART_COLORS = [
    "#1a1a1a", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
    "#06b6d4", "#d946ef", "#eab308", "#22c55e", "#64748b",
    "#a855f7", "#0ea5e9", "#f43f5e", "#84cc16", "#a3e635"
];

export default function ResponsesView({ questions, submissions }: ResponsesViewProps) {
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questions.length > 0 ? String(questions[0]._id) : null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Preview Modal State
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onOpenChange: onPreviewChange } = useDisclosure();

    const handlePreview = (key: string) => {
        setPreviewFile(key);
        onPreviewOpen();
    };

    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
        return 'other';
    };

    const questionsWithAnswers = useMemo(() => {
        return questions.filter(q =>
            !["WELCOME", "GOODBYE", "QUOTE"].includes(q.type)
        );
    }, [questions]);

    // Helper to find respondent identifier (e.g. email) for a submission
    const getRespondentLabel = (submission: ISubmission) => {
        const emailQuestion = questions.find(q => q.type === "EMAIL");
        if (emailQuestion) {
            const answer = submission.answers.find(a => String(a.questionId) === String(emailQuestion._id));
            if (answer && answer.value) return String(answer.value);
        }
        return `Anon ${submission._id.toString().slice(-4)}`;
    };

    // Derived state for the selected question analysis
    const analysis = useMemo(() => {
        if (!selectedQuestionId) return null;

        const question = questions.find(q => String(q._id) === selectedQuestionId);
        if (!question) return null;

        const answerData = submissions.map(s => {
            const ans = s.answers.find(a => String(a.questionId) === selectedQuestionId);
            if (!ans || ans.value === null || ans.value === undefined || ans.value === "") return null;
            return {
                id: String(s._id),
                value: ans.value,
                submittedAt: s.submittedAt,
                respondent: getRespondentLabel(s),
                metadata: s.metadata
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        const totalAnswers = answerData.length;

        // Grouping for charts
        const distribution: Record<string, { count: number; percentage: number; color: string }> = {};
        const isChoiceType = ["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES"].includes(question.type);

        if (isChoiceType) {
            const rawCounts: Record<string, number> = {};

            // Initialize counts for all defined options
            if (question.options && Array.isArray(question.options)) {
                question.options.forEach(opt => {
                    rawCounts[opt.label] = 0;
                });
            }

            answerData.forEach(item => {
                const vals = Array.isArray(item.value) ? item.value : [item.value];
                vals.forEach(v => {
                    const key = String(v);
                    // Only count if it's a known option or if we want to support "Other" (dynamic)
                    // For now, we add it if it didn't exist (handling dynamic/other values)
                    rawCounts[key] = (rawCounts[key] || 0) + 1;
                });
            });

            Object.entries(rawCounts).forEach(([label, count], index) => {
                distribution[label] = {
                    count,
                    percentage: Math.round((count / totalAnswers) * 100),
                    color: CHART_COLORS[index % CHART_COLORS.length]
                };
            });
        }

        return {
            question,
            totalAnswers,
            answerData,
            distribution,
            isChoiceType
        };
    }, [selectedQuestionId, submissions, questions]);

    useGSAP(() => {
        if (analysis?.isChoiceType) {
            gsap.from(".chart-bar", {
                width: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power2.out"
            });
        }
    }, [analysis]);

    if (!analysis) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Question Analysis Section */}
            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Análisis Detallado</h3>
                    <Select
                        label="Pregunta"
                        placeholder="Selecciona una pregunta"
                        className="max-w-md"
                        selectedKeys={selectedQuestionId ? [selectedQuestionId] : []}
                        onChange={(e) => {
                            if (e.target.value) setSelectedQuestionId(e.target.value);
                        }}
                        disallowEmptySelection
                        startContent={<Search size={16} className="text-gray-400" />}
                    >
                        {questionsWithAnswers.map((q) => (
                            <SelectItem key={String(q._id)} textValue={q.title}>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{q.title}</span>
                                    <span className="text-xs text-gray-400 capitalize">{q.type.toLowerCase().replace("_", " ")}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
                    <div className="p-6 bg-white">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Chip size="sm" color="secondary" variant="flat" className="capitalize">
                                        {analysis.question.type.toLowerCase().replace("_", " ")}
                                    </Chip>
                                    <span className="text-sm text-gray-500">{analysis.totalAnswers} respuestas</span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 leading-tight">{analysis.question.title}</h4>
                            </div>
                        </div>

                        {/* Visualization Logic */}
                        <div className="mt-4">
                            {analysis.isChoiceType ? (
                                analysis.totalAnswers === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <BarChart3 size={48} className="text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">No hay datos para visualizar</p>
                                        <p className="text-sm text-gray-400 mt-1">Las respuestas a esta pregunta aparecerán aquí como gráficas.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Chart Area */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {Object.entries(analysis.distribution).map(([label, data]) => (
                                                <div key={label} className="group">
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-medium text-gray-700">{label}</span>
                                                        <span className="text-gray-500 font-mono">{data.percentage}%</span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="chart-bar h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${data.percentage}%`, backgroundColor: data.color }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Legend Area */}
                                        <div className="bg-gray-50 rounded-xl p-5 h-fit">
                                            <h5 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Leyenda</h5>
                                            <div className="space-y-3">
                                                {Object.entries(analysis.distribution).map(([label, data]) => (
                                                    <div key={label} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: data.color }}
                                                            />
                                                            <span className="truncate text-gray-600 font-medium">{label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">
                                                            <span className="font-bold text-gray-900">{data.count}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-6">
                                    {/* Text/List List Preview */}
                                    <div className="grid gap-3">
                                        {analysis.answerData.slice(0, 5).map((item, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group">
                                                {analysis.question.type === "FILE_UPLOAD" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        onPress={() => handlePreview(String(item.value))}
                                                        startContent={
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                        }
                                                    >
                                                        Ver Archivo
                                                    </Button>
                                                ) : (
                                                    <p className="text-gray-800 font-medium mb-2">{String(item.value)}</p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1 text-purple-600/70 bg-purple-50 px-2 py-0.5 rounded-full">
                                                        <UserIcon size={12} />
                                                        <span className="font-medium truncate max-w-[150px]">{item.respondent}</span>
                                                    </div>
                                                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {analysis.totalAnswers > 5 && (
                                        <Button
                                            variant="flat"
                                            color="secondary"
                                            className="w-full font-medium"
                                            endContent={<ChevronRight size={16} />}
                                            onPress={onOpen}
                                        >
                                            Ver las {analysis.totalAnswers} respuestas
                                        </Button>
                                    )}
                                    {analysis.totalAnswers === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            Sin respuestas aún
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </section>

            {/* Modal for Full List */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <span className="text-xl">Respuestas: {analysis.question.title}</span>
                                <span className="text-sm text-gray-500 font-normal">Listado completo de {analysis.totalAnswers} respuestas</span>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-3 pb-4">
                                    {analysis.answerData.map((item, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            {analysis.question.type === "FILE_UPLOAD" ? (
                                                <div className="mb-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        onPress={() => handlePreview(String(item.value))}
                                                        startContent={
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                        }
                                                    >
                                                        Ver Archivo
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-800 font-medium mb-2">{String(item.value)}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-purple-600">{item.respondent}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.metadata?.deviceType === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                                                    <span>{new Date(item.submittedAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onOpenChange={onPreviewChange} size="3xl">
                <ModalContent>
                    {(onClose) => {
                        const fileUrl = previewFile ? `/api/storage/view?key=${encodeURIComponent(previewFile)}` : '';
                        const fileType = previewFile ? getFileType(previewFile) : 'other';

                        return (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Vista Previa
                                </ModalHeader>
                                <ModalBody className="p-0 bg-gray-100 flex items-center justify-center min-h-[400px]">
                                    {fileType === 'image' && (
                                        <img src={fileUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain" />
                                    )}
                                    {fileType === 'pdf' && (
                                        <iframe src={fileUrl} className="w-full h-[70vh]" title="PDF Preview" />
                                    )}
                                    {fileType === 'other' && (
                                        <div className="text-center p-8">
                                            <p className="mb-4 text-gray-500">Vista previa no disponible para este tipo de archivo.</p>
                                        </div>
                                    )}
                                </ModalBody>
                                <ModalFooter className="justify-between">
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cerrar
                                    </Button>
                                    <Button
                                        as="a"
                                        href={fileUrl}
                                        download
                                        color="primary"
                                        startContent={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                                    >
                                        Descargar Original
                                    </Button>
                                </ModalFooter>
                            </>
                        )
                    }}
                </ModalContent>
            </Modal>

            {/* Recent Submissions Table */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Registro de Actividad</h3>
                </div>
                {submissions.length === 0 ? (
                    <Card className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 shadow-none">
                        <p className="text-gray-500">Aún no hay respuestas registradas.</p>
                    </Card>
                ) : (
                    <Table aria-label="Tabla de respuestas recientes" selectionMode="none" classNames={{ wrapper: "shadow-sm border border-gray-100" }}>
                        <TableHeader>
                            <TableColumn>USUARIO</TableColumn>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>DISPOSITIVO</TableColumn>
                            <TableColumn>ESTADO</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((sub) => (
                                <TableRow key={String(sub._id)}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                {getRespondentLabel(sub).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{getRespondentLabel(sub)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-700">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {sub.metadata?.deviceType === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                                            <span className="capitalize text-gray-600">{sub.metadata?.deviceType || 'Web'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            color={sub.status === 'completed' ? "success" : "warning"}
                                            variant="flat"
                                            className="font-medium"
                                        >
                                            {sub.status === 'completed' ? 'Completado' : 'Parcial'}
                                        </Chip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </section>
        </div>
    );
}
