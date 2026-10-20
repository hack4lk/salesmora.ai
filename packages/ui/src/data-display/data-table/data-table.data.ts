export const dataTableData = {
  selectPage:'Select all rows on this page',selectRow:(label:string)=>`Select ${label}`,
  openRow:(label:string)=>`Open record · ${label}`,open:'Open record',
  sort:(label:string,direction:'asc'|'desc')=>`Sort by ${label}, ${direction==='asc'?'ascending':'descending'}`,
  keyboard:'Focus a row and press Enter or Space to open its details. Links open the full record.',
  loading:'Loading records…',empty:'No records to show.',error:'Records could not be loaded.',retry:'Try again',
  stories:{stageOrder:['New','Contacted','Estimate sent','Won','Lost'],title:'Data table',description:'Shared table preview using fictional leads. Sorting, selection and row opening are mocked.',caption:'Leads',lead:'Lead',service:'Service requested',stage:'Stage',source:'Source',owner:'Owner',created:'Created',unassigned:'Unassigned',selected:(count:number)=>`${count} selected`,opened:(label:string)=>`Opened ${label}`,empty:'No leads yet. New leads will appear here.',error:'Leads could not be loaded. Your current filters are preserved.',link:(id:string)=>`#fictional-${id}`,
    rows:[
      {id:'jordan',name:'Jordan Lee',service:'Kitchen sink repair',stage:'New',source:'Website',owner:'Sam Rivera',created:'Today'},
      {id:'taylor',name:'Taylor Morgan',service:'Water heater installation',stage:'Contacted',source:'Referral',owner:'Ava Morgan',created:'Yesterday'},
      {id:'alex',name:'Alex Chen',service:'Emergency pipe repair',stage:'Estimate sent',source:'Phone',owner:null,created:'3 days ago'},
      {id:'riley',name:'Riley Brooks',service:'Bathroom renovation',stage:'Won',source:'Gmail',owner:'Sam Rivera',created:'5 days ago'},
      {id:'casey',name:'Casey Patel',service:'Drain cleaning',stage:'Lost',source:'Other',owner:'Ava Morgan',created:'7 days ago'},
    ],
  },
} as const;
