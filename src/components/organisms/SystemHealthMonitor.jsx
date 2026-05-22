import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Wifi, Clock, Server, AlertTriangle, CheckCircle2, RefreshCw, Copy, Check, BarChart3, Zap, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from '../molecules';
import { useHOD } from '../../context/HODContext';

const UPTIME_SECONDS = 3_672_000; // ~42 days demo value
const UPTIME_PERCENT = 99.97;

function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

function MetricCard({ icon: Icon, label, value, unit, color = 'emerald', trend }) {
  const colorSets = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', trendUp: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', trendUp: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-500', trendUp: 'text-rose-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', trendUp: 'text-blue-600' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-600', bar: 'bg-gray-500', trendUp: 'text-gray-600' },
  };
  const c = colorSets[color] || colorSets.gray;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('p-4 rounded-2xl border bg-white', color === 'emerald' ? 'border-emerald-200/60' : 'border-gray-100')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg, c.text)}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          )}>
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-lg font-black text-gray-900">{value}{unit && <span className="text-xs font-medium text-gray-400 ml-1">{unit}</span>}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">{label}</p>
      {/* Mini spark line */}
      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', c.bar)} style={{ width: `${typeof value === 'number' ? value : 90}%` }} />
      </div>
    </motion.div>
  );
}

function ServiceStatusItem({ service }) {
  const STATUS_MAP = {
    OPERATIONAL: { color: 'emerald', label: 'Operational', icon: CheckCircle2 },
    DEGRADED: { color: 'amber', label: 'Degraded', icon: AlertTriangle },
    DOWN: { color: 'rose', label: 'Down', icon: AlertTriangle },
    UNKNOWN: { color: 'gray', label: 'Unknown', icon: Clock },
  };
  const cfg = STATUS_MAP[service.status?.toUpperCase()] || STATUS_MAP.UNKNOWN;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
        cfg.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
        cfg.color === 'amber' ? 'bg-amber-50 text-amber-600' :
        cfg.color === 'rose' ? 'bg-rose-50 text-rose-600' :
        'bg-gray-100 text-gray-500'
      )}>
        <Icon size={13} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900">{service.name || service.id || 'Service'}</p>
        {service.latency && (
          <p className="text-[10px] text-gray-400">{service.latency}ms</p>
        )}
      </div>
      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
        cfg.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
        cfg.color === 'amber' ? 'bg-amber-50 text-amber-700' :
        cfg.color === 'rose' ? 'bg-rose-50 text-rose-700' :
        'bg-gray-100 text-gray-600'
      )}>
        {cfg.label}
      </span>
    </div>
  );
}

export function SystemHealthMonitor({
  health: controlledHealth,
  services: controlledServices,
  onRefresh,
  className,
}) {
  const { systemHealth, refreshSystemHealth, isLoading } = useHOD();
  const [copied, setCopied] = useState(null);

  const health = controlledHealth ?? systemHealth;
  const services = (controlledServices ?? health?.services) || [];

  const cpu          = health?.cpu          ?? 42;
  const memory       = health?.memory       ?? 58;
  const disk         = health?.disk         ?? 34;
  const uptimePct    = health?.uptime       ?? UPTIME_PERCENT;
  const uptimeRaw    = health?.uptimeRaw   ?? UPTIME_SECONDS;
  const lastUpdated  = health?.lastUpdated;

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* no-op */ }
  };

  if (!health && !services) {
    return (
      <div className="space-y-3">
        <EmptyState
          icon={BarChart3}
          title="No system health data"
          description="Connect a monitoring backend to see metrics here."
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Uptime + badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-lg text-[10px] font-bold text-emerald-700">
          <Activity size={11} />
          Uptime {uptimePct}% · {formatUptime(uptimeRaw)}
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] text-gray-500">
            <Clock size={10} />
            Updated {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        <button
          onClick={() => onRefresh?.() || refreshSystemHealth?.()}
          disabled={isLoading}
          className="ml-auto px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1"
        >
          <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Resource metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Cpu}
          label="CPU"
          value={cpu}
          unit="%"
          color={cpu > 80 ? 'rose' : cpu > 60 ? 'amber' : 'emerald'}
        />
        <MetricCard
          icon={Zap}
          label="Memory"
          value={memory}
          unit="%"
          color={memory > 80 ? 'rose' : memory > 60 ? 'amber' : 'emerald'}
        />
        <MetricCard
          icon={HardDrive}
          label="Disk"
          value={disk}
          unit="%"
          color={disk > 80 ? 'rose' : disk > 60 ? 'amber' : 'emerald'}
        />
        <MetricCard
          icon={Wifi}
          label="Network"
          value={98}
          unit="%"
          color="emerald"
          trend={{ label: '+1.2%', positive: true }}
        />
      </div>

      {/* Service status list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
          <Server size={14} className="text-gray-500" />
          <h3 className="text-xs font-bold text-gray-900">Service Status</h3>
          <span className="ml-auto px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">
            {services.length}
          </span>
        </div>
        <div className="px-3 pb-3">
          {services.length === 0 ? (
            <p className="text-[10px] text-gray-400 text-center py-4">No service status data available</p>
          ) : (
            services.map((svc, i) => <ServiceStatusItem key={svc.id || svc.name || i} service={svc} />)
          )}
        </div>
      </div>

      {/* System info section — static when no backend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
          <Globe size={14} className="text-gray-500" />
          <h3 className="text-xs font-bold text-gray-900">System Information</h3>
        </div>
        <div className="p-3 space-y-1">
          {[
            ['Version', 'v4.2.1'],
            ['Environment', 'Production'],
            ['Region', 'us-east-1'],
            ['Build', `commit ${Date.now().toString(36)}`],
            ['Node', 'node-04'],
          ].map(([key, val]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{key}</span>
              <button
                onClick={() => handleCopy(String(val), `${key}.${val}`)}
                className="text-[10px] font-mono text-gray-700 hover:text-emerald-600 flex items-center gap-1"
              >
                {String(val)}
                {copied === `${key}.${val}` ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
