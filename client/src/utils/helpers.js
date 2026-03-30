export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const statusBadgeClass = (status) => {
  const map = {
    active: 'badge-green', pending: 'badge-amber', approved: 'badge-blue',
    completed: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray',
    suspended: 'badge-amber', blocked: 'badge-red',
    open: 'badge-blue', fulfilled: 'badge-green',
  };
  return map[status] || 'badge-gray';
};

export const urgencyBadgeClass = (urgency) => {
  const map = { Critical: 'badge-red', Urgent: 'badge-amber', Normal: 'badge-blue' };
  return map[urgency] || 'badge-gray';
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const INDIAN_CITIES = [
  'Ahmedabad', 'Amritsar', 'Bangalore', 'Bhopal', 'Chennai', 'Chandigarh',
  'Delhi', 'Hyderabad', 'Indore', 'Jaipur', 'Kolkata', 'Lucknow',
  'Mumbai', 'Nagpur', 'Pune', 'Surat', 'Varanasi', 'Visakhapatnam',
];
export const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'];
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];
