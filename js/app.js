async function buscar() {
    const query = document.getElementById('buscar').value.trim();
    if (!query) return;
    const url = 'https://TU_BACKEND_URL/api/documentos?q=' + encodeURIComponent(query);
    const resultados = document.getElementById('resultados');
    resultados.innerHTML = '<p>Buscando...</p>';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error en la consulta');
        const data = await res.json();
        if (data.length === 0) {
            resultados.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }
        resultados.innerHTML = '<ul>' + data.map(d => `<li><b>${d.nombre}</b> [${d.codigo}]</li>`).join('') + '</ul>';
    } catch (err) {
        resultados.innerHTML = '<p style="color:red;">Error: ' + err.message + '</p>';
    }
}

// Buscar al presionar Enter
document.getElementById('buscar').addEventListener('keyup', function(e){
    if(e.key === 'Enter') buscar();
});
