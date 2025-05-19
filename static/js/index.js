$(document).ready(function() {
  const options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }
  // Initialize all div with carousel class
  const carousels = bulmaCarousel.attach('.carousel', options);

})

document.addEventListener('DOMContentLoaded', function() {
  loadTableData();
  setupEventListeners();
  window.addEventListener('resize', adjustNameColumnWidth);
});

function loadTableData() {
      console.log('Starting to load table data...');
      fetch('./leaderboard_data.json')
        .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Data loaded successfully:', data);
          const tbody = document.querySelector('#logicocr-table tbody');

          // Prepare data for styling
          // const proScores = prepareScoresForStyling(data.leaderboardData, 'pro');
          // const valScores = prepareScoresForStyling(data.leaderboardData, 'validation');
          // const testScores = prepareScoresForStyling(data.leaderboardData, 'test');
          const cotScores = prepareScoresForStyling(data.leaderboardData, 'cot');
          const directScores = prepareScoresForStyling(data.leaderboardData, 'direct');

          data.leaderboardData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.classList.add(row.info.type);
            const nameCell = row.info.link && row.info.link.trim() !== '' ?
              `<a href="${row.info.link}" target="_blank"><b>${row.info.name}</b></a>` :
              `<b>${row.info.name}</b>`;
            const safeGet = (obj, path, defaultValue = '-') => {
              return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
            };

            // Helper function to format the overall value
            const formatOverallValue = (value, source) => {
              // Adjust space in front of asterisk to align values
              const adjustedValue = source === 'author' ? `&nbsp;${value || '-'}*` : `${value || '-'}`;
              return adjustedValue;
            };

            // const proOverall = formatOverallValue(applyStyle(safeGet(row, 'pro.overall'), proScores.overall[index]), safeGet(row, 'pro.source'));
            // const valOverall = formatOverallValue(applyStyle(safeGet(row, 'validation.overall'), valScores.overall[index]), safeGet(row, 'validation.source'));
            // const testOverall = formatOverallValue(applyStyle(safeGet(row, 'test.overall'), testScores.overall[index]), safeGet(row, 'test.source'));
            const cotOverall = formatOverallValue(applyStyle(safeGet(row, 'cot.overall'), cotScores.overall[index]), safeGet(row, 'cot.source'));
            const directOverall = formatOverallValue(applyStyle(safeGet(row, 'direct.overall'), directScores.overall[index]), safeGet(row, 'direct.source'));

            tr.innerHTML = `
              <td>${nameCell}</td>
              <td>${row.info.size}</td>
              <td>${row.info.date}</td>
              <td class="cot-overall">${cotOverall}</td>
              <td class="hidden cot-details">${applyStyle(safeGet(row, 'cot.type1'), cotScores.type1[index])}</td>
              <td class="hidden cot-details">${applyStyle(safeGet(row, 'cot.type2'), cotScores.type2[index])}</td>
              <td class="hidden cot-details">${applyStyle(safeGet(row, 'cot.type3'), cotScores.type3[index])}</td>
              <td class="hidden cot-details">${applyStyle(safeGet(row, 'cot.typegt3'), cotScores.typegt3[index])}</td>
              <td class="direct-overall">${directOverall}</td>
              <td class="hidden direct-details">${applyStyle(safeGet(row, 'direct.type1'), directScores.type1[index])}</td>
              <td class="hidden direct-details">${applyStyle(safeGet(row, 'direct.type2'), directScores.type2[index])}</td>
              <td class="hidden direct-details">${applyStyle(safeGet(row, 'direct.type3'), directScores.type3[index])}</td>
              <td class="hidden direct-details">${applyStyle(safeGet(row, 'direct.typegt3'), directScores.typegt3[index])}</td>
            `;
            tbody.appendChild(tr);
          });
          setTimeout(adjustNameColumnWidth, 0);
          initializeSorting();
        })
        .catch(error => {
          console.error('Error loading table data:', error);
          document.querySelector('#logicocr-table tbody').innerHTML = `
            <tr>
                <td colspan="21"> Error loading data: ${error.message}<br> Please ensure you're accessing this page through a web server (http://localhost:8000) and not directly from the file system. </td>
            </tr>
          `;
        });
  }

function setupEventListeners() {
  document.querySelector('.reset-cell').addEventListener('click', function() {
    resetTable();
  });

  document.querySelector('.cot-details-cell').addEventListener('click', function() {
    toggleDetails('cot');
  });
  document.querySelector('.direct-details-cell').addEventListener('click', function() {
    toggleDetails('direct');
  });

  var headers = document.querySelectorAll('#logicocr-table thead tr:last-child th.sortable');
  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      sortTable(this);
    });
  });
}

function toggleDetails(section) {
  var sections = ['cot', 'direct'];
  sections.forEach(function(sec) {
    var detailCells = document.querySelectorAll('.' + sec + '-details');
    var overallCells = document.querySelectorAll('.' + sec + '-overall');
    var headerCell = document.querySelector('.' + sec + '-details-cell');
    if (sec === section) {
      detailCells.forEach(cell => cell.classList.toggle('hidden'));
      headerCell.setAttribute('colspan', headerCell.getAttribute('colspan') === '1' ? (sec === 'pro' ? '3' : '5') : '1');
    } else {
      detailCells.forEach(cell => cell.classList.add('hidden'));
      overallCells.forEach(cell => cell.classList.remove('hidden'));
      headerCell.setAttribute('colspan', '1');
    }
  });

  setTimeout(adjustNameColumnWidth, 0);
}

function resetTable() {
  document.querySelectorAll('.cot-details, .direct-details').forEach(function(cell) {
    cell.classList.add('hidden');
  });

  document.querySelectorAll('.cot-overall, .direct-overall').forEach(function(cell) {
    cell.classList.remove('hidden');
  });

  document.querySelector('.cot-details-cell').setAttribute('colspan', '1');
  document.querySelector('.direct-details-cell').setAttribute('colspan', '1');

  var valOverallHeader = document.querySelector('#logicocr-table thead tr:last-child th.cot-overall');
  sortTable(valOverallHeader, true);

  setTimeout(adjustNameColumnWidth, 0);
}

function sortTable(header, forceDescending = false, maintainOrder = false) {
  var table = document.getElementById('logicocr-table');
  var tbody = table.querySelector('tbody');
  var rows = Array.from(tbody.querySelectorAll('tr'));
  var headers = Array.from(header.parentNode.children);
  var columnIndex = headers.indexOf(header);
  var sortType = header.dataset.sort;

  var isDescending = forceDescending || (!header.classList.contains('asc') && !header.classList.contains('desc')) || header.classList.contains('asc');

  if (!maintainOrder) {
    rows.sort(function(a, b) {
      var aValue = getCellValue(a, columnIndex);
      var bValue = getCellValue(b, columnIndex);

      if (aValue === '-' && bValue !== '-') return isDescending ? 1 : -1;
      if (bValue === '-' && aValue !== '-') return isDescending ? -1 : 1;

      if (sortType === 'number') {
        return isDescending ? parseFloat(bValue) - parseFloat(aValue) : parseFloat(aValue) - parseFloat(bValue);
      } else if (sortType === 'date') {
        return isDescending ? new Date(bValue) - new Date(aValue) : new Date(aValue) - new Date(bValue);
      } else {
        return isDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
  }

  headers.forEach(function(th) {
    th.classList.remove('asc', 'desc');
  });

  header.classList.add(isDescending ? 'desc' : 'asc');

  rows.forEach(function(row) {
    tbody.appendChild(row);
  });

  setTimeout(adjustNameColumnWidth, 0);
}

function getCellValue(row, index) {
  var cells = Array.from(row.children);
  var cell = cells[index];

  if (cell.classList.contains('hidden')) {
    if (cell.classList.contains('cot-details') || cell.classList.contains('cot-overall')) {
      cell = cells.find(c => (c.classList.contains('cot-overall') || c.classList.contains('cot-details')) && !c.classList.contains('hidden'));
    } else if (cell.classList.contains('direct-details') || cell.classList.contains('direct-overall')) {
      cell = cells.find(c => (c.classList.contains('direct-overall') || c.classList.contains('direct-details')) && !c.classList.contains('hidden'));
    }
  }
  return cell ? cell.textContent.trim() : '';
}

function initializeSorting() {
  var valOverallHeader = document.querySelector('#logicocr-table thead tr:last-child th.cot-overall');
  sortTable(valOverallHeader, true);
}

function adjustNameColumnWidth() {
  const nameColumn = document.querySelectorAll('#logicocr-table td:first-child, #logicocr-table th:first-child');
  let maxWidth = 0;

  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  document.body.appendChild(span);

  nameColumn.forEach(cell => {
    span.textContent = cell.textContent;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  });

  document.body.removeChild(span);

  maxWidth += 20; // Increased padding

  nameColumn.forEach(cell => {
    cell.style.width = `${maxWidth}px`;
    cell.style.minWidth = `${maxWidth}px`; // Added minWidth
    cell.style.maxWidth = `${maxWidth}px`;
  });
}

function prepareScoresForStyling(data, section) {
  const scores = {};
  const fields = [
    'overall', 'type1', 'type2', 'type3', 'typegt3'
  ];

  fields.forEach(field => {
    const values = data.map(row => row[section] && row[section][field])
                       .filter(value => value !== '-' && value !== undefined && value !== null)
                       .map(parseFloat);

    if (values.length > 0) {
      const sortedValues = [...new Set(values)].sort((a, b) => b - a);
      scores[field] = data.map(row => {
        const value = row[section] && row[section][field];
        if (value === '-' || value === undefined || value === null) {
          return -1;
        }
        return sortedValues.indexOf(parseFloat(value));
      });
    } else {
      scores[field] = data.map(() => -1);
    }
  });

  return scores;
}

function applyStyle(value, rank) {
      if (value === undefined || value === null || value === '-') return '-';
      if (rank === 0) return `<b>${value}</b>`;
      if (rank === 1) return `<span style="text-decoration: underline;">${value}</span>`;
      return value;
    }

