"use client";

import { useState, useMemo } from "react";
import {
    Card, Select, SelectItem,
    Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,
    Tabs, Tab, Accordion, AccordionItem, Divider, Spinner
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
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questions.length > 0 && questions[0].type !== "WELCOME" && questions[0].type !== "GOODBYE" ? String(questions[0]._id) : questions.length > 0 ? String(questions[1]._id) : null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Preview Modal State
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onOpenChange: onPreviewChange } = useDisclosure();

    const [isPreviewLoading, setIsPreviewLoading] = useState(true);

    const handlePreview = (key: string) => {
        setPreviewFile(key);
        setIsPreviewLoading(true);
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

    // Derived state for the selected question analysis — all versions merged
    const analysis = useMemo(() => {
        if (!selectedQuestionId) return null;

        const question = questions.find(q => String(q._id) === selectedQuestionId);
        if (!question) return null;

        const isChoiceType = ["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES"].includes(question.type);

        // Build answer data from ALL submissions regardless of form version
        const allAnswerData = submissions.map(s => {
            const ans = s.answers.find(a => String(a.questionId) === selectedQuestionId);
            if (!ans || ans.value === null || ans.value === undefined || ans.value === "") return null;
            return {
                id: String(s._id),
                value: ans.value,
                submittedAt: s.submittedAt,
                respondent: getRespondentLabel(s),
                metadata: s.metadata,
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        const totalAnswers = allAnswerData.length;

        // Aggregate distribution across ALL versions
        const distribution: Record<string, { count: number; percentage: number; color: string }> = {};

        if (isChoiceType) {
            const rawCounts: Record<string, number> = {};

            // Build a value → label map so stored values (e.g. "comida_rápida")
            // resolve to the option's display label (e.g. "Comida rápida")
            const valueToLabel: Record<string, string> = {};
            if (question.options && Array.isArray(question.options)) {
                question.options.forEach(opt => {
                    rawCounts[opt.label] = 0;          // pre-seed by label
                    valueToLabel[opt.value] = opt.label; // map value → label
                });
            }

            allAnswerData.forEach(item => {
                const vals = Array.isArray(item.value) ? item.value : [item.value];
                vals.forEach(v => {
                    const raw = String(v);
                    // Resolve stored value to its label; fall back to raw if unknown
                    const key = valueToLabel[raw] ?? raw;
                    rawCounts[key] = (rawCounts[key] || 0) + 1;
                });
            });

            Object.entries(rawCounts).forEach(([label, count], index) => {
                distribution[label] = {
                    count,
                    percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
                    color: CHART_COLORS[index % CHART_COLORS.length]
                };
            });
        }

        return {
            question,
            totalAnswers,
            answerData: allAnswerData,
            distribution,
            isChoiceType,
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
        <div className="animate-in fade-in duration-500">
            <Tabs disableAnimation={true} aria-label="Opciones de Análisis" size="lg" color="primary" variant="underlined" classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary font-medium"
            }}>
                <Tab
                    key="sessions"
                    title={
                        <div className="flex items-center space-x-2">
                            <UserIcon size={18} />
                            <span>Por sesión</span>
                        </div>
                    }
                >
                    <div className="pt-2">
                        {submissions.length === 0 ? (
                            <Card className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 shadow-none">
                                <p className="text-gray-500">Aún no hay respuestas registradas.</p>
                            </Card>
                        ) : (
                            <>
                                {/* ── Desktop: scrollable table ─────────────────────────── */}
                                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                    <table className="w-full text-sm border-collapse min-w-max">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                {/* Fixed meta columns */}
                                                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">
                                                    Estado
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">
                                                    Respondente
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">
                                                    Fecha
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">
                                                    Dispositivo
                                                </th>
                                                {/* One column per question */}
                                                {questionsWithAnswers.map((q) => (
                                                    <th
                                                        key={String(q._id)}
                                                        className="text-left px-4 py-3 font-semibold text-gray-600 text-xs max-w-[180px] whitespace-normal leading-tight"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="line-clamp-2">{q.title}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {submissions.map((sub) => {
                                                const respondent = getRespondentLabel(sub);
                                                const isComplete = sub.status === 'completed';
                                                const isMobile = sub.metadata?.deviceType === 'mobile';
                                                const isTablet = sub.metadata?.deviceType === 'tablet';
                                                const dateStr = new Date(sub.submittedAt).toLocaleDateString();

                                                return (
                                                    <tr key={String(sub._id)} className="bg-white hover:bg-gray-50 transition-colors">
                                                        {/* Status */}
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isComplete
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {isComplete ? 'Completado' : 'Parcial'}
                                                            </span>
                                                        </td>
                                                        {/* Respondent */}
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                                    {respondent.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-gray-800 max-w-[140px] truncate">{respondent}</span>
                                                            </div>
                                                        </td>
                                                        {/* Date */}
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {dateStr}
                                                            </div>
                                                        </td>
                                                        {/* Device */}
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                {isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
                                                                <span>{isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Escritorio'}</span>
                                                            </div>
                                                        </td>
                                                        {/* One cell per question */}
                                                        {questionsWithAnswers.map((q) => {
                                                            const ans = sub.answers.find(a => String(a.questionId) === String(q._id));
                                                            const raw = ans?.value ?? null;

                                                            // Resolve stored option values → display labels
                                                            const vToL: Record<string, string> = {};
                                                            if (q.options && Array.isArray(q.options)) {
                                                                q.options.forEach((opt: any) => { vToL[opt.value] = opt.label; });
                                                            }
                                                            const resolveVal = (v: string) => vToL[v] ?? v;
                                                            const val = Array.isArray(raw)
                                                                ? (raw as string[]).map(resolveVal)
                                                                : raw !== null ? resolveVal(String(raw)) : null;

                                                            return (
                                                                <td key={String(q._id)} className="px-4 py-3 max-w-[200px]">
                                                                    {val === null || val === '' ? (
                                                                        <span className="text-gray-300 text-xs">—</span>
                                                                    ) : q.type === 'FILE_UPLOAD' ? (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="flat"
                                                                            className="bg-gray-900 text-white text-xs px-2 h-7"
                                                                            onPress={() => handlePreview(String(raw))}
                                                                        >
                                                                            Ver archivo
                                                                        </Button>
                                                                    ) : Array.isArray(val) ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {val.map((v, i) => (
                                                                                <span key={i} className="inline-block bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-xs font-medium">
                                                                                    {v}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="inline-block bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-xs font-medium max-w-full truncate">
                                                                            {val}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ── Mobile: accordion (unchanged) ────────────────────── */}
                                <div className="md:hidden">
                                    <Accordion variant="splitted" className="px-0">
                                        {submissions.map((sub) => {
                                            const respondent = getRespondentLabel(sub);
                                            const date = new Date(sub.submittedAt).toLocaleDateString();
                                            const time = new Date(sub.submittedAt).toLocaleTimeString();
                                            const isMobile = sub.metadata?.deviceType === 'mobile';
                                            const isComplete = sub.status === 'completed';

                                            const sessionAnswers = questionsWithAnswers.map(q => {
                                                const ans = sub.answers.find(a => String(a.questionId) === String(q._id));
                                                return {
                                                    questionTitle: q.title,
                                                    questionType: q.type,
                                                    value: ans?.value || null
                                                };
                                            }).filter(qa => qa.value !== null && qa.value !== "");

                                            return (
                                                <AccordionItem
                                                    key={String(sub._id)}
                                                    aria-label={`Sesión de ${respondent}`}
                                                    title={
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-lg">
                                                                    {respondent.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-900">{respondent}</span>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <Calendar size={12} /> {date} a las {time}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-1 text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-md">
                                                                    {isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}
                                                                    <span className="capitalize">{sub.metadata?.deviceType?.toLowerCase() == 'mobile' ? 'Móvil' : sub.metadata?.deviceType?.toLowerCase() == 'tablet' ? 'Tablet' : 'Escritorio'}</span>
                                                                </div>
                                                                <Chip size="sm" color={isComplete ? "success" : "warning"} variant="flat" className="font-medium">
                                                                    {isComplete ? 'Completado' : 'Parcial'}
                                                                </Chip>
                                                            </div>
                                                        </div>
                                                    }
                                                    className="bg-white border text-gray-800 border-gray-100 shadow-sm"
                                                >
                                                    <Divider className="mb-4" />
                                                    <div className="space-y-6 pb-2">
                                                        {sessionAnswers.length === 0 ? (
                                                            <p className="text-gray-400 italic text-sm">El usuario no respondió a ninguna pregunta rastreable.</p>
                                                        ) : (
                                                            sessionAnswers.map((item, idx) => (
                                                                <div key={idx} className="flex flex-col gap-1.5">
                                                                    <h5 className="text-sm font-medium text-gray-500 leading-tight">
                                                                        {item.questionTitle}
                                                                    </h5>
                                                                    {item.questionType === "FILE_UPLOAD" ? (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="flat"
                                                                            className="w-fit mt-1 bg-[#1a1a1a] text-white"
                                                                            onPress={() => handlePreview(String(item.value))}
                                                                            startContent={
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                            }
                                                                        >
                                                                            Ver Archivo Adjunto
                                                                        </Button>
                                                                    ) : Array.isArray(item.value) ? (
                                                                        <ul className="list-disc list-inside text-base font-bold text-gray-900">
                                                                            {item.value.map((v, i) => <li key={i}>{String(v)}</li>)}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-base font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                                            {String(item.value)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            </>
                        )}
                    </div>
                </Tab>
                <Tab
                    key="analysis"
                    title={
                        <div className="flex items-center space-x-2">
                            <BarChart3 size={18} />
                            <span>Por pregunta</span>
                        </div>
                    }
                >
                    <div className="pt-2 space-y-8">
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
                                                                <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
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
                                                                <span className="font-medium text-gray-900">{item.respondent}</span>
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


                    </div>
                </Tab>


            </Tabs>

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
                                <ModalBody className="p-0 bg-gray-100 flex items-center relative justify-center min-h-[400px]">
                                    {isPreviewLoading && fileType !== 'other' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Spinner color="primary" size="lg" />
                                        </div>
                                    )}
                                    {fileType === 'image' && (
                                        <img
                                            src={fileUrl}
                                            alt="Preview"
                                            className={`max-w-full max-h-[70vh] object-contain transition-opacity duration-300 ${isPreviewLoading ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setIsPreviewLoading(false)}
                                        />
                                    )}
                                    {fileType === 'pdf' && (
                                        <iframe
                                            src={fileUrl}
                                            className={`w-full h-[70vh] transition-opacity duration-300 ${isPreviewLoading ? 'opacity-0' : 'opacity-100'}`}
                                            title="PDF Preview"
                                            onLoad={() => setIsPreviewLoading(false)}
                                        />
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
        </div >
    );
}
