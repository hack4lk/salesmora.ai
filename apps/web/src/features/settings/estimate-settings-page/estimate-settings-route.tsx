"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  estimateBusinessProfileReadSchema,
  estimateBusinessProfileRecordSchema,
} from "@salesmora/contracts";
import { ConfirmDialog } from "@salesmora/ui";
import type {
  EstimateBusinessProfileDraft,
  EstimateBusinessProfileRecord,
  EstimateBusinessProfileSource,
  EstimateBusinessLogoUpload,
} from "../../estimates/estimate-business-profile-form/estimate-business-profile-form.preview";
import { initialEstimateBusinessProfileDraft } from "../../estimates/estimate-business-profile-form/estimate-business-profile-form.preview";
import type { EstimateRole } from "../../estimates/estimate-preview.types";
import { EstimateSettingsPage } from "./estimate-settings-page";
import { estimateSettingsPageData as copy } from "./estimate-settings-page.data";
import { SettingsQueryBoundary, useSettingsRequest } from "../use-settings-request";
import { isApiAccessError } from "../../api/api-query";

type RouteResponse = { status: number; body: unknown };
type PendingNavigation =
  | { type: "href"; href: string }
  | { type: "sign-out"; button: HTMLButtonElement };

type Props = {
  workspaceId: string; timezone: string; initial: EstimateBusinessProfileRecord;
  canManage: boolean; role: EstimateRole;
};
export function EstimateSettingsRoute(props: Props) {
  return <SettingsQueryBoundary workspaceId={props.workspaceId}><EstimateSettingsHost {...props}/></SettingsQueryBoundary>;
}
function EstimateSettingsHost({
  workspaceId,
  timezone,
  initial,
  canManage: initialCanManage,
  role: initialRole,
}: Props) {
  const path = `/api/settings/estimates?workspace=${encodeURIComponent(workspaceId)}`;
  const parseRecord = (raw: unknown) => {
    const record = estimateBusinessProfileRecordSchema.parse(raw);
    if (record.workspaceId !== workspaceId) throw new Error(copy.requestError);
    return record;
  };
  const api = useSettingsRequest<ReturnType<typeof estimateBusinessProfileReadSchema.parse>, EstimateBusinessProfileRecord>('estimate-settings', path, raw => {
    const result = estimateBusinessProfileReadSchema.parse(raw);
    parseRecord(result.record);
    return result;
  }, copy.requestError);
  const router = useRouter();
  const [record, setRecord] = useState(initial);
  const [value, setValue] = useState(() => initialEstimateBusinessProfileDraft(initial));
  const [canManage, setCanManage] = useState(initialCanManage);
  const [role, setRole] = useState(initialRole);
  const [pending, setPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [saved, setSaved] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [leaveTarget, setLeaveTarget] = useState<PendingNavigation | null>(null);
  const inFlight = useRef(false);
  const allowSignOut = useRef(false);
  const dirty = JSON.stringify(value.profile) !== JSON.stringify(record.profile);

  useEffect(() => {
    function captureNavigation(event: MouseEvent) {
      if (allowSignOut.current) {
        allowSignOut.current = false;
        return;
      }
      if (
        (!dirty && !pending && !uploadPending && !inFlight.current) ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const action = target?.closest<HTMLButtonElement>("[data-workspace-action]");
      if (action?.dataset.workspaceAction === "sign-out") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setLeaveTarget({ type: "sign-out", button: action });
        return;
      }
      if (action?.dataset.workspaceAction === "account-settings") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setLeaveTarget({
          type: "href",
          href: `/settings/account?workspace=${encodeURIComponent(workspaceId)}`,
        });
        return;
      }
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setLeaveTarget({ type: "href", href: `${url.pathname}${url.search}${url.hash}` });
    }
    function guardNavigation(event: BeforeUnloadEvent) {
      if (dirty || pending || uploadPending || inFlight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    document.addEventListener("click", captureNavigation, true);
    window.addEventListener("beforeunload", guardNavigation);
    return () => {
      document.removeEventListener("click", captureNavigation, true);
      window.removeEventListener("beforeunload", guardNavigation);
    };
  }, [dirty, pending, uploadPending, workspaceId]);

  async function response(request: Promise<Response>): Promise<RouteResponse> {
    const result = await request;
    const body: unknown = await result.json();
    if (!result.ok) {
      const status = result.status;
      if (api.isActive() && [401, 403, 404, 423].includes(status)) setUnavailable(true);
      throw Object.assign(new Error(), { status, body });
    }
    return { status: result.status, body };
  }

  async function reload() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    try {
      const next = await api.read();
      setRecord(next.record);
      setValue(initialEstimateBusinessProfileDraft(next.record));
      setCanManage(next.canManage);
      setRole(next.role);
      setConflict(false);
      setSaved(false);
      setUnavailable(false);
    } catch (error) {
      if (!api.isActive()) throw error;
      if (isApiAccessError(error)) setUnavailable(true);
      if (error instanceof Error && "status" in error && error.status === 409) {
        setConflict(true);
      }
      throw error;
    } finally {
      inFlight.current = false;
      if (api.isActive()) setPending(false);
    }
  }

  async function save(request: EstimateBusinessProfileDraft) {
    if (inFlight.current) throw new Error("A settings request is already in progress.");
    inFlight.current = true;
    setPending(true);
    setSaved(false);
    try {
      const next = await api.write({
        path: "/api/settings/estimates",
        method: "PUT",
        body: request,
        parse: raw => {
          if (!raw || typeof raw !== 'object' || !('record' in raw)) throw new Error(copy.requestError);
          return parseRecord(raw.record);
        },
        failureMessage: copy.requestError,
      });
      setRecord(next);
      setValue(initialEstimateBusinessProfileDraft(next));
      setSaved(true);
      setConflict(false);
    } catch (error) {
      if (!api.isActive()) throw error;
      if (isApiAccessError(error)) setUnavailable(true);
      if (error instanceof Error && "status" in error && error.status === 409) {
        setConflict(true);
      }
      throw error;
    } finally {
      inFlight.current = false;
      if (api.isActive()) setPending(false);
    }
  }

  async function uploadLogo(request: EstimateBusinessLogoUpload) {
    if (inFlight.current) throw new Error("A settings request is already in progress.");
    inFlight.current = true;
    setUploadPending(true);
    setConflict(false);
    try {
      const form = new FormData();
      form.set("workspaceId", request.workspaceId);
      form.set("expectedVersion", String(request.expectedVersion));
      form.set("file", request.file);
      const result = await response(fetch("/api/settings/estimates/logo", {
        method: "POST",
        cache: "no-store",
        body: form,
      }));
      if (!api.isActive()) throw new Error(copy.requestError);
      if (
        !result.body ||
        typeof result.body !== "object" ||
        !("logoPath" in result.body) ||
        typeof result.body.logoPath !== "string"
      ) {
        throw new Error("The server returned an invalid logo reference.");
      }
      return { logoPath: result.body.logoPath };
    } catch (error) {
      if (!api.isActive()) throw error;
      if (error instanceof Error && "status" in error && error.status === 409) {
        setConflict(true);
      }
      throw error;
    } finally {
      inFlight.current = false;
      if (api.isActive()) setUploadPending(false);
    }
  }

  function change(next: EstimateBusinessProfileDraft) {
    setValue(next);
    setSaved(false);
  }

  function discard() {
    setValue(initialEstimateBusinessProfileDraft(record));
    setSaved(false);
  }

  const source: EstimateBusinessProfileSource = unavailable
    ? { state: "unavailable" }
    : { state: "ready", record };

  return <>
    <EstimateSettingsPage
      businessProfile={{
        source,
        value,
        role,
        canRead: !unavailable,
        canManage,
        timezone,
        pending,
        conflict,
        saved,
        onChange: change,
        onSave: save,
        onDiscard: discard,
        onReload: reload,
        onUploadLogo: uploadLogo,
      }}
    />
    <ConfirmDialog
      open={leaveTarget !== null}
      title={copy.leaveTitle}
      description={copy.leaveDescription}
      confirmLabel={copy.discard}
      cancelLabel={copy.stay}
      pending={pending || uploadPending}
      onClose={() => setLeaveTarget(null)}
      onConfirm={() => {
        const target = leaveTarget;
        setLeaveTarget(null);
        if (target?.type === "href") router.push(target.href);
        else if (target?.type === "sign-out") {
          allowSignOut.current = true;
          target.button.click();
        }
      }}
    />
  </>;
}
