import React from 'react';
import { Check, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmptyState } from '../../../../components/molecules';

const slug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Cycled palette so every subject gets a distinct, theme-aligned hue.
const SUBJECT_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--dept-color-5)',
  'var(--dept-color-6)',
  'var(--dept-color-7)',
  'var(--dept-color-8)',
  'var(--dept-color-9)',
];

export function AcademicJourneyPanel({ studentData }) {
  // Guard early before hooks execute if no history context is available
  if (!studentData || !studentData.academicHistory) {
    return <EmptyState context="results" />;
  }

  // 1. Extract every unique subject across the whole journey (the "360" data set)
  const allSubjects = React.useMemo(() => {
    return Array.from(
      new Set(
        studentData.academicHistory.flatMap((term) =>
          (term.subjects || []).map((subj) => subj.name || subj.subject || subj.subj)
        )
      )
    )
      .filter(Boolean)
      .sort();
  }, [studentData.academicHistory]);

  // 2. Filterable set of subjects shown on the chart (defaults to all = 360° view)
  const [filteredSubjects, setFilteredSubjects] = React.useState(allSubjects);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const toggleSubject = (subj) => {
    setFilteredSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj],
    );
  };

  // 3. Build per-term data points: journey average + one series per subject.
  //    This is the data + params that feed the chart, all derived from the
  //    student's academic history (every semester, every subject).
  const chartData = React.useMemo(() => {
    if (allSubjects.length === 0) return [];
    return studentData.academicHistory.map((term) => {
      const subjects = term.subjects || [];
      const scores = subjects
        .map((subj) => Number(subj.score))
        .filter((n) => !Number.isNaN(n));
      const point = {
        term: `${term.year || term.yearLabel || ''} ${term.term || ''}`.trim(),
        average: scores.length
          ? scores.reduce((sum, n) => sum + n, 0) / scores.length
          : 0,
      };
      allSubjects.forEach((subj) => {
        const found = subjects.find(
          (s) => (s.name || s.subject || s.subj) === subj,
        );
        const score = found ? Number(found.score) : NaN;
        point[slug(subj)] = Number.isNaN(score) ? null : score;
      });
      return point;
    });
  }, [studentData.academicHistory, allSubjects]);

  // 4. Chart config is generated from the journey params (subjects + average)
  const chartConfig = React.useMemo(() => {
    const cfg = {
      average: {
        label: 'Journey Average',
        color: 'var(--brand-secondary)',
      },
    };
    allSubjects.forEach((subj, i) => {
      cfg[slug(subj)] = {
        label: subj,
        color: SUBJECT_PALETTE[i % SUBJECT_PALETTE.length],
      };
    });
    return cfg;
  }, [allSubjects]);

  // 5. Whole-journey trend, measured on the journey-average baseline
  const trend = React.useMemo(() => {
    if (chartData.length < 2) return null;
    const first = Number(chartData[0]?.average);
    const last = Number(chartData.at(-1)?.average);
    if (!first) return null;
    const pct = ((last - first) / first) * 100;
    return { up: pct >= 0, pct: Math.abs(pct) };
  }, [chartData]);

  // 6. One Line per displayed subject, using the reference pattern
  //    (type="natural", dots, activeDot r:6)
  const subjectLines = filteredSubjects.map((subj) => {
    const colorKey = `var(--color-${slug(subj)})`;
    return (
      <Line
        key={slug(subj)}
        dataKey={slug(subj)}
        type="natural"
        stroke={colorKey}
        strokeWidth={1.5}
        dot={{ r: 3, fill: colorKey }}
        activeDot={{ r: 6 }}
      />
    );
  });

  const triggerLabel =
    filteredSubjects.length === 0
      ? 'Filter subjects'
      : filteredSubjects.length === allSubjects.length
        ? 'All subjects'
        : `${filteredSubjects.length} of ${allSubjects.length} selected`;

  const firstSemester = chartData[0]?.term;
  const lastSemester = chartData.at(-1)?.term;

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        360° longitudinal view of your performance across every semester and
        subject. Filter the subjects shown below.
      </p>

      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
          >
            {triggerLabel}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-64 max-h-72 overflow-y-auto p-1.5 text-sm"
        >
          <div className="flex flex-col gap-1">
            {allSubjects.map((subj) => {
              const checked = filteredSubjects.includes(subj);
              return (
                <div
                  key={subj}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSubject(subj)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSubject(subj);
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
                >
                  <span
                    className={
                      checked
                        ? 'flex h-4 w-4 items-center justify-center rounded-[3px] border bg-brand-primary text-white'
                        : 'flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-background text-text-secondary'
                    }
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{subj}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Card>
        <CardHeader>
          <CardTitle>Academic Journey</CardTitle>
          <CardDescription>
            {allSubjects.length
              ? `All ${allSubjects.length} subjects · ${firstSemester} – ${lastSemester}`
              : '360° view across the full academic journey'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && allSubjects.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[280px] w-full md:h-[360px]">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="term"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    value
                      ? value.toString().split(' ').slice(-2).join(' ')
                      : value
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="average"
                  type="natural"
                  stroke="var(--color-average)"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{ r: 4, fill: 'var(--color-average)' }}
                  activeDot={{ r: 7 }}
                />
                {subjectLines}
              </LineChart>
            </ChartContainer>
          ) : (
            <EmptyState context="results" variant="compact" />
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            {trend?.up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {trend
              ? `${trend.up ? 'Trending up' : 'Trending down'} by ${trend.pct.toFixed(1)}% across the journey`
              : 'Insufficient data for trend'}
          </div>
          <div className="leading-none text-muted-foreground">
            360° view: {filteredSubjects.length} of {allSubjects.length} subjects
            and journey average across {chartData.length} semesters
          </div>
        </CardFooter>
      </Card>

      {/* Summary of progress layout cards */}
      {chartData.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Journey Average by Semester
          </h3>
          <div className="space-y-2">
            {chartData.map((point) => (
              <div
                key={point.term}
                className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/40 transition-all hover:border-border"
              >
                <span className="text-xs font-semibold text-text-primary truncate min-w-0">
                  {point.term}
                </span>
                <span className="ml-2 shrink-0 px-3 py-1 rounded-full text-xs font-bold text-brand-primary bg-[var(--brand-primary)]/10">
                  {point.average.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicJourneyPanel;
