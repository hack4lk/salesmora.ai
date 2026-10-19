export const paginationData = {
  label: 'Pagination',
  pageSize: 'Rows per page',
  range: (start: number, end: number, total: number) => `Showing ${start.toLocaleString('en-US')}–${end.toLocaleString('en-US')} of ${total.toLocaleString('en-US')}`,
  item: (type: string, page: number | null, selected: boolean) => type === 'page'
    ? `${selected ? 'Current page,' : 'Go to page'} ${page}`
    : ({ previous: 'Go to previous page', next: 'Go to next page', first: 'Go to first page', last: 'Go to last page' }[type] ?? 'More pages'),
  stories: {
    title: 'Pagination',
    description: 'Controlled page navigation and page size. These previews update local state only.',
  },
};
