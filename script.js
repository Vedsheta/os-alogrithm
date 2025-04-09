const processes = [];

document.getElementById('addProcess').addEventListener('click', () => {
  const name = document.getElementById('processName').value;
  const arrival = parseInt(document.getElementById('arrivalTime').value);
  const burst = parseInt(document.getElementById('burstTime').value);

  if (name && arrival >= 0 && burst > 0) {
    processes.push({ name, arrival, burst });
    updateProcessList();
  }
});

document.getElementById('calculateSchedule').addEventListener('click', () => {
  const result = lrtfScheduling(processes);
  displaySchedule(result);
});

function updateProcessList() {
  const list = document.getElementById('processList');
  list.innerHTML = processes.map(
    p => `<li>${p.name} - Arrival: ${p.arrival}, Burst: ${p.burst}</li>`
  ).join('');
}

function lrtfScheduling(processes) {
  const n = processes.length;
  const proc = processes.map(p => ({
    name: p.name,
    arrival: p.arrival,
    burst: p.burst,
    remaining: p.burst,
    completion: 0,
    turnaround: 0,
    waiting: 0,
    response: null
  }));

  let time = 0;
  let completed = 0;
  let lastProcess = null;

  while (completed < n) {
    const ready = proc
      .filter(p => p.arrival <= time && p.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining || a.arrival - b.arrival);

    if (ready.length === 0) {
      time++;
      continue;
    }

    const current = ready[0];

    if (current.response === null) {
      current.response = time - current.arrival;
    }

    current.remaining--;
    time++;

    if (current.remaining === 0) {
      current.completion = time;
      current.turnaround = current.completion - current.arrival;
      current.waiting = current.turnaround - current.burst;
      completed++;
    }
  }

  return proc;
}

function displaySchedule(schedule) {
  const output = document.getElementById('scheduleOutput');

  const avgWT = (schedule.reduce((sum, p) => sum + p.waiting, 0) / schedule.length).toFixed(2);
  const avgTAT = (schedule.reduce((sum, p) => sum + p.turnaround, 0) / schedule.length).toFixed(2);
  const avgRT = (schedule.reduce((sum, p) => sum + p.response, 0) / schedule.length).toFixed(2);

  output.innerHTML = `
    <h3>Schedule</h3>
    <table>
      <thead>
        <tr>
          <th>Process</th>
          <th>Arrival</th>
          <th>Burst</th>
          <th>Completion</th>
          <th>Turnaround</th>
          <th>Waiting</th>
          <th>Response</th>
        </tr>
      </thead>
      <tbody>
        ${schedule.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.completion}</td>
            <td>${p.turnaround}</td>
            <td>${p.waiting}</td>
            <td>${p.response}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="averages">
      <p><strong>Average Waiting Time:</strong> ${avgWT}</p>
      <p><strong>Average Turnaround Time:</strong> ${avgTAT}</p>
      <p><strong>Average Response Time:</strong> ${avgRT}</p>
    </div>
  `;
}
