"use client";

import { useState, useCallback, useEffect } from "react";
import { ReferralPanel } from "@/components/shared/referral-panel";

type ReferralStats = { total: number; completed: number; pending: number; totalCredits: number };
type ReferralData = { referrals: never[]; stats: ReferralStats };

const EMPTY: ReferralData = {
  referrals: [],
  stats: { total: 0, completed: 0, pending: 0, totalCredits: 0 },
};

export default function ReferralsTab() {
  const [data, setData] = useState<ReferralData>(EMPTY);

  const fetchReferrals = useCallback(() => {
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return (
    <div className="mt-6">
      <ReferralPanel
        referrals={data.referrals}
        stats={data.stats}
        userRole="PROFESSIONAL"
        onRefresh={fetchReferrals}
      />
    </div>
  );
}
