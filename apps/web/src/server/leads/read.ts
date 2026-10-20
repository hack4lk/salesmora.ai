import 'server-only';
import { readLeads, readLead } from '@salesmora/data';
import type { LeadListQuery } from '@salesmora/contracts';
import { enabledPermissions } from '../authorization/permissions';
import { database } from '../workspaces/store';
export function workspaceLeads(userId: string, query: LeadListQuery) { return readLeads(database(), { userId, workspaceId: query.workspaceId }, enabledPermissions, query); }
export function workspaceLead(userId: string, workspaceId: string, id: string, activityPage = 1, notesPage = 1) { return readLead(database(), { userId, workspaceId }, enabledPermissions, id, activityPage, notesPage); }
