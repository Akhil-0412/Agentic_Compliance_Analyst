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
                sand: {
                    50: '#FDFCF8',  // Main Bg
                    100: '#F7F5EE',
                    200: '#EBE7D8',
                    300: '#DBD5BC',
                },
                orange: {
                    50: '#FFF7ED',  // User Bubble
                    100: '#FFEDD5',
                    500: '#F97316', // Primary
                    600: '#EA580C',
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
