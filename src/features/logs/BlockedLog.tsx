import { useTranslation } from "react-i18next";
import LogView from "./LogView";

export default function BlockedLog() {
  const { t } = useTranslation();
  return (
    <LogView
      title={t("nav.blocked")}
      params={{ malicious: 1 }}
      showRule
    />
  );
}
