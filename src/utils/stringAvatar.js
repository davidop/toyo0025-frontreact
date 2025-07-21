/**
 * Generates avatar props with a background color and initials based on a name
 * @param {string} name - The full name to generate avatar props from
 * @returns {object} Object containing avatar props (sx and children)
 */
export function stringAvatar(name) {
  // Function to generate a color hash from a string
  function stringToColor(string) {
    let hash = 0;
    let i;
    
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    
    return color;
  }

  // Extract initials from name
  const getInitials = (name) => {
    if (!name || name === '') return '?';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  };

  return {
    sx: {
      bgcolor: name ? stringToColor(name) : 'grey',
    },
    children: getInitials(name),
  };
}
