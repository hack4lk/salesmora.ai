import {expect, fn, within} from 'storybook/test';
import {RelatedEstimatesCard} from '../../estimates/related-estimates-card/related-estimates-card';
import {relatedEstimateFixtures} from '../../estimates/related-estimates-card/related-estimates-card.data';
import type {Meta,StoryObj} from '@storybook/nextjs-vite';
import {JobDetailPage} from './job-detail-page';
import * as f from '../job-preview.data';
import {JobWorkOrdersCard} from '../../work-orders/job-work-orders-card/job-work-orders-card';
import {jobWorkOrderFixtures} from '../../work-orders/work-order-preview.data';

const meta={title:'Jobs/JobDetailPage',component:JobDetailPage,args:{job:f.jobFixtures[2],today:f.jobToday,activity:f.jobActivity,files:f.jobFiles,messages:f.jobMessages,related:[{id:'customer',kind:'customer',label:f.jobFixtures[2].customerName,canOpen:true}],onBack:fn(),onAction:fn(),onAssistant:fn(),onNote:fn(),onMessage:fn(),onAddFile:fn(),onOpenFile:fn(),onDownloadFile:fn(),onRemoveFile:fn(),onEditFile:fn(),onRelated:fn()},parameters:{layout:'fullscreen'},
decorators:[Story=><main className="min-h-screen bg-canvas p-4 sm:p-8"><h1 className="mb-6 mt-0 text-xl font-semibold text-ink">{f.jobPreviewData.workspace}</h1><Story/></main>],
} satisfies Meta<typeof JobDetailPage>;
export default meta;type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReadOnly:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobReadOnlyCapabilities},files:f.jobFiles.map(file=>({...file,canRemove:false}))}};
export const Closed:Story={args:{job:f.jobFixtures[6],files:f.jobFiles.map(file=>({...file,canRemove:false}))}};
export const Field:Story={args:{job:{...f.jobFixtures[2],capabilities:f.jobFieldCapabilities},related:[{id:'customer',kind:'customer',label:f.jobFixtures[2].customerName,canOpen:false}],files:f.jobFiles.map(file=>({...file,canRemove:false}))}};
export const WithWorkOrders:Story={args:{workOrdersSlot:<JobWorkOrdersCard workOrders={jobWorkOrderFixtures.mixed} canCreate onOpen={fn()} onAdd={fn()}/>}};
export const WithEstimates:Story={args:{relatedEstimates:<RelatedEstimatesCard recordType="job" estimates={relatedEstimateFixtures} total={3} canRead canCreate onCreate={fn()}/>},
  play:async({canvasElement})=>{const c=within(canvasElement);await expect(c.getByRole('heading',{name:'Estimates'})).toBeVisible();await expect(c.getAllByRole('link',{name:/^Open estimate EST-/})).toHaveLength(3);await expect(c.getByRole('button',{name:'Create estimate'})).toBeEnabled();}};
export const ReadOnlyEstimates:Story={args:{...ReadOnly.args,relatedEstimates:<RelatedEstimatesCard recordType="job" estimates={relatedEstimateFixtures} total={3} canRead/>},
  play:async({canvasElement})=>{await expect(within(canvasElement).queryByRole('button',{name:'Create estimate'})).not.toBeInTheDocument();}};
