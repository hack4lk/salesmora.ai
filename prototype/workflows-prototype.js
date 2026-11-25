const find = (id) => document.getElementById(id);

const recipes = {
  intake: {
    starter: "Route new leads",
    prompt: "Route new website leads to the Office team.",
    name: "Website lead routing",
    rule: "Assign reviewed website leads to the Office team.",
    details: "Possible duplicates and incomplete submissions stay in Intake Review.",
  },
  scheduling: {
    starter: "Flag unscheduled work",
    prompt: "Notify the Office team if an approved estimate still has no visit by the next business day.",
    name: "Unscheduled estimate reminder",
    rule: "Notify the Office team if an approved estimate still has no visit by the end of the next business day.",
    details: "The Office team gets an in-app notification. Skip estimates that already have a visit. Use workspace business hours and apply to future approvals.",
  },
  briefing: {
    starter: "Send a weekly briefing",
    prompt: "Send me a summary of unscheduled jobs every Friday.",
    name: "Friday jobs briefing",
    rule: "Send me a summary of unscheduled jobs every Friday.",
    details: "Send an in-app briefing at 9 AM workspace time with links to the jobs I can access.",
  },
};

const workflows = [
  { ...recipes.intake, id: 1, status: "Active", pending: 0 },
  { ...recipes.briefing, id: 2, status: "Paused", pending: 1 },
];
let nextId = 3;
let draft;
let draftKind;
let selected;
let pendingAction;

function button(label, callback, className = "button") {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = label;
  element.addEventListener("click", callback);
  return element;
}

function renderRows() {
  const rows = find("rows");
  rows.replaceChildren();
  if (workflows.length === 0) {
    const cell = rows.insertRow().insertCell();
    cell.colSpan = 3;
    cell.textContent = "No workflows yet.";
  }
  for (const workflow of workflows) {
    const row = rows.insertRow();
    const summary = row.insertCell();
    summary.append(button(workflow.name, () => openWorkflow(workflow), "row-link"));
    const description = document.createElement("p");
    description.className = "workflow-description";
    description.textContent = workflow.rule;
    summary.append(description);
    const status = document.createElement("span");
    status.className = workflow.status === "Active" ? "status active" : "status";
    status.textContent = workflow.status;
    row.insertCell().append(status);
    const actions = row.insertCell();
    actions.className = "row-actions";
    actions.append(createRowActions(workflow));
  }
}

function createRowActions(workflow) {
  const popover = document.createElement("div");
  popover.id = "workflow-actions-" + workflow.id;
  popover.className = "action-popover";
  popover.setAttribute("popover", "auto");
  popover.setAttribute("role", "group");
  popover.setAttribute("aria-label", "Actions for " + workflow.name);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "button more-actions";
  trigger.textContent = "⋯";
  trigger.setAttribute("aria-label", "Actions for " + workflow.name);
  trigger.popoverTargetElement = popover;

  popover.addEventListener("beforetoggle", (event) => {
    if (event.newState !== "open") return;
    const bounds = trigger.getBoundingClientRect();
    popover.style.left = Math.max(8, bounds.right - 148) + "px";
    popover.style.top = (bounds.bottom + 126 <= window.innerHeight ? bounds.bottom + 4 : bounds.top - 126) + "px";
  });

  const toggle = workflow.status === "Active" ? "Pause" : "Resume";
  for (const action of ["View workflow", toggle, "Delete"]) {
    popover.append(button(action, () => {
      popover.hidePopover();
      trigger.focus();
      openWorkflow(workflow, action === "View workflow" ? undefined : action);
    }, action === "Delete" ? "button danger" : "button"));
  }

  const container = document.createElement("div");
  container.append(trigger, popover);
  return container;
}

function openWorkflow(workflow, action) {
  selected = workflow;
  if (action) {
    openConfirmation(action);
    return;
  }
  find("workflow-title").textContent = workflow.name;
  find("workflow-rule").textContent = workflow.rule;
  const status = find("workflow-status");
  status.textContent = workflow.status;
  status.classList.toggle("active", workflow.status === "Active");
  find("toggle").textContent = workflow.status === "Active" ? "Pause" : "Resume";
  find("workflow").showModal();
}

function openConfirmation(action) {
  pendingAction = action;
  const deleting = action === "Delete";
  const descriptions = {
    Pause: selected.pending ? "Waiting work will be held." : "New runs will stop.",
    Resume: "Waiting work will be checked again before it runs.",
    Delete: "Waiting work will be canceled.",
  };
  find("status-title").textContent = action + " " + selected.name + "?";
  find("status-description").textContent = descriptions[action];
  find("delete-verification").hidden = !deleting;
  find("delete-word").value = "";
  const confirm = find("confirm-status");
  confirm.textContent = action + " workflow";
  confirm.classList.toggle("destructive", deleting);
  confirm.disabled = deleting;
  find("status-dialog").showModal();
  if (deleting) find("delete-word").focus();
}

function showDraft(kind, rule) {
  draftKind = kind;
  draft = { ...recipes[kind], rule: rule ?? recipes[kind].rule };
  find("reply").replaceChildren();
  find("draft-title").textContent = draft.name;
  find("draft-rule").textContent = draft.rule;
  find("draft-details").textContent = draft.details;
  find("draft").hidden = false;
}

function replyTo(prompt) {
  const request = prompt.toLowerCase();
  const days = request.match(/\b(two|three|four|five|[2-5]) business days?\b/);
  if (/\b(?:auto.?book|book automatically|automatic booking)\b/.test(request)) {
    hideDraft();
    find("reply").textContent = "Automatic booking isn't available here. I can notify the Office team when approved work needs scheduling.";
    find("reply").append(button("Draft scheduling reminder", () => showDraft("scheduling")));
  } else if (days && (draftKind === "scheduling" || /scheduling|office team/.test(request))) {
    showDraft("scheduling", "Notify the Office team if an approved estimate still has no visit after " + days[1] + " business days.");
  } else if (/schedul(?:e|ing) reminder|approved estimate|tell dispatch/.test(request)) {
    showDraft("scheduling");
  } else if (/website lead|route new lead/.test(request)) {
    showDraft("intake");
  } else if (/briefing|unscheduled jobs/.test(request)) {
    showDraft("briefing");
  } else {
    hideDraft();
    find("reply").textContent = "Try asking for lead routing, a scheduling reminder, or a Friday jobs briefing.";
  }
}

function hideDraft() {
  draft = undefined;
  draftKind = undefined;
  find("draft").hidden = true;
}

for (const recipe of Object.values(recipes)) {
  find("starters").append(button(recipe.starter, () => {
    find("prompt").value = recipe.prompt;
    find("prompt").focus();
  }));
}
for (const recipe of Object.values(recipes)) {
  const item = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = recipe.starter;
  const example = document.createElement("p");
  example.textContent = "“" + recipe.prompt + "”";
  item.append(title, example);
  find("capabilities").append(item);
}

function setGuideOpen(open) {
  find("automation-guide").hidden = !open;
  find("open-guide").setAttribute("aria-expanded", String(open));
  find(open ? "close-guide" : "open-guide").focus();
}

find("open-guide").addEventListener("click", () => setGuideOpen(true));
find("close-guide").addEventListener("click", () => setGuideOpen(false));
find("assistant").addEventListener("cancel", (event) => {
  if (find("automation-guide").hidden) return;
  event.preventDefault();
  setGuideOpen(false);
});

find("open-assistant").addEventListener("click", () => {
  find("automation-guide").hidden = true;
  find("open-guide").setAttribute("aria-expanded", "false");
  find("assistant").showModal();
});
for (const control of document.querySelectorAll("[data-close]")) {
  control.addEventListener("click", () => find(control.dataset.close).close());
}

find("compose").addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = find("prompt").value.trim();
  if (!prompt) return;
  find("message").textContent = prompt;
  find("message").hidden = false;
  find("sample-hint").hidden = true;
  find("prompt").value = "";
  replyTo(prompt);
  find("draft").hidden || find("draft").scrollIntoView({ block: "nearest" });
});

find("publish").addEventListener("click", () => {
  if (!draft) return;
  const workflow = { ...draft, id: nextId++, status: "Active", pending: 0 };
  workflows.unshift(workflow);
  hideDraft();
  renderRows();
  find("reply").textContent = workflow.name + " is active.";
  find("reply").append(button("View workflow", () => {
    find("assistant").close();
    openWorkflow(workflow);
  }));
});

find("toggle").addEventListener("click", () => openConfirmation(find("toggle").textContent));
find("delete").addEventListener("click", () => openConfirmation("Delete"));

find("delete-word").addEventListener("input", (event) => {
  find("confirm-status").disabled = event.target.value !== "confirm";
});

find("confirm-status").addEventListener("click", () => {
  if (pendingAction === "Delete" && find("delete-word").value !== "confirm") return;
  find("status-dialog").close();
  applyAction(pendingAction);
});

function applyAction(action) {
  const message = { Delete: "deleted", Pause: "paused", Resume: "resumed" }[action];
  if (action === "Delete") {
    workflows.splice(workflows.indexOf(selected), 1);
  } else {
    selected.status = action === "Pause" ? "Paused" : "Active";
  }
  find("workflow").close();
  renderRows();
  find("activity").textContent = selected.name + " was " + message + ".";
  const rowControl = [...find("rows").querySelectorAll(".row-link")][workflows.indexOf(selected)];
  (rowControl ?? find("open-assistant")).focus();
}

renderRows();
