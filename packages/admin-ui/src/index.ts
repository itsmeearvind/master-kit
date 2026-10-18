
// admin.config.ts in client project
// export const adminConfig = { branding: { logo: '/logo.png', primary: '#000' }, menu: [{ label: 'Users', path: '/admin/users', permission: 'user:read' }] }

export const AdminLayout = (props: any) => {
  return `Admin layout with primary ${props.config?.branding?.primary}`;
};
// DataTable component with sort/filter/search using @maasters/search-filter inbuilt
