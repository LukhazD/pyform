import Form, { IForm } from "@/models/Form";
import Question from "@/models/Question";
import connectMongo from "@/libs/mongoose";

import mongoose from "mongoose";

export interface IFormService {
    createForm(userId: string, title: string): Promise<IForm>;
    getForm(formId: string): Promise<IForm | null>;
    updateForm(formId: string, data: Partial<IForm>): Promise<IForm | null>; // UML return type is Promise<Form> (which implies IForm here, but nullable is safer if not found, though UML says Promise<Form> usually implies non-null return or throwing)
    deleteForm(formId: string): Promise<boolean>;
    listUserForms(userId: string, limit?: number): Promise<IForm[]>;
}

class FormService implements IFormService {
    async createForm(userId: string, title: string): Promise<IForm> {
        await connectMongo();
        // Generate a shortId (simple 6 char string for now)
        const shortId = Math.random().toString(36).substring(2, 8);

        const form = await Form.create({
            userId: new mongoose.Types.ObjectId(userId),
            title,
            shortId,
            status: "draft",
        });
        return form;
    }

    async getForm(formId: string): Promise<IForm | null> {
        await connectMongo();
        return await Form.findById(formId);
    }

    async updateForm(formId: string, data: Partial<IForm>): Promise<IForm | null> {
        await connectMongo();
        const form = await Form.findByIdAndUpdate(formId, data, { new: true });
        return form;
    }

    async deleteForm(formId: string): Promise<boolean> {
        await connectMongo();
        const result = await Form.findByIdAndDelete(formId);
        return !!result;
    }

    async listUserForms(userId: string, limit: number = 20): Promise<IForm[]> {
        await connectMongo();
        return await Form.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export const formService = new FormService();
