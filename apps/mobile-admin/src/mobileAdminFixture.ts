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
  parentIssue: number;
  featureId: string;
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
