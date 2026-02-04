/* eslint-disable no-unused-vars */
"use client";

import React from "react";
import WelcomeModule from "./WelcomeModule";
import QuoteModule from "./QuoteModule";
import GoodbyeModule from "./GoodbyeModule";
import TextQuestion from "./TextQuestion";
import EmailQuestion from "./EmailQuestion";
import NumberQuestion from "./NumberQuestion";
import PhoneQuestion from "./PhoneQuestion";
import UrlQuestion from "./UrlQuestion";
import TextareaQuestion from "./TextareaQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import CheckboxesQuestion from "./CheckboxesQuestion";
import DropdownQuestion from "./DropdownQuestion";
import DateQuestion from "./DateQuestion";
import FileUploadQuestion from "./FileUploadQuestion";

import { FormStyling } from "@/types/FormStyling";

interface Module {
    id: string;
    type: string;
    order?: number;
    title?: string;
    description?: string;
    placeholder?: string;
    isRequired?: boolean;
    options?: Array<{ id: string; label: string; value: string; order: number }>;
    buttonText?: string;
    message?: string;
    showConfetti?: boolean;
}

interface ModuleRendererProps {
    module: Module;
    isPreview?: boolean;
    value?: any;
    onChange?: (_val: any) => void;
    onNext?: () => void;
    primaryColor?: string;
    radius?: FormStyling["heroUIRadius"];
    shadow?: FormStyling["heroUIShadow"];
    formId?: string; // Added for file uploads
}

export default function ModuleRenderer({ module, isPreview, value, onChange, onNext, primaryColor, radius, shadow, formId }: ModuleRendererProps) {
    const commonProps = {
        module,
        value,
        onChange: onChange || (() => { }),
        isPreview,
        primaryColor,
        radius,
        shadow
    };

    switch (module.type) {
        case "WELCOME":
            return <WelcomeModule module={module} onNext={onNext} primaryColor={primaryColor} radius={radius} shadow={shadow} />;
        case "QUOTE":
            return <QuoteModule module={module} />;
        case "GOODBYE":
            return <GoodbyeModule module={module} />;
        case "TEXT":
            return <TextQuestion {...commonProps} />;
        case "EMAIL":
            return <EmailQuestion {...commonProps} />;
        case "NUMBER":
            return <NumberQuestion {...commonProps} />;
        case "PHONE":
            return <PhoneQuestion {...commonProps} />;
        case "URL":
            return <UrlQuestion {...commonProps} />;
        case "TEXTAREA":
            return <TextareaQuestion {...commonProps} />;
        case "MULTIPLE_CHOICE":
            return <MultipleChoiceQuestion {...commonProps} />;
        case "CHECKBOXES":
            return <CheckboxesQuestion {...commonProps} />;
        case "DROPDOWN":
            return <DropdownQuestion {...commonProps} />;
        case "DATE":
            return <DateQuestion {...commonProps} />;
        case "FILE_UPLOAD":
            return <FileUploadQuestion {...commonProps} formId={formId} />;
        default:
            return (
                <div className="p-6 bg-gray-100 rounded-lg text-center text-gray-500">
                    Unknown module type: {module.type}
                </div>
            );
    }
}
