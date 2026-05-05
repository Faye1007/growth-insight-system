import "server-only";

export type SensitivityReason =
  | "phone_number"
  | "national_id"
  | "bank_card"
  | "detailed_address"
  | "secret_or_token"
  | "medical_privacy"
  | "private_relationship";

export type SensitivityCheckResult = {
  isSensitive: boolean;
  reasons: SensitivityReason[];
};

const sensitiveRules: Array<{
  reason: SensitivityReason;
  pattern: RegExp;
}> = [
  {
    reason: "phone_number",
    pattern: /(?:\+?86[-\s]?)?1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/,
  },
  {
    reason: "national_id",
    pattern: /\b\d{6}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/,
  },
  {
    reason: "bank_card",
    pattern: /\b(?:\d[ -]?){16,19}\b/,
  },
  {
    reason: "detailed_address",
    pattern: /(?:小区|单元|门牌|楼栋|楼号|室|身份证地址|详细地址)/,
  },
  {
    reason: "secret_or_token",
    pattern: /(?:api[_-]?key|secret|token|password|passwd|bearer|sk-[A-Za-z0-9_-]+)/i,
  },
  {
    reason: "medical_privacy",
    pattern: /(?:诊断|病历|处方|用药|医院|医保|检查报告|化验单|心理咨询记录)/,
  },
  {
    reason: "private_relationship",
    pattern: /(?:亲密关系|私密关系|性生活|出轨|暧昧|前任|伴侣隐私)/,
  },
];

export function checkSensitiveContent(content: string): SensitivityCheckResult {
  const reasons = sensitiveRules
    .filter((rule) => rule.pattern.test(content))
    .map((rule) => rule.reason);

  return {
    isSensitive: reasons.length > 0,
    reasons,
  };
}
