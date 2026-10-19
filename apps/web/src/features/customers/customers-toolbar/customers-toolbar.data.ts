export const customersToolbarData = {
  title: "Filter customers",
  search: "Search customers",
  placeholder: "Name, email or phone",
  relationship: "Relationship",
  owner: "Owner",
  type: "Type",
  sort: "Sort",
  allOwners: "All owners",
  unassigned: "Unassigned",
  archived: "Show archived",
  relationships: {
    all: "All relationships",
    lead: "Has open lead",
    job: "Has active job",
    past: "Past customer",
  },
  types: { all: "All types", person: "Person", business: "Business" },
  sorts: {
    name: "Name A–Z",
    "name-desc": "Name Z–A",
    activity: "Recently active",
    newest: "Newest",
  },
  searchFilter: (value: string) => `Search: ${value}`,
  count: (n: number) =>
    `${n.toLocaleString("en-US")} ${n === 1 ? "customer" : "customers"} found`,
};
