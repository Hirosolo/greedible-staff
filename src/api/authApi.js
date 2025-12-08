export const validateStaffToken = async (token) => {
  const response = await fetch('https://greedible-backend-staff.vercel.app/api/staff/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // If token is invalid or expired, the backend should return a non-ok status (e.g., 401)
    const error = await response.json();
    throw new Error(error.message || 'Token validation failed');
  }

  // Assuming backend returns the user data on success
  return response.json();
}; 