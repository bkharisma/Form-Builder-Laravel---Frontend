import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import type { AllReportData } from '../types';

interface DynamicChartImages {
  submissionsOverTime: string;
  dynamicCharts: Record<string, string>;
}

export interface PdfGenerationOptions {
  reportData: AllReportData;
  dateFrom: string;
  dateTo: string;
  appName: string;
  logoUrl: string | null;
  chartImages: DynamicChartImages;
  reportTitle?: string;
  formTitle?: string;
  formDescription?: string;
  officeName?: string;
  officeAddress?: string;
}

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;
const FOOTER_Y = A4_HEIGHT - 20;

export async function captureElementToImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

export async function captureChartToImage(container: HTMLElement): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvasEl = container.querySelector('canvas');
  if (canvasEl) {
    await new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        resolve(undefined);
      });
      observer.observe(canvasEl, { attributes: true, childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(undefined);
      }, 500);
    });
  }

  return captureElementToImage(container);
}

export async function captureDynamicChartImages(): Promise<DynamicChartImages> {
  const submissionsOverTimeEl = document.querySelector('[data-pdf-chart="submissions-over-time"]') as HTMLElement;
  const submissionsOverTime = submissionsOverTimeEl ? await captureChartToImage(submissionsOverTimeEl) : '';

  const dynamicCharts: Record<string, string> = {};
  const dynamicChartEls = document.querySelectorAll('[data-pdf-chart^="dynamic-"]');
  for (const el of Array.from(dynamicChartEls)) {
    const attr = el.getAttribute('data-pdf-chart') || '';
    const fieldId = attr.replace('dynamic-', '');
    dynamicCharts[fieldId] = await captureChartToImage(el as HTMLElement);
  }

  return { submissionsOverTime, dynamicCharts };
}

async function loadImageAsDataUrl(url: string): Promise<string> {
  let safeUrl = url;
  if (safeUrl.includes('localhost:8000') || safeUrl.includes('127.0.0.1:8000')) {
    safeUrl = new URL(safeUrl).pathname;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = safeUrl;
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildSectionEntries(
  reportData: AllReportData
): { key: string; title: string; hasData: boolean }[] {
  const sections: { key: string; title: string; hasData: boolean }[] = [];

  if (reportData.submissionsOverTime.length > 0) {
    sections.push({ key: 'submissionsOverTime', title: 'Submissions Over Time', hasData: true });
  }

  const dynamicKeys = Object.keys(reportData.dynamicReports);
  for (const fieldId of dynamicKeys) {
    const report = reportData.dynamicReports[fieldId];
    if (report && report.data.length > 0) {
      sections.push({
        key: `dynamic-${fieldId}`,
        title: report.field.label,
        hasData: true,
      });
    }
  }

  sections.push({ key: 'summary', title: 'Report Summary', hasData: true });

  return sections;
}

export async function generatePdfReport(options: PdfGenerationOptions): Promise<void> {
  const { reportData, dateFrom, dateTo, appName, logoUrl, chartImages, reportTitle, formTitle, formDescription, officeName } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const sections = buildSectionEntries(reportData);

  if (sections.length === 0) {
    throw new Error('No data available for the selected date range');
  }

  let y = 40;
  const LOGO_SIZE = 12;
  const LOGO_SPACING = 3;

  let drawWidth = 0;
  let drawHeight = 0;
  let logoDataUrl = '';
  let titleTextX = 0;

  if (logoUrl) {
    try {
      logoDataUrl = await loadImageAsDataUrl(logoUrl);
      const imgProps = doc.getImageProperties(logoDataUrl);

      if (imgProps.width > imgProps.height) {
        drawWidth = LOGO_SIZE;
        drawHeight = (LOGO_SIZE / imgProps.width) * imgProps.height;
      } else {
        drawHeight = LOGO_SIZE;
        drawWidth = (LOGO_SIZE / imgProps.height) * imgProps.width;
      }
    } catch {
      // Logo failed
    }
  }

  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  const appNameText = logoUrl && drawWidth > 0 ? `- ${appName}` : appName;
  const textWidth = doc.getTextWidth(appNameText);

  const headerContentWidth = (logoUrl && drawWidth > 0 ? drawWidth + LOGO_SPACING : 0) + textWidth;
  const startX = (A4_WIDTH - headerContentWidth) / 2;

  if (logoUrl && drawWidth > 0) {
    const logoYOffset = (LOGO_SIZE - drawHeight) / 2;
    doc.addImage(logoDataUrl, 'PNG', startX, y + logoYOffset, drawWidth, drawHeight);
    titleTextX = startX + drawWidth + LOGO_SPACING;
  } else {
    titleTextX = startX;
  }

  const textBaselineY = y + (LOGO_SIZE / 2) + 2;
  doc.text(appNameText, titleTextX, textBaselineY, { align: 'left' });

  y += LOGO_SIZE + 10;



  if (formTitle) {
    doc.setFontSize(14);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    const titleWidth = doc.getTextWidth(formTitle);
    doc.text(formTitle, (A4_WIDTH - titleWidth) / 2, y);
    y += 8;
  }

  if (formDescription) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const descLines = doc.splitTextToSize(formDescription, CONTENT_WIDTH);
    descLines.forEach((line: string, index: number) => {
      const lineWidth = doc.getTextWidth(line);
      doc.text(line, (A4_WIDTH - lineWidth) / 2, y + (index * 5));
    });
    y += 35;
  }

  doc.setFontSize(28);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  const titleToUse = reportTitle || 'Submission Report';
  const reportTitleWidth = doc.getTextWidth(titleToUse);
  doc.text(titleToUse, (A4_WIDTH - reportTitleWidth) / 2, y);
  y += 10; // Reduced spacing

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  const lineLength = 60;
  doc.line((A4_WIDTH - lineLength) / 2, y, (A4_WIDTH + lineLength) / 2, y);
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  const periodText = `Report Period: ${formatDate(dateFrom)} \u2013 ${formatDate(dateTo)}`;
  const periodWidth = doc.getTextWidth(periodText);
  doc.text(periodText, (A4_WIDTH - periodWidth) / 2, y);
  y += 10;

  const now = new Date();
  const formattedNow = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  const genText = `Generated on ${formattedNow}`;
  const genWidth = doc.getTextWidth(genText);
  doc.text(genText, (A4_WIDTH - genWidth) / 2, y);

  // Table of contents page (Reserved)
  doc.addPage();
  const tocPageNumber = doc.getNumberOfPages();

  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('Table of Contents', A4_WIDTH / 2, MARGIN + 15, { align: 'center' });

  const sectionPageNumbers: Record<string, number> = {};

  for (const section of sections) {
    doc.addPage();
    sectionPageNumbers[section.key] = doc.getNumberOfPages();

    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, MARGIN, MARGIN + 10);

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, MARGIN + 14, MARGIN + CONTENT_WIDTH, MARGIN + 14);

    let contentY = MARGIN + 22;

    if (section.key === 'submissionsOverTime') {
      const submissionsChartImg = chartImages.submissionsOverTime;
      if (submissionsChartImg) {
        try {
          const imgProps = doc.getImageProperties(submissionsChartImg);
          const imgWidth = CONTENT_WIDTH;
          const imgHeight = (imgWidth / imgProps.width) * imgProps.height;

          if (contentY + imgHeight > FOOTER_Y - 15) {
            doc.addPage();
            contentY = MARGIN + 10;
          }

          doc.addImage(submissionsChartImg, 'PNG', MARGIN, contentY, imgWidth, imgHeight);
          contentY += imgHeight + 5;
        } catch {
          // Skip failed image
        }
      }

      if (reportData.submissionsOverTime.length > 0) {
        const data = reportData.submissionsOverTime;
        const total = data.reduce((sum, d) => sum + d.count, 0);
        const rows = data.map((d) => [d.date || 'Unknown', d.count.toString()]);

        autoTable(doc, {
          startY: contentY,
          head: [['Date', 'Submissions']],
          body: rows,
          theme: 'striped',
          headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold' },
          foot: [['Total', total.toString()]],
          footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: MARGIN, right: MARGIN, bottom: A4_HEIGHT - FOOTER_Y + 10 }
        });
      }
    } else if (section.key === 'summary') {
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text('Key Statistics', MARGIN, contentY);
      contentY += 12;

      const totalSubmissions = reportData.submissionsOverTime.reduce((sum, d) => sum + d.count, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Submissions: ${totalSubmissions}`, MARGIN + 5, contentY);
      contentY += 8;
      doc.text(`Reporting Period: ${formatDate(options.dateFrom)} to ${formatDate(options.dateTo)}`, MARGIN + 5, contentY);
      contentY += 8;
      doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, MARGIN + 5, contentY);
      contentY += 15;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Data Highlights', MARGIN, contentY);
      contentY += 8;

      const summaryRows = [];
      for (const fieldId in reportData.dynamicReports) {
        const report = reportData.dynamicReports[fieldId];
        const totalFieldCount = report.data.reduce((sum, d) => sum + d.count, 0);
        const sortedData = [...report.data].sort((a, b) => b.count - a.count);
        const topOption = sortedData[0];
        const topLabel = topOption ? (topOption.date || topOption.name || 'Unknown') : 'N/A';
        const topPct = totalFieldCount > 0 && topOption ? ((topOption.count / totalFieldCount) * 100).toFixed(1) + '%' : '0%';

        summaryRows.push([
          report.field.label,
          totalFieldCount.toString(),
          `${topLabel} (${topPct})`
        ]);
      }

      if (summaryRows.length > 0) {
        autoTable(doc, {
          startY: contentY,
          head: [['Field Name', 'Total Responses', 'Top Response (Dominance)']],
          body: summaryRows,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 5 },
          margin: { left: MARGIN, right: MARGIN }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No dynamic field data available for this period.', MARGIN + 5, contentY);
      }
    } else {
      const fieldId = section.key.replace('dynamic-', '');
      const dynamicChartImg = chartImages.dynamicCharts[fieldId];

      if (dynamicChartImg) {
        try {
          const imgProps = doc.getImageProperties(dynamicChartImg);
          const imgWidth = CONTENT_WIDTH;
          const imgHeight = (imgWidth / imgProps.width) * imgProps.height;

          if (contentY + imgHeight > FOOTER_Y - 15) {
            doc.addPage();
            contentY = MARGIN + 10;
          }

          doc.addImage(dynamicChartImg, 'PNG', MARGIN, contentY, imgWidth, imgHeight);
          contentY += imgHeight + 5;
        } catch {
          // Skip failed image
        }
      }

      const report = reportData.dynamicReports[fieldId];
      if (report && report.data.length > 0) {
        const data = report.data;
        const isDateField = report.field.type === 'date';
        const valueLabel = isDateField ? 'Date' : 'Value';
        const total = data.reduce((sum, d) => sum + d.count, 0);

        const rows = data.map((d) => {
          const label = (d.date || d.name || 'Unknown');
          const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) + '%' : '0%';
          return [label, d.count.toString(), pct];
        });

        autoTable(doc, {
          startY: contentY,
          head: [[valueLabel, 'Submissions', '%']],
          body: rows,
          theme: 'striped',
          headStyles: { fillColor: [243, 244, 246], textColor: [75, 85, 99], fontStyle: 'bold' },
          foot: [['Total', total.toString(), '100%']],
          footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: MARGIN, right: MARGIN, bottom: A4_HEIGHT - FOOTER_Y + 10 }
        });
      }
    }
  }

  doc.setPage(tocPageNumber);

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, MARGIN + 20, MARGIN + CONTENT_WIDTH, MARGIN + 20);

  let tocY = MARGIN + 35;
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81);

  for (const section of sections) {
    const pageNum = sectionPageNumbers[section.key];

    doc.setFont('helvetica', 'normal');
    doc.text(section.title, MARGIN, tocY);

    const titleWidth = doc.getTextWidth(section.title);
    const pageNumText = `Page ${pageNum}`;
    const pageNumWidth = doc.getTextWidth(pageNumText);
    const dotsStart = MARGIN + titleWidth + 2;
    const dotsEnd = A4_WIDTH - MARGIN - pageNumWidth - 2;

    if (dotsEnd > dotsStart) {
      doc.setTextColor(156, 163, 175);
      for (let dx = dotsStart; dx < dotsEnd; dx += 4) {
        doc.text('.', dx, tocY);
      }
      doc.setTextColor(55, 65, 81);
    }

    doc.setFont('helvetica', 'bold');
    doc.text(pageNumText, A4_WIDTH - MARGIN, tocY, { align: 'right' });

    tocY += 12;
  }

  // Footer on all pages

  const totalPagesCount = doc.getNumberOfPages();
  for (let i = 1; i <= totalPagesCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPagesCount}`, A4_WIDTH / 2, FOOTER_Y, { align: 'center' });

    const footerY = FOOTER_Y + 5;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);

    const year = new Date().getFullYear();
    const footerLine = appName;
    const copyrightText = `© ${year} ${officeName}`;

    if (footerLine && footerLine !== ' - ') {
      doc.text(footerLine, A4_WIDTH / 2, footerY, { align: 'center' });
    }
    doc.setTextColor(156, 163, 175);
    doc.text(copyrightText, A4_WIDTH / 2, footerY + 4, { align: 'center' });
  }

  const today = new Date().toISOString().split('T')[0];
  doc.save(`reports_${today}.pdf`);
}