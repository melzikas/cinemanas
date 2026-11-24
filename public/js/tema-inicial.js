// Roda antes da página aparecer, para não "piscar" a cor errada
document.documentElement.dataset.tema = localStorage.getItem('tema') === 'escuro' ? 'escuro' : 'claro';
