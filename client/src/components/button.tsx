import { useState } from "react";

const [features, setFeatures] = useState({
  qr: false,
  quick: false,
  oneTime: false,
  password: false,
  custom: false,
});

const toggleFeature = (key: keyof typeof features) => {
  setFeatures({ ...features, [key]: !features[key] });
};
