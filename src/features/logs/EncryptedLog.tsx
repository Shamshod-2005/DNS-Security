import { useTranslation } from "react-i18next";
import LogView from "./LogView";

export default function EncryptedLog() {
  const { t } = useTranslation();
  return (
    <LogView
      title={t("nav.dot")}
      params={{ dot: 1 }}
      hideDomain
    />
  );
}
