const config = {
    plugins: ["@tailwindcss/postcss"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-vazirmatn)"],
                mono: ["var(--font-geist-mono)"],
            },
        },
    },
};

export default config;
