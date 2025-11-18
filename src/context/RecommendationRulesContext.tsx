// src/context/RecommendationRulesContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getAllRecommendationRules,
  addRecommendationRule,
  updateRecommendationRule,
  deleteRecommendationRule,
  updateRecommendationRuleStatus,
} from "../libs/ApiGatewayDatasource";

import type {
  RecommendationRule,
  RecommendationRuleDTO,
  RecommendationRulePayload,
} from "../types/recommendationTypes";

interface RecommendationRulesContextValue {
  rules: RecommendationRule[];
  reloadRules: () => Promise<RecommendationRule[]>;
  createRule: (payload: RecommendationRulePayload) => Promise<RecommendationRule>;
  editRule: (id: number, payload: RecommendationRulePayload) => Promise<RecommendationRule>;
  removeRule: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<RecommendationRule>;
}

const RecommendationRulesContext = createContext<
  RecommendationRulesContextValue | undefined
>(undefined);

function mapRuleDTO(dto: RecommendationRuleDTO): RecommendationRule {
  return {
    id: dto.id,
    baseProductId: dto.baseProductId,
    baseProductCode: dto.baseProductCode,
    baseProductName: dto.baseProductName,
    baseProductCategoryName: dto.baseProductCategoryName ?? null,
    recommendedProducts: dto.recommendedProducts ?? [],
    effectiveDate: dto.effectiveDate,
    expiryDate: dto.expiryDate,
    status: dto.status,
  };
}

export const RecommendationRulesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rules, setRules] = useState<RecommendationRule[]>([]);

  const reloadRules = async () => {
    const dtos = await getAllRecommendationRules();
    const mapped = dtos.map(mapRuleDTO);
    setRules(mapped);
    return mapped;
  };

  const createRule = async (payload: RecommendationRulePayload) => {
    const dto = await addRecommendationRule(payload);
    const mapped = mapRuleDTO(dto);
    setRules((prev) => [...prev, mapped]);
    return mapped;
  };

  const editRule = async (id: number, payload: RecommendationRulePayload) => {
    const dto = await updateRecommendationRule(id, payload);
    const mapped = mapRuleDTO(dto);
    setRules((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
    return mapped;
  };

  const removeRule = async (id: number) => {
    await deleteRecommendationRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleStatus = async (id: number) => {
    const current = rules.find((r) => r.id === id);
    const newStatus = current?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const dto = await updateRecommendationRuleStatus(id, newStatus ?? "ACTIVE");
    const mapped = mapRuleDTO(dto);
    setRules((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
    return mapped;
  };

  useEffect(() => {
    reloadRules().catch(console.error);
  }, []);

  return (
    <RecommendationRulesContext.Provider
      value={{
        rules,
        reloadRules,
        createRule,
        editRule,
        removeRule,
        toggleStatus,
      }}
    >
      {children}
    </RecommendationRulesContext.Provider>
  );
};

export const useRecommendationRulesContext = () => {
  const ctx = useContext(RecommendationRulesContext);
  if (!ctx) {
    throw new Error(
      "useRecommendationRulesContext must be used within RecommendationRulesProvider"
    );
  }
  return ctx;
};
