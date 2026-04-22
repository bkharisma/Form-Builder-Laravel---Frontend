import type { ChartType } from '../components/DynamicChart';
import type { FormFieldType } from '../types';

interface ChartTypeConfig {
  defaultChartType: ChartType;
  allowedChartTypes: ChartType[];
  dataKey: 'date' | 'name';
}

const chartTypeMap: Record<FormFieldType, ChartTypeConfig> = {
  select: {
    defaultChartType: 'pie',
    allowedChartTypes: ['pie', 'bar', 'horizontalBar', 'doughnut'],
    dataKey: 'name',
  },
  checkbox: {
    defaultChartType: 'pie',
    allowedChartTypes: ['pie', 'bar'],
    dataKey: 'name',
  },
  text: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  date: {
    defaultChartType: 'line',
    allowedChartTypes: ['line', 'bar'],
    dataKey: 'date',
  },
  textarea: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  email: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  number: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  tel: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  time: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  radio: {
    defaultChartType: 'pie',
    allowedChartTypes: ['pie', 'bar', 'horizontalBar', 'doughnut'],
    dataKey: 'name',
  },
  file_upload: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  image_upload: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
  signature: {
    defaultChartType: 'horizontalBar',
    allowedChartTypes: ['horizontalBar', 'bar'],
    dataKey: 'name',
  },
};

export function getChartConfig(fieldType: FormFieldType): ChartTypeConfig {
  return chartTypeMap[fieldType];
}

export function getDefaultChartType(fieldType: FormFieldType): ChartType {
  return chartTypeMap[fieldType].defaultChartType;
}

export function getDataKey(fieldType: FormFieldType): 'date' | 'name' {
  return chartTypeMap[fieldType].dataKey;
}