// Build-time config. Keep CREDLY_USERNAME empty or unset to enable demo mode.
export const CREDLY_USERNAME = process.env.CREDLY_USERNAME?.trim() ?? ""
