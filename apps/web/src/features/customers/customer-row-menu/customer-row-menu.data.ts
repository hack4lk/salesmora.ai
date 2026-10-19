export const customerRowMenuData = {
  label: (name: string) => `Actions for ${name}`,
  actions: {
    view: "View customer",
    edit: "Edit contact",
    archive: "Archive customer",
    restore: "Restore customer",
    delete: "Delete customer",
  },
};
