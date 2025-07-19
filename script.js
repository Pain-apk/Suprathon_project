function generateResume() {
  document.getElementById("p-name").textContent = document.getElementById("name").value;
  document.getElementById("p-summary").textContent = document.getElementById("summary").value;
  document.getElementById("p-education").textContent = document.getElementById("education").value;
  document.getElementById("p-experience").textContent = document.getElementById("experience").value;
  document.getElementById("p-hardSkills").textContent = document.getElementById("hardSkills").value;
  document.getElementById("p-softSkills").textContent = document.getElementById("softSkills").value;
  document.getElementById("p-projects").textContent = document.getElementById("projects").value;

  const github = document.getElementById("github").value;
  const blog = document.getElementById("blog").value;
  let links = "";
  if (github) links += `<a href="${github}" target="_blank">GitHub</a> `;
  if (blog) links += <a href="${blog}" target="_blank">Portfolio</a>;
  document.getElementById("p-links").innerHTML = links;
}

function downloadPDF() {
  const element = document.getElementById('preview');
  html2canvas(element).then(canvas => {
    const img = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    const imgProps = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("resume.pdf");
  });
}