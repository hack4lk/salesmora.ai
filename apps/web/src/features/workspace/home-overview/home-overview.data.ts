export const homeOverviewData = {
  greeting: (name: string) => name.trim() ? `Welcome, ${name.trim()}.` : 'Welcome to your workspace.',
  workspace: 'Your workspace',
  roles: {owner:'Owner',admin:'Admin',office:'Office',field:'Field'},
  created: {label:'Workspace created',title:'Start your customer work',description:'Your workspace is ready. Bring customer opportunities and team work into one place.'},
  assigned: {label:'Your workspace',title:'Your assigned work',description:'Assigned opportunities and work will appear here when they are available to you.'},
  joined: {label:'Workspace joined',title:'Start working with your team',description:'You’ve joined the workspace. Work available to you appears here.'},
  leads:{title:'Add your first lead',description:'Keep a new customer opportunity and its contact details together.',action:'Create lead'},
  campaigns:{title:'Create your first campaign',description:'Organize how new opportunities reach your business and your team.',action:'Create campaign'},
  unavailable:'Coming soon',
  stories:{leadHref:'/leads/new?workspace=00000000-0000-4000-8000-000000000001',title:'Home',notice:'Component preview. Creation actions are mocked; no lead, campaign, account, or workspace is changed.',name:'Alex Rivera',workspace:'Northstar Plumbing',memberName:'Jordan Lee',longName:'Alexandra Rivera Montgomery',longWorkspace:'Northstar Property Maintenance, Construction and Professional Services'},
} as const;
