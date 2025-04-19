function changeTheme() {
  document.body.style.backgroundColor =
    document.body.style.backgroundColor === "rgb(24, 24, 61)" ? "" : "rgb(24, 24, 61)";
}

document.getElementById("home")?.addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("clearInput")?.addEventListener("click", () => {
  document.getElementById("input").value = "";
});

document.getElementById("moonIcon")?.addEventListener("click", changeTheme);

function generateReport() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  output.innerHTML = "";

  const blocks = input.split(/(?=█)/g).filter((b) => b.trim());

  blocks.forEach((block, index) => {
    const titleMatch = block.match(/█\s+(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Test ${index + 1}`;

    const statusMatch = block.match(/Status is 200\s+↳\s+(\d+%)\s+—\s+✓\s+(\d+)\s+\/\s+✗\s+(\d+)/);
    const statusPassed = statusMatch ? statusMatch[1] : null;
    const statusSummary = statusPassed
      ? parseFloat(statusPassed) === 100
        ? `✅ Passed (100%)`
        : `❌ Failed (${statusPassed} passed)`
      : "N/A";

    const timeMatch = block.match(/Response time < \d+ms\s+↳\s+(\d+%)\s+—\s+✓\s+(\d+)\s+\/\s+✗\s+(\d+)/);
    const timeCheck = timeMatch
      ? parseFloat(timeMatch[1]) > 95
        ? `✅ Passed (${timeMatch[1]})`
        : `❌ Failed (${timeMatch[1]})`
      : "N/A";

    const httpReqDurationMatch = block.match(/http_req_duration.*?:\s+avg=([\d.\w]+)\s+min=([\d.\w]+)\s+med=([\d.\w]+)\s+max=([\d.\w]+)\s+p\(90\)=([\d.\w]+)\s+p\(95\)=([\d.\w]+)/);

    const httpReqAvg = httpReqDurationMatch ? httpReqDurationMatch[1] : "N/A";
    const httpReqMin = httpReqDurationMatch ? httpReqDurationMatch[2] : "N/A";
    const httpReqMed = httpReqDurationMatch ? httpReqDurationMatch[3] : "N/A";
    const httpReqMax = httpReqDurationMatch ? httpReqDurationMatch[4] : "N/A";

    const bodyCheck = /✓ ✅ Body is not empty/.test(block) ? "✅ Not empty" : "❌ Empty";
    const arrayCheck = /Contains (users|projects) array/.test(block) ? "✅ Present" : "❌ Missing";

    const dataReceived = block.match(/data_received.*?:\s+([\d.\wµs]+)/);
    const dataAmount = dataReceived ? dataReceived[1] : "N/A";

    const checks = block.match(/checks.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/);
    const failedRequests = block.match(/http_req_failed.*?:\s+([\d.]+%)\s+(\d+)\s+out of\s+(\d+)/);
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
          <li><strong>🔹 Avg Response Time:</strong> ${httpReqAvg}</li>
          <li><strong>🔹 Min Response Time:</strong> ${httpReqMin}</li>
          <li><strong>🔹 Med Response Time:</strong> ${httpReqMed}</li>
          <li><strong>🔹 Max Response Time:</strong> ${httpReqMax}</li>
          <li><strong>🔹 Body Check:</strong> ${bodyCheck}</li>
          <li><strong>🔹 Contains Users/Projects Array:</strong> ${arrayCheck}</li>
          <li><strong>🔹 Data from Backend:</strong> ${dataAmount}</li>
          <li><strong>🔹 Checks Passed:</strong> ${checks ? `${checks[1]} (${checks[2]} of ${checks[3]})` : "N/A"}</li>
          <li><strong>🔹 Failed Requests:</strong> ${failedRequests ? `${failedRequests[1]} (${failedRequests[2]} of ${failedRequests[3]})` : "N/A"}</li>
          <li><strong>🔹 Total HTTP Requests:</strong> ${httpReqs ? httpReqs[1] : "N/A"}</li>
          <li><strong>🔹 Iterations:</strong> ${iterations ? iterations[1] : "N/A"}</li>
          <li><strong>🔹 VUs:</strong> ${vus ? vus[1] : "N/A"} / Max: ${vusMax ? vusMax[1] : "N/A"}</li>
        </ul>
      </div>

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
            ${metrics
        .map(
          (m) => `
              <tr>
                <td>${m[1]}</td>
                <td>${m[2]}</td>
                <td>${m[3]}</td>
                <td>${m[4]}</td>
                <td>${m[5]}</td>
                <td>${m[6]}</td>
                <td>${m[7]}</td>
              </tr>
            `
        )
        .join("")}
          </tbody>
        </table>
      </div>
    `;

    output.innerHTML += html;
  });
}

function downloadPDF() {
  const element = document.getElementById('output');
  const opt = {
    margin: [10, 20, 10, 20],
    filename: 'k6-report.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 4,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    },
    jsPDF: {
      unit: 'px',
      format: [element.scrollWidth, element.scrollHeight],
      orientation: 'portrait'
    }
  };
  html2pdf().set(opt).from(element).save();
}

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const data = urlParams.get("data");
  if (data) {
    document.getElementById("input").value = decodeURIComponent(data);
    generateReport();
  }
});

function generateShareableLink() {
  const input = document.getElementById("input").value;
  const encodedInput = encodeURIComponent(input);
  const link = `${window.location.origin}${window.location.pathname}?data=${encodedInput}`;

  navigator.clipboard.writeText(link).then(() => {
    alert("Link copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy link: ", err);
  });
}
