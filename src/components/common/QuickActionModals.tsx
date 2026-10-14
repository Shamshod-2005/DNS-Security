import {
  Check,
  Download,
  FileCheck2,
  History,
  Laptop,
  ShieldBan,
  X
} from "lucide-react";
import React, { useState } from "react";
import type {
  ClientDevice,
  DnsLogEntry,
  DnsPolicy,
  ThreatLevel
} from "../../types";

interface BlockDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (
    domain: string,
    category: string,
    threatLevel: ThreatLevel,
    reason: string,
  ) => void;
  initialDomain?: string;
  initialCategory?: string;
}

export const BlockDomainModal: React.FC<BlockDomainModalProps> = ({
  isOpen,
  onClose,
  onBlock,
  initialDomain = "",
  initialCategory = "Malware",
}) => {
  const [domain, setDomain] = useState(initialDomain);
  const [category, setCategory] = useState(initialCategory);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("Critical");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (initialDomain) setDomain(initialDomain);
    if (initialCategory) setCategory(initialCategory);
  }, [initialDomain, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !domain.includes(".")) {
      setError(
        "Please provide a valid Fully Qualified Domain Name (e.g. evil.com)",
      );
      return;
    }
    onBlock(
      domain.trim(),
      category,
      threatLevel,
      reason || "Manual block rule added by administrator",
    );
    setDomain("");
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldBan className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Block Domain</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 text-xs font-mono"
        >
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Target FQDN / Domain
            </label>
            <input
              type="text"
              placeholder="e.g. malware-distribution.top"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setError("");
              }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              autoFocus
            />
            {error && (
              <p className="text-rose-400 text-[11px] mt-1 font-sans">
                {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Threat Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Malware">Malware</option>
                <option value="Phishing">Phishing</option>
                <option value="Command & Control">Command & Control</option>
                <option value="Suspicious Domains">Suspicious Domains</option>
                <option value="Cryptominer">Cryptominer</option>
                <option value="Gambling">Gambling</option>
                <option value="Adult">Adult</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Severity Level
              </label>
              <select
                value={threatLevel}
                onChange={(e) => setThreatLevel(e.target.value as ThreatLevel)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              SOC Investigation Note / Reason
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Associated with spearphishing campaign detected on LAPTOP-02"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40"
            >
              Enforce Blocklist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePolicy: (
    policy: Omit<DnsPolicy, "id" | "lastModified" | "enforcementCount">,
  ) => void;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
  onCreatePolicy,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetClients, setTargetClients] = useState("All Endpoints");
  const [action, setAction] = useState<"BLOCK" | "SINKHOLE" | "ALLOW">(
    "SINKHOLE",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Malware",
    "Phishing",
    "Command & Control",
  ]);

  if (!isOpen) return null;

  const categories = [
    "Malware",
    "Phishing",
    "Command & Control",
    "Suspicious Domains",
    "Cryptominer",
    "Gambling",
    "Adult",
    "Social Media",
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePolicy({
      name,
      description: description || "Zero-trust DNS perimeter enforcement rule",
      enabled: true,
      priority: 1,
      targetClients,
      blockedCategories: selectedCategories,
      action,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Create DNS Policy Rule
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Policy Title
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering Secure Gateway Policy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Client Group
              </label>
              <input
                type="text"
                value={targetClients}
                onChange={(e) => setTargetClients(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Enforcement Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="SINKHOLE">SINKHOLE (Resolve to 0.0.0.0)</option>
                <option value="BLOCK">BLOCK (Return REFUSED / NXDOMAIN)</option>
                <option value="ALLOW">ALLOW (Bypass Inspection)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Categories to Filter ({selectedCategories.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors font-mono text-[11px] ${
                    selectedCategories.includes(cat)
                      ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                      : "bg-slate-900/60 text-slate-400 border-slate-800"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategories.includes(cat) && (
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of policy intent and scope..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-950/40"
            >
              Deploy Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (
    client: Omit<
      ClientDevice,
      | "id"
      | "totalRequests"
      | "blockedRequests"
      | "maliciousRequests"
      | "lastActivity"
    >,
  ) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("192.168.1.");
  const [mac, setMac] = useState("00:50:56:");
  const [deviceType, setDeviceType] =
    useState<ClientDevice["deviceType"]>("workstation");
  const [department, setDepartment] = useState("Engineering");
  const [assignedPolicy, setAssignedPolicy] = useState(
    "Standard Corporate Policy",
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;
    onAddClient({
      name,
      ip,
      mac: mac || "00:00:00:00:00:00",
      deviceType,
      department,
      assignedPolicy,
      status: "active",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Laptop className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Enroll Network Client
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3.5 text-xs font-mono"
        >
          <div>
            <label className="block text-slate-300 font-semibold mb-1 font-sans">
              Device Hostname
            </label>
            <input
              type="text"
              placeholder="e.g. WORKSTATION-SEC-12"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-sans">
                Static / Assigned IP
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-sans">
                Hardware MAC Address
              </label>
              <input
                type="text"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-sans">
                Device Profile
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="workstation">Workstation</option>
                <option value="laptop">Laptop</option>
                <option value="server">Server</option>
                <option value="mobile">Mobile</option>
                <option value="iot">IoT Device</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-sans">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="SecOps & DevOps">SecOps & DevOps</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 font-sans">
              Assigned Security Policy
            </label>
            <select
              value={assignedPolicy}
              onChange={(e) => setAssignedPolicy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Strict Zero-Trust Perimeter">
                Strict Zero-Trust Perimeter
              </option>
              <option value="Standard Corporate Policy">
                Standard Corporate Policy
              </option>
              <option value="Server Infrastructure Policy">
                Server Infrastructure Policy
              </option>
              <option value="IoT Whitelist Rules">IoT Whitelist Rules</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/40"
            >
              Register Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ExportLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DnsLogEntry[];
  onTriggerDownload: (format: "csv" | "json") => void;
}

export const ExportLogsModal: React.FC<ExportLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onTriggerDownload,
}) => {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [filterOnlyThreats, setFilterOnlyThreats] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              Export DNS Telemetry Logs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-400 leading-relaxed">
            Generate an export containing high-resolution DNS request telemetry,
            threat reputation scores, client metadata, and edge resolution
            timings.
          </p>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Total Available Records:</span>
              <span className="font-bold text-white">
                {logs.length} queries
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Timeframe:</span>
              <span>Active Buffer (Past 24 Hours)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Encryption / Hashing:</span>
              <span className="text-emerald-400">SHA-256 Audit Integrity</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3 rounded-xl border font-mono text-center transition-all ${
                  format === "csv"
                    ? "bg-blue-600/20 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold">CSV (Spreadsheet)</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  SIEM & Excel compatible
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`p-3 rounded-xl border font-mono text-center transition-all ${
                  format === "json"
                    ? "bg-blue-600/20 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold">JSON (Structured)</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Splunk / Elastic index
                </div>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={filterOnlyThreats}
              onChange={(e) => setFilterOnlyThreats(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
            />
            <span className="text-slate-300 text-xs">
              Export only Blocked and Malicious requests (IOC Audit)
            </span>
          </label>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onTriggerDownload(format);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-950/40 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DeviceHistoryModalProps {
  client: ClientDevice | null;
  onClose: () => void;
  logs: DnsLogEntry[];
  onSelectLog: (log: DnsLogEntry) => void;
}

export const DeviceHistoryModal: React.FC<DeviceHistoryModalProps> = ({
  client,
  onClose,
  logs,
  onSelectLog,
}) => {
  if (!client) return null;

  const clientLogs = logs.filter(
    (l) =>
      l.clientIp === client.ip ||
      l.device.toLowerCase() === client.name.toLowerCase(),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 max-h-[90vh] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{client.name}</span>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {client.ip}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department: {client.department} • MAC: {client.mac} • Policy:{" "}
                  <span className="text-slate-300 font-mono">
                    {client.assignedPolicy}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 my-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">
                Total Queries
              </span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {client.totalRequests.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">
                Blocked Queries
              </span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">
                {client.blockedRequests.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">
                Malicious Hits
              </span>
              <span className="text-lg font-bold text-rose-400 mt-0.5 block">
                {client.maliciousRequests.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-300 font-mono mb-2 flex items-center justify-between">
            <span>Recent Query Telemetry History</span>
            <span className="text-slate-500 font-normal">
              Showing recent events
            </span>
          </div>
        </div>

        {/* Scrollable Logs */}
        <div className="flex-1 overflow-y-auto max-h-72 border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-900 text-slate-400 text-[10px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clientLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No recent queries logged in active session for this client
                  </td>
                </tr>
              ) : (
                clientLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => {
                      onSelectLog(log);
                      onClose();
                    }}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 text-white font-medium">
                      {log.domain}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {log.queryType}
                    </td>
                    <td className="py-2 px-3 text-slate-300">{log.category}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.action === "ALLOW"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
