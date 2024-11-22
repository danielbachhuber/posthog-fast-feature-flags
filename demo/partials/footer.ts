export const footer = `
<script src="https://unpkg.com/prismjs@1.29.0/prism.js"></script>
<script>
	document.querySelectorAll('pre.copyable code').forEach(el => {
		const button = document.createElement('button');
		button.textContent = 'Copy';
		button.addEventListener('click', () => {
			navigator.clipboard.writeText(el.textContent);
			button.textContent = 'Copied!';
			setTimeout(() => {
				button.textContent = 'Copy';
			}, 1000);
		});
		el.parentNode.insertBefore(button, el.nextSibling);
	});
</script>
</body>
</html>
`;
