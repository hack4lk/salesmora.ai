export const instructionsLimit=2000;
export const copy={
 title:'Instructions and safety',
 instructions:'Scope of work',
 access:'Access notes',
 safety:'Safety notes',
 instructionsPlaceholder:'What the crew should do, in plain language',
 accessPlaceholder:'Gate codes, parking, pets, who to ask for',
 safetyPlaceholder:'Hazards, required protective gear, shut-offs',
 emptyView:'Nothing added yet.',
 emptyAll:'No instructions have been added to this work order.',
 edit:'Edit',
 save:'Save',
 cancel:'Cancel',
 counter:(used:number,max:number)=>`${used} of ${max} characters`,
 safetyBadge:'Read before starting',
 locked:'Instructions are locked while this work order is closed.',
 changedAfterIssue:'Instructions changed after this work order was issued.'
};
