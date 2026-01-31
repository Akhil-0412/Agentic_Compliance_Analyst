import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                neutral: {
                    50: '#F9F9F8',  // Main Bg (Warm Off-white)
                    100: '#F2F2F0', // Secondary Bg
                    200: '#E6E6E3', // Borders
                    300: '#D1D1CD',
                    400: '#A3A39F',
                    500: '#73736F', // Muted Text
                    800: '#2E2E2C', // Primary Text
                    900: '#1A1A19', // Headings
                },
                trust: {
                    50: '#F0F9FF',
                    500: '#0EA5E9', // Primary Action (Sky/Blue)
                    600: '#0284C7',
                    900: '#0C4A6E',
                },
                legal: {
                    500: '#475569', // Slate for rigid elements
                },
                // Keep mainly for legacy or specific accents if needed, but de-prioritize
                orange: {
                    50: '#FFF7ED',
                    100: '#FFEDD5',
                    500: '#F97316',
                    600: '#EA580C',
                },
                skin: { // Keeping for specific "texture" request compatibility
                    50: '#F5EBE0',
                    100: '#EBDFCF',
                }
            },
            boxShadow: {
                'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
                'elevation-low': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'elevation-high': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-subtle": "linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
