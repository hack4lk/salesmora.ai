import type {Meta,StoryObj} from '@storybook/nextjs-vite';import {JobsReviewGallery} from './jobs-review-gallery';
const meta={title:'Jobs/ReviewGallery',component:JobsReviewGallery,parameters:{layout:'fullscreen'}} satisfies Meta<typeof JobsReviewGallery>;export default meta;type Story=StoryObj<typeof meta>;export const Default:Story={};
