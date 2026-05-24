import contractFixture from "../fixtures/mobile-admin-contract.json";

export type MobileAdminJob = {
  id: string;
  title: string;
  primaryUser: string;
  goal: string;
  firstScreen: string;
  sourceRoutes: string[];
  writeBoundary: string;
};

export type MobileAdminContractFixture = {
  id: string;
  status: string;
  updatedAt: string;
  publicBaseUrl: string;
  parentIssue: number;
  featureId: string;
  liveDashboard: {
    id: string;
    issue: number;
    status: string;
    route: string;
    purpose: string;
    publicSafeReads: string[];
    redactionBoundary: string;
    renderedInScaffoldsIssue?: number;
    liveHydrationIssue?: number;
  };
  privateAuth: {
    id: string;
    issue: number;
    status: string;
    sessionRoute: string;
    loginRoute: string;
    callbackSurface: string;
    acceptedRoles: string[];
    sessionSemantics: string;
    deniedStates: string[];
    platformBehavior: string[];
    redactionBoundary: string;
  };
  privateRowsApi: {
    id: string;
    issue: number;
    status: string;
    route: string;
    authBoundary: string;
    purpose: string;
    readBoundary: string;
    publicSourceDataSummary: string;
    redactionFlags: string[];
  };
  actionIntentApi: {
    id: string;
    issue: number;
    status: string;
    route: string;
    authBoundary: string;
    purpose: string;
    intentBoundary: string;
    publicSourceDataSummary: string;
    requiredInputs: string[];
    redactionFlags: string[];
  };
  confirmedActions: Array<{
    id: string;
    issue: number;
    title: string;
    status: string;
    surface: string;
    confirmationText: string;
    requiredInputs: string[];
    safetyRules: string[];
    mutationBoundary: string;
  }>;
  childIssues: Array<{
    platform: "ios" | "android";
    issue: number;
    title: string;
    firstMilestone: string;
    validation: string[];
    status?: string;
    appPath?: string;
    sourceDataRoute?: string;
    fixturePath?: string;
    smokeCommand?: string;
  }>;
  jobs: MobileAdminJob[];
  apiDependencies: Array<{
    id: string;
    route: string;
    purpose: string;
    authBoundary: string;
    stableIds: string[];
  }>;
  confirmedWriteRules: string[];
};

export const mobileAdminContractFixture = contractFixture as MobileAdminContractFixture;

export const iosSlice = mobileAdminContractFixture.childIssues.find((slice) => slice.platform === "ios");
