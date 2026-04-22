import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  Button, 
  SubmissionsOverTimeChart, 
  SubmissionsOverTimeTable,
  ExportPdfButton, 
  FieldChartSelector, 
  DynamicChartPanel,
  DynamicTablePanel
} from '../../components';
import { reportService, settingsService, formConfigService } from '../../services';
import type { ReportDataPoint, AllReportData, ChartFieldInfo, DynamicFieldReport } from '../../types';
import '../../config/chartConfig';

function FormReportsPage() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const location = useLocation();
  const isChartsView = location.pathname.endsWith('/charts');

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submissionsOverTime, setSubmissionsOverTime] = useState<ReportDataPoint[]>([]);
  const [appName, setAppName] = useState('Form Builder');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<ChartFieldInfo[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [dynamicReports, setDynamicReports] = useState<Record<string, DynamicFieldReport>>({});
  const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | '30days' | 'year' | 'all'>('30days');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [officeName, setOfficeName] = useState<string>('');
  const [officeAddress, setOfficeAddress] = useState<string>('');

  const handleDynamicDataLoaded = useCallback((fieldId: string, report: DynamicFieldReport) => {
    setDynamicReports((prev) => ({ ...prev, [fieldId]: report }));
  }, []);

  const handleFieldSelect = useCallback((fieldIds: string[]) => {
    setSelectedFieldIds(fieldIds);
  }, []);

  const handleFieldsLoaded = useCallback((loadedFields: ChartFieldInfo[]) => {
    setFields(loadedFields);
  }, []);

  const fetchData = useCallback(async () => {
    if (!formSlug) return;
    setLoading(true);
    try {
      const timeData = await reportService.getSubmissionsOverTime(formSlug!, dateFrom, dateTo);
      setSubmissionsOverTime(timeData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [formSlug, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((settings) => {
        setAppName(settings.app_name);
        setLogoUrl(settings.logo_url);
        setOfficeName(settings.office_name || '');
        setOfficeAddress(settings.office_address || '');
      })
      .catch(() => {
        setAppName('Form Builder');
        setLogoUrl(null);
      });
  }, []);

  useEffect(() => {
    if (formSlug) {
      formConfigService.getFormBySlug(formSlug)
        .then((config) => {
          setFormTitle(config.title);
          setFormDescription(config.description || '');
        })
        .catch(() => {
          setFormTitle('');
          setFormDescription('');
        });
    }
  }, [formSlug]);

  const selectedFields = fields.filter((f) => selectedFieldIds.includes(f.id));

  const filteredDynamicReports: Record<string, DynamicFieldReport> = {};
  selectedFieldIds.forEach((id) => {
    if (dynamicReports[id]) {
      filteredDynamicReports[id] = dynamicReports[id];
    }
  });

  const reportData: AllReportData = {
    submissionsOverTime,
    dynamicReports: filteredDynamicReports,
  };

  const setPreset = (preset: 'today' | 'week' | 'month' | '30days' | 'year' | 'all') => {
    setActivePreset(preset);
    const now = new Date();
    let from = new Date();
    switch (preset) {
      case 'today':
        from = now;
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case '30days':
        from.setDate(now.getDate() - 30);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        from = new Date('2020-01-01');
        break;
    }
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">
              Reports - {isChartsView ? 'Charts' : 'Tables'}
            </h2>
            <p className="text-[#737373]">
              {isChartsView ? 'Visual analytics and insights' : 'Detailed data tables and statistics'}
              {' '}for: {formSlug}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/dashboard/f/${formSlug}/builder`}>
              <Button variant="secondary">Go to Builder</Button>
            </Link>
            <ExportPdfButton
              dateFrom={dateFrom}
              dateTo={dateTo}
              reportData={reportData}
              appName={appName}
              logoUrl={logoUrl}
              formTitle={formTitle}
              formDescription={formDescription}
              officeName={officeName}
              officeAddress={officeAddress}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={activePreset === 'today' ? 'primary' : 'secondary'} onClick={() => setPreset('today')} className="text-sm">Today</Button>
            <Button variant={activePreset === 'week' ? 'primary' : 'secondary'} onClick={() => setPreset('week')} className="text-sm">This Week</Button>
            <Button variant={activePreset === 'month' ? 'primary' : 'secondary'} onClick={() => setPreset('month')} className="text-sm">This Month</Button>
            <Button variant={activePreset === '30days' ? 'primary' : 'secondary'} onClick={() => setPreset('30days')} className="text-sm">Last 30 Days</Button>
            <Button variant={activePreset === 'year' ? 'primary' : 'secondary'} onClick={() => setPreset('year')} className="text-sm">This Year</Button>
            <Button variant={activePreset === 'all' ? 'primary' : 'secondary'} onClick={() => setPreset('all')} className="text-sm">All Time</Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#374151] mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="block w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#374151] mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="block w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <FieldChartSelector formSlug={formSlug!} onFieldSelect={handleFieldSelect} onFieldsLoaded={handleFieldsLoaded} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {isChartsView ? (
            <SubmissionsOverTimeChart data={submissionsOverTime} loading={loading} />
          ) : (
            <SubmissionsOverTimeTable data={submissionsOverTime} loading={loading} />
          )}

          {selectedFields.map((field) => (
            isChartsView ? (
              <DynamicChartPanel
                key={field.id}
                field={field}
                formSlug={formSlug!}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDataLoaded={handleDynamicDataLoaded}
              />
            ) : (
              <DynamicTablePanel
                key={field.id}
                field={field}
                formSlug={formSlug!}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDataLoaded={handleDynamicDataLoaded}
              />
            )
          ))}
        </div>
    </div>
  );
}

export default FormReportsPage;