export const isAiSupportRequestResolved = (status) =>
  status === 2 || String(status).toLowerCase() === 'resolved'
