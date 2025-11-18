import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchAllRules,
  createRule,
  updateRule,
  deleteRule,
} from "../libs/ApiGatewayDatasource";
import type {
  RecommendationRuleDTO,
  RecommendationRuleRequest,
} from "../libs/models/product/RecommendedRule";

interface RecommendationRuleContextType {
  rules: RecommendationRuleDTO[];
  loading: boolean;
  addRule: (rule: RecommendationRuleRequest) => Promise<void>;
  updateRuleById: (id: number, rule: RecommendationRuleRequest) => Promise<void>;
  removeRule: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const RecommendationRuleContext =
  createContext<RecommendationRuleContextType | null>(null);

export const RecommendationRuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rules, setRules] = useState<RecommendationRuleDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchAllRules();
      setRules(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const addRule = async (rule: RecommendationRuleRequest) => {
    const newRule = await createRule(rule);
    setRules((prev) => [...prev, newRule]);
  };

  const updateRuleById = async (id: number, rule: RecommendationRuleRequest) => {
    const updated = await updateRule(id, rule);
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const removeRule = async (id: number) => {
    await deleteRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RecommendationRuleContext.Provider
      value={{ rules, loading, addRule, updateRuleById, removeRule, refresh }}
    >
      {children}
    </RecommendationRuleContext.Provider>
  );
};

export const useRecommendationRules = () => {
  const context = useContext(RecommendationRuleContext);
  if (!context) {
    throw new Error(
      "useRecommendationRules must be used within a RecommendationRuleProvider"
    );
  }
  return context;
};
