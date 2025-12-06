import { useState } from "react";

type FeatureKey = "qr" | "quick" | "oneTime" | "password" | "custom";

export default function Button() {
  const [features, setFeatures] = useState<Record<FeatureKey, boolean>>({
    qr: false,
    quick: false,
    oneTime: false,
    password: false,
    custom: false,
  });

  const toggleFeature = (key: FeatureKey) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      {(["qr", "quick", "oneTime", "password", "custom"] as FeatureKey[]).map(
        (k) => (
          <button key={k} onClick={() => toggleFeature(k)}>
            {k}: {features[k] ? "On" : "Off"}
          </button>
        )
      )}
    </div>
  );
}
