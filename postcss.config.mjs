/** @type {import('postcss').ProcessOptions & { plugins: import('postcss').AcceptedPlugin[] }} */
const postcssConfig = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};

export default postcssConfig;
