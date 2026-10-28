# Calendar Gantt Chart View - Implementation Plan

**Document Version:** 1.0  
**Last Updated:** 2026-10-21  
**Status:** Implemented (read-only MVP)  
**Author:** Copilot Agent  

## Overview

Create a linear Gantt chart view as a sub-page within the existing calendar module. This view will provide admins and owners with a comprehensive timeline overview of all jobs and their associated work orders, enabling better visibility into project scheduling, resource allocation, and timeline management.

## Business Objectives

1. **Visibility**: Provide a bird's-eye view of all active jobs and work orders across a timeline
2. **Planning**: Enable better scheduling and resource allocation decisions
3. **Coordination**: Help identify scheduling conflicts and dependencies
4. **Status Monitoring**: Quick visual reference for job and work order progress

## User Personas & Access

- **Admin**: Full access to all jobs and work orders across the workspace
- **Owner**: Full access to owned jobs and associated work orders
- **Role-based Access**: Use existing authorization system to filter displayed jobs/work orders

## Feature Scope

### Core Functionality

#### 1. **Gantt Chart Timeline Rendering**
- **Horizontal timeline** with configurable date range
- **Responsive grid** with time periods (days/weeks based on zoom level)
- **Visual timeline headers** showing month, week, and day indicators
- **Vertical grid lines** for time period demarcation

#### 2. **Job Rows**
- Each job displayed as a **gray/neutral bar** representing the job's overall duration
- **Job name/identifier** displayed in left sidebar
- Job bar spans from estimated start to estimated completion date
- **Visual indicators** for:
  - On-track status (green)
  - At-risk status (yellow/orange)
  - Delayed status (red)

#### 3. **Work Order Sub-Rows**
- **Nested under parent job** with visual indentation
- Each work order displayed as a **bright green bar** (as shown in mockup)
- **Duration visualization** from start date to completion date
- **Sequential or parallel arrangement** based on dependencies (phase 2)

#### 4. **Timeline Controls**
- **Zoom in/out** controls (day/week/month views)
- **Date range selector** (e.g., next 30/60/90 days)
- **Filter options**:
  - By job status (active, completed, archived)
  - By team/assigned user
  - By priority
  - By customer
- **Scroll controls** for horizontal timeline navigation

#### 5. **Interaction & Drill-Down**
- **Hover states** showing job/work order details:
  - Title
  - Start and end dates
  - Current status
  - Assigned team members
- **Click to open** job or work order detail view (in drawer or modal)
- **Drag to reschedule** (future enhancement) - allows inline date adjustment

#### 6. **Legend & Status Indicators**
- Color-coded legend explaining:
  - Job bar styling
  - Work order styling
  - Status indicators (on-track, at-risk, delayed)
- Status badge on each bar

## Technical Architecture

### Component Structure

```
apps/web/src/features/gantt-chart/
├── gantt-chart.types.ts             # Re-exported contract types and status mappers
├── gantt-chart.fixtures.ts          # Sample jobs/work orders for stories
├── gantt-timeline.ts                # Day width, range and bar position math
├── gantt-chart/                     # Main container (layout, filtering, scroll sync)
├── gantt-filters/                   # Status / Team / Customer filter bar
├── gantt-legend/                    # Color legend
├── gantt-timeline-header/           # Date columns
├── gantt-job-label/                 # Sidebar job row (expand/collapse)
├── gantt-work-order-label/          # Sidebar work order row
├── gantt-job-row/                   # Timeline job bar
└── gantt-work-order-row/            # Timeline work order bar
```

Each component folder holds `name.tsx`, `name.data.ts` and `name.stories.tsx`.

### Data Model

**Job Gantt Entry:**
```typescript
interface GanttJob {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  estimatedDuration: number; // in days
  workOrders: GanttWorkOrder[];
  assignedTeam?: User[];
  progress?: number; // 0-100
}

interface GanttWorkOrder {
  id: string;
  jobId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  estimatedDuration: number;
  assignedTo?: User;
  dependencies?: string[]; // IDs of dependent work orders
}
```

**Timeline Scale State:**
```typescript
interface TimelineState {
  zoomLevel: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  visibleRange: number; // pixels per day/week/month
  scrollPosition: number;
}
```

### Data Flow

1. **Fetch Jobs & Work Orders**:
   - Query jobs by workspace and authorization scope
   - Join with work orders using existing domain models
   - Apply filters (status, team, priority, customer)

2. **Calculate Positions**:
   - Convert date ranges to pixel positions based on timeline scale
   - Calculate left offset and width for each bar
   - Handle overlapping work orders (visual stacking)

3. **Render Timeline**:
   - Draw timeline header with date indicators
   - Render job rows with nested work order bars
   - Apply status-based styling
   - Add interactive overlays (hover, click handlers)

### Data Source Integration

- **Existing Repositories**: Leverage `JobRepository` and `WorkOrderRepository` from domain layer
- **Authorization**: Use existing `authorize()` function to filter jobs by user scope
- **Real-time Updates**: Integrate with existing polling/subscription mechanism (if available)

## UI/UX Design Details

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Gantt Chart Controls (Zoom, Filters, Date Range)           │
├─────────────────────────────────────────────────────────────┤
│ Legend: [Job Bar] [Work Order] [On-Track] [At-Risk] [Delayed]│
├──────────┬──────────────────────────────────────────────────┤
│ Job List │ Timeline Grid with Months/Weeks/Days            │
│ (Left)   │                                                  │
│          │ ┌─────────────────────────────────────────────┐  │
│ Job A    │ │ [========== Job A ==========]               │  │
│ └─WO1    │ │   [=== WO1 ===]                            │  │
│ └─WO2    │ │         [======= WO2 =======]              │  │
│ └─WO3    │ │   [== WO3 ==]                              │  │
│          │ └─────────────────────────────────────────────┘  │
│          │ ┌─────────────────────────────────────────────┐  │
│ Job B    │ │ [===== Job B =====]                         │  │
│ └─WO4    │ │ [= WO4 =]                                  │  │
│ └─WO5    │ │      [======= WO5 =======]                 │  │
│          │ └─────────────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────┘
```

### Color Scheme

- **Job Bars**: Light gray/neutral (`#D3D3D3` or Tailwind `gray-300`)
- **Work Order Bars**: Bright green (`#00FF00` or Tailwind `green-500/lime-400`)
- **On-Track Status**: Green border/accent
- **At-Risk Status**: Orange/yellow border/accent
- **Delayed Status**: Red border/accent
- **Completed**: Reduced opacity or striped pattern

### Responsive Behavior

- **Desktop**: Full horizontal timeline with sidebar job list
- **Tablet**: Collapsible sidebar, horizontal scroll for timeline
- **Mobile**: Consider simplified view or vertical stack (deferred to phase 2)

## Implementation Phases

### Phase 1: MVP (Foundation)
**Duration:** 2-3 weeks

**Deliverables:**
1. Component structure and basic rendering
2. Timeline grid with fixed zoom level (week view)
3. Job and work order bars with duration calculation
4. Basic hover states and styling
5. Date range selector (next 60 days default)
6. Filter by job status
7. Authorization-based job filtering
8. Unit tests for core calculation logic
9. Storybook stories for component testing

**Acceptance Criteria:**
- Gantt chart renders all jobs and work orders correctly
- Timeline accurately represents date ranges
- Authorization prevents unauthorized job viewing
- Hover states display relevant information
- No performance degradation with 100+ jobs

### Phase 2: Enhancement (Interactivity)
**Duration:** 2-3 weeks

**Deliverables:**
1. Zoom controls (day/week/month switching)
2. Advanced filters (team, priority, customer)
3. Click-to-detail drawer integration
4. Status indicator badges
5. Progress visualization
6. Dependency visualization (connecting lines between dependent WOs)
7. Performance optimization (virtualization for large lists)
8. E2E tests for user interactions

**Acceptance Criteria:**
- Zoom controls smoothly transition between views
- Filters work correctly in combination
- Click opens appropriate detail view
- Performance acceptable with 500+ jobs

### Phase 3: Advanced Features (Future)
**Duration:** TBD

**Deliverables:**
1. Drag-to-reschedule functionality
2. Real-time updates via WebSocket
3. Print/export capabilities
4. Mobile-optimized view
5. Custom date range picker
6. Saved filter presets
7. Team capacity overlay

## API Requirements

### Queries Needed

1. **Get Jobs with Work Orders**
   ```
   Query: GetJobsWithWorkOrders
   Parameters: 
   - workspaceId: string
   - filters: { statusIn?: string[], teamId?: string, customerId?: string }
   - dateRange: { start: Date, end: Date }
   Returns: GanttJob[]
   ```

2. **Get Job Details** (for drawer)
   ```
   Query: GetJobDetail
   Parameters: jobId: string
   Returns: Job with full details including all work orders
   ```

### Existing APIs to Leverage
- Existing job/work order queries from domain layer
- Authorization checks via `authorize()` function
- Workspace context from existing state management

## Testing Strategy

### Unit Tests
- Date calculations and positioning logic
- Filter application and data transformation
- Status determination logic
- Authorization-based filtering

### Component Tests
- Rendering accuracy with sample data sets
- Responsiveness to prop changes
- Interaction handlers (hover, click)
- Filter and zoom state changes

### Integration Tests
- Data fetching and rendering pipeline
- Authorization integration
- Drawer/modal open and close
- Real data scenarios

### E2E Tests
- Full user workflow: navigate to gantt view, filter, drill-down
- Permission-based visibility (verify unauthorized jobs hidden)
- Timeline interaction workflow

### Performance Tests
- Render time with 100, 500, 1000+ jobs
- Timeline scroll smoothness
- Filter application performance
- Zoom transition performance

## Accessibility Considerations

- **ARIA Labels**: Describe job/work order bars and their status
- **Keyboard Navigation**: Tab through bars, enter to open details
- **Color Alternatives**: Don't rely solely on color for status (add text labels)
- **Touch Targets**: Minimum 44x44px for interactive elements
- **High Contrast**: Ensure colors meet WCAG AA standards

## Performance Considerations

1. **Virtualization**: Only render visible rows (use react-window or similar)
2. **Memoization**: Memoize expensive calculations and components
3. **Debouncing**: Debounce scroll and zoom events
4. **Lazy Loading**: Load additional data as user scrolls
5. **Caching**: Cache calculated positions for static data periods

## Documentation Needs

- **Component API Documentation**: Props, event handlers, examples
- **Usage Guide**: How admins use the feature
- **Storybook Stories**: Interactive documentation with variants
- **Configuration Guide**: Filter options, zoom levels, date ranges

## Success Metrics

1. **Feature Adoption**: % of admins/owners using the feature weekly
2. **Performance**: Page load < 2s, scroll frame rate > 60fps
3. **Accuracy**: Zero bugs in timeline calculation (verified by tests)
4. **User Satisfaction**: Positive feedback from beta testers
5. **Data Quality**: Accurate reflection of job/work order data

## Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Large data sets cause performance issues | High | Medium | Implement virtualization early, load test with 1000+ jobs |
| Timeline calculation accuracy issues | High | Low | Thorough unit test coverage, edge case testing |
| Authorization scope conflicts | High | Low | Leverage existing authorize() function, test with different roles |
| Work order dependency visualization complexity | Medium | Medium | Defer to Phase 3, start with sequential only |
| Mobile view complexity | Low | High | Defer to Phase 3, focus on desktop/tablet initially |

## Dependencies & Blockers

- ✅ Calendar page foundation (existing)
- ✅ Job and work order domain models (existing)
- ✅ Authorization system (existing)
- ⏳ Exact job/work order duration fields must be queryable
- ⏳ Need confirmation on which fields determine job/WO status

## File & Folder Structure

```
apps/web/src/features/gantt-chart/
├── gantt-chart.types.ts             # Interfaces and status mappers
├── gantt-chart.fixtures.ts          # Sample jobs/work orders for stories
├── gantt-timeline.ts                # Day width, range and bar position math
├── gantt-chart/                     # Main container (layout, filtering, scroll sync)
├── gantt-filters/                   # Status / Team / Customer filter bar
├── gantt-legend/                    # Color legend
├── gantt-timeline-header/           # Date columns
├── gantt-job-label/                 # Sidebar job row (expand/collapse)
├── gantt-work-order-label/          # Sidebar work order row
├── gantt-job-row/                   # Timeline job bar
└── gantt-work-order-row/            # Timeline work order bar
```

Each component folder holds `name.tsx`, `name.data.ts` and `name.stories.tsx`.

## Implemented Page

- **Route:** `/calendar/gantt?workspace=<id>` (`apps/web/src/app/(auth)/calendar/gantt/page.tsx`), rendered by `apps/web/src/server/gantt/read-page.tsx`. Server-rendered; data is passed to the client `GanttChart`. No API route and no real-time updates.
- **Menu:** "Gantt chart" is a sub-item under Calendar. `WorkspaceNavigation` shows it only when `ganttHref` is supplied, which every page does from `caps.readGantt`.
- **Access:** `canViewGantt` (`packages/domain/src/calendar/gantt.ts`) requires the owner or admin role plus workspace scope on `calendar.read`, `jobs.read` and `workorders.read`. The page returns 404 otherwise, and `readGantt` re-checks in the data layer. Office and field users are excluded. It can move to a dedicated catalog permission later.
- **Data:** `readGantt` (`packages/data/src/gantt/read.ts`) returns jobs with nested work orders, team members and customers, using the shared `Gantt*` contract types. Rehearsal: `pnpm --filter @salesmora/data test:gantt` (needs the isolated test database).
- **Jobs shown:** all open jobs, plus completed/canceled jobs whose last date is within 90 days. Capped at 300 jobs; the page tells the user when the cap is hit.
- **Dates:** "today" is the workspace timezone's date. A job's bar runs from `scheduledDate` to `completionDeadline`; with only one of them it is a single day, with neither it shows "No dates scheduled". A work order has one `scheduledDate` (and the completion day once completed), so it renders as that day or span. End days are inclusive.
- **Colors:** overdue open jobs are red, waiting jobs amber, otherwise green. Completed items are dimmed.
- **Team filter:** matches the job's primary owner or any team member.
- **Interaction:** expanding a job reveals its work orders; bars link to `/jobs/<id>` and `/work-orders/<id>`. The chart opens scrolled to today.
- **Not built:** hover tooltips, a detail drawer, zoom levels, drag-to-reschedule.

## Appendix: Related Documents

- [calendar-page-plan.md](calendar-page-plan.md) - Parent calendar feature
- [work-orders-plan.md](work-orders-plan.md) - Work order data model
- [job-module-plan.md](job-module-plan.md) - Job data model
- [authorization-permissions-plan.md](authorization-permissions-plan.md) - Authorization patterns
