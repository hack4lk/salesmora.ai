import { leadPipelineWidgetData } from '../lead-pipeline-widget/lead-pipeline-widget.data';

export const homePageViewData = {
  pipeline: leadPipelineWidgetData.title,
  pipelineLoading: 'Loading lead pipeline...',
  pipelineError: 'We could not load the lead pipeline. Other sections are still available.',
  pipelineRetry: 'Retry pipeline',
  orderClasses: ['order-0', 'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-6'],
} as const;
