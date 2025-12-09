export const onLogout = () => {
  // Clear any auth tokens or session data
  localStorage.removeItem("comparely-auth-token")
  localStorage.removeItem("comparely-user")

  // Reload the page to reset app state
  window.location.reload()
}
