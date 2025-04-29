function generateReport() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  output.innerHTML = "";

  // Split blocks by "Meeting page" or "█", ensuring no empty datasets are included
  const blocks = input.split(/(?=^.*?(Meeting page|█).*$)/gmi).filter(b => b.trim() && !b.includes("Failed or N/A") && !b.includes("N/A"));

  blocks.forEach((block, index) => {
    let title = `Test ${index + 1}`;

    // Detect title: either starting with "Meeting page" or "█"
    if (block.includes("Load /")) {
      const match = block.match(/Load\s+\/(\S+)/);
      if (match) title = `Load /${match[1]}`;
    } else {
      const titleMatch = block.match(/█\s*(.+)/) || block.match(/(Meeting page.+)/i);
      if (titleMatch) title = titleMatch[1].trim();
    }

    const statusMatch = block.match(/status is 200|Status is 200/);
    const statusSummary = statusMatch ? "Passed (200 OK)" : "Failed or N/A";

    const timeMatch = block.match(/response time < (\d+)ms/);
    const timeCheck = timeMatch ? `Under ${timeMatch[1]}ms` : "N/A";

    const bodyCheck = /body is not empty/i.test(block) ? "Not empty" : "Empty";

    const checks = block.match(/checks.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/i);
    const failedRequests = block.match(/http_req_failed.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/i);
    const dataReceived = block.match(/data_received.*?:\s+([\d.\w\s/]+)/i);
    const dataSent = block.match(/data_sent.*?:\s+([\d.\w\s/]+)/i);
    const httpReqs = block.match(/http_reqs.*?:\s+(\d+)/i);
    const iterations = block.match(/iterations.*?:\s+(\d+)/i);
    const vus = block.match(/vus.*?:\s+(\d+)/i);
    const vusMax = block.match(/vus_max.*?:\s+(\d+)/i);

    const metrics = [...block.matchAll(/([a-zA-Z0-9_.]+)\.*:\s+avg=([\d.msµskB]+).*?min=([\d.msµskB]+).*?med=([\d.msµskB]+).*?max=([\d.msµskB]+).*?p\(90\)=([\d.msµskB]+).*?p\(95\)=([\d.msµskB]+)/g)];

    const html = `
      <div class="section">
        <div class="section-title">${title}</div>
        <ul>
          <li><strong>🔹 Status Code:</strong> ${statusSummary}</li>
          <li><strong>🔹 Response Time Check:</strong> ${timeCheck}</li>
          <li><strong>🔹 Body Check:</strong> ${bodyCheck}</li>
          <li><strong>🔹 Checks Passed:</strong> ${checks ? `${checks[1]} (${checks[2]} of ${checks[3]})` : "N/A"}</li>
          <li><strong>🔹 Failed Requests:</strong> ${failedRequests ? `${failedRequests[1]} (${failedRequests[2]} of ${failedRequests[3]})` : "N/A"}</li>
          <li><strong>🔹 Data Received:</strong> ${dataReceived ? dataReceived[1] : "N/A"}</li>
          <li><strong>🔹 Data Sent:</strong> ${dataSent ? dataSent[1] : "N/A"}</li>
          <li><strong>🔹 Total HTTP Requests:</strong> ${httpReqs ? httpReqs[1] : "N/A"}</li>
          <li><strong>🔹 Iterations:</strong> ${iterations ? iterations[1] : "N/A"}</li>
          <li><strong>🔹 VUs:</strong> ${vus ? vus[1] : "N/A"} / Max: ${vusMax ? vusMax[1] : "N/A"}</li>
        </ul>
      </div>

      ${metrics.length > 0 ? `
      <div class="section">
        <div class="section-title">📊 Detailed Metrics</div>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Avg</th>
              <th>Min</th>
              <th>Med</th>
              <th>Max</th>
              <th>P(90)</th>
              <th>P(95)</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.map(m => `
              <tr>
                <td>${m[1]}</td>
                <td>${m[2]}</td>
                <td>${m[3]}</td>
                <td>${m[4]}</td>
                <td>${m[5]}</td>
                <td>${m[6]}</td>
                <td>${m[7]}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ` : ""}
    `;

    output.innerHTML += html;
  });
}


function downloadPDF() {
  const element = document.getElementById("output");

  // Fullscreen-style options
  const opt = {
    margin:       0,
    filename:     'k6_test_report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  // Generate PDF
  html2pdf().set(opt).from(element).save();
}
