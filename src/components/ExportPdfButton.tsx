import { useState, useCallback } from 'react';
import Button from './Button';
import Toast from './Toast';
import { generatePdfReport, captureDynamicChartImages } from '../utils/FormpdfGenerator';
import type { AllReportData } from '../types';

interface ExportPdfButtonProps {
  dateFrom: string;
  dateTo: string;
  reportData: AllReportData | null;
  appName: string;
  logoUrl: string | null;
  reportTitle?: string;
  formTitle?: string;
  formDescription?: string;
  officeName?: string;
  officeAddress?: string;
}

function ExportPdfButton({ dateFrom, dateTo, reportData, appName, logoUrl, reportTitle, formTitle, formDescription, officeName, officeAddress }: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (!reportData) {
      setError('No data available for the selected date range');
      return;
    }

    const hasAnyData =
      reportData.submissionsOverTime.length > 0 ||
      Object.keys(reportData.dynamicReports).length > 0;

    if (!hasAnyData) {
      setError('No data available for the selected date range');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const chartImages = await captureDynamicChartImages();

      await generatePdfReport({
        reportData,
        dateFrom,
        dateTo,
        appName,
        logoUrl,
        chartImages,
        reportTitle,
        formTitle,
        formDescription,
        officeName,
        officeAddress,
      });
    } catch {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [reportData, dateFrom, dateTo, appName, logoUrl, reportTitle, formTitle, formDescription, officeName, officeAddress]);

  const dismissError = () => setError(null);

  return (
    <>
      <Button
        variant="primary"
        onClick={handleExport}
        loading={isGenerating}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Export as PDF'}
      </Button>
      {error && <Toast message={error} type="error" onDismiss={dismissError} />}
    </>
  );
}

export default ExportPdfButton;