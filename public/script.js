document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#logs-table tbody');
    const links = document.querySelectorAll('nav.sidebar a');
    const expandButtons = document.querySelectorAll('.expand-button');
    const pageTitle = document.querySelector('#page-title');


    function loadLogs(type, title) {
        fetch(`/api/logs/${type}`)
            .then(response => response.json())
            .then(data => {
                tableBody.innerHTML = '';
                data.forEach(log => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${log.user}</td>
                        <td>${log.date}</td>
                        <td>${log.time}</td>
                        <td>${log.details}</td>
                    `;
                    tableBody.appendChild(row);
                });
                pageTitle.textContent = title;
            });
    }


    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const type = link.getAttribute('data-type');
            const title = link.textContent; 

            if (type) {
                loadLogs(type, title);
            }
        });
    });


    expandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const submenu = button.nextElementSibling;
            const isOpen = submenu.style.display === 'block';
            submenu.style.display = isOpen ? 'none' : 'block';
            button.classList.toggle('active', !isOpen);
        });
    });


    loadLogs('all', 'Todos os Logs');
});
