function generateReport() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  output.innerHTML = "";

  const blocks = input.includes("█") 
    ? input.split(/(?=█)/g).filter((b) => b.trim())
    : [input]; // Treat entire input as one block if no █

  blocks.forEach((block, index) => {
    let title = `Test ${index + 1}`;
    if (block.includes("Load /")) {
      const match = block.match(/Load\s+\/(\S+)/);
      if (match) title = `Load /${match[1]}`;
    } else {
      const titleMatch = block.match(/█\s+(.+)/);
      if (titleMatch) title = titleMatch[1].trim();
    }

    const statusMatch = block.match(/status is 200|Status is 200/);
    const statusSummary = statusMatch ? "Passed (200 OK)" : "Failed or N/A";

    const timeMatch = block.match(/response time < (\d+)ms/);
    const timeLimit = timeMatch ? timeMatch[1] : null;
    const timeCheck = timeLimit ? `Under ${timeLimit}ms` : "N/A";

    const bodyCheck = /body is not empty/i.test(block) ? "Not empty" : "Empty";

    const checks = block.match(/checks.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/);
    const failedRequests = block.match(/http_req_failed.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/);
    const dataReceived = block.match(/data_received.*?:\s+([\d.\w\s/]+)/);
    const dataSent = block.match(/data_sent.*?:\s+([\d.\w\s/]+)/);
    const httpReqs = block.match(/http_reqs.*?:\s+(\d+)/);
    const iterations = block.match(/iterations.*?:\s+(\d+)/);
    const vus = block.match(/vus.*?:\s+(\d+)/);
    const vusMax = block.match(/vus_max.*?:\s+(\d+)/);

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
