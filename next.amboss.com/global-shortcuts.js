// Global keyboard shortcuts - Forward Cmd+K and Escape to parent
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { 
        e.preventDefault(); 
        window.parent.postMessage('show-search', '*'); 
    }
    if (e.key === 'Escape') {
        window.parent.postMessage('hide-search', '*');
    }
});
