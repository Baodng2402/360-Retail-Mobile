import { useSubscriptionStore } from '@/src/stores/useSubscriptionStore';
import { FEATURE_MIN_PLAN, FEATURE_LABELS, PLAN_CONFIGS } from '@/src/config/plan.config';
import type { FeatureKey } from '@/src/config/plan.config';

// =============================================
// useFeatureGate — kiểm tra quyền truy cập tính năng
// Usage: const { allowed, label, minPlanLabel } = useFeatureGate('dashboard')
// =============================================

interface FeatureGateResult {
  allowed: boolean; // Có được dùng không
  label: string; // Tên tính năng
  minPlan: string; // Gói tối thiểu cần nâng cấp
  minPlanLabel: string; // Tên hiển thị gói tối thiểu
}

export function useFeatureGate(feature: FeatureKey): FeatureGateResult {
  const canUse = useSubscriptionStore((s) => s.canUse);

  const minPlan = FEATURE_MIN_PLAN[feature];

  return {
    allowed: canUse(feature),
    label: FEATURE_LABELS[feature],
    minPlan,
    minPlanLabel: PLAN_CONFIGS[minPlan].label,
  };
}
