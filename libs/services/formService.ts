import Form, { IForm } from "@/models/Form";
import Question from "@/models/Question";
import Submission from "@/models/Submission";
import FormAnalytics from "@/models/FormAnalytics";
import connectMongo from "@/libs/mongoose";
import { nanoid } from "nanoid";
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

        // Generate a collision-resistant shortId with retry logic.
        // nanoid(10) gives 64^10 ≈ 1.15e18 combinations vs Math.random's 36^6 ≈ 2.17e9
        const MAX_RETRIES = 3;
        let shortId: string = "";
        for (let i = 0; i < MAX_RETRIES; i++) {
            shortId = nanoid(10);
            const exists = await Form.exists({ shortId });
            if (!exists) break;
            if (i === MAX_RETRIES - 1) {
                throw new Error("Failed to generate unique form ID. Please try again.");
            }
        }

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
        if (mongoose.Types.ObjectId.isValid(formId)) {
            return await Form.findById(formId);
        }
        return await Form.findOne({ shortId: formId });
    }

    async updateForm(formId: string, data: Partial<IForm>): Promise<IForm | null> {
        await connectMongo();
        const query = mongoose.Types.ObjectId.isValid(formId)
            ? { _id: formId }
            : { shortId: formId };

        const form = await Form.findOneAndUpdate(query, data, { new: true });
        return form;
    }

    async deleteForm(formId: string): Promise<boolean> {
        await connectMongo();
        const query = mongoose.Types.ObjectId.isValid(formId)
            ? { _id: formId }
            : { shortId: formId };

        const result = await Form.findOneAndDelete(query);
        if (!result) return false;

        // Cascade delete: clean up orphaned documents
        const formObjectId = result._id;
        await Promise.all([
            Question.deleteMany({ formId: formObjectId }),
            Submission.deleteMany({ formId: formObjectId }),
            FormAnalytics.deleteOne({ formId: formObjectId }),
        ]);

        return true;
    }

    async listUserForms(userId: string, limit: number = 20): Promise<IForm[]> {
        await connectMongo();
        return await Form.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export const formService = new FormService();
