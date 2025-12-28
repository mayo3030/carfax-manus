import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createVinSubmission,
  createVehicleReport,
  getAllAdminSettings,
  getAllVehicleReports,
  getPendingVinSubmissions,
  getVehicleReportByVin,
  getVehicleReportByVinSubmissionId,
  getVinSubmissionById,
  getVinSubmissionsByUser,
  setAdminSetting,
  updateVinSubmissionStatus,
} from "./db";
import {
  storeCarfaxCredentials,
  getCarfaxCredentials,
  updateSessionCookie,
  getValidSessionCookie,
} from "./sessionDb";
import { getApifyClient } from "./apify-client";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  vin: router({
    // Submit a single VIN for scraping
    submitSingle: protectedProcedure
      .input(z.object({ vin: z.string().length(17) }))
      .mutation(async ({ ctx, input }) => {
        const submission = await createVinSubmission({
          userId: ctx.user.id,
          vin: input.vin.toUpperCase(),
          status: "pending",
        });
        return { success: true, submissionId: submission.id };
      }),

    // Submit multiple VINs for scraping
    submitBulk: protectedProcedure
      .input(z.object({ vins: z.array(z.string().length(17)) }))
      .mutation(async ({ ctx, input }) => {
        const submissions = [];
        for (const vin of input.vins) {
          const submission = await createVinSubmission({
            userId: ctx.user.id,
            vin: vin.toUpperCase(),
            status: "pending",
          });
          submissions.push(submission.id);
        }
        return { success: true, submissionIds: submissions };
      }),

    // Get all VIN submissions for current user
    getMySubmissions: protectedProcedure.query(async ({ ctx }) => {
      return getVinSubmissionsByUser(ctx.user.id);
    }),

    // Get a specific VIN submission
    getSubmission: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const submission = await getVinSubmissionById(input.id);
        if (!submission || submission.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return submission;
      }),
  }),

  reports: router({
    // Get all vehicle reports for current user
    getMyReports: protectedProcedure.query(async ({ ctx }) => {
      return getAllVehicleReports(ctx.user.id);
    }),

    // Get a specific vehicle report by VIN
    getByVin: protectedProcedure
      .input(z.object({ vin: z.string().length(17) }))
      .query(async ({ ctx, input }) => {
        return getVehicleReportByVin(input.vin.toUpperCase());
      }),

    // Get report by submission ID
    getBySubmissionId: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const submission = await getVinSubmissionById(input.submissionId);
        if (!submission || submission.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return getVehicleReportByVinSubmissionId(input.submissionId);
      }),
  }),

  admin: router({
    // Get all pending submissions (admin only)
    getPendingQueue: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return getPendingVinSubmissions();
    }),

    // Get admin settings
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return getAllAdminSettings();
    }),

    // Update admin setting
    updateSetting: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await setAdminSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // Export endpoints
  export: router({
    // Export report as JSON
    json: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const submission = await getVinSubmissionById(input.submissionId);
        if (!submission || submission.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const report = await getVehicleReportByVinSubmissionId(input.submissionId);
        if (!report) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
        }
        return report;
      }),

    // Export report as CSV data
    csv: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const submission = await getVinSubmissionById(input.submissionId);
        if (!submission || submission.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const report = await getVehicleReportByVinSubmissionId(input.submissionId);
        if (!report) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
        }

        // Convert report to CSV format
        const csvData = [
          ["Field", "Value"],
          ["VIN", report.vin],
          ["Year", report.year?.toString() || ""],
          ["Make", report.make || ""],
          ["Model", report.model || ""],
          ["Trim", report.trim || ""],
          ["Mileage", report.mileage?.toString() || ""],
          ["Price", report.price?.toString() || ""],
          ["Color", report.color || ""],
          ["Engine Type", report.engineType || ""],
          ["Transmission", report.transmission || ""],
          ["Accident Count", report.accidentCount?.toString() || "0"],
          ["Owner Count", report.ownerCount?.toString() || "0"],
          ["Service Record Count", report.serviceRecordCount?.toString() || "0"],
        ];

        return {
          csv: csvData.map(row => row.join(",")).join("\n"),
          filename: `carfax_${report.vin}_${Date.now()}.csv`,
        };
      }),
  }),

  // Session management for Carfax credentials
  session: router({
    storeCredentials: protectedProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await storeCarfaxCredentials(ctx.user.id, input.username, input.password);
        return { success: true };
      }),

    getCredentials: protectedProcedure.query(async ({ ctx }) => {
      const creds = await getCarfaxCredentials(ctx.user.id);
      if (!creds) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No credentials stored" });
      }
      return creds;
    }),

    updateCookie: publicProcedure
      .input(z.object({ userId: z.number(), cookie: z.string(), expiresAt: z.string() }))
      .mutation(async ({ input }) => {
        await updateSessionCookie(input.userId, input.cookie, new Date(input.expiresAt));
        return { success: true };
      }),

    getSessionCookie: protectedProcedure.query(async ({ ctx }) => {
      const cookie = await getValidSessionCookie(ctx.user.id);
      return { cookie, hasValidSession: !!cookie };
    }),
  }),

  // Apify integration for scraping
  apify: router({
    // Test Apify connection
    testConnection: publicProcedure.query(async () => {
      try {
        const apifyClient = getApifyClient();
        const accountInfo = await apifyClient.getAccountInfo();
        return {
          success: true,
          userId: accountInfo.id,
          email: accountInfo.email,
          message: "Apify connection successful",
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),
  }),

  // Webhook endpoint for n8n to update submission status
  webhook: router({
    updateStatus: publicProcedure
      .input(
        z.object({
          submissionId: z.number(),
          status: z.enum(["pending", "processing", "completed", "failed"]),
          errorMessage: z.string().optional(),
          reportData: z
            .object({
              vin: z.string(),
              year: z.number().optional(),
              make: z.string().optional(),
              model: z.string().optional(),
              trim: z.string().optional(),
              mileage: z.number().optional(),
              price: z.number().optional(),
              color: z.string().optional(),
              engineType: z.string().optional(),
              transmission: z.string().optional(),
              accidentCount: z.number().optional(),
              ownerCount: z.number().optional(),
              serviceRecordCount: z.number().optional(),
              accidentHistory: z.string().optional(),
              serviceHistory: z.string().optional(),
              ownershipHistory: z.string().optional(),
              titleInfo: z.string().optional(),
              additionalData: z.string().optional(),
            })
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateVinSubmissionStatus(
          input.submissionId,
          input.status,
          input.errorMessage
        );

        if (input.status === "completed" && input.reportData) {
          await createVehicleReport({
            vinSubmissionId: input.submissionId,
            ...input.reportData,
          });
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
