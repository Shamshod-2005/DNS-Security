import { useTranslation } from "react-i18next";
import LogView from "./LogView";

export default function QueryLog() {
  const { t } = useTranslation();
  return <LogView title={t("nav.querylog")} params={{ malicious: 0, dot: 0 }} />;
}
