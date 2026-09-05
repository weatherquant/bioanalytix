/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod';
// File: TransactionIsolationLevel.schema.ts

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable'])

export type TransactionIsolationLevel = z.infer<typeof TransactionIsolationLevelSchema>;

// File: UserScalarFieldEnum.schema.ts

export const UserScalarFieldEnumSchema = z.enum(['id', 'name', 'email', 'emailVerified', 'image', 'createdAt', 'updatedAt', 'username', 'role', 'banned', 'banReason', 'banExpires', 'onboardingComplete', 'paymentsCustomerId', 'locale', 'displayUsername', 'twoFactorEnabled', 'lastActiveOrganizationId'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;

// File: SessionScalarFieldEnum.schema.ts

export const SessionScalarFieldEnumSchema = z.enum(['id', 'expiresAt', 'ipAddress', 'userAgent', 'userId', 'impersonatedBy', 'activeOrganizationId', 'token', 'createdAt', 'updatedAt'])

export type SessionScalarFieldEnum = z.infer<typeof SessionScalarFieldEnumSchema>;

// File: AccountScalarFieldEnum.schema.ts

export const AccountScalarFieldEnumSchema = z.enum(['id', 'accountId', 'providerId', 'userId', 'accessToken', 'refreshToken', 'idToken', 'expiresAt', 'password', 'accessTokenExpiresAt', 'refreshTokenExpiresAt', 'scope', 'createdAt', 'updatedAt'])

export type AccountScalarFieldEnum = z.infer<typeof AccountScalarFieldEnumSchema>;

// File: VerificationScalarFieldEnum.schema.ts

export const VerificationScalarFieldEnumSchema = z.enum(['id', 'identifier', 'value', 'expiresAt', 'createdAt', 'updatedAt'])

export type VerificationScalarFieldEnum = z.infer<typeof VerificationScalarFieldEnumSchema>;

// File: PasskeyScalarFieldEnum.schema.ts

export const PasskeyScalarFieldEnumSchema = z.enum(['id', 'name', 'publicKey', 'userId', 'credentialID', 'counter', 'deviceType', 'backedUp', 'transports', 'aaguid', 'createdAt'])

export type PasskeyScalarFieldEnum = z.infer<typeof PasskeyScalarFieldEnumSchema>;

// File: TwoFactorScalarFieldEnum.schema.ts

export const TwoFactorScalarFieldEnumSchema = z.enum(['id', 'secret', 'backupCodes', 'userId'])

export type TwoFactorScalarFieldEnum = z.infer<typeof TwoFactorScalarFieldEnumSchema>;

// File: OrganizationScalarFieldEnum.schema.ts

export const OrganizationScalarFieldEnumSchema = z.enum(['id', 'name', 'slug', 'logo', 'createdAt', 'metadata', 'paymentsCustomerId'])

export type OrganizationScalarFieldEnum = z.infer<typeof OrganizationScalarFieldEnumSchema>;

// File: MemberScalarFieldEnum.schema.ts

export const MemberScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'userId', 'role', 'createdAt'])

export type MemberScalarFieldEnum = z.infer<typeof MemberScalarFieldEnumSchema>;

// File: InvitationScalarFieldEnum.schema.ts

export const InvitationScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'email', 'role', 'status', 'expiresAt', 'inviterId', 'createdAt'])

export type InvitationScalarFieldEnum = z.infer<typeof InvitationScalarFieldEnumSchema>;

// File: PurchaseScalarFieldEnum.schema.ts

export const PurchaseScalarFieldEnumSchema = z.enum(['id', 'organizationId', 'userId', 'type', 'customerId', 'subscriptionId', 'priceId', 'status', 'createdAt', 'updatedAt'])

export type PurchaseScalarFieldEnum = z.infer<typeof PurchaseScalarFieldEnumSchema>;

// File: NotificationScalarFieldEnum.schema.ts

export const NotificationScalarFieldEnumSchema = z.enum(['id', 'userId', 'type', 'data', 'link', 'read', 'createdAt', 'updatedAt'])

export type NotificationScalarFieldEnum = z.infer<typeof NotificationScalarFieldEnumSchema>;

// File: UserNotificationPreferenceScalarFieldEnum.schema.ts

export const UserNotificationPreferenceScalarFieldEnumSchema = z.enum(['id', 'userId', 'type', 'target', 'createdAt'])

export type UserNotificationPreferenceScalarFieldEnum = z.infer<typeof UserNotificationPreferenceScalarFieldEnumSchema>;

// File: FeedbackScalarFieldEnum.schema.ts

export const FeedbackScalarFieldEnumSchema = z.enum(['id', 'userId', 'email', 'name', 'message', 'type', 'ipAddress', 'createdAt', 'updatedAt'])

export type FeedbackScalarFieldEnum = z.infer<typeof FeedbackScalarFieldEnumSchema>;

// File: BioHouseholdScalarFieldEnum.schema.ts

export const BioHouseholdScalarFieldEnumSchema = z.enum(['id', 'ownerUserId', 'organizationId', 'name', 'status', 'schemaVersion', 'financialState', 'onboardingDraft', 'onboardingStep', 'onboardingComplete', 'createdAt', 'updatedAt'])

export type BioHouseholdScalarFieldEnum = z.infer<typeof BioHouseholdScalarFieldEnumSchema>;

// File: BioLicenseScalarFieldEnum.schema.ts

export const BioLicenseScalarFieldEnumSchema = z.enum(['id', 'userId', 'organizationId', 'planKey', 'status', 'entitlements', 'startsAt', 'expiresAt', 'metadata', 'createdAt', 'updatedAt'])

export type BioLicenseScalarFieldEnum = z.infer<typeof BioLicenseScalarFieldEnumSchema>;

// File: BioConsentScalarFieldEnum.schema.ts

export const BioConsentScalarFieldEnumSchema = z.enum(['id', 'userId', 'type', 'documentVersion', 'granted', 'grantedAt', 'withdrawnAt', 'metadata', 'createdAt', 'updatedAt'])

export type BioConsentScalarFieldEnum = z.infer<typeof BioConsentScalarFieldEnumSchema>;

// File: BioGeneticUploadScalarFieldEnum.schema.ts

export const BioGeneticUploadScalarFieldEnumSchema = z.enum(['id', 'householdId', 'storageKey', 'originalFileName', 'provider', 'fileFormat', 'sha256', 'status', 'parserVersion', 'pipelineVersion', 'errorMessage', 'processingMetadata', 'createdAt', 'updatedAt'])

export type BioGeneticUploadScalarFieldEnum = z.infer<typeof BioGeneticUploadScalarFieldEnumSchema>;

// File: BioPlanningProfileScalarFieldEnum.schema.ts

export const BioPlanningProfileScalarFieldEnumSchema = z.enum(['id', 'householdId', 'geneticUploadId', 'profileVersion', 'profile', 'current', 'createdAt', 'updatedAt'])

export type BioPlanningProfileScalarFieldEnum = z.infer<typeof BioPlanningProfileScalarFieldEnumSchema>;

// File: BioScenarioRunScalarFieldEnum.schema.ts

export const BioScenarioRunScalarFieldEnumSchema = z.enum(['id', 'householdId', 'scenarioQuestionId', 'source', 'planningExposureId', 'parameters', 'result', 'engineVersion', 'createdAt'])

export type BioScenarioRunScalarFieldEnum = z.infer<typeof BioScenarioRunScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: JsonNullValueInput.schema.ts

export const JsonNullValueInputSchema = z.enum(['JsonNull'])

export type JsonNullValueInput = z.infer<typeof JsonNullValueInputSchema>;

// File: NullableJsonNullValueInput.schema.ts

export const NullableJsonNullValueInputSchema = z.enum(['DbNull', 'JsonNull'])

export type NullableJsonNullValueInput = z.infer<typeof NullableJsonNullValueInputSchema>;

// File: QueryMode.schema.ts

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export type QueryMode = z.infer<typeof QueryModeSchema>;

// File: NullsOrder.schema.ts

export const NullsOrderSchema = z.enum(['first', 'last'])

export type NullsOrder = z.infer<typeof NullsOrderSchema>;

// File: JsonNullValueFilter.schema.ts

export const JsonNullValueFilterSchema = z.enum(['DbNull', 'JsonNull', 'AnyNull'])

export type JsonNullValueFilter = z.infer<typeof JsonNullValueFilterSchema>;

// File: PurchaseType.schema.ts

export const PurchaseTypeSchema = z.enum(['SUBSCRIPTION', 'ONE_TIME'])

export type PurchaseType = z.infer<typeof PurchaseTypeSchema>;

// File: NotificationType.schema.ts

export const NotificationTypeSchema = z.enum(['WELCOME', 'APP_UPDATE'])

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

// File: NotificationTarget.schema.ts

export const NotificationTargetSchema = z.enum(['IN_APP', 'EMAIL'])

export type NotificationTarget = z.infer<typeof NotificationTargetSchema>;

// File: BioHouseholdStatus.schema.ts

export const BioHouseholdStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])

export type BioHouseholdStatus = z.infer<typeof BioHouseholdStatusSchema>;

// File: BioLicenseStatus.schema.ts

export const BioLicenseStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'])

export type BioLicenseStatus = z.infer<typeof BioLicenseStatusSchema>;

// File: BioGeneticUploadStatus.schema.ts

export const BioGeneticUploadStatusSchema = z.enum(['UPLOADED', 'PARSING', 'INTERPRETING', 'READY', 'FAILED', 'DELETED'])

export type BioGeneticUploadStatus = z.infer<typeof BioGeneticUploadStatusSchema>;

// File: BioScenarioSource.schema.ts

export const BioScenarioSourceSchema = z.enum(['GENETIC_PROFILE', 'LONGEVITY_PROFILE', 'HOUSEHOLD', 'USER_SELECTED'])

export type BioScenarioSource = z.infer<typeof BioScenarioSourceSchema>;

// File: User.schema.ts

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  username: z.string().nullish(),
  role: z.string().nullish(),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.date().nullish(),
  onboardingComplete: z.boolean(),
  paymentsCustomerId: z.string().nullish(),
  locale: z.string().nullish(),
  displayUsername: z.string().nullish(),
  twoFactorEnabled: z.boolean().nullish(),
  lastActiveOrganizationId: z.string().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;


// File: Session.schema.ts

export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: z.string(),
  impersonatedBy: z.string().nullish(),
  activeOrganizationId: z.string().nullish(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SessionType = z.infer<typeof SessionSchema>;


// File: Account.schema.ts

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  idToken: z.string().nullish(),
  expiresAt: z.date().nullish(),
  password: z.string().nullish(),
  accessTokenExpiresAt: z.date().nullish(),
  refreshTokenExpiresAt: z.date().nullish(),
  scope: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountType = z.infer<typeof AccountSchema>;


// File: Verification.schema.ts

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().nullish(),
  updatedAt: z.date().nullish(),
});

export type VerificationType = z.infer<typeof VerificationSchema>;


// File: Passkey.schema.ts

export const PasskeySchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  publicKey: z.string(),
  userId: z.string(),
  credentialID: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullish(),
  aaguid: z.string().nullish(),
  createdAt: z.date().nullish(),
});

export type PasskeyType = z.infer<typeof PasskeySchema>;


// File: TwoFactor.schema.ts

export const TwoFactorSchema = z.object({
  id: z.string(),
  secret: z.string(),
  backupCodes: z.string(),
  userId: z.string(),
});

export type TwoFactorType = z.infer<typeof TwoFactorSchema>;


// File: Organization.schema.ts

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullish(),
  logo: z.string().nullish(),
  createdAt: z.date(),
  metadata: z.string().nullish(),
  paymentsCustomerId: z.string().nullish(),
});

export type OrganizationType = z.infer<typeof OrganizationSchema>;


// File: Member.schema.ts

export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
});

export type MemberType = z.infer<typeof MemberSchema>;


// File: Invitation.schema.ts

export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullish(),
  status: z.string(),
  expiresAt: z.date(),
  inviterId: z.string(),
  createdAt: z.date(),
});

export type InvitationType = z.infer<typeof InvitationSchema>;


// File: Purchase.schema.ts

export const PurchaseSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullish(),
  userId: z.string().nullish(),
  type: PurchaseTypeSchema,
  customerId: z.string(),
  subscriptionId: z.string().nullish(),
  priceId: z.string(),
  status: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PurchaseModel = z.infer<typeof PurchaseSchema>;

// File: Notification.schema.ts

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  data: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").default("{}"),
  link: z.string().nullish(),
  read: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type NotificationModel = z.infer<typeof NotificationSchema>;

// File: UserNotificationPreference.schema.ts

export const UserNotificationPreferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  target: NotificationTargetSchema,
  createdAt: z.date(),
});

export type UserNotificationPreferenceType = z.infer<typeof UserNotificationPreferenceSchema>;


// File: Feedback.schema.ts

export const FeedbackSchema = z.object({
  id: z.string(),
  userId: z.string().nullish(),
  email: z.string().nullish(),
  name: z.string().nullish(),
  message: z.string(),
  type: z.string(),
  ipAddress: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FeedbackType = z.infer<typeof FeedbackSchema>;


// File: BioHousehold.schema.ts

export const BioHouseholdSchema = z.object({
  id: z.string(),
  ownerUserId: z.string(),
  organizationId: z.string().nullish(),
  name: z.string().default("My household"),
  status: BioHouseholdStatusSchema.default("DRAFT"),
  schemaVersion: z.string().default("1.0.0"),
  financialState: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  onboardingDraft: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  onboardingStep: z.number().int(),
  onboardingComplete: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BioHouseholdType = z.infer<typeof BioHouseholdSchema>;


// File: BioLicense.schema.ts

export const BioLicenseSchema = z.object({
  id: z.string(),
  userId: z.string().nullish(),
  organizationId: z.string().nullish(),
  planKey: z.string(),
  status: BioLicenseStatusSchema.default("TRIAL"),
  entitlements: z.array(z.string()),
  startsAt: z.date(),
  expiresAt: z.date().nullish(),
  metadata: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BioLicenseType = z.infer<typeof BioLicenseSchema>;


// File: BioConsent.schema.ts

export const BioConsentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  documentVersion: z.string(),
  granted: z.boolean(),
  grantedAt: z.date().nullish(),
  withdrawnAt: z.date().nullish(),
  metadata: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BioConsentType = z.infer<typeof BioConsentSchema>;


// File: BioGeneticUpload.schema.ts

export const BioGeneticUploadSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  storageKey: z.string(),
  originalFileName: z.string(),
  provider: z.string().nullish(),
  fileFormat: z.string().nullish(),
  sha256: z.string().nullish(),
  status: BioGeneticUploadStatusSchema.default("UPLOADED"),
  parserVersion: z.string().nullish(),
  pipelineVersion: z.string().nullish(),
  errorMessage: z.string().nullish(),
  processingMetadata: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10").nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BioGeneticUploadType = z.infer<typeof BioGeneticUploadSchema>;


// File: BioPlanningProfile.schema.ts

export const BioPlanningProfileSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  geneticUploadId: z.string().nullish(),
  profileVersion: z.string(),
  profile: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  current: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BioPlanningProfileType = z.infer<typeof BioPlanningProfileSchema>;


// File: BioScenarioRun.schema.ts

export const BioScenarioRunSchema = z.object({
  id: z.string(),
  householdId: z.string(),
  scenarioQuestionId: z.string(),
  source: BioScenarioSourceSchema,
  planningExposureId: z.string().nullish(),
  parameters: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  result: z.unknown().refine((val) => { const getDepth = (obj: unknown, depth: number = 0): number => { if (depth > 10) return depth; if (obj === null || typeof obj !== 'object') return depth; const values = Object.values(obj as Record<string, unknown>); if (values.length === 0) return depth; return Math.max(...values.map(v => getDepth(v, depth + 1))); }; return getDepth(val) <= 10; }, "JSON nesting depth exceeds maximum of 10"),
  engineVersion: z.string(),
  createdAt: z.date(),
});

export type BioScenarioRunType = z.infer<typeof BioScenarioRunSchema>;

