/********
 * Minimal Tailwind setup with status colors for OKR health.
 */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        onTrack: '#16a34a',
        atRisk: '#f59e0b',
        offTrack: '#dc2626',
      },
    },
  },
  plugins: [],
};
