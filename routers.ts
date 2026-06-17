import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  addGlucoseReading,
  getGlucoseReadings,
  addBloodPressureReading,
  getBloodPressureReadings,
  addMedication,
  getMedications,
  deleteMedication,
  markMedicationDose,
  getTodayMedicationDoses,
  addLabUpload,
  getLabUploads,
  addChatMessage,
  getChatMessages,
  getHealthNews,
  getHealthNewsCategories,
} from "./db";
import { invokeLLM } from "./_core/llm";
// import { storagePut } from "./storage"; // For future file upload integration

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Glucose tracker
  glucose: router({
    add: protectedProcedure
      .input(
        z.object({
          value: z.number().positive("Glucose value must be positive"),
          readingDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return addGlucoseReading(
          ctx.user.id,
          input.value,
          input.readingDate,
          input.notes
        );
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input, ctx }) => {
        return getGlucoseReadings(ctx.user.id, input.limit);
      }),

    stats: protectedProcedure
      .input(z.object({}))
      .query(async ({ ctx }) => {
        const readings = await getGlucoseReadings(ctx.user.id, 1000);
      if (readings.length === 0) {
        return { average: 0, min: 0, max: 0, count: 0 };
      }

      const values = readings.map((r) => Number(r.value));
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return { average: Math.round(average * 10) / 10, min, max, count: readings.length };
    }),
  }),

  // Blood pressure tracker
  bloodPressure: router({
    add: protectedProcedure
      .input(
        z.object({
          systolic: z.number().int().positive(),
          diastolic: z.number().int().positive(),
          pulse: z.number().int().positive(),
          readingDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return addBloodPressureReading(
          ctx.user.id,
          input.systolic,
          input.diastolic,
          input.pulse,
          input.readingDate,
          input.notes
        );
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input, ctx }) => {
        return getBloodPressureReadings(ctx.user.id, input.limit);
      }),

    stats: protectedProcedure
      .input(z.object({}))
      .query(async ({ ctx }) => {
        const readings = await getBloodPressureReadings(ctx.user.id, 1000);
      if (readings.length === 0) {
        return {
          systolic: { average: 0, min: 0, max: 0 },
          diastolic: { average: 0, min: 0, max: 0 },
          pulse: { average: 0, min: 0, max: 0 },
          count: 0,
        };
      }

      const systolicValues = readings.map((r) => r.systolic);
      const diastolicValues = readings.map((r) => r.diastolic);
      const pulseValues = readings.map((r) => r.pulse);

      const avg = (arr: number[]) =>
        Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

      return {
        systolic: {
          average: avg(systolicValues),
          min: Math.min(...systolicValues),
          max: Math.max(...systolicValues),
        },
        diastolic: {
          average: avg(diastolicValues),
          min: Math.min(...diastolicValues),
          max: Math.max(...diastolicValues),
        },
        pulse: {
          average: avg(pulseValues),
          min: Math.min(...pulseValues),
          max: Math.max(...pulseValues),
        },
        count: readings.length,
      };
    }),
  }),

  // Medication manager
  medications: router({
    add: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          dosage: z.string().min(1),
          frequency: z.string().min(1),
          timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return addMedication(
          ctx.user.id,
          input.name,
          input.dosage,
          input.frequency,
          input.timeOfDay
        );
      }),

    list: protectedProcedure
      .input(z.object({}))
      .query(async ({ ctx }) => {
        return getMedications(ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteMedication(input.id);
        return { success: true };
      }),

    markDose: protectedProcedure
      .input(
        z.object({
          medicationId: z.number(),
          doseDate: z.date(),
          taken: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return markMedicationDose(
          input.medicationId,
          ctx.user.id,
          input.doseDate,
          input.taken
        );
      }),

    todayDoses: protectedProcedure
      .input(z.object({ date: z.date().optional() }))
      .query(async ({ input, ctx }) => {
        const date = input.date || new Date();
        return getTodayMedicationDoses(ctx.user.id, date);
      }),
  }),

  // Lab uploads
  labs: router({
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileUrl: z.string(),
          fileKey: z.string(),
          mimeType: z.string(),
          extractedData: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return addLabUpload(
          ctx.user.id,
          input.fileName,
          input.fileUrl,
          input.fileKey,
          input.mimeType,
          input.extractedData || undefined
        );
      }),

    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getLabUploads(ctx.user.id, input.limit);
      }),
  }),

  // AI Doctor Chat
  chat: router({
    send: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        // Add user message to history
        await addChatMessage(ctx.user.id, "user", input.message);

        // Get recent health context
        const [glucoseReadings, bpReadings, medications] = await Promise.all([
          getGlucoseReadings(ctx.user.id, 10),
          getBloodPressureReadings(ctx.user.id, 10),
          getMedications(ctx.user.id),
        ]);

        // Build health context for the LLM
        const glucoseContext = glucoseReadings
          .slice(0, 3)
          .map((r) => `${r.value} mg/dL on ${r.readingDate}`)
          .join(", ") || "No recent readings";
        const bpContext = bpReadings
          .slice(0, 3)
          .map((r) => `${r.systolic}/${r.diastolic} mmHg on ${r.readingDate}`)
          .join(", ") || "No recent readings";
        const medsContext = medications
          .map((m) => `${m.name} ${m.dosage} ${m.frequency}`)
          .join(", ") || "No medications";

        const healthContext = `
User's Recent Health Data:
- Latest Glucose Readings: ${glucoseContext}
- Latest Blood Pressure: ${bpContext}
- Current Medications: ${medsContext}
`;

        // Get chat history
        const chatHistory = await getChatMessages(ctx.user.id, 20);

        // Build messages for LLM
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          {
            role: "system",
            content: `You are a helpful health assistant. You have access to the user's health data and can provide general health information and guidance. Always remind users to consult with their healthcare provider for medical advice.\n\n${healthContext}`,
          },
          ...chatHistory.map((msg) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          })),
          { role: "user", content: input.message },
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: messages as any,
        });

        const assistantMessage =
          typeof response.choices[0]?.message?.content === "string"
            ? response.choices[0].message.content
            : "I apologize, but I could not generate a response.";

        // Save assistant response
        await addChatMessage(ctx.user.id, "assistant", assistantMessage);

        return {
          userMessage: input.message,
          assistantMessage,
          timestamp: new Date(),
        };
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getChatMessages(ctx.user.id, input.limit);
      }),
  }),

  // Health news
  news: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        return getHealthNews(input.category, input.limit);
      }),

    categories: publicProcedure
      .input(z.object({}))
      .query(async () => {
        return getHealthNewsCategories();
      }),
  }),
});

export type AppRouter = typeof appRouter;
