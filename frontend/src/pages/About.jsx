import PageContainer from "../components/PageContainer";

function AboutPage() {
  return (
  <PageContainer>
    <div>
      <h1>About Us</h1>
      <h3>Why We Created MyCourtPal?</h3>
      <p>For people without lawyers, the hardest part of going to court is often not the law, it’s navigating the system. Critical information about where to go, what to bring, whether hearings are in-person or on Zoom, and how a specific judge runs their courtroom is fragmented, outdated, or unavailable. This leaves pro se litigants unprepared, overwhelmed, and at risk of procedural mistakes.
      </p>

      <h3>How Does MyCourtPal Help You?</h3>
      <p>
        MyCourtPal helps pro se litigants confidently navigate the Domestic Relations Division of the Daley Center. Pro se litigants can ask MyCourtPal questions in plain language using the chatbot on the home page. MyCourtPal will take you from there and guide you through all the processes while offering useful links to files and relevant resources.
      </p>

      <h3>Where Does Our Information Come From?</h3>
      <p>
        Our data is grounded in real-world experience. The guidance provided by MyCourtPal is built directly from on-the-ground observations and in-depth interviews with the staff and professionals who work at the Daley Center every day.
      </p>

      <h3>Help Us keep Information Current</h3>
      <ul style={{ paddingLeft: "25px", marginTop: 10 }}>
        <li><b>For Legal Professionals:</b> If you have identified new procedural information that has not yet been incorporated into MyCourtPal, please submit a ticket. Our team will review your submission, verify its accuracy, and promptly update the chatbot.</li>
        <li><b>For Pro Se Litigants:</b> We encourage you to report back on your own experiences! While we might not publish individual reports immediately, if we see multiple people reporting the same issue or change, we can confidently pass that updated information on to other users.</li>
      </ul>
    <p>Together, we can help ensure that everyone receives the most accurate and up-to-date information as they navigate the court system!</p>
    <p>Please contact Andrew Sharp from {" "}
        <a href="https://carpls.org/" target="_blank" rel="noopener noreferrer">
          CARPLS
        </a> at {" "} 
        <a href="mailto:asharp@carpls.org">
          asharp@carpls.org
        </a> if you have any questions or concerns.</p>
        
    </div>
  </PageContainer>
  );
}

export default AboutPage;




